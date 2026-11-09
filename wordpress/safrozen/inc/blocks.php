<?php
/**
 * The landing's sections as ACF blocks (blocks/{name}/block.json + render.php).
 * Their fields are in acf-json/; their style and script handles come from the
 * Vite build (inc/assets.php, registered earlier on init).
 */

defined( 'ABSPATH' ) || exit;

const SAFROZEN_BLOCKS = array( 'hero', 'benefits', 'story', 'partners', 'featured', 'recipes', 'testimonials', 'newsletter' );

add_action(
	'init',
	function () {
		foreach ( SAFROZEN_BLOCKS as $name ) {
			register_block_type( SAFROZEN_DIR . "/blocks/$name" );
		}
	}
);

add_filter(
	'block_categories_all',
	function ( array $categories ) {
		array_unshift(
			$categories,
			array(
				'slug'  => 'safrozen',
				'title' => __( "Page d'accueil Legim Express", 'safrozen' ),
			)
		);
		return $categories;
	}
);

// Field groups saved from the admin land in the theme, next to the blocks.
add_filter( 'acf/settings/save_json', fn() => SAFROZEN_DIR . '/acf-json' );

/** A block's anchor id, unless the editor gave it another one. */
function safrozen_block_id( array $block, string $default ): string {
	return ! empty( $block['anchor'] ) ? $block['anchor'] : $default;
}
