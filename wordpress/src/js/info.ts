// Information pages (page-info.php): marks the "Sur cette page" link of the
// section being read, the last heading above 30% of the screen (InfoPage.tsx).
import '../css/info.css'

const links = [...document.querySelectorAll<HTMLAnchorElement>('.info__toc a[href^="#"]')]
const headings = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))

if (links.length) {
  let frame = 0
  const update = () => {
    frame = 0
    const line = window.innerHeight * 0.3
    let current = 0
    headings.forEach((h, i) => {
      if (h && h.getBoundingClientRect().top <= line) current = i
    })
    links.forEach((a, i) => (i === current ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')))
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  update()
  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', schedule)
}
