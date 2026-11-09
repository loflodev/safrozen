import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
} as const

const stroke = {
  ...base,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const InstagramIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

export const FacebookIcon = (props: IconProps) => (
  <svg {...base} fill="currentColor" {...props}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.1H7.7v3h2.6V21h3.2Z" />
  </svg>
)

export const TikTokIcon = (props: IconProps) => (
  <svg {...base} fill="currentColor" {...props}>
    <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7 7 0 0 1-3.8-1.2v6.1A5.7 5.7 0 1 1 11 9v3.1a2.7 2.7 0 1 0 2.6 2.7V3h3Z" />
  </svg>
)

export const CartIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </svg>
)

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const MenuIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const CloseIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const SnowflakeIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
    <path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />
  </svg>
)

export const LeafIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
    <path d="M5 19c3-4 6-7 10-9" />
  </svg>
)

export const TimerIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 9.5v4l2.5 2M9.5 3h5" />
  </svg>
)

export const StarIcon = (props: IconProps) => (
  <svg {...base} fill="currentColor" {...props}>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z" />
  </svg>
)

export const QuoteIcon = (props: IconProps) => (
  <svg {...base} fill="currentColor" {...props}>
    <path d="M10 6.5C6.6 7.3 4 10 4 14v4.5h6V12H7.2c.4-1.9 1.6-3.1 3.3-3.6L10 6.5Zm10 0c-3.4.8-6 3.5-6 7.5v4.5h6V12h-2.8c.4-1.9 1.6-3.1 3.3-3.6L20 6.5Z" />
  </svg>
)

export const PinIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)

export const PhoneIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
  </svg>
)

export const MailIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
)

export const ClockIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const UserIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)

export const MinusIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M5 12h14" />
  </svg>
)

export const PlusIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const TrashIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
)

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const TruckIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17.5" cy="18" r="2" />
  </svg>
)

export const BoxIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9" />
  </svg>
)

// Sort: an arrow down beside lines of falling length.
export const SortIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M4 6h9M4 12h6M4 18h3M17 5v14M14 16l3 3 3-3" />
  </svg>
)

export const HomeIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />
  </svg>
)

// Recipes: an open book.
export const BookIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5ZM12 6.5v13" />
  </svg>
)

export const QuestionIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.5a2.5 2.5 0 0 1 4.9.7c0 1.8-2.5 2.2-2.5 3.8" />
    <path d="M12 17h.01" />
  </svg>
)

// Sign out: a door with an arrow leaving it.
export const LogoutIcon = (props: IconProps) => (
  <svg {...stroke} {...props}>
    <path d="M14 4H6v16h8M10 12h10M17 8.5l3.5 3.5-3.5 3.5" />
  </svg>
)
