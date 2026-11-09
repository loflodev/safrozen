<?php
/**
 * Panier (Cart.tsx): the header counts the articles; the shortcode draws the
 * lines and the summary (woocommerce/cart/cart.php) or the empty state.
 */

defined( 'ABSPATH' ) || exit;

$count = safrozen_cart_count();

get_header();
?>
<main id="main" class="page cart">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php
		get_template_part(
			'template-parts/page-header',
			null,
			array(
				'title'  => __( 'Votre panier', 'safrozen' ),
				/* translators: %s: "3 articles" */
				'lede'   => $count ? sprintf( __( '%s, prêts à partir au froid.', 'safrozen' ), sprintf( _n( '%d article', '%d articles', $count, 'safrozen' ), $count ) ) : '',
				'crumbs' => array( array( __( 'Panier', 'safrozen' ) ) ),
			)
		);
		?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</main>
<?php
get_footer();
