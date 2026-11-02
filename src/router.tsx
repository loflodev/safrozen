import { createBrowserRouter } from 'react-router'
import App from './App'
import Home from './pages/Home'

// The landing is eager (first paint); every other page is its own chunk,
// loaded by the router before it navigates, so the old page stays until then.
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    Component: App,
    children: [
      { index: true, Component: Home },
      { path: 'boutique', lazy: page(() => import('./pages/Shop')) },
      { path: 'produit/:slug', lazy: page(() => import('./pages/Product')) },
      { path: 'panier', lazy: page(() => import('./pages/Cart')) },
      { path: 'commande', lazy: page(() => import('./pages/Checkout')) },
      { path: 'commande/recue/:id', lazy: page(() => import('./pages/Confirmation')) },
      { path: '*', lazy: page(() => import('./pages/NotFound')) },
    ],
  },
])
