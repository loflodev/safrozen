<?php
/**
 * Rank Math setup (docs/seo-a11y-tasks.md, P0): skips its account
 * registration (until then it prints nothing on the front end), picks the
 * modules, sets titles, the organisation, the default share image, the
 * sitemap's contents, the utility pages' noindex and every page's and
 * product's meta description. The Recipe schema is the theme's
 * (inc/seo.php). Safe to run again.
 *
 * Run: wp eval-file wordpress/scripts/import-seo.php <repo>/public/images
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/lx-image.php';

$images = rtrim( $args[0] ?? '', '/' );
if ( ! is_dir( $images ) ) {
	WP_CLI::error( 'Pass the public/images folder of the React app.' );
}
wp_set_current_user( 1 );

/** Merges $values into one of Rank Math's option arrays. */
function lx_rank_math( string $group, array $values ): void {
	$option = "rank-math-options-$group";
	update_option( $option, array_merge( (array) get_option( $option, array() ), $values ) );
}

// Without an account, "skip" on Rank Math's welcome screen is what turns its front end on.
update_option( 'rank_math_registration_skip', true );
update_option( 'rank_math_wizard_completed', true );

// Analytics and Content AI stay off: Law 25 wants analytics off by default (CLAUDE.md §19).
update_option( 'rank_math_modules', array( 'sitemap', 'rich-snippet', 'woocommerce', 'acf', 'seo-analysis', 'llms-txt' ) );

$share = lx_image( "$images/og-default.jpg", __( 'Les trois boîtes Legim Express : lalo, aubergine et chayotte.', 'safrozen' ) );
$logo  = lx_image( "$images/logo.png", 'Legim Express' );

lx_rank_math(
	'general',
	array(
		'breadcrumbs'                 => 'off', // The theme prints its own crumbs.
		'wc_remove_generator'         => 'on',
		'attachment_redirect_default' => home_url( '/' ),
		// /llms.txt: pages, products and recipes (inc/seo.php adds prices, stores and contact).
		'llms_post_types'             => array( 'page', 'product', 'post' ),
		'llms_taxonomies'             => array(),
		'llms_summary'                => 'Legim Express, de Les Aliments Safrozen Foods : des légumes mijotés à l’haïtienne (lalo, aubergine, chayotte), précuits et congelés, prêts en 20 minutes. Vente en ligne avec livraison au froid dans le Grand Montréal, et en épicerie au Québec et à Ottawa.',
	)
);

// The round logo is the site icon: favicon, Apple touch icon (WordPress prints them).
update_option( 'site_icon', $logo );

lx_rank_math(
	'titles',
	array(
		'title_separator'                => '–',
		'knowledgegraph_type'            => 'company',
		'knowledgegraph_name'            => 'Les Aliments Safrozen Foods',
		'knowledgegraph_logo'            => wp_get_attachment_url( $logo ),
		'knowledgegraph_logo_id'         => $logo,
		'website_name'                   => 'Legim Express',
		'local_business_type'            => 'Organization',
		'open_graph_image'               => wp_get_attachment_url( $share ),
		'open_graph_image_id'            => $share,
		'twitter_card_type'              => 'summary_large_image',
		'homepage_title'                 => '%sitename% %sep% %sitedesc%',
		'404_title'                      => 'Page non trouvée %sep% %sitename%',
		'search_title'                   => 'Recherche : %search_query% %page% %sep% %sitename%',
		// Author archives would list the admin's login name.
		'disable_author_archives'        => 'on',
		// Product names already start with "Legim Express".
		'pt_product_title'               => '%title%',
		'pt_product_description'         => '%excerpt%',
		'pt_product_default_rich_snippet' => 'product',
		// Recipes get the theme's Recipe schema; pages are plain WebPages.
		'pt_post_default_rich_snippet'   => 'off',
		'pt_page_default_rich_snippet'   => 'off',
		// One-product categories and the single "Recettes" category duplicate the shop and the archive.
		'tax_product_cat_custom_robots'  => 'on',
		'tax_product_cat_robots'         => array( 'noindex', 'follow' ),
		'tax_category_custom_robots'     => 'on',
		'tax_category_robots'            => array( 'noindex', 'follow' ),
	)
);

lx_rank_math(
	'sitemap',
	array(
		'authors_sitemap'         => 'off',
		'tax_category_sitemap'    => 'off',
		'tax_product_cat_sitemap' => 'off',
		'include_featured_image'  => 'on',
	)
);

// Utility pages: noindex, which also keeps them out of the sitemap.
$utility = array( wc_get_page_id( 'cart' ), wc_get_page_id( 'checkout' ), wc_get_page_id( 'myaccount' ) );
$track   = get_page_by_path( 'suivi' );
if ( $track ) {
	$utility[] = $track->ID;
}
foreach ( array_filter( $utility, fn( $id ) => $id > 0 ) as $id ) {
	update_post_meta( $id, 'rank_math_robots', array( 'noindex', 'follow' ) );
}

// The front page is a static page, so homepage_title doesn't reach it.
update_post_meta( (int) get_option( 'page_on_front' ), 'rank_math_title', '%sitename% %sep% %sitedesc%' );

// Meta descriptions (150–160 characters), by page slug, then by product slug.
$descriptions = array(
	'page'    => array(
		'accueil'                => 'Legim Express, des légumes mijotés à l’haïtienne précuits et congelés : lalo, aubergine et chayotte, prêts en 20 minutes. En ligne et en épicerie.',
		'boutique'               => 'Achetez Legim Express en ligne : lalo, aubergine, chayotte et packs. Des légumes mijotés à l’haïtienne, précuits et congelés, prêts en 20 minutes.',
		'recettes'               => 'Des recettes simples avec Legim Express : lalo aux crevettes, bol végétarien à l’aubergine, chayotte et riz blanc. Un souper haïtien en 20 minutes.',
		'points-de-vente'        => 'Trouvez Legim Express près de chez vous : entrez votre code postal pour voir les épiceries de Montréal, Laval, Québec ou Ottawa qui vendent nos legims.',
		'contact'                => 'Une question sur une commande, la livraison ou nos produits ? Écrivez à l’équipe Legim Express : nous répondons en un jour ouvrable.',
		'notre-histoire'         => 'Une idée née pendant la COVID : Les Aliments Safrozen a créé Legim Express pour mettre les légumes mijotés à l’haïtienne à la portée de tous.',
		'livraison'              => 'Comment vos legims voyagent au froid, de notre cuisine à votre congélateur : zones, délais, frais de livraison et cueillette Legim Express.',
		'faq'                    => 'Conservation, préparation, livraison, paiement : les réponses aux questions qu’on nous pose le plus souvent sur Legim Express.',
		'retours'                => 'Un problème avec votre commande ? Annulation, retours et remboursements Legim Express, et ce que la loi du Québec vous garantit.',
		'cgv'                    => 'Les conditions générales de vente de safrozen.com : prix, commande, paiement, livraison et garanties, selon la Loi sur la protection du consommateur.',
		'confidentialite'        => 'Ce que safrozen.com recueille, pourquoi, combien de temps nous le gardons et comment exercer vos droits, conformément à la Loi 25 du Québec.',
		'conditions-utilisation' => 'Qui édite safrozen.com, le site de Legim Express, et les règles qui encadrent son utilisation : propriété intellectuelle, liens et responsabilité.',
	),
	'product' => array(
		'legim-au-lalo'                 => 'Legim Express au Lalo : des feuilles de lalo (molokhia) mijotées à l’haïtienne, précuites et congelées en barquette individuelle. Prêt en 20 minutes.',
		'legim-a-l-aubergine'           => 'Legim Express à l’Aubergine : des aubergines mijotées à l’haïtienne, précuites et congelées en barquette individuelle. Prêt en 20 minutes.',
		'legim-a-la-chayotte'           => 'Legim Express à la Chayotte : des chayottes mijotées à l’haïtienne, précuites et congelées en barquette individuelle. Prêt en 20 minutes.',
		'pack-decouverte'               => 'La Boîte Essentielle : 6 barquettes Legim Express de lalo, aubergine et chayotte mijotés à l’haïtienne, précuits et congelés. Prêts en 20 minutes.',
		'legim-express-trio-economique' => 'Le Trio Économique Legim Express : lalo, aubergine et chayotte mijotés à l’haïtienne, précuits et congelés, à prix réduit. Prêts en 20 minutes.',
	),
);
foreach ( $descriptions as $type => $items ) {
	foreach ( $items as $slug => $text ) {
		$post = get_page_by_path( $slug, OBJECT, $type );
		if ( ! $post ) {
			WP_CLI::warning( "$type $slug not found" );
			continue;
		}
		update_post_meta( $post->ID, 'rank_math_description', $text );
	}
}

// Rank Math rebuilds its rewrite rules (sitemap_index.xml) on the next request.
update_option( 'rank_math_flush_rewrite', 1 );
flush_rewrite_rules( false );

WP_CLI::success( 'Rank Math configured.' );
