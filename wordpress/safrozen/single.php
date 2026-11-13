<?php
/**
 * One recipe, a post (RecipeDetail.tsx): picture and facts, an optional article,
 * the ingredients (sticky from 900px) beside the numbered steps, the legim it
 * uses as a shop card (quick add through js/cart.ts), then two other recipes.
 * The ACF group "Legim : recette" holds the facts, ingredients, steps and product.
 */

defined( 'ABSPATH' ) || exit;

wp_enqueue_style( 'safrozen-recipes-page' );

get_header();

while ( have_posts() ) :
	the_post();
	$recipe      = get_post();
	$archive     = safrozen_recipes_url();
	$serves      = (string) safrozen_field( 'serves' );
	$time        = (string) safrozen_field( 'time' );
	$ingredients = safrozen_lines( (string) safrozen_field( 'ingredients' ) );
	$steps       = safrozen_lines( (string) safrozen_field( 'steps' ) );
	$product_id  = (int) safrozen_field( 'product' );
	$item        = $product_id && function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;
	$others      = get_posts(
		array(
			'numberposts'      => 2,
			'post_type'        => 'post',
			'post__not_in'     => array( $recipe->ID ),
			'suppress_filters' => false,
		)
	);
	$facts       = array_filter(
		array(
			__( 'Pour', 'safrozen' )  => esc_html( $serves ),
			__( 'Temps', 'safrozen' ) => esc_html( $time ),
		)
	);
	$facts[ __( 'Publié le', 'safrozen' ) ] = '<time datetime="' . esc_attr( get_the_date( 'Y-m-d' ) ) . '">' . esc_html( get_the_date() ) . '</time>';
	$facts[ __( 'Lecture', 'safrozen' ) ]   = '<span class="recipe-page__read">' . safrozen_icon( 'clock', array( 'width' => 16, 'height' => 16 ) ) . esc_html( str_replace( ' de lecture', '', safrozen_reading_time( $recipe ) ) ) . '</span>';
	?>
<main id="main" class="page recipe-page">
	<?php
	get_template_part(
		'template-parts/page-header',
		null,
		array(
			'title'  => get_the_title(),
			'lede'   => has_excerpt() ? get_the_excerpt() : '',
			'crumbs' => array( array( __( 'Recettes', 'safrozen' ), $archive ), array( get_the_title() ) ),
		)
	);
	?>

	<div class="recipe-page__hero">
		<?php if ( has_post_thumbnail() ) : ?>
			<div class="recipe-page__tile">
				<?php the_post_thumbnail( 'large', array( 'sizes' => '(min-width: 1280px) 1200px, 100vw', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
			</div>
		<?php endif; ?>
		<dl class="recipe-page__facts">
			<?php foreach ( $facts as $label => $value ) : ?>
				<div>
					<dt><?php echo esc_html( $label ); ?></dt>
					<dd><?php echo $value; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped above. ?></dd>
				</div>
			<?php endforeach; ?>
		</dl>
	</div>

	<?php if ( trim( wp_strip_all_tags( get_the_content() ) ) ) : ?>
		<div class="recipe-page__content">
			<?php the_content(); ?>
		</div>
	<?php endif; ?>

	<?php if ( $ingredients || $steps ) : ?>
		<div class="recipe-page__body">
			<?php if ( $ingredients ) : ?>
				<section class="panel recipe-page__ingredients" aria-labelledby="ingredients-title">
					<h2 class="panel__title" id="ingredients-title"><?php esc_html_e( 'Ingrédients', 'safrozen' ); ?></h2>
					<ul>
						<?php foreach ( $ingredients as $line ) : ?>
							<li><?php echo esc_html( $line ); ?></li>
						<?php endforeach; ?>
					</ul>
				</section>
			<?php endif; ?>
			<?php if ( $steps ) : ?>
				<section class="recipe-page__steps" aria-labelledby="steps-title">
					<h2 class="panel__title" id="steps-title"><?php esc_html_e( 'Préparation', 'safrozen' ); ?></h2>
					<ol>
						<?php foreach ( $steps as $i => $line ) : // The ids are the Recipe schema's step URLs (inc/seo.php). ?>
							<li id="etape-<?php echo (int) $i + 1; ?>"><?php echo esc_html( $line ); ?></li>
						<?php endforeach; ?>
					</ol>
				</section>
			<?php endif; ?>
		</div>
	<?php endif; ?>

	<?php if ( $item && $item->is_visible() ) : ?>
		<section class="recipe-page__product" aria-labelledby="used-title">
			<h2 class="panel__title" id="used-title"><?php esc_html_e( 'Le legim de cette recette', 'safrozen' ); ?></h2>
			<ul class="recipe-page__product-card">
				<?php
				$GLOBALS['product'] = $item; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
				wc_get_template_part( 'content', 'product' );
				?>
			</ul>
		</section>
	<?php endif; ?>

	<?php if ( $others ) : ?>
		<section class="recipe-page__more" aria-labelledby="more-title">
			<div class="section__head recipes__head">
				<h2 class="section__title" id="more-title"><?php esc_html_e( "D'autres recettes", 'safrozen' ); ?></h2>
				<a class="recipes__all" href="<?php echo esc_url( $archive ); ?>">
					<?php esc_html_e( 'Toutes les recettes', 'safrozen' ); ?>
					<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</a>
			</div>
			<ol class="recipes-grid">
				<?php foreach ( $others as $i => $other ) : ?>
					<li style="--i: <?php echo (int) $i; ?>">
						<?php get_template_part( 'template-parts/recipe-card', null, array( 'post' => $other ) ); ?>
					</li>
				<?php endforeach; ?>
			</ol>
		</section>
	<?php endif; ?>
</main>
	<?php
endwhile;

get_footer();
