<?php
/**
 * Adresses (Addresses.tsx): billing and shipping side by side, each with its
 * "Modifier" (or "Ajouter") button.
 *
 * @version 9.3.0
 */

defined( 'ABSPATH' ) || exit;

$customer_id = get_current_user_id();
$types       = ! wc_ship_to_billing_address_only() && wc_shipping_enabled()
	? array( 'billing' => __( 'Facturation', 'safrozen' ), 'shipping' => __( 'Livraison', 'safrozen' ) )
	: array( 'billing' => __( 'Facturation', 'safrozen' ) );
$types = apply_filters( 'woocommerce_my_account_get_addresses', $types, $customer_id );
?>
<div class="addresses">
	<p class="dash__hello"><?php esc_html_e( 'Ces adresses sont proposées par défaut à la commande.', 'safrozen' ); ?></p>
	<div class="addresses__grid">
		<?php foreach ( $types as $name => $title ) : ?>
			<?php $address = wc_get_account_formatted_address( $name ); ?>
			<section class="panel addresses__card" aria-labelledby="address-<?php echo esc_attr( $name ); ?>">
				<h2 class="panel__title" id="address-<?php echo esc_attr( $name ); ?>"><?php echo esc_html( $title ); ?></h2>
				<?php if ( $address ) : ?>
					<address class="address-block"><?php echo wp_kses_post( $address ); ?></address>
				<?php else : ?>
					<p class="field__help"><?php esc_html_e( 'Pas encore d’adresse.', 'safrozen' ); ?></p>
				<?php endif; ?>
				<?php do_action( 'woocommerce_my_account_after_my_address', $name ); ?>
				<a class="btn-ghost" href="<?php echo esc_url( wc_get_endpoint_url( 'edit-address', $name ) ); ?>">
					<?php echo esc_html( $address ? __( 'Modifier', 'safrozen' ) : __( 'Ajouter', 'safrozen' ) ); ?>
					<span class="visually-hidden"><?php echo esc_html( mb_strtolower( sprintf( __( 'l’adresse de %s', 'safrozen' ), $title ) ) ); ?></span>
				</a>
			</section>
		<?php endforeach; ?>
	</div>
</div>
