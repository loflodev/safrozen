<?php
/**
 * Recipes (CLAUDE.md §12): the three latest posts, newest first. The newest
 * is the lead card from 900px; the "see all" link goes to the posts page.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$posts   = get_posts(
	array(
		'numberposts'      => 3,
		'post_type'        => 'post',
		'suppress_filters' => false,
	)
);
$archive = safrozen_recipes_url();
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'recettes' ) ); ?>" class="section recipes" data-reveal-on aria-labelledby="recipes-title">
	<div class="section__head recipes__head">
		<div>
			<h2 class="section__title recipes__title" id="recipes-title"><?php echo esc_html( safrozen_field( 'title' ) ); ?></h2>
			<?php if ( safrozen_field( 'lede' ) ) : ?>
				<p class="section__lede recipes__lede"><?php echo esc_html( safrozen_field( 'lede' ) ); ?></p>
			<?php endif; ?>
		</div>
		<a class="recipes__all" href="<?php echo esc_url( $archive ); ?>">
			<?php echo esc_html( safrozen_field( 'link_label', false, __( 'Voir toutes les recettes', 'safrozen' ) ) ); ?>
			<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore ?>
		</a>
	</div>

	<ol class="recipes__list">
		<?php foreach ( $posts as $i => $recipe ) : ?>
			<li class="recipe" style="--i: <?php echo (int) $i; ?>">
				<?php get_template_part( 'template-parts/recipe-card', null, array( 'post' => $recipe ) ); ?>
			</li>
		<?php endforeach; ?>
	</ol>
</section>
