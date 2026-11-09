<?php
/**
 * Fallback template (posts, archives) until each gets its own; same frame as page.php.
 *
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
