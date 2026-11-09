<?php
/**
 * Commande (Checkout.tsx): three steps on one page (coordonnées, livraison,
 * paiement) beside the summary, 7 / 5 from 900px. All three steps sit in
 * WooCommerce's one checkout form, so its checkout.js still refreshes the
 * totals and posts the order; js/checkout.ts shows one step at a time and
 * checks each step's fields before the next opens.
 *
 * Overrides woocommerce/templates/checkout/form-checkout.php 9.4.0; the form's
 * name, classes, fields and hooks are WooCommerce's.
 *
 * @var WC_Checkout $checkout
 * @version 9.4.0
 */

defined( 'ABSPATH' ) || exit;

// The theme draws its own coupon form in the summary and its own sign-in line.
remove_action( 'woocommerce_before_checkout_form', 'woocommerce_checkout_coupon_form', 10 );
remove_action( 'woocommerce_before_checkout_form', 'woocommerce_checkout_login_form', 10 );
do_action( 'woocommerce_before_checkout_form', $checkout );

if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
	echo '<p class="notice">' . esc_html__( 'Connectez-vous pour commander.', 'safrozen' ) . '</p>';
	return;
}

$billing  = safrozen_checkout_values( 'billing' );
$shipping = safrozen_checkout_values( 'shipping' );
$order    = safrozen_checkout_values( 'order' );
// E-mail first, then phone (Woo lists the phone first).
$contact  = array_filter( array( 'billing_email' => $billing['billing_email'] ?? null, 'billing_phone' => $billing['billing_phone'] ?? null ) );
$address  = array_diff_key( $billing, $contact );
// phpcs:ignore WordPress.Security.NonceVerification.Missing -- re-renders a posted choice; Woo checks the post.
$elsewhere = ! empty( $_POST['ship_to_different_address'] ) || apply_filters( 'woocommerce_ship_to_different_address_checked', 'shipping' === get_option( 'woocommerce_ship_to_destination' ) ? 1 : 0 );
$steps     = array( __( 'Coordonnées', 'safrozen' ), __( 'Livraison', 'safrozen' ), __( 'Paiement', 'safrozen' ) );
?>
<div class="checkout__layout">
	<div>
		<ol class="steps" aria-label="<?php esc_attr_e( 'Étapes de la commande', 'safrozen' ); ?>" data-steps>
			<?php foreach ( $steps as $i => $label ) : ?>
				<li class="steps__item" data-state="<?php echo 0 === $i ? 'current' : 'todo'; ?>">
					<button type="button" class="steps__btn" data-go="<?php echo (int) $i; ?>" disabled<?php echo 0 === $i ? ' aria-current="step"' : ''; ?>>
						<span class="steps__dot" aria-hidden="true"><span class="steps__num"><?php echo (int) $i + 1; ?></span><?php echo safrozen_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
						<span class="steps__label"><?php echo esc_html( $label ); ?><span class="visually-hidden" data-done-label hidden> <?php esc_html_e( '(terminé, modifier)', 'safrozen' ); ?></span></span>
					</button>
				</li>
			<?php endforeach; ?>
		</ol>

		<?php if ( ! is_user_logged_in() ) : ?>
			<p class="notice checkout__login" data-step-only="0">
				<?php esc_html_e( 'Déjà client ?', 'safrozen' ); ?>
				<a class="link" href="<?php echo esc_url( add_query_arg( 'redirect_to', rawurlencode( wc_get_checkout_url() ), wc_get_page_permalink( 'myaccount' ) ) ); ?>"><?php esc_html_e( 'Connectez-vous', 'safrozen' ); ?></a>
				<?php esc_html_e( 'pour retrouver vos adresses. Sinon, commandez simplement en invité.', 'safrozen' ); ?>
			</p>
		<?php endif; ?>

		<form name="checkout" method="post" class="checkout woocommerce-checkout panel checkout__form" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data" novalidate aria-label="<?php esc_attr_e( 'Commande', 'safrozen' ); ?>" data-checkout>
			<div data-error-summary></div>
			<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>

			<section class="checkout__step" data-step="0" aria-labelledby="step-0-title">
				<h2 class="panel__title" id="step-0-title" tabindex="-1"><?php esc_html_e( 'Vos coordonnées', 'safrozen' ); ?></h2>
				<?php do_action( 'woocommerce_before_checkout_billing_form', $checkout ); ?>
				<div class="form-grid form-grid--2">
					<?php
					foreach ( $contact as $key => $field ) {
						echo safrozen_checkout_field( $key, $field, $field['value'] ); // phpcs:ignore WordPress.Security.EscapeOutput
					}
					?>
				</div>
				<h3 class="form-subhead"><?php esc_html_e( 'Adresse de facturation', 'safrozen' ); ?></h3>
				<div class="form-grid form-grid--2" data-address="billing">
					<?php echo safrozen_address_fields( 'billing', $address ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</div>
				<?php do_action( 'woocommerce_after_checkout_billing_form', $checkout ); ?>
			</section>

			<section class="checkout__step" data-step="1" aria-labelledby="step-1-title" hidden>
				<h2 class="panel__title" id="step-1-title" tabindex="-1"><?php esc_html_e( 'Livraison', 'safrozen' ); ?></h2>
				<?php if ( WC()->cart->needs_shipping() ) : ?>
					<fieldset class="checkout__choices">
						<legend class="form-subhead"><?php esc_html_e( 'Mode de livraison', 'safrozen' ); ?></legend>
						<?php echo safrozen_checkout_delivery(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					</fieldset>

					<div class="checkout__ship" data-ship>
						<label class="check">
							<input type="checkbox" data-same-address<?php checked( ! $elsewhere ); ?>>
							<?php esc_html_e( 'Livrer à mon adresse de facturation', 'safrozen' ); ?>
						</label>
						<?php // Woo's own switch, kept in step with the box above (js/checkout.ts). ?>
						<p id="ship-to-different-address" hidden>
							<input type="checkbox" name="ship_to_different_address" value="1" tabindex="-1"<?php checked( $elsewhere ); ?>>
						</p>
						<div class="checkout__address address-block" data-same-block<?php echo $elsewhere ? ' hidden' : ''; ?>></div>
						<div class="shipping_address" data-shipping-fields<?php echo $elsewhere ? '' : ' hidden'; ?>>
							<h3 class="form-subhead"><?php esc_html_e( 'Adresse de livraison', 'safrozen' ); ?></h3>
							<?php do_action( 'woocommerce_before_checkout_shipping_form', $checkout ); ?>
							<div class="form-grid form-grid--2" data-address="shipping">
								<?php echo safrozen_address_fields( 'shipping', $shipping ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
							</div>
							<?php do_action( 'woocommerce_after_checkout_shipping_form', $checkout ); ?>
						</div>
					</div>
				<?php endif; ?>

				<?php do_action( 'woocommerce_before_order_notes', $checkout ); ?>
				<?php
				foreach ( $order as $key => $field ) {
					echo safrozen_checkout_field( $key, $field, $field['value'] ); // phpcs:ignore WordPress.Security.EscapeOutput
				}
				?>
				<?php do_action( 'woocommerce_after_order_notes', $checkout ); ?>
			</section>

			<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>

			<section class="checkout__step" data-step="2" aria-labelledby="step-2-title" hidden>
				<h2 class="panel__title" id="step-2-title" tabindex="-1"><?php esc_html_e( 'Paiement', 'safrozen' ); ?></h2>
				<?php woocommerce_checkout_payment(); ?>
			</section>

			<div class="checkout__actions" data-step-actions>
				<button type="button" class="btn-ghost" data-back hidden><?php esc_html_e( 'Retour', 'safrozen' ); ?></button>
				<button type="button" class="btn-chip" data-next>
					<?php esc_html_e( 'Continuer', 'safrozen' ); ?>
					<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</button>
			</div>
		</form>
	</div>

	<div class="checkout__aside">
		<section class="summary panel" id="order_review" aria-labelledby="summary-title">
			<h2 class="panel__title" id="summary-title"><?php esc_html_e( 'Récapitulatif', 'safrozen' ); ?></h2>
			<?php woocommerce_order_review(); ?>
			<?php if ( wc_coupons_enabled() ) : ?>
				<form class="coupon" method="post" data-coupon-form<?php echo WC()->cart->get_coupons() ? ' hidden' : ''; ?>>
					<label class="field__label" for="coupon_code"><?php esc_html_e( 'Code promo', 'safrozen' ); ?></label>
					<div class="coupon__row">
						<input id="coupon_code" class="field__control" name="coupon_code" autocomplete="off" autocapitalize="characters" aria-describedby="coupon-msg">
						<button type="submit" class="btn-ghost"><?php esc_html_e( 'Appliquer', 'safrozen' ); ?></button>
					</div>
					<p class="field__help" id="coupon-msg" aria-live="polite"></p>
				</form>
			<?php endif; ?>
			<div class="summary__action">
				<a class="link checkout__edit" href="<?php echo esc_url( wc_get_cart_url() ); ?>"><?php esc_html_e( 'Modifier le panier', 'safrozen' ); ?></a>
			</div>
		</section>
	</div>
</div>
<?php
do_action( 'woocommerce_after_checkout_form', $checkout );
