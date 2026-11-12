"""Writes the ACF field groups as local JSON: blocks into the theme's acf-json,
content types and options into safrozen-core's. Run: python3 wordpress/scripts/acf-groups.py
Keys are stable (field_sf_*), so the import script can fill block data by key."""
import json, os, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THEME = os.path.join(ROOT, 'safrozen', 'acf-json')
CORE = os.path.join(ROOT, 'safrozen-core', 'acf-json')
STAMP = int(time.time())


def f(prefix, name, label, type_, **extra):
    field = {'key': f'field_sf_{prefix}_{name}', 'label': label, 'name': name, 'type': type_,
             'instructions': extra.pop('help', ''), 'required': extra.pop('required', 0)}
    if 'sub' in extra:
        field['sub_fields'] = [f(f'{prefix}_{name}', *s[:3], **(s[3] if len(s) > 3 else {})) for s in extra.pop('sub')]
    field.update(extra)
    return field


def text(default='', **kw):
    return dict(default_value=default, **kw)


def group(key, title, fields, location, out, **extra):
    data = {'key': f'group_sf_{key}', 'title': title, 'fields': fields, 'location': location,
            'menu_order': 0, 'position': 'normal', 'style': 'default', 'label_placement': 'top',
            'instruction_placement': 'label', 'active': True, 'show_in_rest': 0, 'modified': STAMP, **extra}
    with open(os.path.join(out, f'group_sf_{key}.json'), 'w') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)


def block(name):
    return [[{'param': 'block', 'operator': '==', 'value': f'safrozen/{name}'}]]


products = dict(post_type=['product'], return_format='object', filters=['search'], elements=['featured_image'])

# --- Landing blocks (theme) ---------------------------------------------------
group('hero', 'Bloc : Héros', [
    f('hero', 'brand', 'Ligne de marque', 'text', **text('Legim Express', help='En Aclonica au-dessus du titre.')),
    f('hero', 'description', 'Description', 'textarea', rows=2, new_lines='', **text("Un mijoté de légumes traditionnellement cuits à l'haïtienne")),
    f('hero', 'cta_label', 'Bouton', 'text', **text('Commandez', help='Mène à la page du produit affiché.')),
    f('hero', 'products', 'Produits de la roue', 'relationship', min=1, max=5,
      help="Dans l'ordre de la roue. Chaque produit a besoin de son image (boîte 2:1), de son arrière-plan et de ses couleurs de champ (onglet Legim du produit).", **products),
], block('hero'), THEME)

group('benefits', 'Bloc : Avantages', [
    f('benefits', 'heading', 'Titre', 'text', **text('Pourquoi Legim Express', help='« Legim Express » s’écrit en Aclonica ; « ? » est ajouté.')),
    f('benefits', 'minutes', 'Minuteur (minutes)', 'number', min=1, max=60, **text(20, help='Le chiffre au centre du cadran, où l’arc s’arrête.')),
    f('benefits', 'cards', 'Cartes', 'repeater', min=1, max=4, layout='table', button_label='Ajouter une carte', sub=[
        ('title', 'Titre', 'text'),
        ('icon', 'Icône', 'select', {'choices': {'snowflake': 'Flocon (congelé)', 'leaf': 'Feuille (écologique)', 'timer': 'Minuteur (rapide)', 'truck': 'Camion (livraison)', 'box': 'Boîte', 'star': 'Étoile'}, 'default_value': 'snowflake', 'return_format': 'value'}),
        ('product', 'Couleur (produit)', 'post_object', {'post_type': ['product'], 'return_format': 'id', 'allow_null': 1,
                                                         'instructions': 'La carte prend le champ de ce produit (onglet Legim).'}),
    ]),
], block('benefits'), THEME)

group('story', 'Bloc : Notre histoire', [
    f('story', 'kicker', 'Surtitre', 'text', **text('Legim Express')),
    f('story', 'title', 'Titre', 'text', **text('Prêt en 20 minutes')),
    f('story', 'body', 'Texte', 'textarea', rows=10, new_lines='', help='Un paragraphe par bloc, séparés par une ligne vide.'),
    f('story', 'tagline', 'Phrase de fin', 'text', **text('Gagner du temps avec Legim Express !')),
    f('story', 'photo', 'Photo', 'image', return_format='id', preview_size='medium', library='all', mime_types='jpg,jpeg,png,webp',
      help='Paysage, environ 3:2. Son texte alternatif décrit la scène.'),
], block('story'), THEME)

group('partners', 'Bloc : Partenaires', [
    f('partners', 'title', 'Titre', 'text', **text('Nos partenaires')),
    f('partners', 'lede', 'Chapeau', 'text', **text('Retrouvez Legim Express chez nos détaillants.')),
    f('partners', 'logos', 'Logos', 'gallery', return_format='id', preview_size='thumbnail', library='all', mime_types='png,webp,svg',
      help='PNG transparents, 178 × 100. Le texte alternatif de chaque logo est le nom du détaillant.'),
], block('partners'), THEME)

group('featured', 'Bloc : Meilleures ventes', [
    f('featured', 'title', 'Titre', 'text', **text('Nos meilleures ventes')),
    f('featured', 'products', 'Produits', 'relationship', min=1, max=4,
      help='Nom, phrase (description courte), repères et prix viennent du produit.', **products),
], block('featured'), THEME)

group('recipes', 'Bloc : Dernières recettes', [
    f('recipes', 'title', 'Titre', 'text', **text('Nos dernières recettes')),
    f('recipes', 'lede', 'Chapeau', 'text', **text('Des idées simples pour apprêter Legim Express à votre goût.')),
    f('recipes', 'link_label', 'Lien vers toutes les recettes', 'text', **text('Voir toutes les recettes', help='Les trois dernières recettes (Articles) s’affichent seules.')),
], block('recipes'), THEME)

group('testimonials', 'Bloc : Avis clients', [
    f('testimonials', 'title', 'Titre', 'text', **text('Ils en parlent')),
    f('testimonials', 'lede', 'Chapeau', 'text', **text('Ce que nos clients disent de Legim Express.')),
    f('testimonials', 'average', 'Note moyenne', 'text', **text('4,9', help='Laisser vide pour masquer le résumé.')),
    f('testimonials', 'count_label', 'Nombre d’avis', 'text', **text('D’après 120 avis', help='Les trois derniers avis (menu Avis) s’affichent seuls.')),
], block('testimonials'), THEME)

group('newsletter', 'Bloc : Infolettre', [
    f('newsletter', 'title', 'Titre', 'text', **text('Rejoignez notre communauté !')),
    f('newsletter', 'lede', 'Chapeau', 'text', **text('Recevez nos dernières nouvelles directement dans votre boîte mail.')),
    f('newsletter', 'form', 'Formulaire', 'post_object', post_type=['wpcf7_contact_form'], return_format='id', allow_null=0,
      help='Le formulaire Contact Form 7 « Infolettre ». Les inscriptions sont dans Flamingo.'),
], block('newsletter'), THEME)

# --- Content types and options (safrozen-core) ----------------------------------
group('product', 'Legim : produit', [
    f('product', 'hero_title', 'Titre dans la roue', 'text', help='Ex. « Au Lalo ». La ligne de marque est ajoutée au-dessus.'),
    f('product', 'background_image', 'Arrière-plan de la roue', 'image', return_format='id', preview_size='medium', library='all',
      help='Même toile 2:1 que la boîte (l’image du produit), sol peint au même endroit.'),
    f('product', 'field_colors', 'Couleurs du champ', 'text',
      help='Les 5 couleurs du bord gauche de l’arrière-plan, de haut en bas, séparées par des virgules. Ex. #f4f9e9, #eef5de, #e8f2d1, #e2efc7, #dcebba'),
    f('product', 'line_color', 'Teinte de la texture', 'color_picker', help='Un cran plus foncé que le champ ; garder l’encre ≥ 9,8:1 et #C64914 ≥ 3,1:1 dessus.'),
    f('product', 'image_kind', 'Type d’image', 'select', choices={'box': 'Boîte sur toile 2:1 (recadrée 4:3)', 'photo': 'Photo entière'}, default_value='box', return_format='value'),
    f('product', 'weight', 'Poids', 'text', **text('500 g', help='Les trois repères (Poids, Portions, Prêt en) s’affichent tels quels sous le titre dans la roue du héros. Vide : masqué.')),
    f('product', 'portions', 'Portions', 'text', **text('4')),
    f('product', 'ready', 'Prêt en', 'text', **text('20 min')),
    f('product', 'ingredients', 'Ingrédients', 'textarea', rows=3, new_lines=''),
    f('product', 'preparation', 'Préparation', 'textarea', rows=5, new_lines='', help='Une étape par ligne.'),
    f('product', 'allergens', 'Allergènes', 'textarea', rows=2, new_lines=''),
    f('product', 'contents', 'Contenu du pack', 'textarea', rows=3, new_lines='', help='Packs seulement : une boîte par ligne.'),
], [[{'param': 'post_type', 'operator': '==', 'value': 'product'}]], CORE, position='normal')

group('recipe', 'Legim : recette', [
    f('recipe', 'reading_time', 'Temps de lecture', 'text', help='Ex. « 4 min de lecture ». Vide : calculé.'),
    f('recipe', 'serves', 'Portions', 'text'),
    f('recipe', 'time', 'Temps total', 'text'),
    f('recipe', 'product', 'Produit utilisé', 'post_object', post_type=['product'], return_format='id', allow_null=1),
    f('recipe', 'ingredients', 'Ingrédients', 'textarea', rows=6, new_lines='', help='Un ingrédient par ligne.'),
    f('recipe', 'steps', 'Étapes', 'textarea', rows=8, new_lines='', help='Une étape par ligne.'),
], [[{'param': 'post_type', 'operator': '==', 'value': 'post'}]], CORE)

group('avis', 'Legim : avis', [
    f('avis', 'quote', 'Avis', 'textarea', rows=4, new_lines='', required=1),
    f('avis', 'city', 'Ville', 'text'),
    f('avis', 'rating', 'Note', 'number', min=1, max=5, **text(5)),
], [[{'param': 'post_type', 'operator': '==', 'value': 'avis'}]], CORE)

group('boutique', 'Legim : point de vente', [
    f('boutique', 'address', 'Adresse', 'text', required=1),
    f('boutique', 'city', 'Ville', 'text'),
    f('boutique', 'postcode', 'Code postal', 'text'),
    f('boutique', 'phone', 'Téléphone', 'text'),
    f('boutique', 'hours', 'Heures', 'textarea', rows=3, new_lines=''),
    f('boutique', 'lat', 'Latitude', 'number', step='any'),
    f('boutique', 'lng', 'Longitude', 'number', step='any'),
], [[{'param': 'post_type', 'operator': '==', 'value': 'boutique'}]], CORE)

group('options', 'Réglages Safrozen', [
    f('options', 'footer_about', 'Phrase du pied de page', 'textarea', rows=2, new_lines=''),
    f('options', 'contact_address', 'Adresse', 'text'),
    f('options', 'contact_phone', 'Téléphone', 'text'),
    f('options', 'contact_email', 'Courriel', 'email'),
    f('options', 'contact_hours', 'Heures', 'text'),
    f('options', 'social_tiktok', 'TikTok', 'url'),
    f('options', 'social_facebook', 'Facebook', 'url'),
    f('options', 'social_instagram', 'Instagram', 'url'),
    f('options', 'copyright_holder', 'Titulaire du droit d’auteur', 'text', **text('Les Aliments Safrozen Foods')),
    f('options', 'privacy_officer_name', 'Responsable de la protection des renseignements personnels', 'text',
      help='Loi 25 : nom de la personne responsable, affiché sur la politique de confidentialité.'),
    f('options', 'privacy_officer_role', 'Fonction du responsable', 'text'),
    f('options', 'google_geocoding_key', 'Clé API Google (Geocoding)', 'password',
      help='Situe les codes postaux de la page Points de vente. Utilisée seulement par le serveur, jamais montrée aux visiteurs. Dans Google Cloud, limitez-la à l’API Geocoding et à l’adresse IP du serveur. Vide : OpenStreetMap (moins de codes connus).'),
], [[{'param': 'options_page', 'operator': '==', 'value': 'reglages-safrozen'}]], CORE)

# Contact page (Contact.tsx): page-contact.php reads these; the details come from Réglages Safrozen.
group('contact', 'Legim : page Contact', [
    f('contact', 'title', 'Titre', 'text', **text('Parlons-en', help='Le titre de la page (le fil d’Ariane garde « Contact »).')),
    f('contact', 'lede', 'Chapeau', 'textarea', rows=2, new_lines='',
      **text('Une question sur une commande, la livraison ou nos produits ? Nous répondons en un jour ouvrable.')),
    f('contact', 'locator_title', 'Bandeau : titre', 'text', **text('Trouvez nos produits près de chez vous')),
    f('contact', 'locator_text', 'Bandeau : texte', 'textarea', rows=2, new_lines='',
      **text('Nos boîtes vous attendent au congélateur de nos épiciers partenaires. Cherchez le magasin le plus proche.')),
    f('contact', 'locator_label', 'Bandeau : bouton', 'text', **text('Trouver un magasin', help='Mène à la page Trouver un magasin.')),
    f('contact', 'locator_product', 'Bandeau : produit', 'post_object', post_type=['product'], return_format='id', allow_null=1,
      help='Sa boîte et ses couleurs de champ habillent le bandeau.'),
    f('contact', 'form', 'Formulaire', 'post_object', post_type=['wpcf7_contact_form'], return_format='id', allow_null=0,
      help='Le formulaire Contact Form 7 « Contact ». Les messages sont dans Flamingo.'),
], [[{'param': 'page_template', 'operator': '==', 'value': 'page-contact.php'}]], CORE, position='acf_after_title')

# Information pages (InfoPage.tsx): the template page-info.php reads these.
group('info', 'Legim : page d’information', [
    f('info', 'lede', 'Chapeau', 'textarea', rows=2, new_lines='', help='La phrase sous le titre.'),
    f('info', 'updated', 'Dernière mise à jour', 'date_picker', display_format='j F Y', return_format='Y-m-d',
      help='Affichée sous le chapeau. Laissez vide pour ne rien afficher. À changer à chaque modification d’une page légale.'),
    f('info', 'contact_card', 'Carte « Nous joindre » en fin de page', 'true_false', ui=1, default_value=0),
    f('info', 'officer', 'Afficher le responsable de la protection des renseignements', 'true_false', ui=1, default_value=0,
      help='Pour la politique de confidentialité : ajoute le nom et la fonction (Réglages Safrozen) à la carte.'),
], [[{'param': 'page_template', 'operator': '==', 'value': 'page-info.php'}]], CORE, position='acf_after_title')

print('written:', sorted(os.listdir(THEME)), sorted(os.listdir(CORE)))
