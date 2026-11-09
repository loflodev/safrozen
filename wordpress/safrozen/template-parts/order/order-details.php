<?php
/**
 * One order in full (OrderDetails.tsx), for the account's order view and the
 * tracking page: key facts on a white strip, the progress, the addresses and
 * the summary.
 *
 * @var array $args { @type WC_Order $order }
 */

defined( 'ABSPATH' ) || exit;

$order    = $args['order'];
$step     = safrozen_order_step( $order );
$shipping = $order->get_formatted_shipping_address();
$billing  = $order->get_formatted_billing_address();
$method   = $order->get_shipping_method();
$pickup   = $order->has_shipping_method( 'local_pickup' ) || $order->has_shipping_method( 'pickup_location' );
$totals   = $order->get_order_item_totals();
$total    = $totals['order_total'] ?? null;
unset( $totals['payment_method'], $totals['order_total'] );
$id = (int) $order->get_id();
?>
<div class="order">
	<dl class="order__facts">
		<div>
			<dt><?php esc_html_e( 'Commande', 'safrozen' ); ?></dt>
			<dd><?php echo esc_html( sprintf( __( 'n° %s', 'safrozen' ), $order->get_order_number() ) ); ?></dd>
		</div>
		<div>
			<dt><?php esc_html_e( 'Date', 'safrozen' ); ?></dt>
			<dd><?php echo esc_html( safrozen_order_date( $order ) ); ?></dd>
		</div>
		<div>
			<dt><?php esc_html_e( 'Total', 'safrozen' ); ?></dt>
			<dd><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></dd>
		</div>
		<div>
			<dt><?php esc_html_e( 'Paiement', 'safrozen' ); ?></dt>
			<dd><?php echo esc_html( $order->get_payment_method_title() ?: '—' ); ?></dd>
		</div>
	</dl>

	<section class="panel order__progress" aria-labelledby="progress-<?php echo $id; // phpcs:ignore ?>">
		<div class="order__progress-head">
			<h2 class="panel__title" id="progress-<?php echo $id; // phpcs:ignore ?>">
				<?php
				if ( safrozen_order_delivered( $order ) && $order->get_date_completed() ) {
					/* translators: %s: date */
					echo esc_html( sprintf( __( 'Livrée le %s', 'safrozen' ), wc_format_datetime( $order->get_date_completed(), 'j F Y' ) ) );
				} elseif ( null === $step ) {
					esc_html_e( 'État de la commande', 'safrozen' );
				} else {
					esc_html_e( 'Où en est votre commande', 'safrozen' );
				}
				?>
			</h2>
			<?php echo null === $step ? safrozen_status_pill( $order ) : ''; // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
		<?php get_template_part( 'template-parts/order/status-timeline', null, array( 'order' => $order ) ); ?>
	</section>

	<div class="order__grid">
		<div class="order__addresses">
			<?php if ( $order->needs_shipping_address() || $shipping ) : ?>
				<section class="panel">
					<h2 class="panel__title"><?php echo esc_html( $pickup ? __( 'Cueillette', 'safrozen' ) : __( 'Livraison', 'safrozen' ) ); ?></h2>
					<?php if ( $shipping && ! $pickup ) : ?>
						<address class="address-block"><?php echo wp_kses_post( $shipping ); ?></address>
					<?php endif; ?>
					<?php if ( $method ) : ?>
						<p class="order__method"><?php echo esc_html( $method ); ?></p>
					<?php endif; ?>
					<?php if ( $order->get_customer_note() ) : ?>
						<p class="order__note"><?php echo esc_html( sprintf( __( 'Note : %s', 'safrozen' ), $order->get_customer_note() ) ); ?></p>
					<?php endif; ?>
				</section>
			<?php endif; ?>
			<section class="panel">
				<h2 class="panel__title"><?php esc_html_e( 'Facturation', 'safrozen' ); ?></h2>
				<?php if ( $billing ) : ?>
					<address class="address-block"><?php echo wp_kses_post( $billing ); ?></address>
				<?php endif; ?>
				<p class="order__method"><?php echo esc_html( $order->get_billing_email() ); ?></p>
			</section>
		</div>

		<section class="summary panel" aria-labelledby="summary-<?php echo $id; // phpcs:ignore ?>">
			<h2 class="panel__title" id="summary-<?php echo $id; // phpcs:ignore ?>"><?php esc_html_e( 'Articles', 'safrozen' ); ?></h2>
			<ul class="summary__lines">
				<?php foreach ( $order->get_items() as $item ) : ?>
					<li>
						<span><?php echo esc_html( $item->get_name() ); ?> <span class="summary__qty">× <?php echo (int) $item->get_quantity(); ?></span></span>
						<span><?php echo wp_kses_post( $order->get_formatted_line_subtotal( $item ) ); ?></span>
					</li>
				<?php endforeach; ?>
			</ul>
			<dl class="summary__totals">
				<?php foreach ( $totals as $key => $row ) : ?>
					<div<?php echo 'discount' === $key ? ' class="summary__discount"' : ''; ?>>
						<dt><?php echo esc_html( rtrim( wp_strip_all_tags( $row['label'] ), ' :' ) ); ?></dt>
						<dd><?php echo wp_kses_post( $row['value'] ); ?></dd>
					</div>
				<?php endforeach; ?>
				<?php if ( $total ) : ?>
					<div class="summary__total">
						<dt><?php esc_html_e( 'Total', 'safrozen' ); ?></dt>
						<dd class="price"><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></dd>
					</div>
				<?php endif; ?>
			</dl>
		</section>
	</div>
</div>
