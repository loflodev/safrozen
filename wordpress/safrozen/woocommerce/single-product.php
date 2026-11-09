<?php
/**
 * Single product (Product.tsx): the art on its field panel left, the buy box
 * right (7:5 from 900px), the details as disclosures, then related products.
 * The add form is WooCommerce's own post (?add-to-cart); js/cart.ts sends it
 * through the Store API instead, with the toast, and js/product.ts drives the
 * stepper and the phones' sticky add bar.
 *
 * Overrides woocommerce/templates/single-product.php 1.6.4.
 *
 * @version 1.6.4
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	global $product;
	if ( ! $product instanceof WC_Product ) {
		$product = wc_get_product( get_the_ID() );
	}
	$id        = $product->get_id();
	$name      = $product->get_name();
	$shop_url  = wc_get_page_permalink( 'shop' );
	$terms     = get_the_terms( $id, 'product_cat' );
	$category  = is_array( $terms ) ? array_values( array_filter( $terms, fn( $t ) => (int) get_option( 'default_product_cat' ) !== $t->term_id ) )[0] ?? null : null;
	$specs     = safrozen_hero_specs( $id );
	$contents  = safrozen_lines( (string) safrozen_field( 'contents', $id ) );
	$steps     = safrozen_lines( (string) safrozen_field( 'preparation', $id ) );
	$allergens = safrozen_list_lines( (string) safrozen_field( 'allergens', $id ) );
	$rating    = safrozen_rating_summary();
	$free_from = safrozen_free_from();
	$delivery  = get_page_by_path( 'livraison' );
	$simple    = $product->is_type( 'simple' );
	$sold_out  = ! $product->is_in_stock();
	$can_buy   = $simple && $product->is_purchasable() && ! $sold_out;
	$max       = $product->get_max_purchase_quantity();
	$max       = $max > 0 ? min( $max, SAFROZEN_MAX_QTY ) : SAFROZEN_MAX_QTY;
	$stock     = $product->managing_stock() ? (int) $product->get_stock_quantity() : null;
	$in_cart   = 0;
	foreach ( WC()->cart ? WC()->cart->get_cart() : array() as $item ) {
		$in_cart += (int) $item['product_id'] === $id ? (int) $item['quantity'] : 0;
	}
	// The short description as written in Woo, without the inline styles pasted with it.
	$short = wp_kses(
		(string) $product->get_short_description(),
		array( 'p' => array(), 'ul' => array(), 'ol' => array(), 'li' => array(), 'strong' => array(), 'em' => array(), 'br' => array(), 'span' => array() )
	);
	$related = array_filter( array_map( 'wc_get_product', wc_get_related_products( $id, 3 ) ) );
	if ( ! $related ) {
		$related = wc_get_products( array( 'limit' => 3, 'exclude' => array( $id ), 'status' => 'publish', 'visibility' => 'catalog' ) );
	}
	$crumbs = array( array( __( 'Boutique', 'safrozen' ), $shop_url ) );
	if ( $category ) {
		$crumbs[] = array( $category->name, get_term_link( $category ) );
	}
	$crumbs[] = array( $name );
	?>
<main id="main" class="page product">
	<?php woocommerce_output_all_notices(); ?>
	<div class="product__top">
		<?php // Its own grid item: above the art under 900px, atop the buy column from 900px. ?>
		<?php echo safrozen_crumbs( $crumbs, 'product__crumbs' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		<div class="product__media">
			<?php echo safrozen_product_art( $product, 'product__art', true ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>

		<div class="product__info">
			<header class="page-header">
				<div class="section__head page-header__head">
					<h1 class="section__title"><?php echo esc_html( $name ); ?></h1>
				</div>
			</header>
			<?php if ( $short ) : ?>
				<div class="product__short"><?php echo $short; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
			<?php endif; ?>

			<p class="price product__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></p>

			<?php if ( $rating ) : ?>
				<a class="product__rating" href="<?php echo esc_url( home_url( '/#avis' ) ); ?>">
					<span class="product__stars" aria-hidden="true"><?php echo str_repeat( safrozen_icon( 'star' ), 5 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<?php echo esc_html( trim( $rating[0] . ' / 5 · ' . $rating[1], ' ·' ) ); ?>
				</a>
			<?php endif; ?>

			<?php if ( $specs ) : ?>
				<?php // The spec fields as written (the shop puts weight and nutrition facts there). ?>
				<ul class="product__specs" aria-label="<?php esc_attr_e( 'En bref', 'safrozen' ); ?>">
					<?php foreach ( $specs as $spec ) : ?>
						<li><?php echo esc_html( $spec ); ?></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>

			<?php if ( $contents ) : ?>
				<div class="product__contents">
					<h2 class="product__subhead"><?php esc_html_e( 'Dans le pack', 'safrozen' ); ?></h2>
					<ul>
						<?php foreach ( $contents as $line ) : ?>
							<li><?php echo esc_html( $line ); ?></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endif; ?>

			<?php if ( $sold_out ) : ?>
				<p class="notice product__buy"><?php esc_html_e( 'Bientôt de retour. Cette boîte est en rupture de stock pour l’instant.', 'safrozen' ); ?></p>
			<?php elseif ( $can_buy ) : ?>
				<form class="product__buy" method="post" action="<?php echo esc_url( $product->get_permalink() ); ?>" data-add-form="<?php echo (int) $id; ?>" data-product-name="<?php echo esc_attr( $name ); ?>">
					<div class="stepper">
						<button type="button" class="stepper__btn" data-step="-1" disabled aria-label="<?php echo esc_attr( sprintf( /* translators: %s: product */ __( 'Retirer un, %s', 'safrozen' ), $name ) ); ?>"><?php echo safrozen_icon( 'minus' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
						<label class="visually-hidden" for="qty"><?php echo esc_html( sprintf( /* translators: %s: product */ __( 'Quantité, %s', 'safrozen' ), $name ) ); ?></label>
						<input id="qty" class="stepper__input" type="number" name="quantity" inputmode="numeric" min="1" max="<?php echo (int) $max; ?>" value="1">
						<button type="button" class="stepper__btn" data-step="1"<?php disabled( $max <= 1 ); ?> aria-label="<?php echo esc_attr( sprintf( /* translators: %s: product */ __( 'Ajouter un, %s', 'safrozen' ), $name ) ); ?>"><?php echo safrozen_icon( 'plus' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
					</div>
					<button type="submit" class="btn-chip product__add" name="add-to-cart" value="<?php echo (int) $id; ?>">
						<?php esc_html_e( 'Ajouter au panier', 'safrozen' ); ?>
						<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					</button>
				</form>
			<?php else : ?>
				<?php // Variable and other product types keep WooCommerce's own form. ?>
				<div class="product__buy"><?php woocommerce_template_single_add_to_cart(); ?></div>
			<?php endif; ?>

			<p class="product__stock" data-in-cart="<?php echo (int) $in_cart; ?>">
				<?php
				if ( ! $sold_out && null !== $stock ) {
					/* translators: %d: units left */
					echo esc_html( $stock < 10 ? sprintf( __( 'Plus que %d en stock.', 'safrozen' ), $stock ) : __( 'En stock.', 'safrozen' ) ) . ' ';
				} elseif ( ! $sold_out ) {
					echo esc_html__( 'En stock.', 'safrozen' ) . ' ';
				}
				?>
				<span class="product__in-cart"<?php echo $in_cart ? '' : ' hidden'; ?>>
					<?php /* translators: %d: quantity in the cart */ ?>
					<span data-in-cart-label><?php echo esc_html( sprintf( __( '%d dans votre panier', 'safrozen' ), $in_cart ) ); ?></span> ·
					<a class="link" href="<?php echo esc_url( wc_get_cart_url() ); ?>"><?php esc_html_e( 'Voir le panier', 'safrozen' ); ?></a>
				</span>
			</p>

			<p class="product__delivery tint">
				<?php echo safrozen_icon( 'truck' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<span>
					<?php
					echo esc_html(
						$free_from
							/* translators: %s: amount */
							? sprintf( __( 'Livraison offerte dès %s dans le Grand Montréal.', 'safrozen' ), wp_strip_all_tags( wc_price( $free_from, array( 'decimals' => 0 ) ) ) )
							: __( 'Livraison au froid dans le Grand Montréal.', 'safrozen' )
					);
					?>
					<?php if ( $delivery ) : ?>
						<a class="link" href="<?php echo esc_url( get_permalink( $delivery ) ); ?>"><?php esc_html_e( 'Délais et zones', 'safrozen' ); ?></a>
					<?php endif; ?>
				</span>
			</p>
		</div>
	</div>

	<section class="product__details" aria-label="<?php esc_attr_e( 'Détails du produit', 'safrozen' ); ?>">
		<?php if ( get_the_content() ) : ?>
			<details open>
				<summary><?php esc_html_e( 'Description', 'safrozen' ); ?></summary>
				<div class="product__text"><?php the_content(); ?></div>
			</details>
		<?php endif; ?>
		<?php if ( safrozen_field( 'ingredients', $id ) ) : ?>
			<details>
				<summary><?php esc_html_e( 'Ingrédients', 'safrozen' ); ?></summary>
				<p><?php echo esc_html( safrozen_field( 'ingredients', $id ) ); ?></p>
			</details>
		<?php endif; ?>
		<?php if ( $steps ) : ?>
			<details>
				<summary><?php esc_html_e( 'Préparation', 'safrozen' ); ?></summary>
				<ol>
					<?php foreach ( $steps as $step ) : ?>
						<li><?php echo esc_html( $step ); ?></li>
					<?php endforeach; ?>
				</ol>
			</details>
		<?php endif; ?>
		<details>
			<summary><?php esc_html_e( 'Allergènes et conservation', 'safrozen' ); ?></summary>
			<div class="product__text">
				<?php if ( $allergens ) : ?>
					<ul>
						<?php foreach ( $allergens as $line ) : ?>
							<li><?php echo esc_html( $line ); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
				<p><?php esc_html_e( 'Se garde 3 mois au congélateur, à −18 °C. Ne pas recongeler après décongélation.', 'safrozen' ); ?></p>
			</div>
		</details>
	</section>

	<?php if ( $related ) : ?>
		<section class="product__related" aria-labelledby="related-title">
			<div class="section__head">
				<h2 class="section__title" id="related-title"><?php esc_html_e( 'Vous aimerez aussi', 'safrozen' ); ?></h2>
			</div>
			<ul class="product-grid">
				<?php
				wc_set_loop_prop( 'loop', 0 );
				foreach ( $related as $item ) {
					$post_object = get_post( $item->get_id() );
					setup_postdata( $GLOBALS['post'] = $post_object ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride
					$GLOBALS['product'] = $item; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
					wc_get_template_part( 'content', 'product' );
				}
				wp_reset_postdata();
				$GLOBALS['product'] = $product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
				?>
			</ul>
		</section>
	<?php endif; ?>

	<?php if ( $can_buy ) : ?>
		<div class="product__bar" data-show="false" aria-hidden="true">
			<span class="product__bar-name"><?php echo esc_html( $name ); ?></span>
			<span class="price" data-unit="<?php echo esc_attr( (string) wc_get_price_to_display( $product ) ); ?>"><?php echo wp_kses_post( wc_price( wc_get_price_to_display( $product ) ) ); ?></span>
			<button type="button" class="btn-chip" data-bar-add tabindex="-1"><?php esc_html_e( 'Ajouter', 'safrozen' ); ?></button>
		</div>
	<?php endif; ?>
</main>
	<?php
endwhile;

get_footer();
