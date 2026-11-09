<?php
/**
 * Order tracking form (Track.tsx): order number and e-mail on one row from
 * 900px. Links from the confirmation prefill it (?commande=&email=).
 *
 * @version 7.0.1
 */

defined( 'ABSPATH' ) || exit;

global $post;

// phpcs:disable WordPress.Security.NonceVerification -- prefill only; Woo checks the nonce on submit.
$prefill = function ( string $posted, string $linked ): string {
	$value = $_REQUEST[ $posted ] ?? $_GET[ $linked ] ?? '';
	return is_string( $value ) ? sanitize_text_field( wp_unslash( $value ) ) : '';
};
// phpcs:enable
?>
<form action="<?php echo esc_url( get_permalink( $post->ID ) ); ?>" method="post" class="panel track__form woocommerce-form woocommerce-form-track-order track_order" novalidate data-validate>
	<?php do_action( 'woocommerce_order_tracking_form_start' ); ?>
	<div data-error-summary></div>
	<div class="track__fields">
		<?php
		// phpcs:disable WordPress.Security.EscapeOutput
		echo safrozen_form_field(
			array(
				'id'           => 'orderid',
				'label'        => __( 'Numéro de commande', 'safrozen' ),
				'value'        => $prefill( 'orderid', 'commande' ),
				'inputmode'    => 'numeric',
				'autocomplete' => 'off',
				'help'         => __( 'Par exemple 1041', 'safrozen' ),
				'message'      => __( 'Saisissez le numéro de commande, par exemple 1041.', 'safrozen' ),
			)
		);
		echo safrozen_form_field(
			array(
				'id'           => 'order_email',
				'label'        => __( 'Adresse e-mail', 'safrozen' ),
				'type'         => 'email',
				'value'        => $prefill( 'order_email', 'email' ),
				'inputmode'    => 'email',
				'autocomplete' => 'email',
				'rule'         => 'email',
			)
		);
		// phpcs:enable
		?>
		<?php do_action( 'woocommerce_order_tracking_form' ); ?>
		<button type="submit" class="btn-chip track__submit" name="track" value="<?php esc_attr_e( 'Suivre', 'safrozen' ); ?>">
			<?php esc_html_e( 'Suivre', 'safrozen' ); ?>
			<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</button>
	</div>
	<?php wp_nonce_field( 'woocommerce-order_tracking', 'woocommerce-order-tracking-nonce' ); ?>
	<?php do_action( 'woocommerce_order_tracking_form_end' ); ?>
</form>
