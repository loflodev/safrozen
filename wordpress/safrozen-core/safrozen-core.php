<?php
/**
 * Plugin Name: Safrozen Core
 * Description: Contenus Legim Express indépendants du thème : avis clients, points de vente, page « Réglages Safrozen » et champs ACF des produits et recettes.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Requires Plugins: advanced-custom-fields-pro
 * Text Domain: safrozen-core
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'init',
	function () {
		// Customer reviews, shown by the landing's Testimonials block. No public pages.
		register_post_type(
			'avis',
			array(
				'labels'        => array(
					'name'          => __( 'Avis', 'safrozen-core' ),
					'singular_name' => __( 'Avis', 'safrozen-core' ),
					'add_new_item'  => __( 'Ajouter un avis', 'safrozen-core' ),
					'edit_item'     => __( "Modifier l'avis", 'safrozen-core' ),
					'menu_name'     => __( 'Avis clients', 'safrozen-core' ),
				),
				'public'        => false,
				'show_ui'       => true,
				'show_in_rest'  => true,
				'menu_icon'     => 'dashicons-format-quote',
				'menu_position' => 25,
				'supports'      => array( 'title' ),
			)
		);

		// Stores that sell the products (store locator, /points-de-vente). The
		// list is read through the REST API; stores have no page of their own,
		// so nothing ever claims /boutique, which is the WooCommerce shop.
		register_post_type(
			'boutique',
			array(
				'labels'        => array(
					'name'          => __( 'Points de vente', 'safrozen-core' ),
					'singular_name' => __( 'Point de vente', 'safrozen-core' ),
					'add_new_item'  => __( 'Ajouter un point de vente', 'safrozen-core' ),
					'edit_item'     => __( 'Modifier le point de vente', 'safrozen-core' ),
					'menu_name'     => __( 'Points de vente', 'safrozen-core' ),
				),
				'public'        => false,
				'show_ui'       => true,
				'show_in_rest'  => true,
				'rest_base'     => 'points-de-vente',
				'rewrite'       => false,
				'menu_icon'     => 'dashicons-location',
				'menu_position' => 26,
				'supports'      => array( 'title' ),
			)
		);
	}
);

add_filter(
	'enter_title_here',
	function ( $text, $post ) {
		return 'avis' === $post->post_type ? __( 'Nom du client (ex. Nadège P.)', 'safrozen-core' ) : $text;
	},
	10,
	2
);

// Contact details, socials and footer line, shared by the whole site.
add_action(
	'acf/init',
	function () {
		if ( function_exists( 'acf_add_options_page' ) ) {
			acf_add_options_page(
				array(
					'page_title' => __( 'Réglages Safrozen', 'safrozen-core' ),
					'menu_title' => __( 'Réglages Safrozen', 'safrozen-core' ),
					'menu_slug'  => 'reglages-safrozen',
					'capability' => 'edit_theme_options',
					'icon_url'   => 'dashicons-carrot',
					'position'   => 59,
					'redirect'   => false,
				)
			);
		}
	}
);

// The field groups for these types (and products, recipes) ship with the plugin.
add_filter(
	'acf/settings/load_json',
	function ( array $paths ) {
		$paths[] = __DIR__ . '/acf-json';
		return $paths;
	}
);

// ACF Pro is updated by hand: no update checks against ACF's server (and none of its "View details" warnings).
add_filter( 'acf/settings/show_updates', '__return_false' );

// Postal code look-ups for the store locator (/wp-json/legim/v1/geocode).
require __DIR__ . '/geocode.php';

// Order statuses "Préparée" and "En livraison" (the customer's timeline).
require __DIR__ . '/order-status.php';
