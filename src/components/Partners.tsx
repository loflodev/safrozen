import { useEffect, useRef } from 'react'
import { useReveal } from './reveal'
import './Partners.css'

// Logos in public/images/partners/ (178×100, transparent).
const PARTNERS = [
  { file: 'iga', name: 'IGA extra' },
  { file: 'armel', name: 'Distribution Armel' },
  { file: 'marche-palumbo', name: 'Marché Palumbo' },
  { file: 'damesara', name: 'Dame Sara' },
  { file: 'le-pro', name: 'Le Pro' },
  { file: 'm&s', name: 'M&S' },
  { file: 'obeissance', name: 'Obéissance' },
  { file: 'wawa', name: 'Wawa' },
]

// The row drifts left forever at BASE px/s; scrolling the page adds to that
// (SCROLL_GAIN × the distance scrolled), and the extra decays per frame.
const BASE = 40
const SCROLL_GAIN = 0.6
const BOOST_DECAY = 0.92
const BOOST_MAX = 900

export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  useReveal(sectionRef)

  /*
   * The track holds the logos twice; it slides left and wraps by one copy's
   * width, so the row never runs out. It only runs while on screen, and pauses
   * while a logo is hovered. Written straight to the DOM.
   */
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
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

    const onScroll = () => {
      const y = window.scrollY
      boost = Math.min(BOOST_MAX, boost + Math.abs(y - lastScroll) * SCROLL_GAIN)
      lastScroll = y
    }
    const pause = () => {
      paused = true
    }
    const resume = () => {
      paused = false
    }

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    io.observe(section)
    window.addEventListener('scroll', onScroll, { passive: true })
    track.addEventListener('pointerover', pause)
    track.addEventListener('pointerleave', resume)
    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      track.removeEventListener('pointerover', pause)
      track.removeEventListener('pointerleave', resume)
    }
  }, [])

  return (
    <section id="partenaires" className="section partners" ref={sectionRef} aria-labelledby="partners-title">
      <div className="section__head partners__head">
        <div className="veg-texture" aria-hidden="true" />
        <h2 className="section__title partners__title" id="partners-title">
          Nos partenaires
        </h2>
        <p className="section__lede partners__lede">Retrouvez Legim Express chez nos détaillants.</p>
      </div>

      <div className="partners__viewport">
        <ul className="partners__track" ref={trackRef}>
          {[0, 1].map((copy) =>
            PARTNERS.map(({ file, name }, i) => (
              <li
                key={`${copy}-${file}`}
                className="partners__item"
                style={{ '--i': i } as React.CSSProperties}
                aria-hidden={copy === 1 || undefined}
              >
                <img
                  className="partners__logo"
                  src={`/images/partners/${file}.png`}
                  alt={copy === 0 ? name : ''}
                  width={178}
                  height={100}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  )
}
