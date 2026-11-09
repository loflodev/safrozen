<?php
/**
 * One order (OrderView.tsx): the shared order details, then the way back and,
 * once delivered, "Commander à nouveau".
 *
 * @var WC_Order $order
 * @var int      $order_id
 * @version 10.6.0
 */

defined( 'ABSPATH' ) || exit;

get_template_part( 'template-parts/order/order-details', null, array( 'order' => $order ) );
?>
<div class="order-view__actions">
	<a class="btn-ghost" href="<?php echo esc_url( wc_get_account_endpoint_url( 'orders' ) ); ?>"><?php esc_html_e( 'Toutes mes commandes', 'safrozen' ); ?></a>
	<?php if ( $order->has_status( apply_filters( 'woocommerce_valid_order_statuses_for_order_again', array( 'completed' ) ) ) ) : ?>
		<a class="btn-chip" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'order_again', $order->get_id(), wc_get_cart_url() ), 'woocommerce-order_again' ) ); ?>">
			<?php esc_html_e( 'Commander à nouveau', 'safrozen' ); ?>
			<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</a>
	<?php endif; ?>
</div>
<?php
do_action( 'woocommerce_view_order', $order_id );
