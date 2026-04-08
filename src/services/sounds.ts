/**
 * Sound effects engine using the Web Audio API.
 * All sounds are synthesized — no audio files required.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume if suspended (browsers require user gesture)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

/** Play a simple tone. */
function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  delay = 0,
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(volume, ac.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration + 0.05);
}

/** Short noise burst (used for clicks / erase). */
function noise(duration: number, volume = 0.08) {
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * volume;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  src.connect(gain);
  gain.connect(ac.destination);
  src.start();
}

// ---- Public API ----

let enabled = false;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/** Soft tap for placing a number. */
export function playTap() {
  if (!enabled) return;
  tone(880, 0.08, 'sine', 0.10);
}

/** Softer click for toggling a note. */
export function playNote() {
  if (!enabled) return;
  tone(1100, 0.06, 'sine', 0.07);
}

/** Short descending tone for erase. */
export function playErase() {
  if (!enabled) return;
  tone(440, 0.12, 'triangle', 0.10);
}

/** Quick low buzz for errors / conflicts. */
export function playError() {
  if (!enabled) return;
  tone(200, 0.15, 'square', 0.06);
  tone(180, 0.15, 'square', 0.05, 0.06);
}

/** Small click for undo. */
export function playUndo() {
  if (!enabled) return;
  tone(660, 0.06, 'sine', 0.08);
}

/** Small click for redo. */
export function playRedo() {
  if (!enabled) return;
  tone(780, 0.06, 'sine', 0.08);
}

/** Notification chime for hints. */
export function playHint() {
  if (!enabled) return;
  tone(523, 0.12, 'sine', 0.10);
  tone(659, 0.12, 'sine', 0.10, 0.10);
}

/** Toggle click. */
export function playToggle() {
  if (!enabled) return;
  noise(0.04, 0.10);
  tone(1000, 0.04, 'sine', 0.06);
}

/** Victory fanfare — ascending chord. */
export function playComplete() {
  if (!enabled) return;
  tone(523, 0.3, 'sine', 0.12, 0);      // C5
  tone(659, 0.3, 'sine', 0.12, 0.12);   // E5
  tone(784, 0.3, 'sine', 0.12, 0.24);   // G5
  tone(1047, 0.5, 'sine', 0.15, 0.36);  // C6
}

/** Cell selection tick. */
export function playCellSelect() {
  if (!enabled) return;
  tone(1200, 0.03, 'sine', 0.05);
}
