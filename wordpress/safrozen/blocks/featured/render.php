<?php
/**
 * Featured (CLAUDE.md §11): best sellers as split rows, each its product's
 * field panel with the box beside the copy. Name, sentence (the product's
 * short description), specs and price all come from the WooCommerce product.
 * The products are the last two starred ★ in Produits (inc/featured.php);
 * with none starred, the block's "Produits" field.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'wc_get_product' ) ) {
	return;
}

$starred  = safrozen_home_featured_ids();
$products = array_filter(
	$starred
		? array_map( 'wc_get_product', $starred )
		: array_map( fn( $p ) => $p instanceof WP_Post ? wc_get_product( $p ) : null, (array) safrozen_field( 'products', false, array() ) )
);
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'produits' ) ); ?>" class="section featured" data-reveal-on aria-labelledby="featured-title">
	<div class="section__head">
		<h2 class="section__title featured__title" id="featured-title"><?php echo esc_html( safrozen_field( 'title' ) ); ?></h2>
	</div>

	<ul class="featured__list">
		<?php
		foreach ( array_values( $products ) as $i => $product ) :
			$id   = $product->get_id();
			$name = $product->get_name();
			?>
			<li class="featured__row" data-reveal-on style="--i: <?php echo (int) $i; ?>">
				<?php // The frame carries the white stroke and the lift; the panel inside it clips for the circle entrance. ?>
				<div class="featured__frame">
					<div class="featured__panel" style="<?php echo esc_attr( safrozen_field_style( safrozen_product_look( $id ) ) ); ?>">
						<div class="featured__texture" aria-hidden="true"></div>
						<?php // A pack photo is shown whole; a box is cropped 4:3 from its 2:1 canvas. ?>
						<div class="featured__pic featured__pic--<?php echo esc_attr( safrozen_product_look( $id )['kind'] ); ?>">
							<?php
							echo wp_get_attachment_image(
								$product->get_image_id(),
								'full',
								false,
								array(
									/* translators: %s: product name */
									'alt'      => sprintf( __( 'La boîte %s', 'safrozen' ), $name ),
									'sizes'    => '(min-width: 900px) 55vw, 100vw',
									'loading'  => 'lazy',
									'decoding' => 'async',
								)
							);
							?>
						</div>
					</div>
				</div>
				<div class="featured__copy">
					<h3 class="featured__line featured__name" style="--j: 0">
						<a class="featured__link" href="<?php echo esc_url( $product->get_permalink() ); ?>"><?php echo esc_html( $name ); ?></a>
					</h3>
					<p class="featured__line featured__text" style="--j: 1"><?php echo esc_html( wp_strip_all_tags( $product->get_short_description() ) ); ?></p>
					<?php $specs = safrozen_product_specs( $id ); ?>
					<?php if ( $specs ) : ?>
						<dl class="featured__line featured__specs" style="--j: 2">
							<?php foreach ( $specs as $label => $value ) : ?>
								<div>
									<dt><?php echo esc_html( $label ); ?></dt>
									<dd><?php echo esc_html( $value ); ?></dd>
								</div>
							<?php endforeach; ?>
						</dl>
					<?php endif; ?>
					<div class="featured__line featured__buy" style="--j: 3">
						<p class="featured__price"><?php echo wp_kses_post( wc_price( wc_get_price_to_display( $product ) ) ); ?></p>
						<?php if ( $product->is_purchasable() && $product->is_in_stock() ) : ?>
							<?php // Adds without leaving the page (js/cart.ts); without JS, WooCommerce's own add-to-cart URL. ?>
							<a class="btn-chip" href="<?php echo esc_url( $product->add_to_cart_url() ); ?>" rel="nofollow" data-add-to-cart="<?php echo (int) $id; ?>" data-product-name="<?php echo esc_attr( $name ); ?>">
								<?php esc_html_e( 'Ajouter au panier', 'safrozen' ); ?>
								<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore ?>
							</a>
						<?php else : ?>
							<a class="btn-ghost" href="<?php echo esc_url( $product->get_permalink() ); ?>"><?php esc_html_e( 'Épuisé', 'safrozen' ); ?></a>
						<?php endif; ?>
					</div>
				</div>
			</li>
		<?php endforeach; ?>
	</ul>
</section>
