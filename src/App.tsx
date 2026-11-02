import Navbar from './components/Navbar'
import ProductWheel from './components/ProductWheel'
import Benefits from './components/Benefits'
import Story from './components/Story'
import Partners from './components/Partners'
import Featured from './components/Featured'
import Recipes from './components/Recipes'
import Testimonials from './components/Testimonials'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <ProductWheel />
        <Benefits />
        <Story />
        <Partners />
        <Featured />
        <Recipes />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}

export default App
