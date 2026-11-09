<?php
/**
 * A recipe card (landing section, the recipes archive, a recipe's "other
 * recipes"): picture tile, title (its link covers the card), excerpt, then
 * date · reading time.
 *
 * @var array $args { post: WP_Post, heading: int }
 */

defined( 'ABSPATH' ) || exit;

$recipe  = $args['post'];
$heading = 'h' . ( (int) ( $args['heading'] ?? 3 ) );
$read    = safrozen_reading_time( $recipe );
?>
<article class="recipe__card">
	<div class="recipe__tile">
		<?php
		echo get_the_post_thumbnail(
			$recipe,
			'large',
			array(
				'class'    => 'recipe__img',
				'sizes'    => '(min-width: 900px) 30vw, 90vw',
				'loading'  => 'lazy',
				'decoding' => 'async',
			)
		);
		?>
	</div>
	<<?php echo $heading; ?> class="recipe__title recipe__text">
		<a class="recipe__link" href="<?php echo esc_url( get_permalink( $recipe ) ); ?>"><?php echo esc_html( get_the_title( $recipe ) ); ?></a>
	</<?php echo $heading; ?>>
	<p class="recipe__excerpt recipe__text"><?php echo esc_html( get_the_excerpt( $recipe ) ); ?></p>
	<p class="recipe__meta recipe__text">
		<time datetime="<?php echo esc_attr( get_the_date( 'Y-m-d', $recipe ) ); ?>"><?php echo esc_html( get_the_date( '', $recipe ) ); ?></time>
		<span aria-hidden="true">·</span>
		<span class="recipe__read">
			<?php echo safrozen_icon( 'clock', array( 'width' => 16, 'height' => 16 ) ); // phpcs:ignore ?>
			<?php echo esc_html( $read ); ?>
		</span>
	</p>
</article>
