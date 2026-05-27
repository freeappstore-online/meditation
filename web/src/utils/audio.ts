import type { AmbientSound } from "../types";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

// ---- Bell / chime ----

export function playBell(): void {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 2);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);
}

export function playIntervalBell(): void {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.2);
}

// ---- Ambient sounds ----

interface AmbientNodes {
  source: AudioBufferSourceNode;
  gain: GainNode;
  filters: BiquadFilterNode[];
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

let currentAmbient: AmbientNodes | null = null;
let currentSound: AmbientSound = "silence";

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function buildRain(ctx: AudioContext, masterGain: GainNode): AmbientNodes {
  const buffer = createNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1000;
  bp.Q.value = 0.8;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 300;

  source.connect(bp);
  bp.connect(hp);
  hp.connect(masterGain);
  source.start();

  return { source, gain: masterGain, filters: [bp, hp] };
}

function buildOcean(ctx: AudioContext, masterGain: GainNode): AmbientNodes {
  const buffer = createNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 600;
  lp.Q.value = 1;

  // LFO to modulate gain for wave effect
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.1;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.3;

  const waveMix = ctx.createGain();
  waveMix.gain.value = 0.5;

  lfo.connect(lfoGain);
  lfoGain.connect(waveMix.gain);

  source.connect(lp);
  lp.connect(waveMix);
  waveMix.connect(masterGain);
  lfo.start();

  return { source, gain: masterGain, filters: [lp], lfo, lfoGain };
}

function buildWind(ctx: AudioContext, masterGain: GainNode): AmbientNodes {
  const buffer = createNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 400;
  lp.Q.value = 2;

  // Slow LFO for wind gusts
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.07;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 200;

  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);

  source.connect(lp);
  lp.connect(masterGain);
  lfo.start();

  return { source, gain: masterGain, filters: [lp], lfo, lfoGain };
}

function buildForest(ctx: AudioContext, masterGain: GainNode): AmbientNodes {
  const buffer = createNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Layer 1: low ambient (rustling leaves)
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 800;

  const lowGain = ctx.createGain();
  lowGain.gain.value = 0.4;

  source.connect(lp);
  lp.connect(lowGain);
  lowGain.connect(masterGain);

  // Layer 2: high-pass for bird-like chirps with amplitude modulation
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3000;

  const birdGain = ctx.createGain();
  birdGain.gain.value = 0.08;

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 2.5;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.06;

  lfo.connect(lfoGain);
  lfoGain.connect(birdGain.gain);

  source.connect(hp);
  hp.connect(birdGain);
  birdGain.connect(masterGain);
  lfo.start();

  return { source, gain: masterGain, filters: [lp, hp], lfo, lfoGain };
}

export function startAmbient(sound: AmbientSound, volume: number): void {
  stopAmbient();
  currentSound = sound;
  if (sound === "silence") return;

  const ctx = getContext();
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(ctx.destination);

  switch (sound) {
    case "rain":
      currentAmbient = buildRain(ctx, masterGain);
      break;
    case "ocean":
      currentAmbient = buildOcean(ctx, masterGain);
      break;
    case "wind":
      currentAmbient = buildWind(ctx, masterGain);
      break;
    case "forest":
      currentAmbient = buildForest(ctx, masterGain);
      break;
  }
}

export function setAmbientVolume(volume: number): void {
  if (currentAmbient) {
    currentAmbient.gain.gain.value = volume;
  }
}

export function stopAmbient(): void {
  if (currentAmbient) {
    try {
      currentAmbient.source.stop();
    } catch {
      // already stopped
    }
    currentAmbient.lfo?.stop();
    currentAmbient = null;
  }
  currentSound = "silence";
}

export function getCurrentSound(): AmbientSound {
  return currentSound;
}
