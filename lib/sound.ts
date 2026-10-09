"use client";

import { getPrefs } from "./prefs";

// 8-bit blips from a WebAudio oscillator: no audio files. Silent unless the
// visitor turned sound on in the command palette.

let ctx: AudioContext | null = null;

export function blip(freq = 440, ms = 60, type: OscillatorType = "square", volume = 0.04) {
  if (!getPrefs().sound || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
  } catch {
    // audio unavailable
  }
}

export const sfx = {
  hit: () => blip(520, 40),
  score: () => blip(880, 70, "triangle"),
  lose: () => blip(140, 260, "sawtooth"),
  win: () => {
    blip(660, 90, "triangle");
    setTimeout(() => blip(880, 90, "triangle"), 90);
    setTimeout(() => blip(1320, 160, "triangle"), 180);
  },
  key: () => blip(1200, 12, "square", 0.015),
};
