import { createBrowserRouter, redirect } from 'react-router'
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
      {
        path: 'mon-compte',
        lazy: page(() => import('./pages/account/AccountLayout')),
        children: [
          { index: true, lazy: page(() => import('./pages/account/Dashboard')) },
          { path: 'commandes', lazy: page(() => import('./pages/account/Orders')), handle: { title: 'Commandes' } },
          { path: 'commandes/:id', lazy: page(() => import('./pages/account/OrderView')), handle: { title: 'Commande' } },
          { path: 'adresses', lazy: page(() => import('./pages/account/Addresses')), handle: { title: 'Adresses' } },
          { path: 'adresses/:type', lazy: page(() => import('./pages/account/AddressEdit')), handle: { title: 'Modifier une adresse' } },
          { path: 'details', lazy: page(() => import('./pages/account/Details')), handle: { title: 'Détails du compte' } },
          { path: 'deconnexion', lazy: page(() => import('./pages/account/Logout')) },
        ],
      },
      { path: 'mon-compte/mot-de-passe-perdu', lazy: page(() => import('./pages/account/LostPassword')) },
      { path: 'mon-compte/reinitialiser', lazy: page(() => import('./pages/account/ResetPassword')) },
      { path: 'suivi', lazy: page(() => import('./pages/Track')) },
      { path: 'recettes', lazy: page(() => import('./pages/RecipesArchive')) },
      { path: 'recettes/:slug', lazy: page(() => import('./pages/RecipeDetail')) },
      { path: 'contact', lazy: page(() => import('./pages/Contact')) },
      { path: 'points-de-vente', lazy: page(() => import('./pages/StoreLocator')) },
      ...['notre-histoire', 'livraison', 'faq', 'retours', 'cgv', 'confidentialite', 'conditions-utilisation'].map((path) => ({
        path,
        lazy: page(() => import('./pages/InfoPage')),
      })),
      // The French-law mentions légales became the terms of use (Québec).
      { path: 'mentions-legales', loader: () => redirect('/conditions-utilisation') },
      { path: '*', lazy: page(() => import('./pages/NotFound')) },
    ],
  },
])
