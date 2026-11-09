<?php
/**
 * The checkout's payment step: the methods as radio cards, the terms line,
 * then Retour and "Payer {total}". WooCommerce's checkout.js swaps this block
 * (#payment) with the totals and opens the chosen method's box.
 *
 * Overrides woocommerce/templates/checkout/payment.php 10.9.0; the input
 * names, ids, nonce and hooks are WooCommerce's.
 *
 * @var WC_Payment_Gateway[] $available_gateways
 * @var string               $order_button_text
 * @version 10.9.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! wp_doing_ajax() ) {
	do_action( 'woocommerce_review_order_before_payment' );
}
?>
<div id="payment" class="woocommerce-checkout-payment checkout__payment">
	<?php if ( WC()->cart && WC()->cart->needs_payment() ) : ?>
		<fieldset class="checkout__choices">
			<legend class="form-subhead"><?php esc_html_e( 'Moyen de paiement', 'safrozen' ); ?></legend>
			<?php if ( $available_gateways ) : ?>
				<ul class="wc_payment_methods payment_methods methods checkout__methods">
					<?php
					foreach ( $available_gateways as $gateway ) {
						wc_get_template( 'checkout/payment-method.php', array( 'gateway' => $gateway ) );
					}
					?>
				</ul>
			<?php else : ?>
				<p class="notice"><?php esc_html_e( 'Aucun moyen de paiement n’est disponible pour l’instant. Écrivez-nous pour finaliser la commande.', 'safrozen' ); ?></p>
			<?php endif; ?>
		</fieldset>
	<?php endif; ?>
	<div class="place-order checkout__pay">
		<noscript>
			<p class="field__help"><?php esc_html_e( 'Sans JavaScript, mettez à jour les totaux avant de payer.', 'safrozen' ); ?></p>
			<button type="submit" class="btn-ghost" name="woocommerce_checkout_update_totals" value="1"><?php esc_html_e( 'Mettre à jour les totaux', 'safrozen' ); ?></button>
		</noscript>

		<?php wc_get_template( 'checkout/terms.php' ); ?>

		<?php do_action( 'woocommerce_review_order_before_submit' ); ?>
		<div class="checkout__actions">
			<button type="button" class="btn-ghost" data-back><?php esc_html_e( 'Retour', 'safrozen' ); ?></button>
			<?php
			// checkout.js writes the label back from data-value, so the arrow is drawn in CSS.
			echo apply_filters( 'woocommerce_order_button_html', '<button type="submit" class="btn-chip checkout__place" name="woocommerce_checkout_place_order" id="place_order" value="' . esc_attr( $order_button_text ) . '" data-value="' . esc_attr( $order_button_text ) . '" data-busy="' . esc_attr__( 'Paiement en cours…', 'safrozen' ) . '">' . esc_html( $order_button_text ) . '</button>' ); // phpcs:ignore WordPress.Security.EscapeOutput, WooCommerce.Commenting.CommentHooks
			?>
		</div>
		<?php do_action( 'woocommerce_review_order_after_submit' ); ?>

		<?php wp_nonce_field( 'woocommerce-process_checkout', 'woocommerce-process-checkout-nonce' ); ?>
	</div>
</div>
<?php
if ( ! wp_doing_ajax() ) {
	do_action( 'woocommerce_review_order_after_payment' );
}
