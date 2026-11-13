<?php
/**
 * Theme supports, menus and editor settings.
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'after_setup_theme',
	function () {
		load_theme_textdomain( 'safrozen', SAFROZEN_DIR . '/languages' );

		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
		add_theme_support(
			'custom-logo',
			array(
				'width'       => 257,
				'height'      => 257,
				'flex-width'  => false,
				'flex-height' => false,
			)
		);
		add_theme_support( 'woocommerce' );
		add_theme_support( 'editor-styles' );
		// Core block patterns point at another design; the landing is built from the theme's blocks.
		remove_theme_support( 'core-block-patterns' );

		register_nav_menus(
			array(
				'primary'     => __( 'Navbar (menu chip)', 'safrozen' ),
				'mobile'      => __( 'Navbar mobile (groupes)', 'safrozen' ),
				'footer-help' => __( 'Pied de page : Aide', 'safrozen' ),
				'footer-legal' => __( 'Pied de page : liens légaux', 'safrozen' ),
			)
		);
	}
);

/**
 * Top-level items of the menu at a location, with WordPress's "current" flags set.
 *
 * The navbar and footer print their own markup (their classes come from the
 * React reference), so they read the items instead of using wp_nav_menu().
 *
 * @return WP_Post[]
 */
function safrozen_menu_items( string $location ): array {
	$locations = get_nav_menu_locations();
	if ( empty( $locations[ $location ] ) ) {
		return array();
	}
	$items = wp_get_nav_menu_items( $locations[ $location ] ) ?: array();
	_wp_menu_item_classes_by_context( $items );
	return array_values( array_filter( $items, fn( $item ) => ! $item->menu_item_parent ) );
}

/**
 * The mobile panel's groups (< 900px): each top-level item of the "mobile" menu
 * is a heading, its children are the links. A child's icon is the "icon-<name>"
 * in its CSS classes (Apparence > Menus > Options de l'écran > Classes CSS), e.g.
 * icon-truck. Without a mobile menu, the navbar's items form one group.
 *
 * @return array<int, array{title: string, items: WP_Post[]}>
 */
function safrozen_menu_groups(): array {
	$locations = get_nav_menu_locations();
	$items     = empty( $locations['mobile'] ) ? array() : ( wp_get_nav_menu_items( $locations['mobile'] ) ?: array() );
	if ( ! $items ) {
		return array( array( 'title' => __( 'Menu', 'safrozen' ), 'items' => safrozen_menu_items( 'primary' ) ) );
	}
	_wp_menu_item_classes_by_context( $items );
	$groups = array();
	foreach ( $items as $item ) {
		if ( ! $item->menu_item_parent ) {
			$groups[ $item->ID ] = array( 'title' => $item->title, 'items' => array() );
		} elseif ( isset( $groups[ $item->menu_item_parent ] ) ) {
			$groups[ $item->menu_item_parent ]['items'][] = $item;
		}
	}
	return array_values( array_filter( $groups, fn( $group ) => $group['items'] ) );
}

/** The icon named by a menu item's "icon-<name>" class, or ''. */
function safrozen_menu_icon( WP_Post $item ): string {
	foreach ( (array) $item->classes as $class ) {
		if ( str_starts_with( (string) $class, 'icon-' ) ) {
			return substr( $class, 5 );
		}
	}
	return '';
}

/**
 * A menu item's href. Links to a section of the landing ("/#recettes") become
 * bare hashes on the landing itself, so they scroll instead of reloading; the
 * home link (Accueil) scrolls back to the hero there, like the logo.
 */
function safrozen_menu_href( WP_Post $item ): string {
	$home = trailingslashit( home_url() );
	if ( is_front_page() && trailingslashit( $item->url ) === $home ) {
		return '#accueil';
	}
	if ( is_front_page() && str_starts_with( $item->url, $home . '#' ) ) {
		return substr( $item->url, strlen( $home ) );
	}
	return $item->url;
}

/**
 * The item's aria-current: "page" for the page itself, "true" for the posts
 * page (Recette) while a recipe or a recipe category is open.
 */
function safrozen_menu_current( WP_Post $item ): string {
	if ( $item->current ) {
		return 'page';
	}
	$in_blog = is_singular( 'post' ) || is_category();
	return $in_blog && in_array( 'current_page_parent', (array) $item->classes, true ) ? 'true' : '';
}

// WordPress marks every page's <body> with "page"; here .page is the inner
// pages' frame (base.css), so the body must not carry it.
add_filter( 'body_class', fn( array $classes ) => array_values( array_diff( $classes, array( 'page' ) ) ) );

// The French-law "Mentions légales" became the terms of use (Québec). WordPress
// keeps old slugs for posts only, so the old page address is redirected here.
add_action(
	'template_redirect',
	function () {
		if ( is_404() && 'mentions-legales' === trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' ) ) {
			$page = get_page_by_path( 'conditions-utilisation' );
			if ( $page ) {
				wp_safe_redirect( get_permalink( $page ), 301 );
				exit;
			}
		}
	}
);

// <head> clean-up: no version numbers (WordPress, and Woo's via Rank Math), no
// legacy editor and shortlink links, no XML-RPC, and no emoji script (system
// emoji render natively). The REST link stays: the store locator calls its API.
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head', 10 );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
add_filter( 'xmlrpc_enabled', '__return_false' ); // The methods that need a login...
add_filter( 'xmlrpc_methods', '__return_empty_array' ); // ...and the public ones (pingbacks, demo).
add_filter(
	'wp_headers',
	function ( array $headers ): array {
		unset( $headers['X-Pingback'] );
		return $headers;
	}
);
