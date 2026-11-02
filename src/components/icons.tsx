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
