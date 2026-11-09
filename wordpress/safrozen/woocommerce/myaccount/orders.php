<?php
/**
 * Commandes (Orders.tsx): a table from 700px, a card per order below; rows
 * are set apart by space, not rules.
 *
 * @var bool     $has_orders
 * @var stdClass $customer_orders { @type WC_Order[]|int[] $orders, @type int $max_num_pages }
 * @var int      $current_page
 * @version 9.5.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_account_orders', $has_orders );
?>
<?php if ( $has_orders ) : ?>
	<div class="panel orders">
		<table class="orders__table">
			<thead>
				<tr>
					<th scope="col"><?php esc_html_e( 'Commande', 'safrozen' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Date', 'safrozen' ); ?></th>
					<th scope="col"><?php esc_html_e( 'État', 'safrozen' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Total', 'safrozen' ); ?></th>
					<th scope="col"><span class="visually-hidden"><?php esc_html_e( 'Actions', 'safrozen' ); ?></span></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $customer_orders->orders as $customer_order ) : ?>
					<?php
					$order = wc_get_order( $customer_order ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
					$count = $order->get_item_count() - $order->get_item_count_refunded();
					?>
					<tr>
						<th scope="row" data-label="<?php esc_attr_e( 'Commande', 'safrozen' ); ?>"><?php echo esc_html( sprintf( __( 'n° %s', 'safrozen' ), $order->get_order_number() ) ); ?></th>
						<td data-label="<?php esc_attr_e( 'Date', 'safrozen' ); ?>"><time datetime="<?php echo esc_attr( $order->get_date_created()?->date( 'c' ) ?? '' ); ?>"><?php echo esc_html( safrozen_order_date( $order ) ); ?></time></td>
						<td data-label="<?php esc_attr_e( 'État', 'safrozen' ); ?>"><?php echo safrozen_status_pill( $order ); // phpcs:ignore WordPress.Security.EscapeOutput ?></td>
						<td data-label="<?php esc_attr_e( 'Total', 'safrozen' ); ?>">
							<?php echo wp_kses_post( $order->get_formatted_order_total() ); ?>
							<span class="orders__count">
								<?php
								/* translators: %d: number of items */
								echo esc_html( sprintf( _n( '%d article', '%d articles', $count, 'safrozen' ), $count ) );
								?>
							</span>
						</td>
						<td>
							<a class="btn-ghost orders__view" href="<?php echo esc_url( $order->get_view_order_url() ); ?>">
								<?php esc_html_e( 'Voir', 'safrozen' ); ?>
								<span class="visually-hidden"><?php echo esc_html( sprintf( __( 'la commande n° %s', 'safrozen' ), $order->get_order_number() ) ); ?></span>
							</a>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>

	<?php do_action( 'woocommerce_before_account_orders_pagination' ); ?>
	<?php if ( 1 < $customer_orders->max_num_pages ) : ?>
		<div class="order-view__actions">
			<?php if ( 1 !== $current_page ) : ?>
				<a class="btn-ghost" href="<?php echo esc_url( wc_get_endpoint_url( 'orders', $current_page - 1 ) ); ?>"><?php esc_html_e( 'Plus récentes', 'safrozen' ); ?></a>
			<?php endif; ?>
			<?php if ( intval( $customer_orders->max_num_pages ) !== $current_page ) : ?>
				<a class="btn-ghost" href="<?php echo esc_url( wc_get_endpoint_url( 'orders', $current_page + 1 ) ); ?>"><?php esc_html_e( 'Plus anciennes', 'safrozen' ); ?></a>
			<?php endif; ?>
		</div>
	<?php endif; ?>
<?php else : ?>
	<section class="panel dash__latest">
		<h2 class="panel__title"><?php esc_html_e( 'Pas encore de commande', 'safrozen' ); ?></h2>
		<a class="btn-chip" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">
			<?php esc_html_e( 'Découvrir nos legims', 'safrozen' ); ?>
			<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</a>
	</section>
<?php endif; ?>
<?php
do_action( 'woocommerce_after_account_orders', $has_orders );
