import { useEffect, useRef, type ComponentType, type CSSProperties, type SVGProps } from 'react'
import { LeafIcon, SnowflakeIcon, TimerIcon } from './icons'
import { PRODUCTS } from './products'
import { useReveal } from './reveal'
import { clamp01, ENTRY_CLEAR } from './scroll'
import './Benefits.css'

type Benefit = {
  title: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  // The hero product whose field fills the card.
  product: string
}

// One hero field per card, so the section echoes all three without picking one.
const BENEFITS: Benefit[] = [
  { title: 'Précuits et Congelés', Icon: SnowflakeIcon, product: 'eggplant' },
  { title: 'Écologiques', Icon: LeafIcon, product: 'lalo' },
  { title: 'Solution rapide', Icon: TimerIcon, product: 'chayotte' },
]

const READY_MIN = 20
// The dial's face is one hour; the arc stops on the 20-minute mark.
const FACE_MIN = 60
// The counter's own clock: 0 -> 20 with an ease-out, whatever the scroll speed.
const COUNT_MS = 1600
// Share of the dial (capped at one viewport) that must be on screen to play.
const FULL_VIEW = 0.99
// Cards are not scrubbed: once they are in view they rise in on their own,
// one after another, in step with the counter: each takes CARD_MS and the
// last one lands as the count reaches 20.
const CARD_MS = 900

// Dial geometry, in the SVG's 200-unit box (centre 100, 100); the ring of
// words runs outside the face, in the box's 32-unit margin.
const TICK_OUT = 90
const ARC_R = 70
const WORDS_R = 112
// The brand badge's three lines around the dial, clockwise on a circle that
// starts at 6 o'clock (offsets: 25% is 9 o'clock, 50% the top, 75% 3 o'clock).
const RING_WORDS = [
  { text: 'PRÊT EN', at: '27%' },
  { text: 'READY IN', at: '50%' },
  { text: 'LAP PARE NAN', at: '75.5%' },
]

// 0 -> 1: how much of the element is on screen. An element taller than the
// viewport counts as fully in view once it fills the viewport.
function shownShare(el: Element) {
  const rect = el.getBoundingClientRect()
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
  return clamp01(visible / Math.min(rect.height, window.innerHeight))
}

function fieldStyle(id: string) {
  const field = PRODUCTS.find((p) => p.id === id)?.field ?? []
  return { '--field-top': field[1], '--field-bottom': field[4] } as CSSProperties
}

export default function Benefits() {
  const trackRef = useRef<HTMLElement>(null)
  const dialRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const tipRef = useRef<SVGGElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  useReveal(trackRef)

  /*
   * The cards rise in one after another on their own clock (CSS transitions)
   * once they are in view, and reset when the section leaves the screen.
   * The dial plays 0 -> 20 (number and arc together) once it is fully in
   * view, again whenever the mouse moves onto it, and resets once it has left
   * the screen. All written straight to the DOM.
   */
  useEffect(() => {
    const track = trackRef.current
    const dial = dialRef.current
    const list = listRef.current
    const arc = arcRef.current
    const tip = tipRef.current
    const num = numRef.current
    if (!track || !dial || !list || !arc || !tip || !num) return

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

    // p 0 -> 1: the number, the arc (pathLength is the face's 60 minutes) and
    // the dot riding its tip.
    const paint = (p: number) => {
      const minutes = READY_MIN * p
      num.textContent = String(Math.round(minutes))
      arc.style.strokeDasharray = `${minutes} ${FACE_MIN}`
      tip.setAttribute('transform', `rotate(${(minutes / FACE_MIN) * 360} 100 100)`)
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
        paint(1 - (1 - t) ** 3)
        if (t < 1) countFrame = requestAnimationFrame(tick)
      }
      countFrame = requestAnimationFrame(tick)
      // Lands even if frames pause (background tab, busy main thread).
      countTimer = window.setTimeout(() => {
        cancelAnimationFrame(countFrame)
        paint(1)
      }, COUNT_MS + 50)
    }

    // Checked on every scroll event, not per frame, so the trigger never
    // waits on a frame. Reduced motion: the dial just reads 20.
    const checkView = () => {
      const vh = window.innerHeight
      const section = track.getBoundingClientRect()
      if (!cardsShown && list.getBoundingClientRect().top < vh * (1 - ENTRY_CLEAR)) {
        showCards(true)
      } else if (cardsShown && (section.bottom <= 0 || section.top >= vh)) {
        showCards(false)
      }
      if (reduceMotion) return
      const shown = shownShare(dial)
      if (!played && shown >= FULL_VIEW) {
        played = true
        playCount()
      } else if (played && shown === 0) {
        played = false
        stopCount()
        paint(0)
      }
    }

    const onHover = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && !reduceMotion) playCount()
    }

    paint(reduceMotion ? 1 : 0)
    showCards(false)
    checkView()
    window.addEventListener('scroll', checkView, { passive: true })
    window.addEventListener('resize', checkView)
    dial.addEventListener('pointerenter', onHover)
    return () => {
      stopCount()
      window.removeEventListener('scroll', checkView)
      window.removeEventListener('resize', checkView)
      dial.removeEventListener('pointerenter', onHover)
    }
  }, [])

  return (
    <section id="avantages" className="benefits" ref={trackRef} aria-labelledby="benefits-title">
      <div className="benefits__lead">
        <h2 className="section__title benefits__title" id="benefits-title">
          Pourquoi <span className="benefits__brand">Legim Express</span>&nbsp;?
        </h2>

        {/* A kitchen timer: an hour's face, the arc sweeping to 20 minutes, and
            the brand badge's words around it. */}
        <div className="benefits__dial" ref={dialRef}>
          <p className="visually-hidden">
            Prêt en 20 minutes. <span lang="en">Ready in 20 minutes.</span>{' '}
            <span lang="ht">Lap pare nan 20 minit.</span>
          </p>
          <svg className="benefits__face" viewBox="-32 -32 264 264" aria-hidden="true">
            <defs>
              <path
                id="benefits-words"
                d={`M 100 ${100 + WORDS_R} A ${WORDS_R} ${WORDS_R} 0 1 1 100 ${100 - WORDS_R} A ${WORDS_R} ${WORDS_R} 0 1 1 100 ${100 + WORDS_R}`}
              />
            </defs>
            {RING_WORDS.map(({ text, at }) => (
              <text key={text} className="benefits__word">
                <textPath href="#benefits-words" startOffset={at} textAnchor="middle">
                  {text}
                </textPath>
              </text>
            ))}
            <circle className="benefits__plate" cx="100" cy="100" r="98" />
            {Array.from({ length: FACE_MIN }, (_, i) => (
              <line
                key={i}
                className={i % 5 === 0 ? 'benefits__tick benefits__tick--hour' : 'benefits__tick'}
                x1="100"
                y1={100 - TICK_OUT}
                x2="100"
                y2={100 - TICK_OUT + (i % 5 === 0 ? 8 : 4)}
                transform={`rotate(${i * 6} 100 100)`}
              />
            ))}
            <circle className="benefits__track" cx="100" cy="100" r={ARC_R} />
            <circle
              className="benefits__arc"
              ref={arcRef}
              cx="100"
              cy="100"
              r={ARC_R}
              pathLength={FACE_MIN}
              transform="rotate(-90 100 100)"
            />
            <g className="benefits__tip" ref={tipRef}>
              <circle cx="100" cy={100 - ARC_R} r="7" />
            </g>
          </svg>
          <div className="benefits__counter" aria-hidden="true">
            {/* The sign hangs left of the number, so the number itself is centred. */}
            <span className="benefits__value">
              <span className="benefits__sign">
                <span>+</span>
                <span>−</span>
              </span>
              <span className="benefits__num" ref={numRef}>
                {READY_MIN}
              </span>
            </span>
            <span className="benefits__unit">MIN</span>
          </div>
        </div>
      </div>

      <ul className="benefits__list" ref={listRef}>
        {BENEFITS.map(({ title, Icon, product }) => (
          <li key={title} className="benefit-card" style={fieldStyle(product)}>
            <span className="benefit-card__icon">
              <Icon width={22} height={22} />
            </span>
            <h3 className="benefit-card__title">{title}</h3>
          </li>
        ))}
      </ul>
    </section>
  )
}
