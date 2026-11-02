import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { byId } from '../shop/catalog'
import { ArrowRightIcon } from './icons'
import { clamp01 } from './scroll'
import { isNewScroll, SWIPE_THRESHOLD, WHEEL_THRESHOLD, type WheelSample } from './wheelIntent'
import './ProductWheel.css'
import { PRODUCTS, type Product } from './products'

const fieldVars = ({ field, line }: Product) =>
  ({
    ...Object.fromEntries(field.map((c, i) => [`--field-${i}`, c])),
    '--field-line': line,
  }) as React.CSSProperties

const DESCRIPTION = "Un mijoté de légumes traditionnellement cuits à l'haïtienne"

// How far boxes travel and shrink per step away from the centre.
const PAST_SHIFT = 22 // % of layer height, downwards
const NEXT_SHIFT = 10 // % of layer height, upwards (behind the current box)
const PAST_SCALE = 0.35
const NEXT_SCALE = 0.45
const MAX_BLUR = 10 // px

// Snapping: every scroll moves exactly one product and the move always completes.
const STEP_MS = 800 // duration of one product-to-product move
const SETTLE_MS = 140 // after other scrolling (scrollbar, links) stops, snap onwards

const imageSet = (id: string, kind: 'box' | 'background') =>
  `/images/${id}-${kind}-1280.webp 1280w, /images/${id}-${kind}-2048.webp 2048w`

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

// Signed distance from the wheel position, wrapped so the wheel is cyclic.
const wrap = (d: number, n: number) => {
  const m = ((d % n) + n) % n
  return m > n / 2 ? m - n : m
}

export default function ProductWheel() {
  const sectionRef = useRef<HTMLElement>(null)
  const boxRefs = useRef<(HTMLImageElement | null)[]>([])
  const bgRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const n = PRODUCTS.length
    // One snap point past the last product: the hero has left and Benefits is open.
    const exit = n
    const main = section.parentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let pos = 0 // wheel position as drawn, 0..exit, fractional while moving
    let index = 0 // snap point the wheel is at or moving to
    let animating = false
    let frame = 0
    let wheelAcc = 0
    let wheelLog: WheelSample[] = [] // the wheel scroll in progress
    let gestureUsed = false // the current wheel scroll already moved the wheel
    let queued = 0 // direction of a scroll made during a move, played after it
    let touchY = 0
    let touchUsed = false
    let lastY = window.scrollY
    let lastDir = 1
    let programmaticY = -1
    let pendingY = -1 // scroll jump held back until a reverse exit has closed Benefits
    let settleTimer = 0
    let finishTimer = 0

    const paint = (p: number) => {
      // Past the last product the wheel stays on it while the hero leaves:
      // --leave moves the box out right and the text out left (ProductWheel.css)
      // and opens Benefits from the centre out (Benefits.css).
      const q = Math.min(p, n - 1)
      main?.style.setProperty('--leave', String(clamp01(p - (n - 1))))
      // Drives the slow drift of the vegetable texture.
      if (!reduceMotion) section.style.setProperty('--drift', String(q))

      PRODUCTS.forEach((_, i) => {
        const d = wrap(i - q, n)
        const dist = Math.abs(d)
        const box = boxRefs.current[i]
        const bg = bgRefs.current[i]

        if (box) {
          const shift = d < 0 ? dist * PAST_SHIFT : -dist * NEXT_SHIFT
          const scale = 1 - dist * (d < 0 ? PAST_SCALE : NEXT_SCALE)
          box.style.opacity = String(Math.max(0, 1 - dist))
          box.style.zIndex = String(Math.round(100 - dist * 10))
          box.style.transform = reduceMotion
            ? 'none'
            : `translate3d(0, ${shift}%, 0) scale(${scale})`
          box.style.filter = reduceMotion ? 'none' : `blur(${Math.min(dist, 1) * MAX_BLUR}px)`
        }
        if (bg) {
          // The nearest background sits underneath at full strength and the
          // outgoing one fades over it, so the crossfade never dips in brightness.
          bg.style.opacity = String(Math.max(0, 1 - dist))
          bg.style.zIndex = String(Math.round(dist * 10))
        }
      })

      setActive(Math.round(q))
    }

    // The stage is pinned while the page is between the first and last snap
    // point; one stage height of scroll per product, plus one for the exit.
    const geometry = () => {
      const step = section.firstElementChild?.clientHeight ?? window.innerHeight
      const top = section.getBoundingClientRect().top + window.scrollY
      return { top, step, end: exit * step, rel: window.scrollY - top }
    }

    const finish = (target: number) => {
      cancelAnimationFrame(frame)
      window.clearTimeout(finishTimer)
      pos = target
      animating = false
      paint(pos)
      if (pendingY >= 0) {
        programmaticY = pendingY
        pendingY = -1
        window.scrollTo({ top: programmaticY, behavior: 'instant' })
        lastY = window.scrollY
      }
      // Benefits re-checks its state (counter, cards, scene) after every move,
      // so it starts once fully open and resets once closed again.
      window.dispatchEvent(new Event('legim:wheel'))
      const dir = queued
      queued = 0
      if (dir && !releases(dir)) goTo(index + dir)
    }

    // Plays the move on its own clock, so it never stops half way. The timer
    // lands it even if frames pause (background tab, busy main thread).
    const animateTo = (target: number) => {
      cancelAnimationFrame(frame)
      window.clearTimeout(finishTimer)
      const from = pos
      if (reduceMotion || from === target) {
        finish(target)
        return
      }
      animating = true
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / STEP_MS, 1)
        if (t >= 1) {
          finish(target)
          return
        }
        pos = from + (target - from) * easeInOutCubic(t)
        paint(pos)
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      finishTimer = window.setTimeout(() => finish(target), STEP_MS + 150)
    }

    // Moves to a snap point and parks the page there. The stage is pinned, and
    // Benefits (pulled up over the exit step) is fully clipped whenever the page
    // jumps, so the jump itself is invisible. Into the exit the page jumps first;
    // out of it, Benefits covers the screen until it has closed, so the page
    // stays put and jumps once the move is done.
    const goTo = (target: number) => {
      const from = index
      index = Math.min(Math.max(target, 0), exit)
      const { top, step } = geometry()
      const y = Math.round(top + index * step)
      const atExit = Math.abs(window.scrollY - (top + exit * step)) <= 1
      if (from === exit && index < exit && atExit) {
        pendingY = y
      } else {
        pendingY = -1
        programmaticY = y
        window.scrollTo({ top: programmaticY, behavior: 'instant' })
        lastY = window.scrollY
      }
      animateTo(index)
    }

    // True when this direction should leave the hero and scroll the page.
    const releases = (dir: number) => (dir > 0 && index === exit) || (dir < 0 && index === 0)

    const inPin = () => {
      const { rel, end } = geometry()
      return rel >= -1 && rel <= end + 1
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1)
      const now = performance.now()
      if (isNewScroll(wheelLog, now, Math.abs(dy))) {
        wheelLog = []
        gestureUsed = false
        wheelAcc = 0
      }
      wheelLog.push({ t: now, d: Math.abs(dy) })
      if (wheelLog.length > 64) wheelLog.shift()
      // Logged outside the hero too, so a scroll that comes back up into it
      // (see onScroll) stays one scroll.
      if (!inPin()) return
      // One move per scroll: the rest of it (spin, trackpad inertia) is swallowed.
      if (gestureUsed) {
        e.preventDefault()
        return
      }
      const dir = Math.sign(dy)
      if (!dir) return
      if (releases(dir) && !animating) return
      e.preventDefault()
      wheelAcc += dy
      if (Math.abs(wheelAcc) < WHEEL_THRESHOLD) return
      gestureUsed = true
      // A scroll made during a move plays right after it (never past the ends).
      if (animating) queued = releases(dir) ? 0 : dir
      else goTo(index + dir)
    }

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
      touchUsed = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!inPin()) return
      const dy = touchY - e.touches[0].clientY // positive = scrolling down
      if (animating || touchUsed) {
        e.preventDefault()
        return
      }
      const dir = Math.sign(dy)
      if (!dir || releases(dir)) return
      e.preventDefault()
      if (Math.abs(dy) < SWIPE_THRESHOLD) return
      touchUsed = true
      goTo(index + dir)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, button, [contenteditable]')) return
      const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)
      const dir = down ? 1 : up ? -1 : 0
      if (!dir || !inPin() || releases(dir)) return
      e.preventDefault()
      if (!animating) goTo(index + dir)
    }

    // Anything else that moved the page (scrollbar drag, anchor links, a
    // restored scroll position) is finished once it stops: never left mid-way.
    const settle = () => {
      if (animating) return
      const { rel, step, end } = geometry()
      if (rel > end + 1) {
        // Below the hero: the wheel rests on the exit, Benefits open.
        if (index !== exit) {
          index = exit
          pos = index
          paint(pos)
        }
        return
      }
      const exact = Math.max(rel, 0) / step
      const nearest = Math.round(exact)
      if (Math.abs(exact - nearest) < 0.01) {
        if (nearest !== index || pos !== nearest) {
          index = nearest
          animateTo(index)
        }
        return
      }
      goTo(lastDir > 0 ? Math.ceil(exact) : Math.floor(exact))
    }

    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - programmaticY) <= 1) return
      if (y !== lastY) lastDir = Math.sign(y - lastY)
      // Scrolling back up out of Benefits stops on the exit and plays it
      // backwards; the rest of that scroll is swallowed.
      if (index === exit && !animating) {
        const { top, step } = geometry()
        const exitY = Math.round(top + exit * step)
        if (y < exitY - 1 && lastY >= exitY - 1) {
          programmaticY = exitY
          window.scrollTo({ top: exitY, behavior: 'instant' })
          lastY = window.scrollY
          gestureUsed = true
          touchUsed = true
          goTo(exit - 1)
          return
        }
      }
      lastY = y
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, SETTLE_MS)
    }

    const onResize = () => {
      if (inPin()) goTo(index)
    }

    paint(pos)
    settle()
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(settleTimer)
      window.clearTimeout(finishTimer)
      cancelAnimationFrame(frame)
    }
  }, [])

  const current = PRODUCTS[active]

  return (
    <section
      ref={sectionRef}
      id="accueil"
      className="wheel"
      style={{ '--steps': PRODUCTS.length + 1 } as React.CSSProperties}
      aria-labelledby="hero-title"
    >
      <div className="wheel__stage">
        <div className="wheel__backgrounds" aria-hidden="true">
          {PRODUCTS.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                bgRefs.current[i] = el
              }}
              className="wheel__bg"
              style={fieldVars(p)}
            >
              <img
                className="wheel__bg-art"
                srcSet={imageSet(p.id, 'background')}
                sizes="(max-aspect-ratio: 5/4) 176vw, max(70vw, 140svh)"
                src={`/images/${p.id}-background-2048.webp`}
                alt=""
                decoding="async"
              />
              <div className="wheel__texture" />
            </div>
          ))}
        </div>

        <div className="wheel__layer">
          {PRODUCTS.map((p, i) => (
            <img
              key={p.id}
              ref={(el) => {
                boxRefs.current[i] = el
              }}
              className="wheel__box"
              srcSet={imageSet(p.id, 'box')}
              sizes="(max-aspect-ratio: 5/4) 176vw, max(70vw, 140svh)"
              src={`/images/${p.id}-box-2048.webp`}
              alt={i === active ? `Boîte Legim Express ${p.title}` : ''}
              aria-hidden={i !== active}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
          ))}
        </div>

        <div className="hero">
          <h1 className="hero__heading" id="hero-title">
            <span className="hero__brand">Legim Express</span>
            <span className="hero__titles">
              {PRODUCTS.map((p, i) => (
                <span
                  key={p.id}
                  className="hero__title"
                  data-active={i === active}
                  aria-hidden={i !== active}
                >
                  {p.title}
                </span>
              ))}
            </span>
          </h1>
          <p key={current.id} className="hero__desc">
            {DESCRIPTION}
          </p>
          {/* TODO: per-product specs once the catalogue exists; all three match today. */}
          <p className="hero__specs">
            <span>500 g</span>
            <span>4 portions</span>
            <span>Prêt en 20 min</span>
          </p>
          {/* Orders the product on screen. */}
          <Link className="hero__cta" to={`/produit/${byId(current.id)?.slug ?? ''}`}>
            Commandez
            <ArrowRightIcon />
          </Link>
          <p className="visually-hidden" aria-live="polite">
            Legim Express {current.title}
          </p>
        </div>

        <ol className="wheel__dots" aria-hidden="true">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} className={i === active ? 'is-active' : undefined} />
          ))}
        </ol>
      </div>
    </section>
  )
}
