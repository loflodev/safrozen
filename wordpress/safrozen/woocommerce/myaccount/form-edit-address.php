<?php
/**
 * Edit an address (AddressEdit.tsx): Woo's own fields for that address, drawn
 * as the theme's fields (safrozen_address_fields()).
 *
 * @var string $load_address 'billing', 'shipping' or '' for the list.
 * @var array  $address      Woo's fields for it, with their values.
 * @version 9.3.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_edit_account_address_form' );
?>
<?php if ( ! $load_address ) : ?>
	<?php wc_get_template( 'myaccount/my-address.php' ); ?>
<?php else : ?>
	<?php
	foreach ( $address as $key => $field ) {
		$address[ $key ]['value'] = wc_get_post_data_by_key( $key, $field['value'] );
	}
	?>
	<form method="post" class="panel account-form" novalidate data-validate aria-labelledby="address-title">
		<h2 class="panel__title" id="address-title" tabindex="-1"><?php echo esc_html( 'billing' === $load_address ? __( 'Adresse de facturation', 'safrozen' ) : __( 'Adresse de livraison', 'safrozen' ) ); ?></h2>
		<div data-error-summary></div>
		<?php do_action( "woocommerce_before_edit_address_form_{$load_address}" ); ?>
		<div class="form-grid form-grid--2">
			<?php echo safrozen_address_fields( $load_address, $address ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
		<?php do_action( "woocommerce_after_edit_address_form_{$load_address}" ); ?>
		<div class="account-form__actions">
			<button type="submit" class="btn-chip" name="save_address" value="<?php esc_attr_e( 'Enregistrer l’adresse', 'safrozen' ); ?>" data-busy="<?php esc_attr_e( 'Enregistrement…', 'safrozen' ); ?>">
				<?php esc_html_e( 'Enregistrer l’adresse', 'safrozen' ); ?>
			</button>
			<a class="btn-ghost" href="<?php echo esc_url( wc_get_account_endpoint_url( 'edit-address' ) ); ?>"><?php esc_html_e( 'Annuler', 'safrozen' ); ?></a>
		</div>
		<?php wp_nonce_field( 'woocommerce-edit_address', 'woocommerce-edit-address-nonce' ); ?>
		<input type="hidden" name="action" value="edit_address">
	</form>
<?php endif; ?>
<?php
do_action( 'woocommerce_after_edit_account_address_form' );
