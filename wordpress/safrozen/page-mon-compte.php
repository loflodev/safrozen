<?php
/**
 * Mon compte (WooCommerce's account page, AccountLayout.tsx): the header takes
 * the current section's title and crumbs (Mon compte › Commandes › n° 1041);
 * the shortcode draws the sign-in card when signed out, else the nav and the
 * section (woocommerce/myaccount/*).
 */

defined( 'ABSPATH' ) || exit;

$header = safrozen_account_header();

get_header();
?>
<main id="main" class="page account">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php get_template_part( 'template-parts/page-header', null, $header ); ?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</main>
<?php
get_footer();
