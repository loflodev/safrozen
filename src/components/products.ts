// Hero products, in wheel order. Field colours come from the background images (CLAUDE.md §1).
export type Product = {
  id: string
  title: string
  // Left-edge colours of the background image at 0/25/50/75/100% height,
  // used to continue its blend around the scaled-down canvas.
  field: string[]
  // Colour of the vegetable line texture: a step darker than the field, light
  // enough that the hero text keeps its contrast where it crosses a line.
  line: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'lalo',
    title: 'Au Lalo',
    field: ['#f4f9e9', '#eef5de', '#e8f2d1', '#e2efc7', '#dcebba'],
    line: '#c9dca2',
  },
  {
    id: 'eggplant',
    title: "À l'Aubergine",
    field: ['#f4eef7', '#eee8f3', '#e9e2ef', '#e4daee', '#ddd3e9'],
    line: '#d6cbe4',
  },
  {
    id: 'chayotte',
    title: 'À la Chayotte',
    field: ['#fff9e7', '#fdf4d9', '#faeecb', '#f8e8be', '#f6e3b2'],
    line: '#e9d08e',
  },
]
