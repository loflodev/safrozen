<?php
/**
 * Sets up Mon compte and Suivi de commande (CLAUDE.md §19): the tracking
 * page's shortcode, sign-up on the account page with a password the customer
 * chooses, the French endpoint slugs, and a demo customer with the React app's
 * two past orders (src/shop/orders.ts) so every account page has something to
 * show. Safe to re-run: the customer is found by e-mail and the orders by
 * their demo id. import-landing.php runs it at the end.
 *
 * Run: wp eval-file wordpress/scripts/import-account.php [<repo>/public/images]
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/lx-image.php';

// The signed-out card's photos (woocommerce/myaccount/form-login.php finds
// them by file name). WordPress makes the smaller sizes for their srcset.
$art_images = rtrim( $args[0] ?? '', '/' );
if ( is_dir( $art_images ) ) {
	lx_image( "$art_images/benefits-bg-2-1600.webp" );
	lx_image( "$art_images/3box-product-2048.webp" );
} else {
	WP_CLI::warning( 'No public/images folder given: the sign-in and sign-up photos were not imported.' );
}

// No mail while importing: the demo address is on the client's real domain, and
// creating the customer, its orders and notes would each send one.
add_filter( 'pre_wp_mail', '__return_false' );

// --- Pages and settings ----------------------------------------------------------------

$track = get_page_by_path( 'suivi' );
if ( $track ) {
	wp_update_post(
		array(
			'ID'           => $track->ID,
			'post_content' => '<!-- wp:shortcode -->[woocommerce_order_tracking]<!-- /wp:shortcode -->',
		)
	);
}

$options = array(
	'woocommerce_enable_myaccount_registration'  => 'yes',
	'woocommerce_registration_generate_username' => 'yes',
	'woocommerce_registration_generate_password' => 'no',
	// /mon-compte/commandes/, /mon-compte/voir-commande/1041/, /mon-compte/adresses/… (not
	// "commande": endpoints are query vars, and /suivi/?commande= must stay free)
	'woocommerce_myaccount_orders_endpoint'        => 'commandes',
	'woocommerce_myaccount_view_order_endpoint'    => 'voir-commande',
	'woocommerce_myaccount_edit_address_endpoint'  => 'adresses',
	'woocommerce_myaccount_edit_account_endpoint'  => 'details',
	'woocommerce_logout_endpoint'                  => 'deconnexion',
	'woocommerce_myaccount_lost_password_endpoint' => 'mot-de-passe-perdu',
);
foreach ( $options as $name => $value ) {
	update_option( $name, $value );
}
WC()->query->init_query_vars();
WC()->query->add_endpoints();
flush_rewrite_rules();

// --- Demo customer ---------------------------------------------------------------------

// TODO: demo data for the review, like the React app's mock account. Its password is public, so it never goes live.
if ( ! in_array( wp_get_environment_type(), array( 'local', 'development' ), true ) ) {
	WP_CLI::success( 'Account pages set up (no demo customer outside local / development).' );
	return;
}

const LXA_EMAIL    = 'demo@safrozen.com';
const LXA_PASSWORD = 'legimexpress';

$address = array(
	'first_name' => 'Nadège',
	'last_name'  => 'Pierre',
	'address_1'  => '4520, boulevard Saint-Laurent',
	'address_2'  => 'App. 3',
	'city'       => 'Montréal',
	'state'      => 'QC',
	'postcode'   => 'H2T 1R2',
	'country'    => 'CA',
	'phone'      => '514 555-0199',
);

$user = get_user_by( 'email', LXA_EMAIL );
$uid  = $user ? $user->ID : wc_create_new_customer( LXA_EMAIL, 'demo', LXA_PASSWORD );
if ( is_wp_error( $uid ) ) {
	WP_CLI::error( 'demo customer: ' . $uid->get_error_message() );
}
$customer = new WC_Customer( $uid );
$customer->set_first_name( $address['first_name'] );
$customer->set_last_name( $address['last_name'] );
$customer->set_display_name( 'Nadège' );
foreach ( $address as $key => $value ) {
	$customer->{"set_billing_$key"}( $value );
	if ( 'phone' !== $key ) {
		$customer->{"set_shipping_$key"}( $value );
	}
}
$customer->set_billing_email( LXA_EMAIL );
$customer->save();
WP_CLI::log( "customer demo@safrozen.com → $uid (password " . LXA_PASSWORD . ')' );

// --- Its orders ------------------------------------------------------------------------

$orders = array(
	array(
		'demo'     => '1041',
		'date'     => '2026-10-29 10:12:00',
		'status'   => 'en-livraison',
		'lines'    => array( 'legim-au-lalo' => 2, 'legim-a-l-aubergine' => 1 ),
		'shipping' => array( 'Livraison standard', 7.99 ),
		'payment'  => 'Carte de crédit',
		'note'     => 'Votre commande a quitté notre entrepôt ; le livreur passe aujourd’hui entre 13 h et 17 h.',
	),
	array(
		'demo'     => '1038',
		'date'     => '2026-10-12 18:40:00',
		'status'   => 'completed',
		'done'     => '2026-10-15 15:05:00',
		'lines'    => array( 'legim-express-trio-economique' => 1 ),
		'shipping' => array( 'Livraison standard', 0 ),
		'payment'  => 'Virement Interac',
	),
);

foreach ( $orders as $data ) {
	$found = wc_get_orders(
		array(
			'limit'      => 1,
			'meta_key'   => '_lx_demo', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value' => $data['demo'], // phpcs:ignore WordPress.DB.SlowDBQuery
			'status'     => array_keys( wc_get_order_statuses() ),
		)
	);
	$order = $found ? $found[0] : wc_create_order( array( 'customer_id' => $uid ) );
	foreach ( $order->get_items( array( 'line_item', 'shipping' ) ) as $item_id => $item ) {
		$order->remove_item( $item_id );
	}
	foreach ( $data['lines'] as $slug => $qty ) {
		$post = get_page_by_path( $slug, OBJECT, 'product' );
		if ( ! $post ) {
			WP_CLI::warning( "order {$data['demo']}: no product $slug" );
			continue;
		}
		$order->add_product( wc_get_product( $post->ID ), $qty );
	}
	$ship = new WC_Order_Item_Shipping();
	$ship->set_method_title( $data['shipping'][0] );
	$ship->set_method_id( 'flat_rate' );
	$ship->set_total( (string) $data['shipping'][1] );
	$order->add_item( $ship );

	$order->set_customer_id( $uid );
	$order->set_address( $address + array( 'email' => LXA_EMAIL ), 'billing' );
	$order->set_address( array_diff_key( $address, array( 'phone' => 1 ) ), 'shipping' );
	$order->set_payment_method_title( $data['payment'] );
	$order->set_date_created( $data['date'] );
	$order->set_date_paid( $data['date'] );
	$order->calculate_totals( false );
	$order->set_status( $data['status'] );
	if ( isset( $data['done'] ) ) {
		$order->set_date_completed( $data['done'] );
	}
	$order->update_meta_data( '_lx_demo', $data['demo'] );
	$order->save();

	if ( ! empty( $data['note'] ) && ! $order->get_customer_order_notes() ) {
		$order->add_order_note( $data['note'], 1 );
	}
	WP_CLI::log( "order {$data['demo']} → n° {$order->get_order_number()} ({$data['status']})" );
}

WP_CLI::success( 'Account pages set up.' );
