<?php
/**
 * Suivi de commande (Track.tsx): WooCommerce's order tracking shortcode, with
 * the form and the result drawn by woocommerce/order/form-tracking.php and
 * tracking.php. Links from the confirmation prefill it (?commande=&email=).
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="main" class="page track">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php
		get_template_part(
			'template-parts/page-header',
			null,
			array(
				'title'  => __( 'Suivre ma commande', 'safrozen' ),
				'lede'   => __( 'Saisissez le numéro de commande reçu par e-mail et l’adresse utilisée pour commander.', 'safrozen' ),
				'crumbs' => array( array( get_the_title() ) ),
			)
		);
		?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</main>
<?php
get_footer();
