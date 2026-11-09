// Small helpers shared by the scroll- and clock-driven sections.

// A block's entrance starts once its top is this far (share of the viewport
// height) above the bottom edge.
export const ENTRY_CLEAR = 0.15

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
