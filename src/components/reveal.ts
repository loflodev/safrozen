import { useEffect, type RefObject } from 'react'
import { ENTRY_CLEAR } from './scroll'

/*
 * Triggered entrances for the sections below the Story: once the element's
 * top is ENTRY_CLEAR of the viewport above the bottom edge, `data-in` is set
 * and its CSS transitions play on their own clock (no scrubbing). It is
 * cleared once the element has fully left the screen, so the entrance plays
 * again on the next visit. `data-reveal` marks that JS runs: without it the
 * CSS leaves everything in place.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.dataset.reveal = ''

    const enter = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.dataset.in = ''
      },
      { rootMargin: `0px 0px -${ENTRY_CLEAR * 100}% 0px` },
    )
    const leave = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) delete el.dataset.in
    })
    enter.observe(el)
    leave.observe(el)
    return () => {
      enter.disconnect()
      leave.disconnect()
      delete el.dataset.reveal
      delete el.dataset.in
    }
  }, [ref])
}
