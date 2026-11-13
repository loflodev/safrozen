// Tells a new wheel scroll apart from the tail of the previous one, so every
// scroll moves the product wheel exactly one step, big or small.

export const WHEEL_THRESHOLD = 8 // px of wheel/trackpad travel that counts as intent
export const SWIPE_THRESHOLD = 30 // px of finger travel that counts as intent

export type WheelSample = { t: number; d: number } // time (ms) and |deltaY| (px)

const GESTURE_GAP_MS = 200 // quiet time that always ends a scroll
const DENSE_MS = 25 // events closer than this are a continuous stream (trackpad, momentum)
const BEAT_BREAK = 2.5 // a notch gap this many beats long starts a new scroll
const MIN_BREAK_MS = 90 // ... and never shorter than this
const SURGE = 2 // input that faded to 1/SURGE of its peak, then rises SURGE× again, is a new push
const MIN_SURGE_PX = 24 // ... and never smaller than this

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

// `log` holds the samples of the scroll in progress, oldest first (keep ~1s of them).
export function isNewScroll(log: WheelSample[], t: number, d: number): boolean {
  const prev = log[log.length - 1]
  if (!prev) return true
  const gap = t - prev.t
  if (gap >= GESTURE_GAP_MS) return true

  const recent = log.slice(-4)
  if (recent.length < 3) return false

  // A notched mouse wheel ticks at a steady beat while it spins; a clear break
  // in that beat is the finger flicking it again.
  const beats = recent.slice(1).map((s, i) => s.t - recent[i].t)
  const beat = median(beats)
  if (beat >= DENSE_MS && gap >= Math.max(beat * BEAT_BREAK, MIN_BREAK_MS)) return true

  // Momentum only fades. Input that peaked, faded to half, then jumps back up
  // is a new push. (A spin that is still speeding up has not faded yet.)
  let peak = 0
  for (let i = 1; i < log.length; i++) if (log[i].d >= log[peak].d) peak = i
  const after = log.slice(peak + 1).slice(-4).map((s) => s.d)
  if (!after.length) return false
  const floor = Math.min(...after)
  return floor * SURGE <= log[peak].d && d >= MIN_SURGE_PX && d >= floor * SURGE
}
