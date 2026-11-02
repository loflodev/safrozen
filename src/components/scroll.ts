// Small helpers shared by the scroll- and clock-driven sections.

// Wide landscape: Benefits and the Story share one full screen (see Story.tsx).
export const SIDE_BY_SIDE = '(min-width: 1200px) and (min-aspect-ratio: 3/2)'

// Stacked: a block plays from its top entering the viewport until it sits
// fully in view this far (share of the viewport height) above the bottom edge.
export const ENTRY_CLEAR = 0.15

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

// 0 -> 1 over [at, at + len] of a timeline.
export const step = (p: number, at: number, len: number) => clamp01((p - at) / len)

export function entryProgress(el: Element) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight
  const entered = vh - rect.top
  // Near the end of the page there may be less scroll left than a full entry
  // needs: finish by the page's end instead of stopping half-faded.
  const left = document.documentElement.scrollHeight - window.scrollY - vh
  const span = Math.max(1, Math.min(rect.height + ENTRY_CLEAR * vh, entered + left))
  return clamp01(entered / span)
}

// True once the hero wheel has fully opened Benefits (--leave on <main>).
export const heroLeft = (main: Element | null) =>
  ((main as HTMLElement | null)?.style.getPropertyValue('--leave') || '1') === '1'
