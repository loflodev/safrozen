<?php
/**
 * Product page, cart, checkout and order received (CLAUDE.md §18): the
 * classic shortcodes drawn by the theme (woocommerce/cart/, checkout/,
 * single-product.php). Woo's checkout.js still runs the checkout (totals
 * refresh, payment boxes, the order post); js/checkout.ts adds the three
 * steps on top of it.
 */

defined( 'ABSPATH' ) || exit;

/* --- Scripts and styles ------------------------------------------------------------------------- */

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( is_product() ) {
			wp_enqueue_style( 'safrozen-product' );
			wp_enqueue_script_module( 'safrozen-product' );
		}
		if ( is_cart() || is_checkout() ) {
			// The theme posts the cart form itself; checkout.js stays (see above). The
			// address scripts only style Woo's own .form-row fields, which aren't printed.
			foreach ( array( 'wc-cart', 'wc-password-strength-meter', 'selectWoo' ) as $handle ) {
				wp_dequeue_script( $handle );
			}
			wp_enqueue_style( 'safrozen-checkout' );
			wp_enqueue_script_module( 'safrozen-checkout' );
		}
	},
	20
);

/* --- Product page ------------------------------------------------------------------------------ */

/** The landing's rating summary (the Testimonials block on the front page): array( average, count label ), or null. */
function safrozen_rating_summary(): ?array {
	static $summary = false;
	if ( false !== $summary ) {
		return $summary;
	}
	$summary = null;
	$front   = (int) get_option( 'page_on_front' );
	foreach ( $front ? parse_blocks( (string) get_post_field( 'post_content', $front ) ) : array() as $block ) {
		$data = $block['attrs']['data'] ?? array();
		if ( 'safrozen/testimonials' === $block['blockName'] && ! empty( $data['average'] ) ) {
			$summary = array( (string) $data['average'], (string) ( $data['count_label'] ?? '' ) );
		}
	}
	return $summary;
}

/** A textarea field's lines without the bullets the shop types in front of them ("• Sans gluten"). */
function safrozen_list_lines( string $text ): array {
	return array_values( array_filter( array_map( fn( $l ) => trim( ltrim( trim( $l ), '•-*·' ) ), safrozen_lines( $text ) ) ) );
}

/* --- Delivery --------------------------------------------------------------------------------- */

/**
 * The free standard delivery (a free_shipping method with a minimum, titled
 * like the paid one) replaces the paid rate once it applies, so the customer
 * sees one "Livraison standard", offered.
 */
add_filter(
	'woocommerce_package_rates',
	function ( array $rates ) {
		$free = array();
		foreach ( $rates as $rate ) {
			if ( 'free_shipping' === $rate->get_method_id() ) {
				$free[] = $rate->get_label();
			}
		}
		return array_filter( $rates, fn( $rate ) => 'flat_rate' !== $rate->get_method_id() || ! in_array( $rate->get_label(), $free, true ) );
	},
	20
);

/** The amount from which the zone's standard delivery is free (its free_shipping minimum), or null. */
function safrozen_free_from( ?array $package = null ): ?float {
	$zone = $package ? WC_Shipping_Zones::get_zone_matching_package( $package ) : null;
	$zones = $zone ? array( $zone ) : array_map( fn( $z ) => new WC_Shipping_Zone( $z['id'] ), WC_Shipping_Zones::get_zones() );
	foreach ( $zones as $z ) {
		foreach ( $z->get_shipping_methods( true ) as $method ) {
			if ( 'free_shipping' === $method->id && in_array( $method->requires, array( 'min_amount', 'either' ), true ) && (float) $method->min_amount > 0 ) {
				return (float) $method->min_amount;
			}
		}
	}
	return null;
}

/** The line under each delivery method (DELIVERY in catalog.ts), by method and title. */
function safrozen_rate_detail( WC_Shipping_Rate $rate ): string {
	if ( 'local_pickup' === $rate->get_method_id() || 'pickup_location' === $rate->get_method_id() ) {
		/* translators: %s: pickup place */
		return sprintf( __( '%s, dès le lendemain', 'safrozen' ), __( 'Québec, H1L 3A9', 'safrozen' ) );
	}
	return match ( sanitize_title( $rate->get_label() ) ) {
		'livraison-standard' => __( 'Grand Montréal, en 2 à 3 jours ouvrables', 'safrozen' ),
		'livraison-express'  => __( 'Le lendemain, commandé avant 14 h', 'safrozen' ),
		default              => '',
	};
}

function safrozen_is_pickup( string $rate_id ): bool {
	return str_starts_with( $rate_id, 'local_pickup' ) || str_starts_with( $rate_id, 'pickup_location' );
}

/**
 * The delivery methods as radio cards (ChoiceCard.tsx), in the checkout's
 * second step. Woo's checkout.js reads the checked shipping_method[] radio;
 * the block is refreshed with the totals (the fragment below).
 */
function safrozen_checkout_delivery(): string {
	$packages = WC()->shipping()->get_packages();
	$chosen   = WC()->session ? (array) WC()->session->get( 'chosen_shipping_methods' ) : array();
	$html     = '';
	foreach ( $packages as $i => $package ) {
		$rates   = $package['rates'];
		$current = $chosen[ $i ] ?? ( $rates ? array_key_first( $rates ) : '' );
		if ( ! isset( $rates[ $current ] ) && $rates ) {
			$current = array_key_first( $rates );
		}
		$free_from = safrozen_free_from( $package );
		if ( ! $rates ) {
			$html .= '<p class="notice">' . esc_html__( 'Aucun mode de livraison pour cette adresse. Vérifiez le code postal, ou choisissez la cueillette.', 'safrozen' ) . '</p>';
			continue;
		}
		foreach ( $rates as $id => $rate ) {
			$cost   = (float) $rate->get_cost();
			$detail = safrozen_rate_detail( $rate );
			if ( $cost > 0 && 'livraison-standard' === sanitize_title( $rate->get_label() ) && $free_from ) {
				/* translators: %s: amount */
				$detail .= ( $detail ? '. ' : '' ) . sprintf( __( 'Offerte dès %s.', 'safrozen' ), wp_strip_all_tags( wc_price( $free_from, array( 'decimals' => 0 ) ) ) );
			}
			$input = sprintf(
				'<input type="radio" name="shipping_method[%1$d]" data-index="%1$d" id="shipping_method_%1$d_%2$s" value="%3$s" class="shipping_method"%4$s%5$s>',
				(int) $i,
				esc_attr( sanitize_title( $id ) ),
				esc_attr( $id ),
				checked( $id, $current, false ),
				safrozen_is_pickup( $id ) ? ' data-pickup' : ''
			);
			$html .= sprintf(
				'<label class="choice">%s<span class="choice__text"><span class="choice__label">%s</span>%s</span><span class="choice__aside">%s</span></label>',
				$input,
				esc_html( $rate->get_label() ),
				$detail ? '<span class="choice__detail">' . esc_html( $detail ) . '</span>' : '',
				$cost > 0 ? wp_kses_post( wc_price( $cost ) ) : esc_html__( 'Offerte', 'safrozen' )
			);
		}
	}
	return '<div class="checkout__delivery">' . $html . '</div>';
}

// Totals, delivery cards and payment are refreshed together when the address or the method changes.
add_filter(
	'woocommerce_update_order_review_fragments',
	function ( array $fragments ) {
		$fragments['.checkout__delivery'] = safrozen_checkout_delivery();
		return $fragments;
	}
);

/* --- Checkout ---------------------------------------------------------------------------------- */

// The checkout asks what the React app asks: no company, a required phone, a
// delivery note. Woo's own checks (postcode, e-mail, phone) still run on the post.
add_filter(
	'woocommerce_checkout_fields',
	function ( array $fields ) {
		unset( $fields['billing']['billing_company'], $fields['shipping']['shipping_company'] );
		$fields['billing']['billing_email']['label'] = __( 'Adresse e-mail', 'safrozen' );
		$fields['billing']['billing_phone']['label'] = __( 'Téléphone', 'safrozen' );
		if ( isset( $fields['order']['order_comments'] ) ) {
			$fields['order']['order_comments']['label']    = __( 'Note pour la livraison', 'safrozen' );
			$fields['order']['order_comments']['required'] = false;
		}
		return $fields;
	}
);

// "Payer 45,98 $": the button carries the total, refreshed with the payment block.
add_filter(
	'woocommerce_order_button_text',
	function () {
		$total = WC()->cart ? wp_strip_all_tags( html_entity_decode( wc_price( WC()->cart->get_total( 'edit' ) ) ) ) : '';
		/* translators: %s: order total */
		return $total ? sprintf( __( 'Payer %s', 'safrozen' ), $total ) : __( 'Payer', 'safrozen' );
	}
);

// The theme draws the terms line and the privacy line itself (checkout/terms.php).
remove_action( 'woocommerce_checkout_terms_and_conditions', 'wc_checkout_privacy_policy_text', 20 );
remove_action( 'woocommerce_checkout_terms_and_conditions', 'wc_terms_and_conditions_page_content', 30 );

/**
 * One checkout field in Field.tsx's markup (safrozen_form_field()), from
 * Woo's field list, so Woo still validates and saves it.
 */
function safrozen_checkout_field( string $key, array $field, string $value ): string {
	$rules = array(
		'billing_email'  => array( 'email', 'email', 'email', __( 'Pour la confirmation et le suivi de la commande.', 'safrozen' ) ),
		'billing_phone'  => array( 'tel', 'tel', 'phone', __( 'Le livreur vous appelle à l’arrivée.', 'safrozen' ) ),
		'order_comments' => array( 'off', '', '', __( 'Code de porte, étage, voisin à qui laisser le colis…', 'safrozen' ) ),
	);
	[ $autocomplete, $inputmode, $rule, $help ] = $rules[ $key ] ?? array( '', '', '', '' );
	return safrozen_form_field(
		array(
			'id'           => $key,
			'label'        => wp_strip_all_tags( (string) ( $field['label'] ?? $key ) ),
			'type'         => 'order_comments' === $key ? 'textarea' : ( 'billing_phone' === $key ? 'tel' : ( 'billing_email' === $key ? 'email' : 'text' ) ),
			'value'        => $value,
			'required'     => ! empty( $field['required'] ),
			'full'         => 'order_comments' === $key,
			'autocomplete' => $autocomplete,
			'inputmode'    => $inputmode,
			'rule'         => $rule,
			'help'         => $help,
		)
	);
}

/** Woo's fields of one address group, with the values the checkout remembers. */
function safrozen_checkout_values( string $group ): array {
	$checkout = WC()->checkout();
	$fields   = $checkout->get_checkout_fields( $group );
	foreach ( $fields as $key => $field ) {
		$fields[ $key ]['value'] = (string) $checkout->get_value( $key );
	}
	return $fields;
}

/* --- Order received ---------------------------------------------------------------------------- */

/**
 * The order on the order-received page when the visitor may see it (Woo's own
 * rule: the order key in the URL, and the owner's account if it has one), else null.
 */
function safrozen_received_order(): ?WC_Order {
	$id    = absint( get_query_var( 'order-received' ) );
	$key   = isset( $_GET['key'] ) ? wc_clean( wp_unslash( $_GET['key'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	$order = $id ? wc_get_order( $id ) : false;
	if ( ! $order instanceof WC_Order || ! hash_equals( $order->get_order_key(), (string) $key ) ) {
		return null;
	}
	if ( $order->get_customer_id() && get_current_user_id() !== $order->get_customer_id() ) {
		return null;
	}
	return $order;
}

/** The checkout page's header: Commande, or the thank-you on the order-received page (Confirmation.tsx). */
function safrozen_checkout_header(): array {
	$cart = array( __( 'Panier', 'safrozen' ), wc_get_cart_url() );
	if ( is_wc_endpoint_url( 'order-received' ) ) {
		$order = safrozen_received_order();
		if ( ! $order ) {
			return array(
				'title'  => __( 'Commande introuvable', 'safrozen' ),
				'lede'   => __( 'Pour retrouver une commande, utilisez son numéro et votre adresse e-mail.', 'safrozen' ),
				'crumbs' => array( array( __( 'Commande', 'safrozen' ) ) ),
			);
		}
		$name = $order->get_billing_first_name();
		return array(
			/* translators: %s: first name */
			'title'  => $name ? sprintf( __( 'Merci, %s !', 'safrozen' ), $name ) : __( 'Merci !', 'safrozen' ),
			/* translators: 1: order number, 2: e-mail */
			'lede'   => sprintf( __( 'Votre commande n° %1$s est confirmée. Un e-mail de confirmation part à %2$s.', 'safrozen' ), $order->get_order_number(), $order->get_billing_email() ),
			'crumbs' => array( array( __( 'Commande reçue', 'safrozen' ) ) ),
		);
	}
	if ( is_wc_endpoint_url( 'order-pay' ) ) {
		return array( 'title' => __( 'Paiement de la commande', 'safrozen' ), 'crumbs' => array( array( __( 'Paiement', 'safrozen' ) ) ) );
	}
	return array( 'title' => __( 'Commande', 'safrozen' ), 'crumbs' => array( $cart, array( __( 'Commande', 'safrozen' ) ) ) );
}

// The thank-you page prints the theme's order details (template-parts/order/), not Woo's table.
remove_action( 'woocommerce_thankyou', 'woocommerce_order_details_table', 10 );

/* --- Summary ----------------------------------------------------------------------------------- */

/**
 * The summary's total rows (OrderSummary.tsx) as array( label, value HTML,
 * modifier, coupon code ). The cart leaves delivery and taxes to the checkout;
 * the checkout shows the chosen method and each tax.
 */
function safrozen_summary_rows( bool $checkout ): array {
	$cart = WC()->cart;
	$rows = array( array( __( 'Sous-total', 'safrozen' ), $cart->get_cart_subtotal(), '', '' ) );
	foreach ( $cart->get_coupons() as $code => $coupon ) {
		/* translators: %s: coupon code */
		$rows[] = array( sprintf( __( 'Code %s', 'safrozen' ), strtoupper( $code ) ), '−' . wc_price( $cart->get_coupon_discount_amount( $code, $cart->display_cart_ex_tax ) ), 'discount', $code );
	}
	if ( ! $checkout ) {
		$rows[] = array( __( 'Livraison et taxes', 'safrozen' ), esc_html__( 'À l’étape suivante', 'safrozen' ), '', '' );
		return $rows;
	}
	if ( $cart->needs_shipping() ) {
		$chosen = (array) WC()->session->get( 'chosen_shipping_methods' );
		foreach ( WC()->shipping()->get_packages() as $i => $package ) {
			$rate = $package['rates'][ $chosen[ $i ] ?? '' ] ?? null;
			$rows[] = $rate
				? array( $rate->get_label(), (float) $rate->get_cost() > 0 ? wc_price( (float) $rate->get_cost() ) : esc_html__( 'Offerte', 'safrozen' ), '', '' )
				: array( __( 'Livraison', 'safrozen' ), esc_html__( 'À choisir', 'safrozen' ), '', '' );
		}
	}
	foreach ( $cart->get_fees() as $fee ) {
		$rows[] = array( $fee->name, wc_price( $fee->total ), '', '' );
	}
	if ( wc_tax_enabled() && ! $cart->display_prices_including_tax() ) {
		foreach ( $cart->get_tax_totals() as $tax ) {
			$rows[] = array( $tax->label, $tax->formatted_amount, '', '' );
		}
	}
	return $rows;
}
