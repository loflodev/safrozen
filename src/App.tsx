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
