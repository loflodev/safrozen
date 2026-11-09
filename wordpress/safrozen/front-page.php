<?php
/**
 * The landing: a page built from the theme's blocks (hero wheel, Benefits,
 * Story, Partners, Featured, Recipes, Testimonials, Newsletter), in normal flow.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="main">
	<?php
	while ( have_posts() ) {
		the_post();
		the_content();
	}
	?>
</main>
<?php
get_footer();
