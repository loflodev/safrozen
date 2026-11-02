// TODO: mock posts, newest first, until the blog (WordPress posts) exists.
export type Recipe = {
  slug: string
  image: string
  alt: string
  date: string
  dateLabel: string
  title: string
  excerpt: string
  read: string
  productId: string
  serves: string
  time: string
  ingredients: string[]
  steps: string[]
}

export const RECIPES: Recipe[] = [
  {
    slug: 'mijote-de-lalo-aux-crevettes',
    image: 'benefit-stew-pot',
    alt: 'Une cocotte de légumes mijotés, carottes et persil.',
    date: '2026-10-28',
    dateLabel: '28 octobre 2026',
    title: 'Mijoté de lalo aux crevettes en 20 minutes',
    excerpt: 'Une boîte de Legim Express au Lalo, une poignée de crevettes et un filet de citron vert : le souper est servi.',
    read: '4 min de lecture',
    productId: 'lalo',
    serves: '4 personnes',
    time: '25 min',
    ingredients: [
      '1 boîte de Legim Express au Lalo',
      '300 g de crevettes décortiquées',
      '1 citron vert',
      '2 gousses d’ail',
      '1 c. à soupe d’huile',
      'Sel, poivre, piment au goût',
    ],
    steps: [
      'Faites revenir l’ail haché dans l’huile, puis ajoutez les crevettes 2 minutes de chaque côté. Réservez.',
      'Videz la boîte de lalo encore congelée dans la même casserole avec 125 ml d’eau.',
      'Couvrez et laissez mijoter 15 minutes en remuant de temps en temps.',
      'Ajoutez les crevettes et le jus du citron vert, réchauffez 3 minutes et assaisonnez.',
    ],
  },
  {
    slug: 'bol-vegetarien-aubergine-et-pois',
    image: 'benefit-bean-bowl',
    alt: 'Un bol de pois rouges en sauce.',
    date: '2026-10-21',
    dateLabel: '21 octobre 2026',
    title: "Bol végétarien à l'aubergine et aux pois",
    excerpt: "Une base neutre, des pois rouges et un peu d'épices : notre recette favorite pour les soirs pressés.",
    read: '5 min de lecture',
    productId: 'eggplant',
    serves: '4 personnes',
    time: '25 min',
    ingredients: [
      "1 boîte de Legim Express à l'Aubergine",
      '1 boîte de pois rouges égouttés',
      '2 tasses de riz cuit',
      '1 avocat',
      'Persil frais, sel, poivre',
    ],
    steps: [
      'Faites mijoter la boîte d’aubergine 20 minutes à couvert avec 125 ml d’eau.',
      'Ajoutez les pois rouges les 5 dernières minutes.',
      'Servez sur le riz, avec l’avocat tranché et le persil.',
    ],
  },
  {
    slug: 'chayotte-riz-blanc-et-avocat',
    image: 'benefit-rice',
    alt: 'Une assiette de riz blanc.',
    date: '2026-10-14',
    dateLabel: '14 octobre 2026',
    title: 'Chayotte, riz blanc et avocat',
    excerpt: "Le classique du dimanche, sans les trois heures de cuisson. Nos astuces pour l'assaisonner à votre goût.",
    read: '3 min de lecture',
    productId: 'chayotte',
    serves: '4 personnes',
    time: '20 min',
    ingredients: ['1 boîte de Legim Express à la Chayotte', '2 tasses de riz blanc', '1 avocat', 'Pikliz (facultatif)'],
    steps: [
      'Lancez la cuisson du riz.',
      'Faites mijoter la chayotte 20 minutes à couvert avec 125 ml d’eau.',
      'Servez avec le riz, l’avocat et un peu de pikliz pour relever.',
    ],
  },
]

export const recipeBySlug = (slug: string) => RECIPES.find((r) => r.slug === slug)
