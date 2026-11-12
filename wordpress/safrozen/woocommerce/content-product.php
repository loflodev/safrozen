<?php
/**
 * Shop grid card (ProductCard.tsx): field panel, name (the link covers the
 * card), spec line (the product's spec fields as written), price and a quick add (js/cart.ts adds it without leaving
 * the page; the link is the no-JS fallback). Out of stock says so.
 */

defined( 'ABSPATH' ) || exit;

global $product;
if ( ! $product instanceof WC_Product || ! $product->is_visible() ) {
	return;
}

$index = (int) wc_get_loop_prop( 'loop' );
wc_set_loop_prop( 'loop', $index + 1 );
$name = $product->get_name();
// The spec fields as written (weight, then whatever facts the shop puts there).
$meta = safrozen_hero_specs( $product->get_id() );
?>
<li style="--i: <?php echo (int) $index; ?>">
	<article class="product-card">
		<?php echo safrozen_product_art( $product, 'product-card__art product-art--lifted', $index < 3 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		<div class="product-card__body">
			<h3 class="product-card__name">
				<a href="<?php echo esc_url( $product->get_permalink() ); ?>"><?php echo esc_html( $name ); ?></a>
			</h3>
			<?php if ( $meta ) : ?>
				<p class="product-card__meta"><?php echo esc_html( implode( ' · ', $meta ) ); ?></p>
			<?php endif; ?>
			<div class="product-card__buy">
				<p class="price"><?php echo wc_price( wc_get_price_to_display( $product ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
				<?php if ( ! $product->is_in_stock() ) : ?>
					<p class="product-card__soldout"><?php esc_html_e( 'Bientôt de retour', 'safrozen' ); ?></p>
				<?php elseif ( $product->is_purchasable() ) : ?>
					<a
						class="product-card__add"
						href="<?php echo esc_url( $product->add_to_cart_url() ); ?>"
						rel="nofollow"
						data-add-to-cart="<?php echo (int) $product->get_id(); ?>"
						data-product-name="<?php echo esc_attr( $name ); ?>"
						aria-label="<?php echo esc_attr( sprintf( /* translators: %s: product name */ __( 'Ajouter %s au panier', 'safrozen' ), $name ) ); ?>"
					><?php echo safrozen_icon( 'plus' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				<?php endif; ?>
			</div>
		</div>
	</article>
</li>
