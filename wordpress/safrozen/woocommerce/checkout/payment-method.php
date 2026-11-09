<?php
/**
 * One payment method as a radio card (ChoiceCard.tsx). A method with its own
 * fields (Square's card form) opens them in its box under the card.
 *
 * Overrides woocommerce/templates/checkout/payment-method.php 3.5.0.
 *
 * @var WC_Payment_Gateway $gateway
 * @version 3.5.0
 */

defined( 'ABSPATH' ) || exit;

$input = 'payment_method_' . $gateway->id;
?>
<li class="wc_payment_method payment_method_<?php echo esc_attr( $gateway->id ); ?>">
	<label class="choice" for="<?php echo esc_attr( $input ); ?>">
		<input id="<?php echo esc_attr( $input ); ?>" type="radio" class="input-radio" name="payment_method" value="<?php echo esc_attr( $gateway->id ); ?>" <?php checked( $gateway->chosen, true ); ?> data-order_button_text="<?php echo esc_attr( $gateway->order_button_text ); ?>">
		<span class="choice__text">
			<span class="choice__label"><?php echo esc_html( wp_strip_all_tags( $gateway->get_title() ) ); ?></span>
			<?php if ( ! $gateway->has_fields() && $gateway->get_description() ) : ?>
				<span class="choice__detail"><?php echo esc_html( wp_strip_all_tags( $gateway->get_description() ) ); ?></span>
			<?php endif; ?>
		</span>
	</label>
	<?php if ( $gateway->has_fields() ) : ?>
		<div class="payment_box payment_method_<?php echo esc_attr( $gateway->id ); ?> checkout__box"<?php echo $gateway->chosen ? '' : ' style="display:none;"'; ?>>
			<?php $gateway->payment_fields(); ?>
		</div>
	<?php endif; ?>
</li>
