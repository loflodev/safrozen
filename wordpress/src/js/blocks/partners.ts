import '../../css/blocks/partners.css'

// The row drifts left forever at BASE px/s; scrolling the page adds to that
// (SCROLL_GAIN × the distance scrolled), and the extra decays per frame.
const BASE = 40
const SCROLL_GAIN = 0.6
const BOOST_DECAY = 0.92
const BOOST_MAX = 900

/*
 * The track holds the logos twice; it slides left and wraps by one copy's
 * width, so the row never runs out. It only runs while on screen, and pauses
 * while a logo is hovered.
 */
function initPartners(section: HTMLElement) {
  const track = section.querySelector<HTMLElement>('.partners__track')
  if (!track) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let x = 0
  let boost = 0
  let last = 0
  let frame = 0
  let paused = false
  let lastScroll = window.scrollY

  const tick = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    const half = track.scrollWidth / 2
    if (!paused) x -= (BASE + boost) * dt
    if (half && x <= -half) x += half
    boost *= BOOST_DECAY
    track.style.transform = `translateX(${x}px)`
    frame = requestAnimationFrame(tick)
  }

  const start = () => {
    if (frame) return
    last = 0
    frame = requestAnimationFrame(tick)
  }
  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
  io.observe(section)
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY
      boost = Math.min(BOOST_MAX, boost + Math.abs(y - lastScroll) * SCROLL_GAIN)
      lastScroll = y
    },
    { passive: true },
  )
  track.addEventListener('pointerover', () => (paused = true))
  track.addEventListener('pointerleave', () => (paused = false))
}

document.querySelectorAll<HTMLElement>('.partners').forEach(initPartners)
