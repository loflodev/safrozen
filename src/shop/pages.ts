// TODO: placeholder copy for the store's information pages until the legal
// texts are written. Each page is a title, a lede and sections.
export type InfoPage = {
  slug: string
  title: string
  lede: string
  updated?: string
  sections: { heading: string; body: string[] }[]
}

export const INFO_PAGES: InfoPage[] = [
  {
    slug: 'livraison',
    title: 'Livraison',
    lede: 'Vos legims voyagent au froid, de notre cuisine à votre congélateur.',
    sections: [
      {
        heading: 'Zones et délais',
        body: [
          'Nous livrons le Grand Montréal (Montréal, Laval, Longueuil) en 2 à 3 jours ouvrables.',
          'La livraison express arrive le lendemain pour toute commande passée avant 14 h, du lundi au jeudi.',
        ],
      },
      {
        heading: 'Frais',
        body: [
          'Livraison standard : 7,99 $, offerte dès 60 $ d’achat.',
          'Livraison express : 12,99 $. Cueillette au 1234, rue Jean-Talon Est : gratuite.',
        ],
      },
      {
        heading: 'Chaîne du froid',
        body: [
          'Les boîtes sont livrées dans un sac isotherme avec de la glace sèche. Rangez-les au congélateur dès réception.',
        ],
      },
    ],
  },
  {
    slug: 'faq',
    title: 'Questions fréquentes',
    lede: 'Tout ce qu’on nous demande le plus souvent.',
    sections: [
      { heading: 'Combien de temps se gardent les legims ?', body: ['Trois mois au congélateur, à −18 °C. Une fois décongelés, consommez-les dans les 48 heures.'] },
      { heading: 'Faut-il les décongeler avant de les cuire ?', body: ['Non. Videz la boîte encore congelée dans une casserole avec un peu d’eau et laissez mijoter 20 minutes.'] },
      { heading: 'Les legims sont-ils épicés ?', body: ['Non, la base est douce pour que chacun l’assaisonne à son goût.'] },
      { heading: 'Puis-je modifier ma commande ?', body: ['Oui, tant qu’elle n’est pas préparée. Écrivez-nous à bonjour@legimexpress.ca avec votre numéro de commande.'] },
      { heading: 'Où trouver vos produits en magasin ?', body: ['Chez nos partenaires épiciers du Grand Montréal. La liste complète arrive bientôt.'] },
    ],
  },
  {
    slug: 'retours',
    title: 'Retours et remboursements',
    lede: 'Un problème avec votre commande ? On s’en occupe.',
    updated: '2026-11-01',
    sections: [
      { heading: 'Produits abîmés ou manquants', body: ['Écrivez-nous dans les 48 heures suivant la livraison avec une photo : nous remplaçons ou remboursons la boîte.'] },
      { heading: 'Produits surgelés', body: ['Pour des raisons de sécurité alimentaire, nous ne reprenons pas les boîtes livrées en bon état.'] },
      { heading: 'Remboursement', body: ['Le remboursement est fait sur le moyen de paiement d’origine sous 5 à 10 jours ouvrables.'] },
    ],
  },
  {
    slug: 'cgv',
    title: 'Conditions générales de vente',
    lede: 'Les règles qui encadrent vos achats sur legimexpress.ca.',
    updated: '2026-11-01',
    sections: [
      { heading: 'Vendeur', body: ['Les Aliments Safrozen, 1234, rue Jean-Talon Est, Montréal (Québec).'] },
      { heading: 'Prix', body: ['Les prix sont en dollars canadiens. Les aliments de base sont détaxés.'] },
      { heading: 'Commande', body: ['La commande est ferme une fois le paiement confirmé. Un e-mail de confirmation vous est envoyé.'] },
      { heading: 'Livraison', body: ['Voir la page Livraison pour les zones, les délais et les frais.'] },
    ],
  },
  {
    slug: 'confidentialite',
    title: 'Politique de confidentialité',
    lede: 'Ce que nous faisons de vos données, et ce que nous n’en faisons pas.',
    updated: '2026-11-01',
    sections: [
      { heading: 'Données collectées', body: ['Votre nom, votre adresse, votre e-mail et votre téléphone, pour livrer vos commandes et vous en informer.'] },
      { heading: 'Partage', body: ['Nous ne vendons pas vos données. Seuls notre livreur et notre prestataire de paiement en reçoivent ce qui leur est nécessaire.'] },
      { heading: 'Vos droits', body: ['Vous pouvez consulter, corriger ou supprimer vos données en nous écrivant à bonjour@legimexpress.ca.'] },
    ],
  },
  {
    slug: 'mentions-legales',
    title: 'Mentions légales',
    lede: 'Qui édite ce site.',
    sections: [
      { heading: 'Éditeur', body: ['Les Aliments Safrozen, 1234, rue Jean-Talon Est, Montréal (Québec).', 'bonjour@legimexpress.ca · 514 555-0142'] },
      { heading: 'Hébergement', body: ['À préciser.'] },
    ],
  },
]

export const infoPage = (slug: string) => INFO_PAGES.find((p) => p.slug === slug)
