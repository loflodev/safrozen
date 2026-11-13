import ProductWheel from '../components/ProductWheel'
import Benefits from '../components/Benefits'
import Story from '../components/Story'
import Partners from '../components/Partners'
import Featured from '../components/Featured'
import Recipes from '../components/Recipes'
import Testimonials from '../components/Testimonials'
import Newsletter from '../components/Newsletter'

// The landing page: the scroll-pinned hero wheel and the sections below it.
export default function Home() {
  return (
    <main id="main">
      <ProductWheel />
      <Benefits />
      <Story />
      <Partners />
      <Featured />
      <Recipes />
      <Testimonials />
      <Newsletter />
    </main>
  )
}
