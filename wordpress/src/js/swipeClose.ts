// Swipe a right-hand sheet off to the right to close it (touch and pen only).
// The sheet follows the finger 1:1 from where it was grabbed, resists past its
// open edge, and on release the gesture's momentum decides: Apple's projection
// (deceleration 0.998) past half the width closes it, anything less springs it
// back. Both springs start at the finger's velocity, and a touch mid-spring
// grabs the sheet where it is. Framework-free: the WordPress theme keeps an
// identical copy (wordpress/src/js/swipeClose.ts). Returns the cleanup.

const SLOP = 10 // px of travel before the gesture picks a direction
const DECELERATION = 0.998
const BACK = { damping: 0.8, response: 0.3 } // Apple's drawer spring
const AWAY = { damping: 1, response: 0.3 } // no bounce back into view

const project = (v: number) => ((v / 1000) * DECELERATION) / (1 - DECELERATION)

const rubberband = (over: number, size: number, c = 0.55) => (over * size * c) / (size + c * Math.abs(over))

export function swipeClose(el: HTMLElement, onClose: () => void): () => void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let x = 0 // the sheet's live offset
  let frame = 0
  let id: number | null = null
  let start = { x: 0, y: 0, offset: 0 }
  let dragging = false
  let samples: { x: number; t: number }[] = []
  let swallowClick = false

  const paint = (v: number) => {
    x = v
    el.style.transform = `translateX(${v}px)`
  }

  const release = () => {
    el.style.transform = ''
    el.style.transition = ''
    x = 0
  }

  // Critically damped (or a little bouncy) spring, Apple's damping + response.
  const spring = (to: number, velocity: number, { damping, response }: typeof BACK, done: () => void) => {
    const k = (2 * Math.PI / response) ** 2
    const c = (4 * Math.PI * damping) / response
    let v = velocity
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      v += (-k * (x - to) - c * v) * dt
      paint(x + v * dt)
      if (Math.abs(x - to) < 0.5 && Math.abs(v) < 10) {
        paint(to)
        done()
      } else frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' || id !== null) return
    cancelAnimationFrame(frame)
    id = e.pointerId
    dragging = false
    start = { x: e.clientX, y: e.clientY, offset: x }
    samples = [{ x: e.clientX, t: e.timeStamp }]
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    const dx = e.clientX - start.x
    if (!dragging) {
      const dy = e.clientY - start.y
      if (Math.hypot(dx, dy) < SLOP) return
      // A vertical start is the list scrolling, not a swipe.
      if (Math.abs(dy) > Math.abs(dx)) return end()
      dragging = true
      el.setPointerCapture(e.pointerId)
      el.style.transition = 'none'
    }
    samples.push({ x: e.clientX, t: e.timeStamp })
    samples = samples.filter((s) => e.timeStamp - s.t < 100)
    if (reduceMotion) return
    const next = start.offset + dx
    paint(next < 0 ? rubberband(next, el.offsetWidth) : next)
  }

  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    const wasDragging = dragging
    end()
    // A captured drag ends in a click on the sheet itself, which would read as a backdrop click.
    if (wasDragging) {
      swallowClick = true
      window.setTimeout(() => (swallowClick = false))
    }
    if (!wasDragging) {
      if (x !== 0) spring(0, 0, BACK, release)
      return
    }
    const first = samples[0]
    const last = samples[samples.length - 1]
    const dt = last.t - first.t
    const velocity = dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0
    const width = el.offsetWidth
    const travel = reduceMotion ? last.x - start.x : x
    if (travel + project(velocity) > width / 2) {
      if (reduceMotion) {
        release()
        onClose()
        return
      }
      spring(width, velocity, AWAY, () => {
        // Off screen: keep it there and let the dialog close without sliding again
        // (the backdrop still fades), then hand the transform back to CSS.
        el.style.transform = 'translateX(100%)'
        el.style.transition = 'overlay var(--dur-base) allow-discrete, display var(--dur-base) allow-discrete'
        onClose()
        requestAnimationFrame(() => requestAnimationFrame(release))
      })
    } else if (reduceMotion) release()
    else spring(0, velocity, BACK, release)
  }

  const end = () => {
    id = null
    dragging = false
  }

  // The browser took the gesture (a vertical scroll): settle back.
  const onCancel = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    end()
    if (x !== 0) spring(0, 0, BACK, release)
    else release()
  }

  const onClick = (e: MouseEvent) => {
    if (!swallowClick) return
    swallowClick = false
    e.stopPropagation()
    e.preventDefault()
  }

  el.addEventListener('pointerdown', onDown)
  el.addEventListener('click', onClick, true)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', onCancel)
  return () => {
    cancelAnimationFrame(frame)
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('click', onClick, true)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
    el.removeEventListener('pointercancel', onCancel)
  }
}
