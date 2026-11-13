import { Outlet, ScrollRestoration } from 'react-router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartProvider from './shop/CartProvider'
import AccountProvider from './shop/AccountProvider'
import Toast from './components/shop/Toast'
import MiniCart from './components/shop/MiniCart'

// Shared shell for every route: the fixed navbar, the page, the footer.
function App() {
  return (
    <AccountProvider>
      <CartProvider>
        {/* Every page's <main> carries id="main" (WCAG 2.4.1: a way past the navbar). */}
        <a className="skip-link" href="#main">
          Aller au contenu
        </a>
        <Navbar />
        <Outlet />
        <Footer />
        <Toast />
        <MiniCart />
        <ScrollRestoration />
      </CartProvider>
    </AccountProvider>
  )
}

export default App
