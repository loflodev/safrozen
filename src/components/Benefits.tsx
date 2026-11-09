import { useEffect, useRef, type ComponentType, type SVGProps } from 'react'
import { LeafIcon, SnowflakeIcon, TimerIcon } from './icons'
import { clamp01, ENTRY_CLEAR } from './scroll'
import './Benefits.css'

type Benefit = {
  title: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const BENEFITS: Benefit[] = [
  { title: 'Précuits et Congelés', Icon: SnowflakeIcon },
  { title: 'Écologiques', Icon: LeafIcon },
  { title: 'Solution rapide', Icon: TimerIcon },
]

const READY_MIN = 20
// The counter's own clock: 0 -> 20 with an ease-out, whatever the scroll speed.
const COUNT_MS = 1600
// Share of the picture (capped at one viewport) that must be on screen to play.
const FULL_VIEW = 0.99
// Cards are not scrubbed: once they are in view they
// rise in on their own, one after another, in step with the counter: each
// takes CARD_MS and the last one lands as the count reaches 20.
const CARD_MS = 900

// 0 -> 1: how much of the element is on screen. An element taller than the
// viewport counts as fully in view once it fills the viewport.
function shownShare(el: Element) {
  const rect = el.getBoundingClientRect()
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
  return clamp01(visible / Math.min(rect.height, window.innerHeight))
}

export default function Benefits() {
  const trackRef = useRef<HTMLElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  /*
   * The section ends with its cards. They rise in one after another on their
   * own clock (CSS transitions) once they are in
   * view, and reset when the section leaves the screen, so they play again on
   * the next visit.
   * The counter plays 0 -> 20 on its own clock once the picture is fully in
   * view, again whenever the mouse moves onto the ring, and resets once the
   * section has left the screen. All written straight to the DOM.
   */
  useEffect(() => {
    const track = trackRef.current
    const art = artRef.current
    const list = listRef.current
    const ring = ringRef.current
    const num = numRef.current
    if (!track || !art || !list || !ring || !num) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = Array.from(list.children) as HTMLElement[]

    let countFrame = 0
    let countTimer = 0
    let played = false
    let cardsShown = false

    const cardGap = (COUNT_MS - CARD_MS) / Math.max(1, cards.length - 1)
    const showCards = (show: boolean) => {
      cardsShown = show
      cards.forEach((card, i) => {
        card.style.setProperty('--card-dur', `${CARD_MS}ms`)
        card.style.setProperty('--card-delay', `${show ? i * cardGap : 0}ms`)
        // Reduced motion: the cards are simply there.
        card.style.setProperty('--t', show || reduceMotion ? '1' : '0')
      })
    }

    const stopCount = () => {
      cancelAnimationFrame(countFrame)
      clearTimeout(countTimer)
    }
    // 0 -> 20, easing out.
    const playCount = () => {
      stopCount()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / COUNT_MS)
        num.textContent = String(Math.round(READY_MIN * (1 - (1 - t) ** 3)))
        if (t < 1) countFrame = requestAnimationFrame(tick)
      }
      countFrame = requestAnimationFrame(tick)
      // Lands even if frames pause (background tab, busy main thread).
      countTimer = window.setTimeout(() => {
        cancelAnimationFrame(countFrame)
        num.textContent = String(READY_MIN)
      }, COUNT_MS + 50)
    }

    // Checked on every scroll event, not per frame, so the trigger never
    // waits on a frame.
    // Reduced motion: the counter just reads 20.
    const checkView = () => {
      const vh = window.innerHeight
      const section = track.getBoundingClientRect()
      if (!cardsShown && list.getBoundingClientRect().top < vh * (1 - ENTRY_CLEAR)) {
        showCards(true)
      } else if (cardsShown && (section.bottom <= 0 || section.top >= vh)) {
        showCards(false)
      }
      if (reduceMotion) return
      const shown = shownShare(art)
      if (!played && shown >= FULL_VIEW) {
        played = true
        playCount()
      } else if (played && shown === 0) {
        played = false
        stopCount()
        num.textContent = '0'
      }
    }

    // Parallax (Benefits.css): --par runs 1 -> -1 as the section crosses the
    // screen, 0 when its centre meets the viewport's. Written once per frame,
    // only while the section is on screen; reduced motion leaves it unset.
    let parFrame = 0
    const paintPar = () => {
      parFrame = 0
      const rect = track.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom <= 0 || rect.top >= vh) return
      const par = (rect.top + rect.height / 2 - vh / 2) / ((vh + rect.height) / 2)
      track.style.setProperty('--par', (clamp01((par + 1) / 2) * 2 - 1).toFixed(4))
    }
    const onPar = () => {
      if (!reduceMotion && !parFrame) parFrame = requestAnimationFrame(paintPar)
    }

    const onHover = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && !reduceMotion) playCount()
    }

    if (!reduceMotion) num.textContent = '0'
    showCards(false)
    checkView()
    onPar()
    window.addEventListener('scroll', checkView, { passive: true })
    window.addEventListener('resize', checkView)
    window.addEventListener('scroll', onPar, { passive: true })
    window.addEventListener('resize', onPar)
    ring.addEventListener('pointerenter', onHover)
    return () => {
      stopCount()
      cancelAnimationFrame(parFrame)
      window.removeEventListener('scroll', checkView)
      window.removeEventListener('resize', checkView)
      window.removeEventListener('scroll', onPar)
      window.removeEventListener('resize', onPar)
      ring.removeEventListener('pointerenter', onHover)
    }
  }, [])

  return (
    <section id="avantages" className="benefits" ref={trackRef} aria-labelledby="benefits-title">
      <div className="benefits__texture" aria-hidden="true" />
      <div className="benefits__stage">
        <h2 className="visually-hidden" id="benefits-title">
          Pourquoi Legim Express
        </h2>
        <div className="benefits__art" ref={artRef} aria-hidden="true">
          <div className="benefits__canvas">
            <img
              className="benefits__img"
              src="/images/bb6-1440.webp"
              srcSet="/images/bb6-960.webp 960w, /images/bb6-1440.webp 1440w, /images/bb6-2160.webp 2160w, /images/bb6-2880.webp 2880w"
              sizes="(min-width: 1200px) max(100vw, 160svh), 190vw"
              width={1440}
              height={900}
              alt=""
              loading="lazy"
              decoding="async"
            />
            {/* Hover area over the printed ring: replays the count. */}
            <div className="benefits__ring" ref={ringRef} />
            <div className="benefits__counter">
              <span className="benefits__sign">
                <span>+</span>
                <span>−</span>
              </span>
              <span className="benefits__num" ref={numRef}>
                {READY_MIN}
              </span>
              <span className="benefits__unit">MIN</span>
            </div>
          </div>
        </div>

        <div className="benefits__copy">
          <ul className="benefits__list" ref={listRef}>
            {BENEFITS.map(({ title, Icon }) => (
              <li key={title} className="benefit-card">
                <span className="benefit-card__icon">
                  <Icon width={22} height={22} />
                </span>
                <h3 className="benefit-card__title">{title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
