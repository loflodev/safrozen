<?php
/**
 * Empty cart (Cart.tsx's EmptyState). A line just removed comes back through
 * WooCommerce's notice above ("Annuler ?").
 *
 * Overrides woocommerce/templates/cart/cart-empty.php 7.0.1.
 *
 * @version 7.0.1
 */

defined( 'ABSPATH' ) || exit;

woocommerce_output_all_notices();
?>
<div class="empty panel">
	<div class="veg-texture" aria-hidden="true"></div>
	<h2 class="panel__title"><?php esc_html_e( 'Votre panier est vide', 'safrozen' ); ?></h2>
	<div class="empty__text">
		<p><?php esc_html_e( 'Nos produits sont prêts en 20 minutes. Commencez par le lalo, notre plus demandé.', 'safrozen' ); ?></p>
	</div>
	<div class="empty__action">
		<a class="btn-chip" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">
			<?php esc_html_e( 'Voir la boutique', 'safrozen' ); ?>
			<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</a>
	</div>
</div>
