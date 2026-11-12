import '../../css/blocks/benefits.css'
import { clamp01, ENTRY_CLEAR } from '../scroll'

// The dial's face is one hour; the arc stops on the ready time.
const FACE_MIN = 60
// The counter's own clock: 0 -> its target with an ease-out, whatever the scroll speed.
const COUNT_MS = 1600
// Share of the dial (capped at one viewport) that must be on screen to play.
const FULL_VIEW = 0.99
// Cards are not scrubbed: once they are in view they rise in on their own,
// one after another, in step with the counter: each takes CARD_MS and the
// last one lands as the count reaches its target.
const CARD_MS = 900

// 0 -> 1: how much of the element is on screen. An element taller than the
// viewport counts as fully in view once it fills the viewport.
function shownShare(el: Element) {
  const rect = el.getBoundingClientRect()
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
  return clamp01(visible / Math.min(rect.height, window.innerHeight))
}

/*
 * The cards rise in one after another on their own clock (CSS transitions)
 * once they are in view, and reset when the section leaves the screen.
 * The dial plays 0 -> target (number and arc together) once it is fully in
 * view, again whenever the mouse moves onto it, and resets once it has left
 * the screen. All written straight to the DOM.
 */
function initBenefits(track: HTMLElement) {
  const dial = track.querySelector<HTMLElement>('.benefits__dial')
  const list = track.querySelector<HTMLElement>('.benefits__list')
  const arc = track.querySelector<SVGCircleElement>('.benefits__arc')
  const tip = track.querySelector<SVGGElement>('.benefits__tip')
  const num = track.querySelector<HTMLElement>('.benefits__num')
  if (!dial || !list || !arc || !tip || !num) return

  const target = Number(dial.dataset.target) || 20
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
    const minutes = target * p
    num.textContent = String(Math.round(minutes))
    arc.style.strokeDasharray = `${minutes} ${FACE_MIN}`
    tip.setAttribute('transform', `rotate(${(minutes / FACE_MIN) * 360} 100 100)`)
  }

  const stopCount = () => {
    cancelAnimationFrame(countFrame)
    clearTimeout(countTimer)
  }
  // 0 -> target, easing out.
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
  // waits on a frame. Reduced motion: the dial just reads its target.
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
}

document.querySelectorAll<HTMLElement>('.benefits').forEach(initBenefits)
