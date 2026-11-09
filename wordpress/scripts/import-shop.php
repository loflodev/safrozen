<?php
/**
 * Sets up the purchase flow (CLAUDE.md §18) as the React app mocks it
 * (src/shop/catalog.ts): the cart and checkout pages as the classic
 * shortcodes (the theme draws them, woocommerce/cart/ and checkout/), the
 * delivery methods, TPS and TVQ, the coupon BIENVENUE10 and two payment
 * methods that need no keys, so an order can be placed on the Local site.
 * Square stays as it is until its sandbox keys are entered. Safe to re-run:
 * methods, rates and the coupon are found by name first.
 * import-landing.php runs it at the end.
 *
 * Run: wp eval-file wordpress/scripts/import-shop.php
 */

defined( 'ABSPATH' ) || exit;

// --- Pages and settings ----------------------------------------------------------------

$shortcodes = array(
	'woocommerce_cart_page_id'     => 'woocommerce_cart',
	'woocommerce_checkout_page_id' => 'woocommerce_checkout',
);
foreach ( $shortcodes as $option => $shortcode ) {
	$page_id = (int) get_option( $option );
	if ( $page_id ) {
		wp_update_post(
			array(
				'ID'           => $page_id,
				'post_content' => "<!-- wp:shortcode -->[$shortcode]<!-- /wp:shortcode -->",
			)
		);
	}
}

$cgv     = get_page_by_path( 'cgv' );
$options = array(
	'woocommerce_enable_coupons'                    => 'yes',
	'woocommerce_enable_guest_checkout'             => 'yes',
	// The theme's own "Déjà client ?" line replaces Woo's login toggle; accounts are
	// offered on the confirmation instead of during checkout.
	'woocommerce_enable_checkout_login_reminder'    => 'no',
	'woocommerce_enable_signup_and_login_from_checkout' => 'no',
	'woocommerce_enable_ajax_add_to_cart'           => 'yes',
	'woocommerce_cart_redirect_after_add'           => 'no',
	'woocommerce_ship_to_destination'               => 'billing',
	'woocommerce_checkout_company_field'            => 'hidden',
	'woocommerce_checkout_address_2_field'          => 'optional',
	'woocommerce_checkout_phone_field'              => 'required',
	'woocommerce_terms_page_id'                     => $cgv ? $cgv->ID : 0,
	// /commande/recue/1041/?key=… like the React route /commande/recue/:id.
	'woocommerce_checkout_order_received_endpoint'  => 'recue',
	'woocommerce_checkout_pay_endpoint'             => 'payer',
	// Prices are entered before tax and shown that way; the taxes are their own lines.
	'woocommerce_calc_taxes'                        => 'yes',
	'woocommerce_prices_include_tax'                => 'no',
	'woocommerce_tax_display_shop'                  => 'excl',
	'woocommerce_tax_display_cart'                  => 'excl',
	'woocommerce_tax_total_display'                 => 'itemized',
	'woocommerce_tax_based_on'                      => 'shipping',
	'woocommerce_default_customer_address'          => 'base',
	// Prices read like the React app's formatPrice (fr-CA): 21,00 $.
	'woocommerce_currency_pos'                      => 'right_space',
	'woocommerce_price_decimal_sep'                 => ',',
	'woocommerce_price_thousand_sep'                => ' ',
	'woocommerce_price_num_decimals'                => 2,
);
foreach ( $options as $name => $value ) {
	update_option( $name, $value );
}
WC()->query->init_query_vars();
WC()->query->add_endpoints();
flush_rewrite_rules();

// --- Delivery (DELIVERY in catalog.ts) ------------------------------------------------

/** Adds a method to a zone, or updates the one of that type and title already there. */
function lxs_zone_method( WC_Shipping_Zone $zone, string $type, array $settings ): void {
	foreach ( $zone->get_shipping_methods() as $method ) {
		if ( $method->id === $type && $method->get_title() === $settings['title'] ) {
			update_option( $method->get_instance_option_key(), array_merge( $method->instance_settings, $settings ) );
			return;
		}
	}
	$instance = $zone->add_shipping_method( $type );
	$method   = WC_Shipping_Zones::get_shipping_method( $instance );
	update_option( $method->get_instance_option_key(), array_merge( $method->instance_settings, $settings ) );
}

$pickup = array(
	'title'      => 'Cueillette',
	'cost'       => '0',
	'tax_status' => 'none',
);
$delivery = array(
	array( 'flat_rate', array( 'title' => 'Livraison standard', 'cost' => '7.99', 'tax_status' => 'taxable' ) ),
	// Same title as the paid one: inc/checkout.php drops the paid rate once this one applies.
	array( 'free_shipping', array( 'title' => 'Livraison standard', 'requires' => 'min_amount', 'min_amount' => '60', 'ignore_discounts' => 'no' ) ),
	array( 'flat_rate', array( 'title' => 'Livraison express', 'cost' => '12.99', 'tax_status' => 'taxable' ) ),
	array( 'local_pickup', $pickup ),
);
foreach ( WC_Shipping_Zones::get_zones() as $data ) {
	$zone = new WC_Shipping_Zone( $data['id'] );
	foreach ( $delivery as [ $type, $settings ] ) {
		lxs_zone_method( $zone, $type, $settings );
	}
}
// Outside the Montréal zones the order can still be picked up.
lxs_zone_method( new WC_Shipping_Zone( 0 ), 'local_pickup', $pickup );
WC_Cache_Helper::get_transient_version( 'shipping', true );

// --- Taxes ---------------------------------------------------------------------------

$rates = array(
	array( 'tax_rate_country' => 'CA', 'tax_rate_state' => '', 'tax_rate' => '5.0000', 'tax_rate_name' => 'TPS', 'tax_rate_priority' => 1 ),
	array( 'tax_rate_country' => 'CA', 'tax_rate_state' => 'QC', 'tax_rate' => '9.9750', 'tax_rate_name' => 'TVQ', 'tax_rate_priority' => 2 ),
);
$existing = array_column( WC_Tax::get_rates_for_tax_class( '' ), null, 'tax_rate_name' );
foreach ( $rates as $rate ) {
	$rate += array( 'tax_rate_compound' => 0, 'tax_rate_shipping' => 1, 'tax_rate_order' => 0, 'tax_rate_class' => '' );
	if ( isset( $existing[ $rate['tax_rate_name'] ] ) ) {
		WC_Tax::_update_tax_rate( $existing[ $rate['tax_rate_name'] ]->tax_rate_id, $rate );
	} else {
		WC_Tax::_insert_tax_rate( $rate );
	}
}

// --- Coupon (COUPONS in catalog.ts) -------------------------------------------------------

// TODO: the store's real coupons, once known.
$coupon = new WC_Coupon( wc_get_coupon_id_by_code( 'bienvenue10' ) );
$coupon->set_code( 'bienvenue10' );
$coupon->set_description( '10 % sur la première commande' );
$coupon->set_discount_type( 'percent' );
$coupon->set_amount( 10 );
$coupon->set_individual_use( true );
$coupon->set_usage_limit_per_user( 1 );
$coupon->save();

// --- Payment -------------------------------------------------------------------------------

// TODO: test methods until Square's keys are entered (WooCommerce › Réglages › Paiements).
$gateways = array(
	'bacs' => array(
		'enabled'      => 'yes',
		'title'        => 'Virement Interac',
		'description'  => 'Instructions envoyées par e-mail',
		'instructions' => 'Envoyez le total par virement Interac à infos@safrozen.com, avec votre numéro de commande en message. Nous préparons la commande dès sa réception.',
	),
	'cod'  => array(
		'enabled'      => 'yes',
		'title'        => 'Paiement à la livraison',
		'description'  => 'Carte ou comptant, à la porte',
		'instructions' => 'Vous payez par carte ou comptant à la livraison ou à la cueillette.',
	),
);
foreach ( $gateways as $id => $settings ) {
	update_option( "woocommerce_{$id}_settings", array_merge( (array) get_option( "woocommerce_{$id}_settings", array() ), $settings ) );
}
update_option( 'woocommerce_gateway_order', array( 'square_credit_card' => 0, 'bacs' => 1, 'cod' => 2 ) );

WP_CLI::success( 'Boutique : pages, livraison, taxes, coupon et paiements à jour.' );
