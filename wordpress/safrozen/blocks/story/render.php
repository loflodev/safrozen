<?php
/**
 * Story (CLAUDE.md §8): the family photo and the copy, an ordinary section
 * after Benefits. The photo, the panel and each line rise in once it comes
 * into view (data-reveal-on, js/reveal.ts) and play again on the next visit.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$photo      = (int) safrozen_field( 'photo', false, 0 );
$paragraphs = safrozen_paragraphs( (string) safrozen_field( 'body' ) );
$tagline    = safrozen_field( 'tagline' );
// Entrance order (--i in story.css): the photo first, then each line.
$i = 0;
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'histoire' ) ); ?>" class="story" data-reveal-on aria-labelledby="story-title">
	<div class="story__media">
		<?php // A quiet terracotta panel behind the photo, running off the right edge. ?>
		<div class="story__panel" aria-hidden="true"></div>
		<?php
		if ( $photo ) {
			echo wp_get_attachment_image(
				$photo,
				'full',
				false,
				array(
					'class'    => 'story__photo',
					'style'    => '--i: 0',
					'sizes'    => '(min-width: 1200px) 55vw, 100vw',
					'loading'  => 'lazy',
					'decoding' => 'async',
				)
			);
		}
		?>
	</div>

	<div class="story__copy">
		<p class="story__line story__kicker" style="--i: <?php echo (int) ++$i; ?>"><?php echo esc_html( safrozen_field( 'kicker', false, 'Legim Express' ) ); ?></p>
		<h2 class="story__line story__title" id="story-title" style="--i: <?php echo (int) ++$i; ?>"><?php echo esc_html( safrozen_field( 'title' ) ); ?></h2>
		<?php foreach ( $paragraphs as $paragraph ) : ?>
			<p class="story__line story__para" style="--i: <?php echo (int) ++$i; ?>"><?php echo esc_html( $paragraph ); ?></p>
		<?php endforeach; ?>
		<?php if ( $tagline ) : ?>
			<p class="story__line story__tagline" style="--i: <?php echo (int) ++$i; ?>"><?php echo esc_html( $tagline ); ?></p>
		<?php endif; ?>
	</div>
</section>
