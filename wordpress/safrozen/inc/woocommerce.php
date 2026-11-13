<?php
/**
 * WooCommerce: the Store API data the mini-cart needs, and the cart's limits.
 */

defined( 'ABSPATH' ) || exit;

// WooCommerce's own stylesheets restyle buttons, links and forms; every page
// is drawn by the theme instead (shop.css and the template overrides in woocommerce/).
add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );

// Cards, grids, the boutique bar and empty states, on the shop, cart, checkout and account pages.
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() ) {
			wp_enqueue_style( 'safrozen-shop' );
		}
	}
);

// Woo's jQuery front-end scripts serve add-to-cart links, the product gallery and
// reviews, which the theme does itself (js/cart.ts on the Store API) or doesn't
// print. Off everywhere but the cart, checkout and account pages (checkout.js and
// js/checkout.ts need jQuery), so jQuery no longer blocks rendering elsewhere.
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( is_cart() || is_checkout() || is_account_page() ) {
			return;
		}
		foreach ( array( 'wc-add-to-cart', 'wc-single-product', 'woocommerce', 'wc-jquery-blockui', 'wc-js-cookie' ) as $handle ) {
			wp_dequeue_script( $handle );
		}
	},
	20
);

// Each cart item carries its product's look, so the mini-cart draws its field panel.
function safrozen_register_cart_look(): void {
	if ( ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) ) {
		return;
	}
	woocommerce_store_api_register_endpoint_data(
		array(
			'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\CartItemSchema::IDENTIFIER,
			'namespace'       => 'safrozen',
			'data_callback'   => function ( $cart_item ) {
				$product = $cart_item['data'];
				return safrozen_product_look( $product->get_parent_id() ?: $product->get_id() );
			},
			'schema_callback' => fn() => array(
				'field' => array( 'type' => 'array', 'items' => array( 'type' => 'string' ), 'readonly' => true ),
				'line'  => array( 'type' => 'string', 'readonly' => true ),
				'kind'  => array( 'type' => 'string', 'readonly' => true ),
			),
			'schema_type'     => ARRAY_A,
		)
	);
}
// WooCommerce's blocks load before the theme, so this usually runs right away.
if ( did_action( 'woocommerce_blocks_loaded' ) ) {
	safrozen_register_cart_look();
} else {
	add_action( 'woocommerce_blocks_loaded', 'safrozen_register_cart_look' );
}

// At most 20 of one product per order, as on the reference cart.
const SAFROZEN_MAX_QTY = 20;
add_filter( 'woocommerce_store_api_product_quantity_maximum', fn( $max ) => min( (int) $max, SAFROZEN_MAX_QTY ) );
add_filter( 'woocommerce_quantity_input_max', fn( $max ) => $max > 0 ? min( (int) $max, SAFROZEN_MAX_QTY ) : SAFROZEN_MAX_QTY );

/** Items in the cart, for the navbar badge. */
function safrozen_cart_count(): int {
	return ( function_exists( 'WC' ) && WC()->cart ) ? (int) WC()->cart->get_cart_contents_count() : 0;
}

// The boutique shows the whole catalogue on one page, like the reference.
add_filter( 'loop_shop_per_page', fn() => 24 );
