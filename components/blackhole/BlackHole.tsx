"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useThemeColors, type ThemeColors } from "@/lib/useThemeColors";
import { FRAGMENT, VERTEX } from "./shader";

/** Live values the caller can change every frame (e.g. the collapse animation). */
export type BlackHoleParams = { zoom: number };

type Props = {
  /** Paint the theme background and stars (404) or only the hole and disk (overlays, hero). */
  opaque?: boolean;
  stars?: boolean;
  /** Camera follows the pointer a little. */
  interactive?: boolean;
  /** Apparent size; ignored when `params` is given. */
  zoom?: number;
  params?: React.RefObject<BlackHoleParams>;
  /** Camera angle above the disk: 0.16 is the classic side view, ~1.45 looks down from above. */
  elevation?: number;
  /** Hole offset from the centre, in fractions of the canvas height. */
  center?: [number, number];
  /** Upper bound for pixel density; the loop lowers it on slow GPUs. */
  maxScale?: number;
  className?: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.trim().replace("#", "");
  const full = m.length === 3 ? m.replace(/./g, (c) => c + c) : m.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function palette(c: ThemeColors) {
  const white: [number, number, number] = [1, 0.97, 0.9];
  const orange = hexToRgb(c.orange);
  return {
    hot: mix(white, orange, 0.25),
    mid: orange,
    cool: hexToRgb(c.coral),
    bg: hexToRgb(c.deep),
    star: mix(hexToRgb(c.light), white, 0.4),
  };
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[blackhole] shader:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

/** Static stand-in: no WebGL2, reduced motion, or before JS runs. */
export function BlackHoleFallback({ className, opaque = true }: { className?: string; opaque?: boolean }) {
  return (
    <div aria-hidden className={cn("pointer-events-none overflow-hidden", opaque && "bg-bg-deep", className)}>
      <div className="absolute left-1/2 top-1/2 h-[18vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,transparent_38%,color-mix(in_oklab,var(--color-accent-orange)_85%,white)_44%,var(--color-accent-orange)_55%,color-mix(in_oklab,var(--color-accent-coral)_60%,transparent)_75%,transparent)] blur-[2px]" />
      <div className="absolute left-1/2 top-1/2 size-[26vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_0_2px_color-mix(in_oklab,var(--color-accent-orange)_70%,white),0_0_40px_6px_color-mix(in_oklab,var(--color-accent-orange)_45%,transparent)]" />
      <div className="absolute left-1/2 top-1/2 h-[6vmin] w-[62vmin] -translate-x-1/2 translate-y-[1vmin] rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent-orange)_80%,white),var(--color-accent-orange)_45%,transparent)] opacity-90" />
    </div>
  );
}

export default function BlackHole({
  opaque = true,
  stars = true,
  interactive = false,
  zoom = 1,
  params,
  center = [0, 0],
  elevation = 0.16,
  maxScale = 1.25,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const colors = useThemeColors();
  const [failed, setFailed] = useState(false);

  // latest props for the render loop without restarting it
  const live = useRef({ zoom, center, elevation, opaque, stars, colors: palette(colors) });
  useEffect(() => {
    live.current = { zoom, center, elevation, opaque, stars, colors: palette(colors) };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!gl || !vs || !fs) {
      // fall back to the CSS version
      setFailed(true);
      return;
    }
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[blackhole] link:", gl.getProgramInfoLog(program));
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    // one triangle covering the screen
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uni = {
      res: u("uRes"),
      time: u("uTime"),
      zoom: u("uZoom"),
      center: u("uCenter"),
      look: u("uLook"),
      elev: u("uElev"),
      hot: u("uHot"),
      mid: u("uMid"),
      cool: u("uCool"),
      bg: u("uBg"),
      star: u("uStar"),
      stars: u("uStars"),
      opaque: u("uOpaque"),
    };

    // ray marching is per pixel: start below native resolution (the disk is soft anyway)
    let scale = Math.min(window.devicePixelRatio || 1, maxScale) * 0.75;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // pointer → camera nudge, eased
    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      look.tx = (e.clientX / window.innerWidth) * 2 - 1;
      look.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (interactive) window.addEventListener("pointermove", onPointer, { passive: true });

    // only render while visible
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    io.observe(canvas);

    const start = performance.now();
    let last = start;
    let avg = 16.7;
    let frames = 0;
    let frame = 0;

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!onScreen) return;

      // adaptive quality: an averaged frame time over ~22 ms (< 45 fps) lowers the
      // resolution. Averaged because GPU-bound frames arrive in bursts.
      const dt = Math.min(now - last, 250);
      last = now;
      avg = avg * 0.9 + dt * 0.1;
      if (++frames % 30 === 0 && avg > 22 && scale > 0.3) {
        scale = Math.max(0.3, scale * 0.75);
        resize();
      }

      look.x += (look.tx - look.x) * 0.04;
      look.y += (look.ty - look.y) * 0.04;
      const l = live.current;
      const z = params?.current?.zoom ?? l.zoom;
      gl.uniform2f(uni.res, canvas.width, canvas.height);
      gl.uniform1f(uni.time, reduced ? 0 : (now - start) / 1000);
      gl.uniform1f(uni.zoom, z);
      gl.uniform2f(uni.center, l.center[0], l.center[1]);
      gl.uniform2f(uni.look, look.x, -look.y);
      gl.uniform1f(uni.elev, l.elevation);
      gl.uniform3fv(uni.hot, l.colors.hot);
      gl.uniform3fv(uni.mid, l.colors.mid);
      gl.uniform3fv(uni.cool, l.colors.cool);
      gl.uniform3fv(uni.bg, l.colors.bg);
      gl.uniform3fv(uni.star, l.colors.star);
      gl.uniform1f(uni.stars, l.stars ? 1 : 0);
      gl.uniform1f(uni.opaque, l.opaque ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // reduced motion: one still frame is enough
      if (reduced) cancelAnimationFrame(frame);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [interactive, maxScale, params, reduced]);

  if (failed) return <BlackHoleFallback className={className} opaque={opaque} />;
  return <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none block", className)} />;
}
