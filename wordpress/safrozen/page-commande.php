<?php
/**
 * Commande (Checkout.tsx) and its order-received page (Confirmation.tsx): the
 * header follows the endpoint (safrozen_checkout_header()); the shortcode
 * draws the steps (woocommerce/checkout/form-checkout.php) or the thank-you.
 */

defined( 'ABSPATH' ) || exit;

$header = safrozen_checkout_header();

get_header();
?>
<main id="main" class="page checkout<?php echo is_wc_endpoint_url( 'order-received' ) ? ' confirmation' : ''; ?>">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php get_template_part( 'template-parts/page-header', null, $header ); ?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</main>
<?php
get_footer();
