<?php
/**
 * Commande reçue (Confirmation.tsx): the header says thank you
 * (safrozen_checkout_header()); then a success line, the payment method's
 * instructions (Interac, payment on delivery), the order in full
 * (template-parts/order/order-details.php), the next steps, and for a guest
 * the invitation to create an account.
 *
 * Overrides woocommerce/templates/checkout/thankyou.php 11.2.0; the hooks are WooCommerce's.
 *
 * @var WC_Order|false $order
 * @version 11.2.0
 */

defined( 'ABSPATH' ) || exit;

$track = get_page_by_path( 'suivi' );
?>
<div class="woocommerce-order">
	<?php if ( ! $order ) : ?>
		<a class="btn-chip" href="<?php echo esc_url( $track ? get_permalink( $track ) : home_url( '/' ) ); ?>">
			<?php esc_html_e( 'Suivre une commande', 'safrozen' ); ?>
			<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</a>
	<?php else : ?>
		<?php do_action( 'woocommerce_before_thankyou', $order->get_id() ); ?>

		<?php if ( $order->has_status( 'failed' ) ) : ?>
			<div class="notice notice--error" role="alert">
				<p><?php echo wp_kses_post( apply_filters( 'woocommerce_thankyou_order_failed_text', __( 'Le paiement a été refusé par la banque. Votre commande est gardée : vous pouvez réessayer.', 'safrozen' ), $order ) ); // phpcs:ignore WooCommerce.Commenting.CommentHooks ?></p>
			</div>
			<div class="confirmation__actions">
				<a class="btn-chip" href="<?php echo esc_url( $order->get_checkout_payment_url() ); ?>">
					<?php esc_html_e( 'Réessayer le paiement', 'safrozen' ); ?>
					<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</a>
			</div>
		<?php else : ?>
			<p class="notice notice--success confirmation__notice" role="status">
				<span class="confirmation__check" aria-hidden="true"><?php echo safrozen_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
				<?php esc_html_e( 'Commande reçue. Nous la préparons au froid.', 'safrozen' ); ?>
			</p>

			<?php
			// The method's own lines (Interac instructions, payment at the door).
			ob_start();
			do_action( 'woocommerce_thankyou_' . $order->get_payment_method(), $order->get_id() );
			$instructions = trim( (string) ob_get_clean() );
			?>
			<?php if ( $instructions ) : ?>
				<section class="panel tint confirmation__pay" aria-labelledby="pay-title">
					<h2 class="panel__title" id="pay-title"><?php echo esc_html( $order->get_payment_method_title() ); ?></h2>
					<?php echo wp_kses_post( $instructions ); ?>
				</section>
			<?php endif; ?>

			<?php get_template_part( 'template-parts/order/order-details', null, array( 'order' => $order ) ); ?>

			<div class="confirmation__actions">
				<?php if ( $track ) : ?>
					<a class="btn-chip" href="<?php echo esc_url( add_query_arg( array( 'commande' => $order->get_order_number(), 'email' => rawurlencode( $order->get_billing_email() ) ), get_permalink( $track ) ) ); ?>">
						<?php esc_html_e( 'Suivre ma commande', 'safrozen' ); ?>
						<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					</a>
				<?php endif; ?>
				<a class="btn-ghost" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Continuer mes achats', 'safrozen' ); ?></a>
			</div>

			<?php if ( ! is_user_logged_in() && 'yes' === get_option( 'woocommerce_enable_myaccount_registration' ) ) : ?>
				<section class="panel tint confirmation__account" aria-labelledby="account-cta">
					<h2 class="panel__title" id="account-cta"><?php esc_html_e( 'Gagnez du temps la prochaine fois', 'safrozen' ); ?></h2>
					<?php /* translators: %s: e-mail */ ?>
					<p><?php echo esc_html( sprintf( __( 'Créez un compte avec %s pour retrouver vos adresses et suivre toutes vos commandes.', 'safrozen' ), $order->get_billing_email() ) ); ?></p>
					<a class="btn-ghost" href="<?php echo esc_url( add_query_arg( 'email', rawurlencode( $order->get_billing_email() ), wc_get_page_permalink( 'myaccount' ) ) . '#inscription' ); ?>"><?php esc_html_e( 'Créer mon compte', 'safrozen' ); ?></a>
				</section>
			<?php endif; ?>
		<?php endif; ?>

		<?php do_action( 'woocommerce_thankyou', $order->get_id() ); ?>
	<?php endif; ?>
</div>
