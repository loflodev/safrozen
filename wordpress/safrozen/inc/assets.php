<?php
/**
 * Registers the Vite build (build/.vite/manifest.json): one style handle per
 * entry's CSS and one script module per JS entry, all named "safrozen-{entry}".
 * Blocks pick theirs up by handle in block.json; the shell's are enqueued here.
 */

defined( 'ABSPATH' ) || exit;

function safrozen_manifest(): array {
	static $manifest = null;
	if ( null === $manifest ) {
		$file     = SAFROZEN_DIR . '/build/.vite/manifest.json';
		$manifest = is_readable( $file ) ? (array) json_decode( (string) file_get_contents( $file ), true ) : array();
	}
	return $manifest;
}

/** File names are content-hashed, so no version query is added. */
function safrozen_build_url( string $file ): string {
	return SAFROZEN_URI . '/build/' . $file;
}

add_action(
	'init',
	function () {
		foreach ( safrozen_manifest() as $chunk ) {
			if ( empty( $chunk['isEntry'] ) ) {
				continue;
			}
			$handle = 'safrozen-' . $chunk['name'];
			$is_js  = str_ends_with( $chunk['file'], '.js' );
			$styles = $is_js ? ( $chunk['css'] ?? array() ) : array( $chunk['file'] );
			foreach ( $styles as $i => $file ) {
				wp_register_style( $handle . ( $i ? "-$i" : '' ), safrozen_build_url( $file ), array(), null );
			}
			if ( $is_js ) {
				wp_register_script_module( $handle, safrozen_build_url( $chunk['file'] ), array(), null );
			}
		}
	},
	5
);

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style( 'safrozen-main' );
		wp_enqueue_script_module( 'safrozen-main' );
	}
);

add_action(
	'after_setup_theme',
	function () {
		$editor = safrozen_manifest()['css/editor.css']['file'] ?? '';
		if ( $editor ) {
			add_editor_style( 'build/' . $editor );
		}
	}
);

// The variable fonts are preloaded: the hero title and navbar need them on first paint.
add_action(
	'wp_head',
	function () {
		foreach ( safrozen_manifest()['js/main.ts']['assets'] ?? array() as $file ) {
			if ( preg_match( '/(manrope-latin-wght|aclonica-latin-400)[^\/]*\.woff2$/', $file ) ) {
				printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( safrozen_build_url( $file ) ) );
			}
		}
	},
	2
);

/** Values the scripts need (js/config.ts), printed once in the footer. */
function safrozen_script_config(): array {
	$config = array(
		'storeApi'    => esc_url_raw( rest_url( 'wc/store/v1/' ) ),
		'nonce'       => function_exists( 'WC' ) ? wp_create_nonce( 'wc_store_api' ) : '',
		'cartUrl'     => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/panier/' ),
		'checkoutUrl' => function_exists( 'wc_get_checkout_url' ) ? wc_get_checkout_url() : home_url( '/commande/' ),
		'shopUrl'     => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/boutique/' ),
		'geocodeUrl'  => esc_url_raw( rest_url( 'legim/v1/geocode' ) ),
	);
	return $config;
}
