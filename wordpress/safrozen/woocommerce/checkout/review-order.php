<?php
/**
 * The checkout summary's lines and totals (OrderSummary.tsx). WooCommerce's
 * checkout.js swaps this block (its class is the key) whenever the totals change.
 *
 * Overrides woocommerce/templates/checkout/review-order.php 11.2.0.
 *
 * @version 11.2.0
 */

defined( 'ABSPATH' ) || exit;

$cart = WC()->cart;
?>
<div class="woocommerce-checkout-review-order-table summary__body">
	<?php do_action( 'woocommerce_review_order_before_cart_contents' ); ?>
	<ul class="summary__lines">
		<?php
		foreach ( $cart->get_cart() as $key => $item ) :
			$product = apply_filters( 'woocommerce_cart_item_product', $item['data'], $item, $key );
			if ( ! $product || ! $product->exists() || $item['quantity'] <= 0 || ! apply_filters( 'woocommerce_checkout_cart_item_visible', true, $item, $key ) ) {
				continue;
			}
			?>
			<li>
				<span><?php echo esc_html( $product->get_name() ); ?> <span class="summary__qty">× <?php echo (int) $item['quantity']; ?></span></span>
				<span><?php echo wp_kses_post( $cart->get_product_subtotal( $product, $item['quantity'] ) ); ?></span>
			</li>
		<?php endforeach; ?>
	</ul>
	<?php do_action( 'woocommerce_review_order_after_cart_contents' ); ?>
	<dl class="summary__totals">
		<?php foreach ( safrozen_summary_rows( true ) as [ $label, $value, $modifier, $code ] ) : ?>
			<div<?php echo $modifier ? ' class="summary__' . esc_attr( $modifier ) . '"' : ''; ?>>
				<dt>
					<?php echo esc_html( $label ); ?>
					<?php if ( $code ) : ?>
						<button type="button" class="summary__remove" data-remove-coupon="<?php echo esc_attr( $code ); ?>"><?php esc_html_e( 'Retirer', 'safrozen' ); ?><span class="visually-hidden"> <?php echo esc_html( $label ); ?></span></button>
					<?php endif; ?>
				</dt>
				<dd><?php echo wp_kses_post( $value ); ?></dd>
			</div>
		<?php endforeach; ?>
		<?php do_action( 'woocommerce_review_order_before_order_total' ); ?>
		<div class="summary__total">
			<dt><?php esc_html_e( 'Total', 'safrozen' ); ?></dt>
			<dd class="price"><?php echo wp_kses_post( $cart->get_total() ); ?></dd>
		</div>
		<?php do_action( 'woocommerce_review_order_after_order_total' ); ?>
	</dl>
</div>
