import { useEffect, useRef } from 'react'
import { entryProgress, heroLeft, SIDE_BY_SIDE, step } from './scroll'
import { isNewScroll, SWIPE_THRESHOLD, WHEEL_THRESHOLD, type WheelSample } from './wheelIntent'
import './Story.css'

const STORY = [
  "Mijoté de légumes composés de Chayotte ou Mirliton ou Christophine, Aubergine, Papaye, Molokhia (Lalo), choux, carotte, épinard, tomate cuits traditionnellement à l'haïtienne. Ils sont déjà découpés, écrasés, précuits et congelés.",
  'Généralement cela prend plus de 3 heures de préparation et de cuisson, mais Les Aliments Safrozen offre aux consommateurs une solution +/- de 20 minutes, Legim Express. Une formule magique !',
  "Fait à partir d'ingrédients naturels, il n'est ni assaisonné, ni épicé, c'est vraiment une base neutre, à partir de laquelle que l'on soit un amateur ou un chef expérimenté, il peut l'apprêter à son goût, c'est-à-dire avec ou sans viandes ou fruits de mer ou protéine végétale.",
]

// Benefits ends with its cards: the story waits this long after the last card
// has landed (legim:cards), then needs a new scroll to start.
const STORY_PAUSE_MS = 400

/*
 * Wide landscape scene, on its own clock once started: p runs in seconds
 * (SCENE_UNIT_MS each) from 0 (closed) to SCENE_END (open); backwards at
 * BACK_SPEED. Each step plays over [at, at + LEN].
 */
const SCENE_UNIT_MS = 1000
const BACK_SPEED = 2
const WIPE_AT = 0.4 // white sweeps over the cards
const SWAP_AT = 0.55 // bb4 fades under the veil, the family picture fades in
const SCENE_LEN = 0.6
const LINE_AT = [1.1, 1.3, 1.7, 2.2, 2.7, 3.2] // kicker, title, 3 paragraphs, tagline
const STEP_LEN = 0.45
const SCENE_END = LINE_AT[LINE_AT.length - 1] + STEP_LEN

type Action = 'pass' | 'swallow' | 'open' | 'close'

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLImageElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  /*
   * Wide landscape: the story is drawn over the Benefits screen and starts
   * closed. Once the cards have landed (plus a pause), one scroll down plays
   * it on its own clock: the white sweeps over the cards, bb4 fades out under
   * the veil while the family picture fades in, then the lines rise in one by
   * one. One scroll up plays it backwards. Any gesture it takes is stopped in
   * the capture phase, so the hero wheel never sees it; the rest of that
   * gesture is swallowed (one scroll, one step).
   * Stacked: an ordinary section after Benefits; the picture and each line
   * rise in as they scroll into view. All written straight to the DOM.
   */
  useEffect(() => {
    const section = sectionRef.current
    const photo = photoRef.current
    const copy = copyRef.current
    if (!section || !photo || !copy) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sideBySide = window.matchMedia(SIDE_BY_SIDE)
    const lines = Array.from(copy.children) as HTMLElement[]
    // Reduced motion: every step switches at its midpoint instead of playing.
    const settle = (t: number) => (reduceMotion ? (t >= 0.5 ? 1 : 0) : t)
    const setT = (el: HTMLElement, t: number) => el.style.setProperty('--t', String(settle(t)))

    let p = 0 // scene position as drawn
    let target = 0 // 0 closed, SCENE_END open
    let animating = false
    let frame = 0
    let timer = 0
    let scrollFrame = 0
    let readyAt = Infinity // when the story may open (cards landed + pause)
    let wheelLog: WheelSample[] = []
    let wheelOwned = false // the current wheel scroll belongs to the story
    let wheelAcc = 0
    let touchY = 0
    let touchOwned = false

    const paint = () => {
      if (!sideBySide.matches) return
      lines.forEach((line, i) => setT(line, step(p, LINE_AT[i], STEP_LEN)))
      const swap = settle(step(p, SWAP_AT, SCENE_LEN))
      section.style.setProperty('--wipe', String(settle(step(p, WIPE_AT, SCENE_LEN))))
      section.style.setProperty('--swap', String(swap))
      // Once the picture is in, the story takes the pointer (bb4's ring stops
      // taking the hover); until then the cards and the ring below keep it.
      section.style.pointerEvents = swap >= 1 ? 'auto' : ''
    }

    const finish = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      p = target
      animating = false
      paint()
    }

    // Plays to `to` on its own clock; a timer lands it even if frames pause.
    const play = (to: number) => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      target = to
      const from = p
      const ms = (Math.abs(to - from) * SCENE_UNIT_MS) / (to < from ? BACK_SPEED : 1)
      if (!ms) {
        finish()
        return
      }
      animating = true
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ms)
        if (t >= 1) {
          finish()
          return
        }
        p = from + (to - from) * t
        paint()
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      timer = window.setTimeout(finish, ms + 100)
    }

    const reset = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      p = target = 0
      animating = false
      paint()
    }

    // The page rests on the Benefits screen, fully opened by the hero.
    const atScreen = () =>
      sideBySide.matches &&
      Math.abs(section.getBoundingClientRect().top) <= 1 &&
      heroLeft(section.parentElement)

    const decide = (dir: number): Action => {
      if (animating) return 'swallow'
      if (target === SCENE_END) return dir < 0 ? 'close' : 'pass'
      if (dir < 0) return 'pass' // the hero takes it
      return performance.now() >= readyAt ? 'open' : 'swallow'
    }

    const consume = (e: Event) => {
      e.preventDefault()
      e.stopImmediatePropagation()
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1)
      const now = performance.now()
      if (isNewScroll(wheelLog, now, Math.abs(dy))) {
        wheelLog = []
        wheelOwned = false
        wheelAcc = 0
      }
      wheelLog.push({ t: now, d: Math.abs(dy) })
      if (wheelLog.length > 64) wheelLog.shift()
      if (wheelOwned) {
        consume(e)
        return
      }
      const dir = Math.sign(dy)
      if (!dir || !atScreen()) return
      const action = decide(dir)
      if (action === 'pass') return
      consume(e)
      if (action === 'swallow') {
        wheelOwned = true
        return
      }
      wheelAcc += dy
      if (Math.abs(wheelAcc) < WHEEL_THRESHOLD) return
      wheelOwned = true
      play(action === 'open' ? SCENE_END : 0)
    }

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
      touchOwned = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (touchOwned) {
        consume(e)
        return
      }
      const dy = touchY - e.touches[0].clientY // positive = scrolling down
      const dir = Math.sign(dy)
      if (!dir || !atScreen()) return
      const action = decide(dir)
      if (action === 'pass') return
      consume(e)
      if (action === 'swallow') {
        touchOwned = true
        return
      }
      if (Math.abs(dy) < SWIPE_THRESHOLD) return
      touchOwned = true
      play(action === 'open' ? SCENE_END : 0)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, button, [contenteditable]')) return
      const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)
      const dir = down ? 1 : up ? -1 : 0
      if (!dir || !atScreen()) return
      const action = decide(dir)
      if (action === 'pass') return
      consume(e)
      if (action !== 'swallow') play(action === 'open' ? SCENE_END : 0)
    }

    // Benefits says when its cards have landed, and when they reset.
    const onCards = (e: Event) => {
      if ((e as CustomEvent<{ done: boolean }>).detail.done) {
        readyAt = performance.now() + STORY_PAUSE_MS
      } else {
        readyAt = Infinity
        reset()
      }
    }

    const update = () => {
      scrollFrame = 0
      if (sideBySide.matches) {
        paint()
      } else {
        for (const el of [photo, ...lines]) setT(el, entryProgress(el))
        section.style.removeProperty('--wipe')
        section.style.removeProperty('--swap')
        section.style.pointerEvents = ''
      }
    }
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('wheel', onWheel, { capture: true, passive: false })
    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
    window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('legim:cards', onCards)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    sideBySide.addEventListener('change', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(scrollFrame)
      clearTimeout(timer)
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('legim:cards', onCards)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      sideBySide.removeEventListener('change', onScroll)
    }
  }, [])

  return (
    <section id="histoire" className="story" ref={sectionRef} aria-labelledby="story-title">
      {/* Wide landscape: sweeps over the cards, then whitens bb4. */}
      <div className="story__wipe" aria-hidden="true" />
      <div className="story__veil" aria-hidden="true" />
      {/* A quiet terracotta panel behind the photo, running off the right edge. */}
      <div className="story__panel" aria-hidden="true" />

      <img
        className="story__photo"
        ref={photoRef}
        src="/images/family-1537.webp"
        srcSet="/images/family-960.webp 960w, /images/family-1537.webp 1537w"
        sizes="(min-width: 1200px) 55vw, 100vw"
        width={1537}
        height={1023}
        alt="Une famille partage un repas en cuisine, devant les trois boîtes Legim Express."
        loading="lazy"
        decoding="async"
      />

      <div className="story__copy" ref={copyRef}>
        <p className="story__line story__kicker">Legim Express</p>
        <h2 className="story__line story__title" id="story-title">
          Prêt en 20 minutes
        </h2>
        {STORY.map((text) => (
          <p key={text.slice(0, 24)} className="story__line story__para">
            {text}
          </p>
        ))}
        <p className="story__line story__tagline">Gagner du temps avec Legim Express !</p>
      </div>
    </section>
  )
}
