# Safrozen: Legim Express storefront

The e-commerce site for **Legim Express**, a line of ready-in-20-minutes Haitian frozen meals from
Les Aliments Safrozen Foods (Québec). The project has two deliverables built from one design system:

1. **A React 19 + TypeScript storefront**: the full shopping experience (landing page, shop, product pages, cart,
   three-step checkout, customer account, order tracking, store locator, recipes blog and legal pages), running on
   typed mock data shaped like WooCommerce's.
2. **A custom WordPress / WooCommerce theme and companion plugin**: the production port of that storefront, with the
   landing sections as editable ACF blocks, WooCommerce template overrides and front-end code ported to framework-free
   TypeScript.

> Status: in active development. The React storefront is feature-complete on mock data; the WordPress theme is being
> brought to parity with it.

---

## Highlights

- **End-to-end purchase flow**: catalogue with filters and sorting, mini-cart drawer, coupons, delivery methods with
  a free-shipping threshold, a three-step checkout that validates each step, order confirmation and status
  tracking (Reçue · Préparée · En livraison · Livrée).
- **Customer account area**: sign in / sign up, dashboard, order history, saved billing and shipping addresses,
  account details, lost / reset password. It follows WooCommerce's "My account" endpoints one to one.
- **Store locator**: postal-code search with Canadian format validation, browser geolocation, distance sorting and
  an interactive Leaflet / OpenStreetMap map. In WordPress, geocoding goes through a server-side REST endpoint that
  keeps the Google API key private, caches answers and rate-limits each visitor.
- **Motion-rich landing page**: a product carousel that turns one product per scroll gesture, with custom gesture
  detection that tells a new scroll apart from trackpad inertia. It also has autoplay that pauses on hover, focus or a
  hidden tab, a scroll-linked parallax, triggered section entrances, and a reduced-motion fallback for every animation.
- **Accessibility built in**: every colour pairing is checked against WCAG 2.x AA, with documented contrast ratios.
  Forms have visible labels, `aria-describedby` errors, an error summary that takes focus, keyboard support
  throughout, focus management between checkout steps and a native `<dialog>` focus trap for the mini-cart.
- **Québec-ready legal pages**: privacy policy following Law 25, and terms of sale and returns following the Consumer
  Protection Act's distance-contract rules.

## Tech stack

| Area | React storefront | WordPress theme |
|---|---|---|
| Language | TypeScript 6 (strict) | PHP 8.1+, TypeScript (vanilla, no framework) |
| UI | React 19 | Classic theme + ACF Pro blocks, `theme.json` |
| Routing | React Router 7 (data router, lazy routes) | WordPress templates, WooCommerce overrides |
| Commerce | Typed mock catalogue, cart and orders | WooCommerce (Square, Interac transfer) |
| Styling | Plain CSS with design tokens | Same tokens and stylesheets, ported |
| Build | Vite 8 | Vite 8 (manifest-based asset enqueue) |
| Maps | Leaflet + OpenStreetMap | Leaflet + Google Geocoding (server-side) |
| Tooling | pnpm, Oxlint, `tsc -b` | WP-CLI import scripts, Local |

Fonts are self-hosted through Fontsource (Manrope Variable and Aclonica). The only runtime dependencies are React,
React Router and Leaflet, with no UI kit, icon library or CSS framework.

## Architecture and design patterns

**Design tokens as the single source of truth.** All colours, type sizes, spacing, radii, shadows and timings live in
[`src/styles/tokens.css`](src/styles/tokens.css). Components never use raw values, and the WordPress theme reuses
the same tokens, so both deliverables stay visually identical.

**State management with Context + `useReducer`.** The cart and the account each have a provider
([`CartProvider`](src/shop/CartProvider.tsx), [`AccountProvider`](src/shop/AccountProvider.tsx)). The cart reducer and
its pure totals calculation live apart from React in [`cart.ts`](src/shop/cart.ts), so the business rules can be
tested and reused. State persists to `localStorage` through a small, failure-tolerant storage adapter
([`storage.ts`](src/shop/storage.ts)) that works in private mode or with blocked site data.

**Custom hooks for reusable behaviour.**
- `useForm` ([`form.ts`](src/shop/form.ts)) handles typed values and per-field validators: validate on blur, clear an
  error once fixed, validate everything on submit.
- `useReveal` ([`reveal.ts`](src/components/reveal.ts)) handles IntersectionObserver-driven entrances that replay on
  each visit.

**Data shaped like the target platform.** The mock catalogue, orders, addresses (`billing_` / `shipping_` prefixes)
and routes mirror WooCommerce's data model and page set. Moving to the real back end then means swapping data
sources, not rewriting components. Every mock is marked `TODO` where real data will plug in.

**Route-level code splitting.** The landing page loads eagerly for the first paint. Every other page is its own chunk,
loaded by the router before navigation ([`router.tsx`](src/router.tsx)), so the previous page stays on screen until the
next is ready.

**Pure, testable logic separated from the UI.** For example, scroll-gesture detection
([`wheelIntent.ts`](src/components/wheelIntent.ts)) is a pure function over timed samples that knows nothing about the
DOM or React. Address validation, totals and date formatting are likewise plain modules.

**Composition over configuration.** Small shared building blocks (`Field`, `ChoiceCard`, `PageHeader`,
`StatusTimeline`, `OrderDetails`, `ProductArt`) are composed into pages. `OrderDetails` is the single order view
used by the confirmation, account and tracking pages.

**WordPress: theme / plugin separation.** Content types (reviews, store locations, custom order statuses), the REST
geocoding endpoint and the options page live in the `safrozen-core` plugin, so content survives a theme switch.
The theme handles presentation only. ACF field groups are versioned as JSON, and Vite's manifest is read by PHP to
register content-hashed assets per block.

## Project structure

```
src/
├── components/          Landing sections (hero wheel, benefits, story, featured, recipes, testimonials…)
│   └── shop/            Shared shop UI: form fields, cart drawer, order summary, map, timeline, toast
├── pages/               One file per route: shop, product, cart, checkout, confirmation, tracking, contact…
│   └── account/         Customer account: login, dashboard, orders, addresses, details, password reset
├── shop/                Domain logic and mock data: catalogue, cart, orders, account, forms, addresses, stores
├── styles/tokens.css    Design tokens
├── router.tsx           Route table (lazy-loaded pages)
└── App.tsx              Shell: providers, navbar, footer, mini-cart, toast

wordpress/
├── safrozen/            The theme: templates, ACF blocks, WooCommerce overrides, theme.json
├── safrozen-core/       Companion plugin: post types, order statuses, REST geocoding, options page
├── src/                 Theme TypeScript and CSS sources (built into safrozen/build/)
└── scripts/             Import scripts that seed WordPress from the React app's data
```

## Getting started

Requirements: Node 23+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Demo account: `demo@safrozen.com` with any 8+ character password (it has two past orders and saved addresses).
Coupon: `BIENVENUE10`.

### Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check (`tsc -b`) and build the storefront |
| `pnpm preview` | Serve the production build |
| `pnpm lint` | Lint with Oxlint |
| `pnpm wp:build` | Type-check and build the WordPress theme's assets |
| `pnpm wp:watch` | Rebuild the theme's assets on change |
| `pnpm wp:pages` / `pnpm wp:stores` | Export the info pages / store list for the WordPress import scripts |

### WordPress (local)

1. Create a site in [Local](https://localwp.com) with WooCommerce and ACF Pro.
2. Symlink `wordpress/safrozen` into `wp-content/themes` and `wordpress/safrozen-core` into `wp-content/plugins`, then
   activate both.
3. Run `pnpm wp:build`, then seed content with the scripts in `wordpress/scripts/` (for example
   `wp eval-file wordpress/scripts/import-landing.php`).

## Quality

- TypeScript strict mode, with no unused locals or parameters, and a type-check on every build.
- Oxlint with React hooks rules.
- WCAG AA contrast for every text and UI colour pairing, with brand colours darkened only as far as needed.
- `prefers-reduced-motion` fallbacks for every animation; hover effects limited to devices that can hover.
- Responsive from 360px phones to wide desktops, checked for horizontal overflow at each breakpoint.

## Roadmap

- Bring the WordPress theme to full parity with the React storefront.
- Connect live payments (WooCommerce Square, Interac transfer) and real store data (phone numbers, opening hours).
- Add automated tests for the cart, forms and gesture logic.
- Deploy to production on safrozen.com.

## Author

**Louis Florival**: design implementation, front-end architecture and WordPress / WooCommerce development.
