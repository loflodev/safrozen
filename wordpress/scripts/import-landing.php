<?php
/**
 * Fills a fresh site with the landing's content, from the React reference's
 * mock data (src/shop/*.ts, src/components/*.tsx): products, recipes, reviews,
 * options, the newsletter form, the pages, menus, and the landing page itself.
 * Safe to run again: everything is looked up by slug or title first.
 *
 * wp eval-file wordpress/scripts/import-landing.php <repo>/public/images
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/lx-image.php';

$images = rtrim( $args[0] ?? '', '/' );
if ( ! is_dir( $images ) ) {
	WP_CLI::error( 'Pass the public/images folder of the React app.' );
}
wp_set_current_user( 1 );

/** A post by slug and type, created or updated with $fields. */
function lx_post( string $type, string $slug, array $fields ): int {
	$existing = get_page_by_path( $slug, OBJECT, $type );
	$data     = array_merge(
		array(
			'post_type'   => $type,
			'post_name'   => $slug,
			'post_status' => 'publish',
		),
		$fields
	);
	if ( $existing ) {
		$data['ID'] = $existing->ID;
	}
	$id = wp_insert_post( wp_slash( $data ), true );
	if ( is_wp_error( $id ) ) {
		WP_CLI::error( "$type $slug: " . $id->get_error_message() );
	}
	return (int) $id;
}

function lx_term( string $taxonomy, string $slug, string $name ): int {
	$term = get_term_by( 'slug', $slug, $taxonomy );
	if ( $term ) {
		return (int) $term->term_id;
	}
	return (int) wp_insert_term( $name, $taxonomy, array( 'slug' => $slug ) )['term_id'];
}

function lx_fields( array $values, $post_id ): void {
	foreach ( $values as $name => $value ) {
		update_field( $name, $value, $post_id );
	}
}

// --- Products ----------------------------------------------------------------

$prep = "Sortez la boîte du congélateur, sans la décongeler.\nVidez-la dans une casserole avec 125 ml d’eau.\nCouvrez et laissez mijoter 20 minutes à feu moyen, en remuant de temps en temps.\nAssaisonnez à votre goût et servez avec du riz blanc.";
$allergens = 'Sans gluten. Préparé dans un atelier qui manipule des crustacés.';
$fields = array(
	'lalo'     => array( '#f4f9e9, #eef5de, #e8f2d1, #e2efc7, #dcebba', '#c9dca2' ),
	'eggplant' => array( '#f4eef7, #eee8f3, #e9e2ef, #e4daee, #ddd3e9', '#d6cbe4' ),
	'chayotte' => array( '#fff9e7, #fdf4d9, #faeecb, #f8e8be, #f6e3b2', '#e9d08e' ),
);
$cats = array(
	'plats' => lx_term( 'product_cat', 'plats', 'Plats' ),
	'packs' => lx_term( 'product_cat', 'packs', 'Packs' ),
);

$catalog = array(
	array(
		'id' => 'lalo', 'slug' => 'legim-au-lalo', 'cat' => 'plats', 'hero' => 'Au Lalo',
		'name' => 'Legim Express au Lalo', 'price' => '12.99', 'stock' => 42,
		'weight' => '300 g / portion', 'portions' => '80', 'ready' => '8 g',
		'short' => "Feuilles de lalo, épinards et légumes du jardin, mijotés à l'haïtienne.",
		'description' => "Notre legim le plus demandé : des feuilles de lalo et d'épinards fondantes, du chou, de la carotte et de l'aubergine, mijotés lentement comme à la maison. La base n'est pas épicée, pour que vous l'assaisonniez à votre goût.",
		'ingredients' => 'Lalo (corète), épinards, chou, carotte, aubergine, oignon, ail, tomate, huile de tournesol, sel, thym.',
	),
	array(
		'id' => 'eggplant', 'slug' => 'legim-a-l-aubergine', 'cat' => 'plats', 'hero' => "À l'Aubergine",
		'name' => "Legim Express à l'Aubergine", 'price' => '12.99', 'stock' => 30,
		'weight' => '400 g / portion', 'portions' => '130', 'ready' => '7 g',
		'short' => "Aubergine fondante, chou, carotte et tomate, mijotés à l'haïtienne.",
		'description' => "L'aubergine fond dans une sauce tomate douce avec le chou et la carotte. Un legim tout en rondeur qui accompagne aussi bien le riz que la banane plantain.",
		'ingredients' => 'Aubergine, chou, carotte, tomate, oignon, ail, poivron, huile de tournesol, sel, persil.',
	),
	array(
		'id' => 'chayotte', 'slug' => 'legim-a-la-chayotte', 'cat' => 'plats', 'hero' => 'À la Chayotte',
		'name' => 'Legim Express à la Chayotte', 'price' => '12.99', 'stock' => 0,
		'weight' => '400 g / portion', 'portions' => '130', 'ready' => '12 g',
		'short' => 'Chayotte tendre, chou et carotte, le legim léger du dimanche.',
		'description' => "La chayotte, le chou et la carotte cuisent doucement jusqu'à devenir fondants. Le plus léger de nos produits, parfait avec du riz blanc et un avocat.",
		'ingredients' => 'Chayotte (mirliton), chou, carotte, oignon, ail, tomate, huile de tournesol, sel, thym.',
	),
	array(
		'id' => 'pack-decouverte', 'slug' => 'pack-decouverte', 'cat' => 'packs', 'look' => 'chayotte', 'image' => 'trio-eco-1280.webp',
		'name' => 'Pack découverte', 'price' => '34.99', 'stock' => 18, 'weight' => '3 × 500 g',
		'short' => 'Les trois legims, une boîte de chaque, pour trouver votre favori.',
		'description' => 'Une boîte de chaque legim : lalo, aubergine et chayotte. Le meilleur moyen de goûter toute la gamme, à petit prix.',
		'ingredients' => 'Voir chaque legim.',
		'contents' => "Legim Express au Lalo\nLegim Express à l'Aubergine\nLegim Express à la Chayotte",
	),
	array(
		'id' => 'pack-famille', 'slug' => 'pack-famille', 'cat' => 'packs', 'look' => 'lalo', 'image' => '6pack-g-1280.webp',
		'name' => 'Pack famille', 'price' => '64.99', 'stock' => 9, 'weight' => '6 × 500 g',
		'short' => 'Six boîtes au choix du chef, pour deux semaines de soupers rapides.',
		'description' => 'Deux boîtes de chaque legim, de quoi préparer six soupers pour quatre. Se garde trois mois au congélateur.',
		'ingredients' => 'Voir chaque legim.',
		'contents' => "2 × Legim Express au Lalo\n2 × Legim Express à l'Aubergine\n2 × Legim Express à la Chayotte",
	),
);

$product_ids = array();
foreach ( $catalog as $item ) {
	$is_box  = 'plats' === $item['cat'];
	$look    = $fields[ $item['look'] ?? $item['id'] ];
	$image   = $is_box
		? lx_image( "$images/{$item['id']}-box-2048.webp", "La boîte {$item['name']}" )
		: lx_image( "$images/{$item['image']}", "La boîte {$item['name']}" );
	$found   = get_page_by_path( $item['slug'], OBJECT, 'product' );
	$product = $found ? wc_get_product( $found->ID ) : new WC_Product_Simple();
	$product->set_name( $item['name'] );
	$product->set_slug( $item['slug'] );
	$product->set_status( 'publish' );
	$product->set_regular_price( $item['price'] );
	$product->set_short_description( $item['short'] );
	$product->set_description( $item['description'] );
	$product->set_manage_stock( true );
	$product->set_stock_quantity( $item['stock'] );
	$product->set_category_ids( array( $cats[ $item['cat'] ] ) );
	$product->set_image_id( $image );
	$id = $product->save();
	lx_fields(
		array(
			'hero_title'       => $item['hero'] ?? '',
			'background_image' => $is_box ? lx_image( "$images/{$item['id']}-background-2048.webp" ) : '',
			'field_colors'     => $look[0],
			'line_color'       => $look[1],
			'image_kind'       => $is_box ? 'box' : 'photo',
			// The three specs' values as printed on the box (the theme writes Poids, Calories, Fibres).
			'weight'           => $item['weight'],
			'portions'         => $item['portions'] ?? '',
			'ready'            => $item['ready'] ?? '',
			'ingredients'      => $item['ingredients'],
			'preparation'      => $prep,
			'allergens'        => $allergens,
			'contents'         => $item['contents'] ?? '',
		),
		$id
	);
	$product_ids[ $item['id'] ] = $id;
	WP_CLI::log( "product {$item['slug']} → $id" );
}

// The home page's best sellers are the last two starred (★ En vedette, inc/featured.php).
foreach ( array( 'lalo', 'eggplant' ) as $key ) {
	$product = wc_get_product( $product_ids[ $key ] );
	if ( ! $product->get_featured() ) {
		$product->set_featured( true );
		$product->save();
	}
}

// --- Recipes (posts) ---------------------------------------------------------

$recettes = lx_term( 'category', 'recettes', 'Recettes' );
$recipes  = array(
	array(
		'slug' => 'mijote-de-lalo-aux-crevettes', 'image' => 'benefit-stew-pot', 'date' => '2026-10-28 09:00:00',
		'alt' => 'Une cocotte de légumes mijotés, carottes et persil.',
		'title' => 'Mijoté de lalo aux crevettes en 20 minutes', 'read' => '4 min de lecture', 'product' => 'lalo',
		'excerpt' => 'Une boîte de Legim Express au Lalo, une poignée de crevettes et un filet de citron vert : le souper est servi.',
		'serves' => '4 personnes', 'time' => '25 min',
		'ingredients' => array( '1 boîte de Legim Express au Lalo', '300 g de crevettes décortiquées', '1 citron vert', '2 gousses d’ail', '1 c. à soupe d’huile', 'Sel, poivre, piment au goût' ),
		'steps' => array( 'Faites revenir l’ail haché dans l’huile, puis ajoutez les crevettes 2 minutes de chaque côté. Réservez.', 'Videz la boîte de lalo encore congelée dans la même casserole avec 125 ml d’eau.', 'Couvrez et laissez mijoter 15 minutes en remuant de temps en temps.', 'Ajoutez les crevettes et le jus du citron vert, réchauffez 3 minutes et assaisonnez.' ),
	),
	array(
		'slug' => 'bol-vegetarien-aubergine-et-pois', 'image' => 'benefit-bean-bowl', 'date' => '2026-10-21 09:00:00',
		'alt' => 'Un bol de pois rouges en sauce.',
		'title' => "Bol végétarien à l'aubergine et aux pois", 'read' => '5 min de lecture', 'product' => 'eggplant',
		'excerpt' => "Une base neutre, des pois rouges et un peu d'épices : notre recette favorite pour les soirs pressés.",
		'serves' => '4 personnes', 'time' => '25 min',
		'ingredients' => array( "1 boîte de Legim Express à l'Aubergine", '1 boîte de pois rouges égouttés', '2 tasses de riz cuit', '1 avocat', 'Persil frais, sel, poivre' ),
		'steps' => array( 'Faites mijoter la boîte d’aubergine 20 minutes à couvert avec 125 ml d’eau.', 'Ajoutez les pois rouges les 5 dernières minutes.', 'Servez sur le riz, avec l’avocat tranché et le persil.' ),
	),
	array(
		'slug' => 'chayotte-riz-blanc-et-avocat', 'image' => 'benefit-rice', 'date' => '2026-10-14 09:00:00',
		'alt' => 'Une assiette de riz blanc.',
		'title' => 'Chayotte, riz blanc et avocat', 'read' => '3 min de lecture', 'product' => 'chayotte',
		'excerpt' => "Le classique du dimanche, sans les trois heures de cuisson. Nos astuces pour l'assaisonner à votre goût.",
		'serves' => '4 personnes', 'time' => '20 min',
		'ingredients' => array( '1 boîte de Legim Express à la Chayotte', '2 tasses de riz blanc', '1 avocat', 'Pikliz (facultatif)' ),
		'steps' => array( 'Lancez la cuisson du riz.', 'Faites mijoter la chayotte 20 minutes à couvert avec 125 ml d’eau.', 'Servez avec le riz, l’avocat et un peu de pikliz pour relever.' ),
	),
);
foreach ( $recipes as $recipe ) {
	$id = lx_post(
		'post',
		$recipe['slug'],
		array(
			'post_title'    => $recipe['title'],
			'post_excerpt'  => $recipe['excerpt'],
			// The excerpt is the page's lede; the content is for an optional article above the recipe.
			'post_content'  => '',
			'post_date'     => $recipe['date'],
			'post_category' => array( $recettes ),
		)
	);
	set_post_thumbnail( $id, lx_image( "$images/{$recipe['image']}-1280.webp", $recipe['alt'] ) );
	lx_fields(
		array(
			'reading_time' => $recipe['read'],
			'serves'       => $recipe['serves'],
			'time'         => $recipe['time'],
			'product'      => $product_ids[ $recipe['product'] ],
			'ingredients'  => implode( "\n", $recipe['ingredients'] ),
			'steps'        => implode( "\n", $recipe['steps'] ),
		),
		$id
	);
	WP_CLI::log( "recipe {$recipe['slug']} → $id" );
}
// The default category stays out of the way.
wp_update_term( (int) get_option( 'default_category' ), 'category', array( 'name' => 'Divers', 'slug' => 'divers' ) );

// --- Reviews -----------------------------------------------------------------

$reviews = array(
	array( 'Sophie M.', 'Longueuil', "J'adore que la base ne soit pas épicée : je l'assaisonne à mon goût, et mes enfants en redemandent." ),
	array( 'Jean-Robert L.', 'Laval', "Le lalo est parfait, bien fondant. C'est devenu notre repas du mercredi soir : vingt minutes et c'est sur la table." ),
	array( 'Nadège P.', 'Montréal', "Comme chez ma grand-mère, sans passer l'après-midi aux fourneaux. J'ajoute un peu de bœuf et toute la famille se régale." ),
);
// Inserted oldest first, a minute apart, so the newest (Nadège) leads as on the reference.
foreach ( $reviews as $i => [ $name, $city, $quote ] ) {
	$id = lx_post(
		'avis',
		sanitize_title( $name ),
		array(
			'post_title' => $name,
			'post_date'  => gmdate( 'Y-m-d H:i:s', strtotime( '2026-11-01 09:00:00' ) + $i * 60 ),
		)
	);
	lx_fields( array( 'quote' => $quote, 'city' => $city, 'rating' => 5 ), $id );
}

// --- Options -----------------------------------------------------------------

lx_fields(
	array(
		'footer_about'     => "Des légumes mijotés à l'haïtienne, précuits et congelés, prêts en 20 minutes.",
		'contact_address'  => 'Québec, Canada H1L 3A9',
		'contact_phone'    => '+1 (438) 969 8712',
		'contact_email'    => 'infos@safrozen.com',
		'contact_hours'    => 'Du lundi au vendredi, 9 h à 17 h',
		'copyright_holder' => 'Les Aliments Safrozen Foods',
	),
	'option'
);

// --- Newsletter form (Contact Form 7) ------------------------------------------

$arrow = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
$form_id = safrozen_form_id( 'Infolettre' );
$form    = $form_id ? wpcf7_contact_form( $form_id ) : WPCF7_ContactForm::get_template( array( 'title' => 'Infolettre' ) );
$form->set_title( 'Infolettre' );
$form->set_properties(
	array(
		'form'     => '<label class="newsletter__label" for="newsletter-email">Votre adresse courriel</label>
<div class="newsletter__row">
[email* email id:newsletter-email class:newsletter__input autocomplete:email placeholder "nom@exemple.com"]
<button class="btn-chip newsletter__submit" type="submit">S’inscrire ' . $arrow . '</button>
</div>',
		'mail'     => array(
			'active'             => true,
			'subject'            => '[_site_title] Nouvelle inscription à l’infolettre',
			'sender'             => '[_site_title] <wordpress@[_site_domain]>',
			'recipient'          => '[_site_admin_email]',
			'body'               => "Nouvelle inscription : [email]\n\n--\n[_site_title] ([_site_url])",
			'additional_headers' => 'Reply-To: [email]',
			'attachments'        => '',
			'use_html'           => false,
			'exclude_blank'      => false,
		),
		// Flamingo files each sign-up under the address, with a readable subject.
		'additional_settings' => "flamingo_email: \"[email]\"\nflamingo_name: \"[email]\"\nflamingo_subject: \"Inscription à l’infolettre\"",
		'messages' => array_merge(
			$form->prop( 'messages' ),
			array(
				'mail_sent_ok'      => 'Merci ! Vous êtes bien inscrit·e à nos nouvelles.',
				'validation_error'  => 'Vérifiez votre adresse courriel.',
				'invalid_required'  => 'Entrez votre adresse courriel.',
				'invalid_email'     => 'Cette adresse courriel ne semble pas valide.',
			)
		),
	)
);
$form_id = $form->save();
WP_CLI::log( "form Infolettre → $form_id" );

// --- Pages ---------------------------------------------------------------------

$pages = array(
	'notre-histoire'    => 'Notre histoire',
	'contact'           => 'Contact',
	'recettes'          => 'Recettes',
	'points-de-vente'   => 'Trouver un magasin',
	'suivi'             => 'Suivi de commande',
	'livraison'         => 'Livraison',
	'faq'               => 'Questions fréquentes',
	'retours'           => 'Retours',
	'cgv'               => 'Conditions générales de vente',
	'confidentialite'   => 'Politique de confidentialité',
	'conditions-utilisation' => 'Conditions d’utilisation',
);
// WooCommerce's and WordPress's drafts become ours rather than duplicates.
foreach ( array( 'refund_returns' => 'retours', 'privacy-policy' => 'confidentialite' ) as $old => $new ) {
	$draft = get_page_by_path( $old );
	if ( $draft && ! get_page_by_path( $new ) ) {
		wp_update_post( array( 'ID' => $draft->ID, 'post_name' => $new, 'post_status' => 'publish', 'post_content' => '' ) );
	}
}
$page_ids = array();
foreach ( $pages as $slug => $title ) {
	$found = get_page_by_path( $slug );
	$page_ids[ $slug ] = $found ? $found->ID : lx_post( 'page', $slug, array( 'post_title' => $title ) );
	if ( $found ) {
		wp_update_post( array( 'ID' => $found->ID, 'post_title' => $title ) );
	}
}
foreach ( array( 'boutique' => 'shop', 'panier' => 'cart', 'commande' => 'checkout', 'mon-compte' => 'myaccount' ) as $slug => $woo ) {
	$page_ids[ $slug ] = wc_get_page_id( $woo );
}

// --- The landing page ------------------------------------------------------------

/** Block data as ACF stores it: each value plus a "_name" pointing at its field key. */
function lx_block( string $name, array $values ): array {
	$data = array();
	foreach ( $values as $field => $value ) {
		if ( is_array( $value ) && isset( $value['rows'] ) ) {
			$data[ $field ]       = count( $value['rows'] );
			$data[ "_$field" ]    = "field_sf_{$name}_{$field}";
			foreach ( $value['rows'] as $i => $row ) {
				foreach ( $row as $sub => $sub_value ) {
					$data[ "{$field}_{$i}_{$sub}" ]  = $sub_value;
					$data[ "_{$field}_{$i}_{$sub}" ] = "field_sf_{$name}_{$field}_{$sub}";
				}
			}
			continue;
		}
		$data[ $field ]    = $value;
		$data[ "_$field" ] = "field_sf_{$name}_{$field}";
	}
	return array(
		'blockName'    => "safrozen/$name",
		'attrs'        => array(
			'name' => "safrozen/$name",
			'data' => $data,
			'mode' => 'edit',
			'lock' => array( 'move' => true, 'remove' => true ),
		),
		'innerBlocks'  => array(),
		'innerHTML'    => '',
		'innerContent' => array(),
	);
}

$ids = fn( array $keys ) => array_map( fn( $k ) => (string) $product_ids[ $k ], $keys );

$partners = array(
	'iga' => 'IGA extra', 'armel' => 'Distribution Armel', 'marche-palumbo' => 'Marché Palumbo', 'damesara' => 'Dame Sara',
	'le-pro' => 'Le Pro', 'm&s' => 'M&S', 'obeissance' => 'Obéissance', 'wawa' => 'Wawa',
);
$logos = array();
foreach ( $partners as $file => $label ) {
	$logos[] = (string) lx_image( "$images/partners/$file.png", $label );
}

$blocks = array(
	lx_block(
		'hero',
		array(
			'brand'       => 'Legim Express',
			'description' => "Un mijoté de légumes traditionnellement cuits à l'haïtienne",
			'cta_label'   => 'Commandez',
			'products'    => $ids( array( 'lalo', 'eggplant', 'chayotte' ) ),
		)
	),
	lx_block(
		'benefits',
		array(
			'heading' => 'Pourquoi Legim Express',
			'minutes' => 20,
			'cards'   => array(
				'rows' => array(
					// One hero field per card, so the section echoes all three.
					array( 'title' => 'Précuits et Congelés', 'icon' => 'snowflake', 'product' => (string) $product_ids['eggplant'] ),
					array( 'title' => 'Écologiques', 'icon' => 'leaf', 'product' => (string) $product_ids['lalo'] ),
					array( 'title' => 'Solution rapide', 'icon' => 'timer', 'product' => (string) $product_ids['chayotte'] ),
				),
			),
		)
	),
	lx_block(
		'story',
		array(
			'kicker'  => 'Legim Express',
			'title'   => 'Prêt en 20 minutes',
			'body'    => implode(
				"\n\n",
				array(
					"Mijoté de légumes composés de Chayotte ou Mirliton ou Christophine, Aubergine, Papaye, Molokhia (Lalo), choux, carotte, épinard, tomate cuits traditionnellement à l'haïtienne. Ils sont déjà découpés, écrasés, précuits et congelés.",
					'Généralement cela prend plus de 3 heures de préparation et de cuisson, mais Les Aliments Safrozen offre aux consommateurs une solution +/- de 20 minutes, Legim Express. Une formule magique !',
					"Fait à partir d'ingrédients naturels, il n'est ni assaisonné, ni épicé, c'est vraiment une base neutre, à partir de laquelle que l'on soit un amateur ou un chef expérimenté, il peut l'apprêter à son goût, c'est-à-dire avec ou sans viandes ou fruits de mer ou protéine végétale.",
				)
			),
			'tagline' => 'Gagner du temps avec Legim Express !',
			'photo'   => lx_image( "$images/family-1537.webp", 'Une famille partage un repas en cuisine, devant les trois boîtes Legim Express.' ),
		)
	),
	lx_block(
		'partners',
		array(
			'title' => 'Nos partenaires',
			'lede'  => 'Retrouvez Legim Express chez nos détaillants.',
			'logos' => $logos,
		)
	),
	lx_block(
		'featured',
		array(
			'title'    => 'Nos meilleures ventes',
			'products' => $ids( array( 'lalo', 'eggplant' ) ),
		)
	),
	lx_block(
		'recipes',
		array(
			'title'      => 'Nos dernières recettes',
			'lede'       => 'Des idées simples pour apprêter Legim Express à votre goût.',
			'link_label' => 'Voir toutes les recettes',
		)
	),
	lx_block(
		'testimonials',
		array(
			'title'       => 'Ils en parlent',
			'lede'        => 'Ce que nos clients disent de Legim Express.',
			'average'     => '4,9',
			'count_label' => "D'après 120 avis",
		)
	),
	lx_block(
		'newsletter',
		array(
			'title' => 'Rejoignez notre communauté !',
			'lede'  => 'Recevez nos dernières nouvelles directement dans votre boîte mail.',
			'form'  => $form_id,
		)
	),
);

$home = lx_post(
	'page',
	'accueil',
	array(
		'post_title'   => 'Accueil',
		'post_content' => implode( "\n\n", array_map( 'serialize_block', $blocks ) ),
	)
);
WP_CLI::log( "page accueil → $home" );

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $home );
update_option( 'page_for_posts', $page_ids['recettes'] );
update_option( 'wp_page_for_privacy_policy', $page_ids['confidentialite'] );
update_option( 'woocommerce_terms_page_id', $page_ids['cgv'] );

// --- Menus -------------------------------------------------------------------------

/** Rebuilds a menu from [label, page slug | URL] pairs and puts it at a location. */
function lx_menu( string $name, string $location, array $items, array $page_ids ): void {
	$menu = wp_get_nav_menu_object( $name );
	if ( $menu ) {
		wp_delete_nav_menu( $menu->term_id );
	}
	$menu_id = wp_create_nav_menu( $name );
	foreach ( $items as $i => [ $label, $target ] ) {
		$item = array(
			'menu-item-title'    => $label,
			'menu-item-status'   => 'publish',
			'menu-item-position' => $i + 1,
		);
		if ( isset( $page_ids[ $target ] ) ) {
			$item += array(
				'menu-item-type'      => 'post_type',
				'menu-item-object'    => 'page',
				'menu-item-object-id' => $page_ids[ $target ],
			);
		} else {
			$item += array(
				'menu-item-type' => 'custom',
				'menu-item-url'  => home_url( $target ),
			);
		}
		wp_update_nav_menu_item( $menu_id, 0, $item );
	}
	$locations              = get_theme_mod( 'nav_menu_locations', array() );
	$locations[ $location ] = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );
}

lx_menu(
	'Navbar',
	'primary',
	array( array( 'Accueil', '/' ), array( 'Produit', 'boutique' ), array( 'Recette', 'recettes' ), array( 'Histoire', 'notre-histoire' ), array( 'Contact', 'contact' ) ),
	$page_ids
);
lx_menu(
	'Pied de page : Aide',
	'footer-help',
	array( array( 'Trouver un magasin', 'points-de-vente' ), array( 'Suivi de commande', 'suivi' ), array( 'Mon compte', 'mon-compte' ), array( 'Livraison', 'livraison' ), array( 'Questions fréquentes', 'faq' ), array( 'Retours', 'retours' ) ),
	$page_ids
);
// The mobile panel: headings (custom "#" links) with the links under them; each link's
// icon is its "icon-<name>" class. The account group is printed by header.php.
function lx_menu_groups( string $name, string $location, array $groups, array $page_ids ): void {
	$menu = wp_get_nav_menu_object( $name );
	if ( $menu ) {
		wp_delete_nav_menu( $menu->term_id );
	}
	$menu_id  = wp_create_nav_menu( $name );
	$position = 0;
	foreach ( $groups as $title => $items ) {
		$parent = wp_update_nav_menu_item(
			$menu_id,
			0,
			array(
				'menu-item-title'    => $title,
				'menu-item-status'   => 'publish',
				'menu-item-position' => ++$position,
				'menu-item-type'     => 'custom',
				'menu-item-url'      => '#',
			)
		);
		foreach ( $items as [ $label, $target, $icon ] ) {
			$item = array(
				'menu-item-title'     => $label,
				'menu-item-status'    => 'publish',
				'menu-item-position'  => ++$position,
				'menu-item-parent-id' => $parent,
				'menu-item-classes'   => "icon-$icon",
			);
			$item += isset( $page_ids[ $target ] )
				? array( 'menu-item-type' => 'post_type', 'menu-item-object' => 'page', 'menu-item-object-id' => $page_ids[ $target ] )
				: array( 'menu-item-type' => 'custom', 'menu-item-url' => home_url( $target ) );
			wp_update_nav_menu_item( $menu_id, 0, $item );
		}
	}
	$locations              = get_theme_mod( 'nav_menu_locations', array() );
	$locations[ $location ] = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );
}

lx_menu_groups(
	'Navbar mobile',
	'mobile',
	array(
		'Découvrir' => array( array( 'Accueil', '/', 'home' ), array( 'Produits', 'boutique', 'box' ), array( 'Recettes', 'recettes', 'book' ), array( 'Notre histoire', 'notre-histoire', 'leaf' ) ),
		'Aide'      => array( array( 'Suivre ma commande', 'suivi', 'truck' ), array( 'Points de vente', 'points-de-vente', 'pin' ), array( 'FAQ', 'faq', 'question' ), array( 'Contact', 'contact', 'mail' ) ),
	),
	$page_ids
);
// The legal menu is built by import-info-pages.php, with the pages' content.

// --- Permalinks ------------------------------------------------------------------------

// Recipes are the posts: /recettes/{slug}/. Products: /produit/{slug}/.
update_option( 'permalink_structure', '/recettes/%postname%/' );
$woo_permalinks                 = (array) get_option( 'woocommerce_permalinks', array() );
$woo_permalinks['product_base'] = '/produit';
$woo_permalinks['category_base'] = 'categorie';
update_option( 'woocommerce_permalinks', $woo_permalinks );
flush_rewrite_rules();

// The information pages' content, template and fields (from the React app's pages.ts).
require __DIR__ . '/import-info-pages.php';
require __DIR__ . '/import-contact.php';
require __DIR__ . '/import-stores.php';
require __DIR__ . '/import-account.php';
require __DIR__ . '/import-shop.php';

WP_CLI::success( 'Landing content imported.' );
