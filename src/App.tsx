import { Outlet, ScrollRestoration } from 'react-router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Shared shell for every route: the fixed navbar, the page, the footer.
function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </>
  )
}

export default App
