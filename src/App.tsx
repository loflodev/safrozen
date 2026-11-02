import { Outlet, ScrollRestoration } from 'react-router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartProvider from './shop/CartProvider'
import AccountProvider from './shop/AccountProvider'

// Shared shell for every route: the fixed navbar, the page, the footer.
function App() {
  return (
    <AccountProvider>
      <CartProvider>
        <Navbar />
        <Outlet />
        <Footer />
        <ScrollRestoration />
      </CartProvider>
    </AccountProvider>
  )
}

export default App
