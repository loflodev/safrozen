<?php
/**
 * Order tracking result: the form stays on top (to look up another order),
 * then the order in full and the shop's notes to the customer.
 *
 * @var WC_Order $order
 * @version 10.6.0
 */

defined( 'ABSPATH' ) || exit;

$notes = $order->get_customer_order_notes();

wc_get_template( 'order/form-tracking.php' );
?>
<div class="track__result" aria-live="polite">
	<h2 class="visually-hidden">
		<?php
		/* translators: %s: order number */
		echo esc_html( sprintf( __( 'Commande n° %s', 'safrozen' ), $order->get_order_number() ) );
		?>
	</h2>
	<?php get_template_part( 'template-parts/order/order-details', null, array( 'order' => $order ) ); ?>

	<?php if ( $notes ) : ?>
		<section class="panel track__notes" aria-labelledby="track-notes-title">
			<h2 class="panel__title" id="track-notes-title"><?php esc_html_e( 'Messages de la boutique', 'safrozen' ); ?></h2>
			<ol>
				<?php foreach ( $notes as $note ) : ?>
					<li>
						<p class="dash__meta"><?php echo esc_html( date_i18n( 'j F Y, G \h i', strtotime( $note->comment_date ) ) ); ?></p>
						<?php echo wp_kses_post( wpautop( wptexturize( $note->comment_content ) ) ); ?>
					</li>
				<?php endforeach; ?>
			</ol>
		</section>
	<?php endif; ?>
</div>
<?php
do_action( 'woocommerce_view_order', $order->get_id() );
