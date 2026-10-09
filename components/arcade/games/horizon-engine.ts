// Event Horizon: fly a ship around a black hole under (Newtonian) gravity,
// collect orbiting data packets, don't cross the horizon, don't run dry.
// Pure state + rules; the component supplies input and draws on a canvas
// layered over the WebGL black hole.

import type { ThemeColors } from "@/lib/useThemeColors";

export const W = 240;
export const H = 405;
const CX = W / 2;
const CY = H / 2;

/** G·M in px³/s²: a circular orbit at r = 85 moves at ~71 px/s. */
const GM = 430_000;
export const HORIZON = 22;
const THRUST = 115;
const TURN = 3.6;
const FUEL_BURN = 16;
const FUEL_PACKET = 22;
export const GOAL = 8;
const PACKETS_ON_SCREEN = 3;
const SUBSTEPS = 4;
const TRAIL = 46;
/** The board is 240px wide: orbits wider than this would leave it sideways. */
const MAX_ORBIT = 104;
const START_ORBIT = 85;

type Packet = { r: number; a: number; dir: number; pulse: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

export type Input = { left: boolean; right: boolean; thrust: boolean; pointer: { x: number; y: number } | null };

export type Events = {
  packets: (n: number) => void;
  fuel: (fuel: number) => void;
  telemetry: (r: number, v: number) => void;
  end: (won: boolean, score: number, reason: string) => void;
  sound: (kind: "collect" | "thrust" | "win" | "lose") => void;
};

const orbitalSpeed = (r: number) => Math.sqrt(GM / r);

function randomPacket(): Packet {
  return { r: 48 + Math.random() * (MAX_ORBIT - 48), a: Math.random() * Math.PI * 2, dir: Math.random() < 0.5 ? 1 : -1, pulse: Math.random() * 6 };
}

export function createHorizon(events: Events, reduced: boolean) {
  const s = {
    x: CX,
    y: CY - START_ORBIT,
    vx: orbitalSpeed(START_ORBIT),
    vy: 0,
    angle: 0,
    fuel: 100,
    collected: 0,
    packets: [] as Packet[],
    trail: [] as { x: number; y: number }[],
    sparks: [] as Spark[],
    thrusting: false,
    dying: 0, // >0 while being spaghettified
    over: false,
    time: 0,
    telemetryTimer: 0,
  };

  function reset() {
    // start in a clean circular orbit so doing nothing is safe (for a while)
    s.x = CX;
    s.y = CY - START_ORBIT;
    s.vx = orbitalSpeed(START_ORBIT);
    s.vy = 0;
    s.angle = 0;
    s.fuel = 100;
    s.collected = 0;
    s.packets = Array.from({ length: PACKETS_ON_SCREEN }, randomPacket);
    s.trail = [];
    s.sparks = [];
    s.dying = 0;
    s.over = false;
    s.time = 0;
    events.packets(0);
    events.fuel(100);
  }

  const packetPos = (p: Packet) => ({ x: CX + Math.cos(p.a) * p.r, y: CY + Math.sin(p.a) * p.r });

  function finish(won: boolean, reason: string) {
    if (s.over) return;
    s.over = true;
    const score = s.collected * 100 + (won ? Math.round(s.fuel) * 5 : 0);
    events.sound(won ? "win" : "lose");
    events.end(won, score, reason);
  }

  function step(dt: number, input: Input) {
    if (s.over) return;
    s.time += dt;

    // spaghettification: stretched and pulled in, then game over
    if (s.dying > 0) {
      s.dying += dt;
      const k = Math.min(1, s.dying / 0.9);
      s.x += (CX - s.x) * k * 0.3;
      s.y += (CY - s.y) * k * 0.3;
      if (s.dying > 0.9) finish(false, "spaghettified past the event horizon");
      return;
    }

    // steering: keys, or point-and-hold
    let thrust = input.thrust;
    if (input.pointer) {
      const target = Math.atan2(input.pointer.y - s.y, input.pointer.x - s.x);
      let d = target - s.angle;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      s.angle += Math.sign(d) * Math.min(Math.abs(d), TURN * 1.4 * dt);
      thrust = true;
    } else {
      s.angle += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * TURN * dt;
    }
    s.thrusting = thrust && s.fuel > 0;
    if (s.thrusting) {
      s.fuel = Math.max(0, s.fuel - FUEL_BURN * dt);
      if (Math.random() < dt * 20) events.sound("thrust");
    }

    // integrate gravity in substeps (semi-implicit Euler keeps orbits stable)
    const h = dt / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) {
      const dx = CX - s.x;
      const dy = CY - s.y;
      const r2 = Math.max(dx * dx + dy * dy, 64);
      const r = Math.sqrt(r2);
      const g = GM / r2;
      let ax = (dx / r) * g;
      let ay = (dy / r) * g;
      if (s.thrusting) {
        ax += Math.cos(s.angle) * THRUST;
        ay += Math.sin(s.angle) * THRUST;
      }
      s.vx += ax * h;
      s.vy += ay * h;
      s.x += s.vx * h;
      s.y += s.vy * h;
      if (r < HORIZON) {
        s.dying = 0.001;
        break;
      }
    }

    // soft walls: the edge of the board is a magnetic field, not a wall of death
    const pad = 6;
    if (s.x < pad || s.x > W - pad) {
      s.x = Math.min(W - pad, Math.max(pad, s.x));
      s.vx *= -0.55;
    }
    if (s.y < pad || s.y > H - pad) {
      s.y = Math.min(H - pad, Math.max(pad, s.y));
      s.vy *= -0.55;
    }

    s.trail = [...s.trail, { x: s.x, y: s.y }].slice(-TRAIL);

    // packets orbit too; collect by flying through them
    s.packets = s.packets.map((p) => {
      const next = { ...p, a: p.a + (p.dir * orbitalSpeed(p.r) * dt) / p.r, pulse: p.pulse + dt * 4 };
      const pos = packetPos(next);
      if (Math.hypot(pos.x - s.x, pos.y - s.y) < 12) {
        s.collected += 1;
        s.fuel = Math.min(100, s.fuel + FUEL_PACKET);
        events.packets(s.collected);
        events.sound("collect");
        if (!reduced) {
          for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = 20 + Math.random() * 70;
            s.sparks.push({ x: pos.x, y: pos.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
          }
        }
        return randomPacket();
      }
      return next;
    });
    if (s.collected >= GOAL) finish(true, "all packets delivered");

    // out of fuel and nowhere near a stable orbit: call it
    if (s.fuel <= 0 && !s.over) {
      const r = Math.hypot(s.x - CX, s.y - CY);
      const v = Math.hypot(s.vx, s.vy);
      if (v * v * r < GM * 0.35) finish(false, "out of fuel, falling in");
    }

    s.sparks = s.sparks
      .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, life: p.life - dt * 1.8 }))
      .filter((p) => p.life > 0);

    s.telemetryTimer -= dt;
    if (s.telemetryTimer <= 0) {
      s.telemetryTimer = 0.15;
      events.fuel(s.fuel);
      events.telemetry(Math.hypot(s.x - CX, s.y - CY), Math.hypot(s.vx, s.vy));
    }
  }

  function draw(ctx: CanvasRenderingContext2D, c: ThemeColors, font: string) {
    ctx.clearRect(0, 0, W, H);

    // faint guide ring at the horizon
    ctx.strokeStyle = c.coral;
    ctx.globalAlpha = 0.35;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(CX, CY, HORIZON, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // packets
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold 11px ${font}`;
    for (const p of s.packets) {
      const pos = packetPos(p);
      const glow = 0.6 + 0.4 * Math.sin(p.pulse);
      ctx.shadowColor = c.green;
      ctx.shadowBlur = 8 * glow;
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.roundRect(pos.x - 9, pos.y - 7, 18, 14, 3);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = c.green;
      ctx.stroke();
      ctx.fillStyle = c.green;
      ctx.fillText("{}", pos.x, pos.y + 0.5);
    }

    // trail
    for (let i = 1; i < s.trail.length; i++) {
      ctx.globalAlpha = (i / s.trail.length) * 0.5;
      ctx.strokeStyle = c.indigo;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
      ctx.lineTo(s.trail[i].x, s.trail[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    for (const p of s.sparks) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = c.green;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // ship (stretched radially while being spaghettified)
    ctx.save();
    ctx.translate(s.x, s.y);
    if (s.dying > 0) {
      const radial = Math.atan2(CY - s.y, CX - s.x);
      const k = Math.min(1, s.dying / 0.9);
      ctx.rotate(radial);
      ctx.scale(1 + k * 4, Math.max(0.1, 1 - k));
      ctx.rotate(-radial);
      ctx.globalAlpha = 1 - k * 0.7;
    }
    ctx.rotate(s.angle);
    if (s.thrusting && s.dying === 0) {
      const flicker = reduced ? 1 : 0.7 + Math.random() * 0.6;
      ctx.fillStyle = c.orange;
      ctx.beginPath();
      ctx.moveTo(-6, -3);
      ctx.lineTo(-6 - 9 * flicker, 0);
      ctx.lineTo(-6, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowColor = c.light;
    ctx.shadowBlur = 8;
    ctx.fillStyle = c.light;
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-6, -5.5);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-6, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  return { reset, step, draw, get over() { return s.over; } };
}
