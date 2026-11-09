<?php
/**
 * The terms line of the payment step (Checkout.tsx): "J'accepte les
 * conditions générales de vente." linking to the CGV page in a new tab.
 *
 * Overrides woocommerce/templates/checkout/terms.php 3.4.0.
 *
 * @version 3.4.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! apply_filters( 'woocommerce_checkout_show_terms', true ) || ! function_exists( 'wc_terms_and_conditions_checkbox_enabled' ) ) {
	return;
}

do_action( 'woocommerce_checkout_before_terms_and_conditions' );
?>
<div class="woocommerce-terms-and-conditions-wrapper">
	<?php do_action( 'woocommerce_checkout_terms_and_conditions' ); ?>
	<?php if ( wc_terms_and_conditions_checkbox_enabled() ) : ?>
		<div class="field checkout__terms">
			<label class="check">
				<?php // phpcs:ignore WordPress.Security.NonceVerification.Missing -- re-renders a posted choice. ?>
				<input type="checkbox" name="terms" id="terms" class="input-checkbox"<?php checked( apply_filters( 'woocommerce_terms_is_checked_default', isset( $_POST['terms'] ) ), true ); // phpcs:ignore WooCommerce.Commenting.CommentHooks ?>>
				<span>
					<?php esc_html_e( 'J’accepte les', 'safrozen' ); ?>
					<a class="link" href="<?php echo esc_url( get_permalink( wc_terms_and_conditions_page_id() ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'conditions générales de vente', 'safrozen' ); ?></a>.
				</span>
			</label>
			<input type="hidden" name="terms-field" value="1">
		</div>
	<?php endif; ?>
</div>
<?php
do_action( 'woocommerce_checkout_after_terms_and_conditions' );
