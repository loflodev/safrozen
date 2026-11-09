// Values printed by the theme in a JSON script tag (footer.php).
export type SiteConfig = {
  storeApi: string
  nonce: string
  cartUrl: string
  checkoutUrl: string
  shopUrl: string
  geocodeUrl: string
}

const el = document.getElementById('safrozen-config')
export const CONFIG: SiteConfig = el ? JSON.parse(el.textContent || '{}') : ({} as SiteConfig)
