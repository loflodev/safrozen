<?php
/**
 * My account, sign in / sign up and order tracking (CLAUDE.md §19): the
 * sections and their titles, the order timeline, the form fields' markup and
 * the server-side checks the forms rely on.
 */

defined( 'ABSPATH' ) || exit;

const SAFROZEN_MIN_PASSWORD = 8;

/** The account nav, in order: endpoint => label (Woo's downloads and payment methods are left out). */
function safrozen_account_sections(): array {
	return array(
		'dashboard'       => __( 'Tableau de bord', 'safrozen' ),
		'orders'          => __( 'Commandes', 'safrozen' ),
		'edit-address'    => __( 'Adresses', 'safrozen' ),
		'edit-account'    => __( 'Détails du compte', 'safrozen' ),
		'customer-logout' => __( 'Déconnexion', 'safrozen' ),
	);
}

add_filter( 'woocommerce_account_menu_items', fn() => safrozen_account_sections(), 20 );

/**
 * The account page's header: its title and crumbs after Accueil, from the
 * current endpoint (Mon compte › Commandes › n° 1041).
 *
 * @return array{title: string, crumbs: array}
 */
function safrozen_account_header(): array {
	$home     = __( 'Mon compte', 'safrozen' );
	$url      = wc_get_page_permalink( 'myaccount' );
	$endpoint = WC()->query->get_current_endpoint();

	if ( ! is_user_logged_in() ) {
		$title = match ( true ) {
			'lost-password' === $endpoint && ( isset( $_GET['show-reset-form'] ) || isset( $_GET['key'] ) ) => __( 'Nouveau mot de passe', 'safrozen' ), // phpcs:ignore WordPress.Security.NonceVerification
			'lost-password' === $endpoint => __( 'Mot de passe oublié', 'safrozen' ),
			default => '',
		};
		return $title
			? array( 'title' => $title, 'crumbs' => array( array( $home, $url ), array( $title ) ) )
			: array( 'title' => $home, 'crumbs' => array( array( $home ) ) );
	}

	$sections = safrozen_account_sections();
	if ( 'view-order' === $endpoint ) {
		/* translators: %s: order number */
		$title = sprintf( __( 'Commande n° %s', 'safrozen' ), absint( get_query_var( 'view-order' ) ) );
		return array(
			'title'  => $title,
			'crumbs' => array( array( $home, $url ), array( $sections['orders'], wc_get_account_endpoint_url( 'orders' ) ), array( $title ) ),
		);
	}
	if ( 'edit-address' === $endpoint && get_query_var( 'edit-address' ) ) {
		$type  = wc_edit_address_i18n( sanitize_title( get_query_var( 'edit-address' ) ), true );
		$title = 'billing' === $type ? __( 'Adresse de facturation', 'safrozen' ) : __( 'Adresse de livraison', 'safrozen' );
		return array(
			'title'  => $title,
			'crumbs' => array( array( $home, $url ), array( $sections['edit-address'], wc_get_account_endpoint_url( 'edit-address' ) ), array( $title ) ),
		);
	}
	if ( $endpoint && isset( $sections[ $endpoint ] ) ) {
		return array( 'title' => $sections[ $endpoint ], 'crumbs' => array( array( $home, $url ), array( $sections[ $endpoint ] ) ) );
	}
	return array( 'title' => $home, 'crumbs' => array( array( $home ) ) );
}

// The account and tracking pages draw their own forms: Woo's address, password
// strength and privacy scripts and blurbs would only restyle them.
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! is_account_page() && ! is_page( 'suivi' ) ) {
			return;
		}
		foreach ( array( 'wc-password-strength-meter', 'wc-country-select', 'wc-address-i18n', 'selectWoo' ) as $handle ) {
			wp_dequeue_script( $handle );
		}
		wp_enqueue_style( 'safrozen-account' );
		wp_enqueue_script_module( 'safrozen-account' );
	},
	20
);
remove_action( 'woocommerce_register_form', 'wc_registration_privacy_policy_text', 20 );

// Passwords: at least 8 characters wherever one is chosen (the forms say so).
function safrozen_password_too_short( string $password ): bool {
	return '' !== $password && mb_strlen( $password ) < SAFROZEN_MIN_PASSWORD;
}

function safrozen_password_message(): string {
	/* translators: %d: minimum length */
	return sprintf( __( 'Le mot de passe doit faire au moins %d caractères.', 'safrozen' ), SAFROZEN_MIN_PASSWORD );
}

add_filter(
	'woocommerce_process_registration_errors',
	function ( WP_Error $errors, $username, $password ) {
		if ( safrozen_password_too_short( (string) $password ) ) {
			$errors->add( 'password_short', safrozen_password_message() );
		}
		return $errors;
	},
	10,
	3
);

add_action(
	'validate_password_reset',
	function ( WP_Error $errors ) {
		if ( isset( $_POST['password_1'] ) && safrozen_password_too_short( (string) wp_unslash( $_POST['password_1'] ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput
			$errors->add( 'password_short', safrozen_password_message() );
		}
	}
);

add_action(
	'woocommerce_save_account_details_errors',
	function ( WP_Error $errors ) {
		if ( isset( $_POST['password_1'] ) && safrozen_password_too_short( (string) wp_unslash( $_POST['password_1'] ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput
			$errors->add( 'password_short', safrozen_password_message() );
		}
	}
);

// The account's address forms ask what the checkout asks (no company).
add_filter(
	'woocommerce_default_address_fields',
	function ( array $fields ) {
		if ( is_account_page() ) {
			unset( $fields['company'] );
		}
		return $fields;
	}
);

// Woo's own lines on these pages: the React app's wording when tracking finds
// nothing, and French for the e-mail confirmation that links past guest orders
// to the account (new in Woo 11, not yet translated).
add_filter(
	'gettext_woocommerce',
	function ( string $translation, string $text ) {
		static $ours = null;
		$ours ??= array(
			'Sorry, the order could not be found. Please contact us if you are having difficulty finding your order details.' => __( '<strong>Aucune commande ne correspond.</strong> Vérifiez le numéro (sans le #) et l’adresse e-mail utilisée pour commander.', 'safrozen' ),
			'Confirm your email address to check for past orders and link them to your account.' => __( 'Confirmez votre adresse e-mail pour retrouver vos commandes passées sans compte et les relier à celui-ci.', 'safrozen' ),
			'Confirm email address' => __( 'Confirmer mon adresse', 'safrozen' ),
			'Confirm your email address to check for past orders. A confirmation link was sent recently — please check your inbox.' => __( 'Confirmez votre adresse e-mail pour retrouver vos commandes passées : un lien vient de vous être envoyé, vérifiez votre boîte de réception.', 'safrozen' ),
			'A confirmation link has been sent to your email address. Please check your inbox.' => __( 'Un lien de confirmation vient de vous être envoyé par e-mail. Vérifiez votre boîte de réception.', 'safrozen' ),
			'A confirmation link was sent recently. Please check your inbox, or wait a moment before requesting a new one.' => __( 'Un lien de confirmation vous a été envoyé il y a peu. Vérifiez votre boîte de réception, ou patientez un instant avant d’en demander un autre.', 'safrozen' ),
			'Your email address has been confirmed.' => __( 'Votre adresse e-mail est confirmée.', 'safrozen' ),
			'This confirmation link is invalid or has expired. Please request a new one.' => __( 'Ce lien de confirmation n’est plus valide. Demandez-en un nouveau.', 'safrozen' ),
			'Unable to confirm this email while you are logged in to a different account. Please log out and open the link again.' => __( 'Ce lien concerne un autre compte : déconnectez-vous, puis ouvrez-le de nouveau.', 'safrozen' ),
		);
		return $ours[ $text ] ?? $translation;
	},
	10,
	2
);

// Lost password: an address with no account gets the same answer as one with
// an account (the "link sent" page), so the form never tells who is a customer.
add_action(
	'lostpassword_post',
	function ( WP_Error $errors, $user ) {
		// phpcs:disable WordPress.Security.NonceVerification -- Woo checked it; wp-login.php's form is left alone.
		if ( $user || $errors->has_errors() || empty( $_POST['wc_reset_password'] ) ) {
			return;
		}
		$login = isset( $_POST['user_login'] ) ? sanitize_text_field( wp_unslash( $_POST['user_login'] ) ) : '';
		// phpcs:enable
		if ( is_email( $login ) ) {
			wp_safe_redirect( add_query_arg( 'reset-link-sent', 'true', wc_get_account_endpoint_url( 'lost-password' ) ) );
			exit;
		}
	},
	10,
	2
);

/* --- Order progress ----------------------------------------------------------------------------- */

/** Paid by Interac transfer: the shop confirms the payment by hand before preparing the order. */
function safrozen_pays_by_transfer( WC_Order $order ): bool {
	return 'bacs' === $order->get_payment_method();
}

/** Still waiting for that transfer ("En attente"; the shop moves it to "En cours" once it arrives). */
function safrozen_awaits_transfer( WC_Order $order ): bool {
	return safrozen_pays_by_transfer( $order ) && $order->has_status( array( 'pending', 'on-hold' ) );
}

/**
 * The timeline's steps (STATUS_STEPS in orders.ts) as array( label, detail ).
 * An Interac order has a payment step after Reçue: waiting, then confirmed.
 */
function safrozen_status_steps( ?WC_Order $order = null ): array {
	$steps = array(
		array( __( 'Reçue', 'safrozen' ), __( 'Nous avons bien reçu votre commande.', 'safrozen' ) ),
		array( __( 'Préparée', 'safrozen' ), __( 'Vos legims sont emballés au froid.', 'safrozen' ) ),
		array( __( 'En livraison', 'safrozen' ), __( 'Le livreur est en route.', 'safrozen' ) ),
		array( __( 'Livrée', 'safrozen' ), __( 'Bon appétit !', 'safrozen' ) ),
	);
	if ( $order && safrozen_pays_by_transfer( $order ) ) {
		$payment = safrozen_awaits_transfer( $order )
			? array(
				__( 'Paiement en attente', 'safrozen' ),
				sprintf(
					/* translators: 1: order total, 2: e-mail, 3: order number */
					__( 'Envoyez %1$s par virement Interac à %2$s, avec le n° %3$s en message. Nous confirmons dès réception.', 'safrozen' ),
					wp_strip_all_tags( $order->get_formatted_order_total() ),
					(string) safrozen_option( 'contact_email', get_option( 'admin_email' ) ),
					$order->get_order_number()
				),
			)
			: array( __( 'Paiement confirmé', 'safrozen' ), __( 'Nous avons bien reçu votre virement Interac.', 'safrozen' ) );
		array_splice( $steps, 1, 0, array( $payment ) );
		// Confirmed and set to "En cours": Préparée is under way, not done yet.
		if ( $order->has_status( 'processing' ) ) {
			$steps[2][1] = __( 'Paiement reçu : nous préparons votre commande.', 'safrozen' );
		}
	}
	return $steps;
}

/**
 * Where an order stands on its timeline, or null when it left it (cancelled,
 * refunded, failed). An Interac order waits on its payment step until the shop
 * sets it to "En cours", which moves it on to Préparée.
 */
function safrozen_order_step( WC_Order $order ): ?int {
	$transfer = safrozen_pays_by_transfer( $order ) ? 1 : 0;
	return match ( $order->get_status() ) {
		'pending', 'on-hold' => $transfer,
		'processing' => $transfer ? 2 : 0,
		'preparee' => 1 + $transfer,
		'en-livraison' => 2 + $transfer,
		'completed' => 3 + $transfer,
		default => null,
	};
}

/** Delivered: on the timeline's last step. */
function safrozen_order_delivered( WC_Order $order ): bool {
	return 'completed' === $order->get_status();
}

/** A status pill: delivered in the success tint, off-timeline in the error tint, the rest quiet. */
function safrozen_status_pill( WC_Order $order ): string {
	$step  = safrozen_order_step( $order );
	$state = null === $step ? 'stopped' : ( safrozen_order_delivered( $order ) ? 'delivered' : 'open' );
	$label = null === $step ? wc_get_order_status_name( $order->get_status() ) : safrozen_status_steps( $order )[ $step ][0];
	return sprintf( '<span class="status-pill" data-status="%s">%s</span>', esc_attr( $state ), esc_html( $label ) );
}

/** The order's date as "29 octobre 2026". */
function safrozen_order_date( WC_Order $order ): string {
	$date = $order->get_date_created();
	return $date ? wc_format_datetime( $date, 'j F Y' ) : '';
}

/* --- Form fields -------------------------------------------------------------------------------- */

/**
 * One field in Field.tsx's markup: label above, 52px pill control, help below.
 * `rule` names the check js/form.ts runs on blur and on submit (required,
 * email, postcode, phone, password, match:<id>); the server checks again.
 *
 * @param array $f {
 *     @type string $id, $name, $label, $type ('text', 'email', 'tel', 'password', 'select', 'textarea'), $value
 *     @type bool   $required, $full
 *     @type string $autocomplete, $inputmode, $help, $rule, $message (the required message)
 *     @type array  $options value => label, for selects
 *     @type array  $attrs  extra attributes for the control
 * }
 */
function safrozen_form_field( array $f ): string {
	$f = wp_parse_args(
		$f,
		array(
			'type'         => 'text',
			'value'        => '',
			'required'     => true,
			'full'         => false,
			'autocomplete' => '',
			'inputmode'    => '',
			'help'         => '',
			'rule'         => '',
			'message'      => '',
			'options'      => array(),
			'attrs'        => array(),
		)
	);
	$name  = $f['name'] ?? $f['id'];
	$help  = $f['help'] ? $f['id'] . '-help' : '';
	$attrs = array_merge(
		array(
			'class'            => 'field__control',
			'id'               => $f['id'],
			'name'             => $name,
			'autocomplete'     => $f['autocomplete'] ?: null,
			'inputmode'        => $f['inputmode'] ?: null,
			'aria-required'    => $f['required'] ? 'true' : null,
			'aria-describedby' => $help ?: null,
			'data-rule'        => $f['rule'] ?: ( $f['required'] ? 'required' : null ),
			'data-message'     => $f['message'] ?: null,
		),
		$f['attrs']
	);
	if ( 'textarea' === $f['type'] ) {
		$attrs['rows'] = $attrs['rows'] ?? 3;
	} elseif ( 'select' !== $f['type'] ) {
		$attrs['type']  = $f['type'];
		$attrs['value'] = 'password' === $f['type'] ? null : $f['value'];
	}
	$attr_html = '';
	foreach ( $attrs as $key => $value ) {
		if ( null !== $value ) {
			$attr_html .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( (string) $value ) );
		}
	}

	if ( 'select' === $f['type'] ) {
		$options = '';
		foreach ( $f['options'] as $value => $label ) {
			$options .= sprintf( '<option value="%s"%s>%s</option>', esc_attr( (string) $value ), selected( (string) $value, (string) $f['value'], false ), esc_html( $label ) );
		}
		$control = "<select$attr_html>$options</select>";
	} elseif ( 'textarea' === $f['type'] ) {
		$control = "<textarea$attr_html>" . esc_textarea( (string) $f['value'] ) . '</textarea>';
	} else {
		$control = "<input$attr_html>";
	}

	return sprintf(
		'<div class="field%s"><label class="field__label" for="%s">%s%s</label>%s%s</div>',
		$f['full'] ? ' field--full' : '',
		esc_attr( $f['id'] ),
		esc_html( $f['label'] ),
		$f['required'] ? '' : ' <span class="field__optional">' . esc_html__( '(facultatif)', 'safrozen' ) . '</span>',
		$control,
		$help ? sprintf( '<p class="field__help" id="%s">%s</p>', esc_attr( $help ), esc_html( $f['help'] ) ) : ''
	);
}

/**
 * An address form's fields (billing_ / shipping_), as AddressFields.tsx draws
 * them, from Woo's own field list so its saving and checks still apply.
 */
function safrozen_address_fields( string $type, array $fields ): string {
	$rules = array(
		'first_name' => array( 'given-name', '', '', __( 'Saisissez le prénom.', 'safrozen' ) ),
		'last_name'  => array( 'family-name', '', '', __( 'Saisissez le nom.', 'safrozen' ) ),
		'address_1'  => array( 'address-line1', '', '', __( 'Saisissez l’adresse, par exemple 4520, boulevard Saint-Laurent.', 'safrozen' ) ),
		'address_2'  => array( 'address-line2', '', '', '' ),
		'city'       => array( 'address-level2', '', '', __( 'Saisissez la ville.', 'safrozen' ) ),
		'state'      => array( 'address-level1', '', '', __( 'Choisissez la province.', 'safrozen' ) ),
		'postcode'   => array( 'postal-code', '', 'postcode', '' ),
		'country'    => array( 'country', '', '', '' ),
		'phone'      => array( 'tel', 'tel', 'phone', '' ),
		'email'      => array( 'email', 'email', 'email', '' ),
	);
	$full    = array( 'address_1', 'address_2', 'email' );
	$country = WC()->countries;
	$html    = '';
	foreach ( $fields as $key => $field ) {
		$short = substr( $key, strlen( $type ) + 1 );
		if ( ! isset( $rules[ $short ] ) ) {
			continue;
		}
		[ $autocomplete, $inputmode, $rule, $message ] = $rules[ $short ];
		$value = (string) ( $field['value'] ?? '' );
		$args  = array(
			'id'           => $key,
			'label'        => wp_strip_all_tags( (string) ( $field['label'] ?? $key ) ),
			'value'        => $value,
			'required'     => ! empty( $field['required'] ),
			'full'         => in_array( $short, $full, true ),
			'autocomplete' => "$type $autocomplete",
			'inputmode'    => $inputmode,
			'rule'         => $rule,
			'message'      => $message,
			'type'         => in_array( $short, array( 'phone', 'email' ), true ) ? ( 'phone' === $short ? 'tel' : 'email' ) : 'text',
		);
		if ( 'address_1' === $short ) {
			$args['label'] = __( 'Adresse', 'safrozen' );
		}
		if ( 'address_2' === $short ) {
			$args['label'] = __( 'Appartement, bureau', 'safrozen' );
		}
		if ( 'postcode' === $short ) {
			$args['label']                  = __( 'Code postal', 'safrozen' );
			$args['help']                   = __( 'Par exemple H2T 1R2.', 'safrozen' );
			$args['attrs']['autocapitalize'] = 'characters';
		}
		if ( 'country' === $short ) {
			$args['type']    = 'select';
			$args['options'] = $country->get_allowed_countries();
			$args['value']   = $value ?: $country->get_base_country();
			$args['attrs']['data-country'] = $type;
		}
		if ( 'state' === $short ) {
			$current         = (string) ( $fields[ "{$type}_country" ]['value'] ?? '' ) ?: $country->get_base_country();
			$args['label']   = __( 'Province', 'safrozen' );
			$args['type']    = 'select';
			$args['options'] = array( '' => __( 'Choisir…', 'safrozen' ) ) + (array) $country->get_states( $current );
			$args['value']   = $value ?: ( $current === $country->get_base_country() ? $country->get_base_state() : '' );
			// js/account.ts rebuilds the list when the country changes.
			$codes                        = array_keys( $country->get_allowed_countries() );
			$args['attrs']['data-states'] = (string) wp_json_encode( array_combine( $codes, array_map( fn( $c ) => (array) $country->get_states( $c ), $codes ) ) );
		}
		$html .= safrozen_form_field( $args );
	}
	return $html;
}

/** An image the import script added from the React app's public/images (by file name), or 0. */
function safrozen_source_image( string $file ): int {
	$ids = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'meta_key'    => '_lx_source', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $file, // phpcs:ignore WordPress.DB.SlowDBQuery
			'fields'      => 'ids',
			'numberposts' => 1,
		)
	);
	return $ids ? (int) $ids[0] : 0;
}

// The order view and tracking print the theme's order details (template-parts/order/), not Woo's table.
remove_action( 'woocommerce_view_order', 'woocommerce_order_details_table', 10 );
