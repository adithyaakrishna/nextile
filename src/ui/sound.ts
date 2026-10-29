"use client";

import { getStore } from "@/persistence/use-store";

export const SOUNDS = ["clack", "tick", "correct", "miss"] as const;
export type SoundName = (typeof SOUNDS)[number];

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return null;
  context ??= new window.AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

function tone(ctx: AudioContext, { freq, at, length, type, gain }: { freq: number; at: number; length: number; type: OscillatorType; gain: number }) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.005);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(amp).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

function clack(ctx: AudioContext, at: number) {
  const length = 0.05;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4);
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 1.2;
  source.buffer = buffer;
  source.connect(filter).connect(ctx.destination);
  source.start(at);
}

// Synthesized on first use, so there are no audio files; every sound repeats something already visible
export function playSound(name: SoundName): void {
  if (!getStore().prefs.sound) return;
  const ctx = audio();
  if (!ctx) return;
  const at = ctx.currentTime + 0.01;
  switch (name) {
    case "clack":
      clack(ctx, at);
      return;
    case "tick":
      tone(ctx, { freq: 1320, at, length: 0.04, type: "square", gain: 0.05 });
      return;
    case "correct":
      tone(ctx, { freq: 523.25, at, length: 0.18, type: "triangle", gain: 0.2 });
      tone(ctx, { freq: 783.99, at: at + 0.11, length: 0.3, type: "triangle", gain: 0.2 });
      return;
    case "miss":
      tone(ctx, { freq: 110, at, length: 0.22, type: "sine", gain: 0.35 });
      return;
    default: {
      const unreachable: never = name;
      throw new Error(`Unknown sound ${unreachable}`);
    }
  }
}
