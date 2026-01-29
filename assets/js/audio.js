let ctx = null;
let humOsc = null;
let humGain = null;

export function audioInitOnUserGesture() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  humOsc = ctx.createOscillator();
  humOsc.type = "sawtooth";
  humOsc.frequency.value = 52;

  humGain = ctx.createGain();
  humGain.gain.value = 0.0;

  humOsc.connect(humGain);
  humGain.connect(ctx.destination);
  humOsc.start();

  rampHum(0.02, 0.6);
}

export function rampHum(target = 0.02, seconds = 0.6) {
  if (!ctx || !humGain) return;
  humGain.gain.cancelScheduledValues(ctx.currentTime);
  humGain.gain.linearRampToValueAtTime(target, ctx.currentTime + seconds);
}

export function beep(freq = 880, durMs = 90, vol = 0.04) {
  if (!ctx) return;

  const o = ctx.createOscillator();
  o.type = "square";
  o.frequency.value = freq;

  const g = ctx.createGain();
  g.gain.value = 0.0;

  o.connect(g);
  g.connect(ctx.destination);

  const t0 = ctx.currentTime;
  g.gain.setValueAtTime(0.0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  g.gain.linearRampToValueAtTime(0.0, t0 + durMs / 1000);

  o.start(t0);
  o.stop(t0 + durMs / 1000 + 0.02);
}

export function glitchBurst() {
  beep(180, 120, 0.05);
  setTimeout(() => beep(260, 90, 0.04), 90);
  setTimeout(() => beep(120, 160, 0.05), 160);
}
