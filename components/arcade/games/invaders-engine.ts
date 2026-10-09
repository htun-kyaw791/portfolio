// Bug Invaders: game state and rules, no React. The component feeds it input
// and a canvas; it reports score/lives/waves back through callbacks.

import type { ThemeColors } from "@/lib/useThemeColors";

export const W = 240;
export const H = 405;

const COLS = 6;
const ROWS = 4;
const CELL_X = 32;
const CELL_Y = 26;
const PLAYER_Y = H - 30;
const PLAYER_SPEED = 170;
const PLAYER_HALF = 9;
const SHOT_SPEED = 330;
const SHOT_COOLDOWN = 0.32;
const ENEMY_SHOT_SPEED = 135;
const BOSS_HP = 16;
export const WAVES = 3; // the last one is the boss
export const LIVES = 3;

const BUGS = ["🐞", "🐛", "🪲", "🦟"];
const NAMES = [
  "TypeError",
  "NullPointer",
  "OffByOne",
  "RaceCondition",
  "MemoryLeak",
  "Deadlock",
  "N+1 query",
  "CORS error",
  "Heisenbug",
  "Segfault",
  "StackOverflow",
  "Undefined index",
  "Timezone bug",
  "Flaky test",
  "Merge conflict",
  "Cache miss",
  "Infinite loop",
  "Typo in prod",
];

type Bug = { col: number; row: number; alive: boolean; emoji: string; name: string };
type Shot = { x: number; y: number; vx: number; vy: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; colour: keyof ThemeColors };

/** `fireQueued` catches taps shorter than a frame; the engine clears it. */
export type Input = { left: boolean; right: boolean; fire: boolean; fireQueued: boolean; pointerX: number | null };

export type Events = {
  score: (score: number) => void;
  lives: (lives: number) => void;
  wave: (wave: number) => void;
  fixed: (name: string) => void;
  end: (won: boolean, score: number) => void;
  sound: (kind: "shoot" | "hit" | "hurt" | "win" | "lose") => void;
};

export function createInvaders(events: Events, reduced: boolean) {
  const s = {
    playerX: W / 2,
    lives: LIVES,
    score: 0,
    wave: 1,
    bugs: [] as Bug[],
    gridX: 0,
    gridY: 0,
    dir: 1,
    shots: [] as Shot[],
    enemyShots: [] as Shot[],
    particles: [] as Particle[],
    cooldown: 0,
    enemyTimer: 1.2,
    invulnerable: 0,
    banner: 0,
    boss: null as null | { x: number; y: number; hp: number; dir: number; timer: number },
    over: false,
    time: 0,
  };

  function startWave(wave: number) {
    s.wave = wave;
    s.shots = [];
    s.enemyShots = [];
    s.banner = 1.4;
    s.enemyTimer = 1.4;
    s.gridX = (W - (COLS - 1) * CELL_X) / 2;
    s.gridY = 56;
    s.dir = 1;
    if (wave === WAVES) {
      s.bugs = [];
      s.boss = { x: W / 2, y: 78, hp: BOSS_HP, dir: 1, timer: 1.2 };
    } else {
      s.boss = null;
      const offset = (wave - 1) * 7;
      s.bugs = Array.from({ length: COLS * ROWS }, (_, i) => ({
        col: i % COLS,
        row: Math.floor(i / COLS),
        alive: true,
        emoji: BUGS[Math.floor(i / COLS) % BUGS.length],
        name: NAMES[(i + offset) % NAMES.length],
      }));
    }
    events.wave(wave);
  }

  function reset() {
    s.playerX = W / 2;
    s.lives = LIVES;
    s.score = 0;
    s.particles = [];
    s.invulnerable = 0;
    s.over = false;
    s.cooldown = 0;
    events.score(0);
    events.lives(LIVES);
    startWave(1);
  }

  const bugPos = (b: Bug) => ({ x: s.gridX + b.col * CELL_X, y: s.gridY + b.row * CELL_Y });

  function burst(x: number, y: number, colour: keyof ThemeColors, n = 12) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 30 + Math.random() * 90;
      s.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, colour });
    }
  }

  function hurt() {
    if (s.invulnerable > 0) return;
    s.lives -= 1;
    s.invulnerable = 1.4;
    events.lives(s.lives);
    events.sound("hurt");
    burst(s.playerX, PLAYER_Y, "coral", 18);
    if (s.lives <= 0) finish(false);
  }

  function finish(won: boolean) {
    if (s.over) return;
    s.over = true;
    events.sound(won ? "win" : "lose");
    events.end(won, s.score);
  }

  function step(dt: number, input: Input) {
    if (s.over) return;
    s.time += dt;
    s.banner = Math.max(0, s.banner - dt);
    s.invulnerable = Math.max(0, s.invulnerable - dt);
    s.cooldown = Math.max(0, s.cooldown - dt);

    // player
    if (input.pointerX !== null) {
      const d = input.pointerX - s.playerX;
      s.playerX += Math.sign(d) * Math.min(Math.abs(d), PLAYER_SPEED * 1.4 * dt);
    } else {
      s.playerX += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * PLAYER_SPEED * dt;
    }
    s.playerX = Math.min(W - PLAYER_HALF - 2, Math.max(PLAYER_HALF + 2, s.playerX));

    if ((input.fire || input.fireQueued) && s.cooldown === 0 && s.banner < 0.6) {
      input.fireQueued = false;
      s.shots.push({ x: s.playerX, y: PLAYER_Y - 10, vx: 0, vy: -SHOT_SPEED });
      s.cooldown = SHOT_COOLDOWN;
      events.sound("shoot");
    }

    // swarm
    const alive = s.bugs.filter((b) => b.alive);
    if (alive.length) {
      const total = s.bugs.length;
      const speed = 16 + (1 - alive.length / total) * 70 + s.wave * 8;
      s.gridX += s.dir * speed * dt;
      const xs = alive.map((b) => bugPos(b).x);
      if ((s.dir > 0 && Math.max(...xs) > W - 12) || (s.dir < 0 && Math.min(...xs) < 12)) {
        s.dir *= -1;
        s.gridY += 10;
      }
      if (Math.max(...alive.map((b) => bugPos(b).y)) > PLAYER_Y - 18) finish(false);

      s.enemyTimer -= dt;
      if (s.enemyTimer <= 0 && s.banner === 0) {
        s.enemyTimer = Math.max(0.35, 1.25 - s.wave * 0.2 - (1 - alive.length / total) * 0.5) * (0.7 + Math.random() * 0.6);
        // the lowest bug in a random column fires
        const cols = [...new Set(alive.map((b) => b.col))];
        const col = cols[Math.floor(Math.random() * cols.length)];
        const shooter = alive.filter((b) => b.col === col).sort((a, b) => b.row - a.row)[0];
        const p = bugPos(shooter);
        s.enemyShots.push({ x: p.x, y: p.y + 8, vx: 0, vy: ENEMY_SHOT_SPEED });
      }
    }

    // boss: the null pointer
    const boss = s.boss;
    if (boss) {
      boss.x += boss.dir * (55 + (BOSS_HP - boss.hp) * 4) * dt;
      if (boss.x > W - 26 || boss.x < 26) boss.dir *= -1;
      boss.y = 78 + Math.sin(s.time * 1.3) * 10;
      boss.timer -= dt;
      if (boss.timer <= 0 && s.banner === 0) {
        boss.timer = Math.max(0.6, 1.2 - (BOSS_HP - boss.hp) * 0.03);
        for (const vx of [-45, 0, 45]) s.enemyShots.push({ x: boss.x, y: boss.y + 16, vx, vy: ENEMY_SHOT_SPEED * 1.1 });
      }
    }

    // move shots
    const move = (list: Shot[]) =>
      list
        .map((b) => ({ ...b, x: b.x + b.vx * dt, y: b.y + b.vy * dt }))
        .filter((b) => b.y > -10 && b.y < H + 10 && b.x > -10 && b.x < W + 10);
    s.shots = move(s.shots);
    s.enemyShots = move(s.enemyShots);

    // player shots vs bugs / boss
    s.shots = s.shots.filter((shot) => {
      for (const b of s.bugs) {
        if (!b.alive) continue;
        const p = bugPos(b);
        if (Math.abs(shot.x - p.x) < 11 && Math.abs(shot.y - p.y) < 10) {
          b.alive = false;
          s.score += 10 * s.wave;
          events.score(s.score);
          events.fixed(b.name);
          events.sound("hit");
          burst(p.x, p.y, "green");
          return false;
        }
      }
      if (boss && Math.abs(shot.x - boss.x) < 20 && Math.abs(shot.y - boss.y) < 16) {
        boss.hp -= 1;
        s.score += 15;
        events.score(s.score);
        events.sound("hit");
        burst(shot.x, shot.y, "purple", 6);
        if (boss.hp <= 0) {
          s.score += 250 + s.lives * 100;
          events.score(s.score);
          events.fixed("NullPointerException");
          burst(boss.x, boss.y, "orange", 40);
          s.boss = null;
          finish(true);
        }
        return false;
      }
      return true;
    });

    // enemy shots vs player
    s.enemyShots = s.enemyShots.filter((shot) => {
      if (Math.abs(shot.x - s.playerX) < PLAYER_HALF && Math.abs(shot.y - PLAYER_Y) < 8) {
        hurt();
        return false;
      }
      return true;
    });

    // next wave
    if (!s.over && !s.boss && s.bugs.length && s.bugs.every((b) => !b.alive)) startWave(s.wave + 1);

    s.particles = s.particles
      .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy + 120 * dt, life: p.life - dt * 1.5 }))
      .filter((p) => p.life > 0);
  }

  function draw(ctx: CanvasRenderingContext2D, c: ThemeColors, font: string) {
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // bugs
    ctx.font = `17px ${font}`;
    for (const b of s.bugs) {
      if (!b.alive) continue;
      const p = bugPos(b);
      const wiggle = reduced ? 0 : Math.sin(s.time * 6 + b.col) * 1.5;
      ctx.fillText(b.emoji, p.x, p.y + wiggle);
    }

    // boss
    if (s.boss) {
      const boss = s.boss;
      ctx.font = `34px ${font}`;
      ctx.fillText("👾", boss.x, boss.y);
      ctx.fillStyle = c.line;
      ctx.fillRect(boss.x - 22, boss.y - 28, 44, 4);
      ctx.fillStyle = c.coral;
      ctx.fillRect(boss.x - 22, boss.y - 28, (44 * boss.hp) / BOSS_HP, 4);
      ctx.font = `9px ${font}`;
      ctx.fillStyle = c.text;
      ctx.fillText("null pointer", boss.x, boss.y + 26);
    }

    // shots
    ctx.fillStyle = c.green;
    for (const shot of s.shots) ctx.fillRect(shot.x - 1, shot.y - 5, 2, 9);
    ctx.fillStyle = c.coral;
    for (const shot of s.enemyShots) {
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // particles
    for (const p of s.particles) {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = c[p.colour];
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // player: a little ship with a cursor glow, blinking while invulnerable
    const blink = s.invulnerable > 0 && Math.floor(s.invulnerable * 10) % 2 === 0;
    if (!blink && !s.over) {
      ctx.shadowColor = c.green;
      ctx.shadowBlur = 10;
      ctx.fillStyle = c.green;
      ctx.beginPath();
      ctx.moveTo(s.playerX, PLAYER_Y - 9);
      ctx.lineTo(s.playerX + PLAYER_HALF, PLAYER_Y + 6);
      ctx.lineTo(s.playerX, PLAYER_Y + 2);
      ctx.lineTo(s.playerX - PLAYER_HALF, PLAYER_Y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ground line
    ctx.fillStyle = c.line;
    ctx.fillRect(0, PLAYER_Y + 14, W, 1);

    if (s.banner > 0) {
      ctx.globalAlpha = Math.min(1, s.banner * 2);
      ctx.fillStyle = c.orange;
      ctx.font = `14px ${font}`;
      ctx.fillText(s.wave === WAVES ? "// BOSS: null pointer" : `// WAVE ${s.wave}`, W / 2, H / 2 + 20);
      ctx.globalAlpha = 1;
    }
  }

  return { reset, step, draw, get over() { return s.over; } };
}

export type InvadersEngine = ReturnType<typeof createInvaders>;
