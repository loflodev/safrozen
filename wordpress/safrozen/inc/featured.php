<?php
/**
 * The home page's best sellers (the Featured block, CLAUDE.md §11) follow
 * WooCommerce's ★ "En vedette" star in Produits: the last two products
 * starred. Starring a third unstars the oldest (with a notice), and the
 * product list tags the two the home page shows. With no star, the block's
 * own "Produits" field decides.
 */

defined( 'ABSPATH' ) || exit;

const SAFROZEN_HOME_FEATURED = 2;
const SAFROZEN_STARRED_AT    = '_safrozen_starred_at';

/** Published, starred products, the most recently starred first. */
function safrozen_starred_ids( int $exclude = 0 ): array {
	$ids = wc_get_products(
		array(
			'featured' => true,
			'status'   => 'publish',
			'limit'    => -1,
			'return'   => 'ids',
			'exclude'  => $exclude ? array( $exclude ) : array(),
		)
	);
	$at = fn( $id ) => (float) get_post_meta( $id, SAFROZEN_STARRED_AT, true );
	usort( $ids, fn( $a, $b ) => $at( $b ) <=> $at( $a ) );
	return $ids;
}

/** What the home page shows: the last two starred products visible in the shop, the earlier one first. */
function safrozen_home_featured_ids(): array {
	static $ids = null;
	if ( null === $ids ) {
		$visible = array_filter( safrozen_starred_ids(), fn( $id ) => wc_get_product( $id )?->is_visible() );
		$ids     = array_reverse( array_slice( array_values( $visible ), 0, SAFROZEN_HOME_FEATURED ) );
	}
	return $ids;
}

// The star is saved like any product prop (the list's star, the edit screen,
// Quick Edit, REST), so this catches every way of setting it. A star records
// when it was set; a third one unstars the oldest.
add_action(
	'woocommerce_before_product_object_save',
	function ( WC_Product $product ) {
		if ( ! array_key_exists( 'featured', $product->get_changes() ) ) {
			return;
		}
		if ( ! $product->get_featured() ) {
			$product->delete_meta_data( SAFROZEN_STARRED_AT );
			return;
		}
		$product->update_meta_data( SAFROZEN_STARRED_AT, microtime( true ) );
		if ( 'publish' !== $product->get_status() ) {
			return;
		}
		$unstarred = array();
		foreach ( array_slice( safrozen_starred_ids( $product->get_id() ), SAFROZEN_HOME_FEATURED - 1 ) as $id ) {
			$old = wc_get_product( $id );
			$old->set_featured( false );
			$old->save();
			$unstarred[] = $old->get_name();
		}
		if ( $unstarred && get_current_user_id() ) {
			set_transient( 'safrozen_unstarred_' . get_current_user_id(), $unstarred, MINUTE_IN_SECONDS );
		}
	}
);

add_action(
	'admin_notices',
	function () {
		$key       = 'safrozen_unstarred_' . get_current_user_id();
		$unstarred = get_transient( $key );
		if ( ! $unstarred ) {
			return;
		}
		delete_transient( $key );
		printf(
			'<div class="notice notice-info is-dismissible"><p>%s</p></div>',
			esc_html(
				sprintf(
					/* translators: 1: number of products, 2: product names */
					__( 'L’accueil montre les %1$d derniers produits mis en avant (★). Retiré : %2$s.', 'safrozen' ),
					SAFROZEN_HOME_FEATURED,
					implode( ', ', $unstarred )
				)
			)
		);
	}
);

// "— Accueil" after the name of the products the home page shows.
add_filter(
	'display_post_states',
	function ( array $states, WP_Post $post ) {
		if ( 'product' === $post->post_type && in_array( $post->ID, safrozen_home_featured_ids(), true ) ) {
			$states['safrozen-home'] = __( 'Accueil', 'safrozen' );
		}
		return $states;
	},
	10,
	2
);
