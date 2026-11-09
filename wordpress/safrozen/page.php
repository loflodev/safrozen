<?php
/**
 * Inner pages: the page frame on cream, the title, then the content
 * (CLAUDE.md §16). WooCommerce's cart, checkout and account pages use it too.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="main" class="page">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php get_template_part( 'template-parts/page-header' ); ?>
		<div class="page__content">
			<?php the_content(); ?>
		</div>
	<?php endwhile; ?>
</main>
<?php
get_footer();
