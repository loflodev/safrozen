<?php
/**
 * Testimonials (CLAUDE.md §13): the rating summary and the three latest
 * reviews (the "avis" post type, safrozen-core).
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$reviews = get_posts(
	array(
		'numberposts' => 3,
		'post_type'   => 'avis',
	)
);
$stars   = str_repeat( safrozen_icon( 'star' ), 5 );
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'avis' ) ); ?>" class="section testimonials" data-reveal-on aria-labelledby="testimonials-title">
	<div class="section__head">
		<div>
			<h2 class="section__title testimonials__title" id="testimonials-title"><?php echo esc_html( safrozen_field( 'title' ) ); ?></h2>
			<?php if ( safrozen_field( 'lede' ) ) : ?>
				<p class="section__lede testimonials__lede"><?php echo esc_html( safrozen_field( 'lede' ) ); ?></p>
			<?php endif; ?>
		</div>
		<?php if ( safrozen_field( 'average' ) ) : ?>
			<p class="testimonials__score">
				<span class="testimonials__avg"><?php echo esc_html( safrozen_field( 'average' ) ); ?><span class="testimonials__max"> / 5</span></span>
				<span class="testimonials__count">
					<span class="review__stars" aria-hidden="true"><?php echo $stars; // phpcs:ignore ?></span>
					<?php echo esc_html( safrozen_field( 'count_label' ) ); ?>
				</span>
			</p>
		<?php endif; ?>
	</div>

	<ul class="testimonials__list">
		<?php
		foreach ( $reviews as $i => $review ) :
			$name   = get_the_title( $review );
			$rating = min( 5, max( 1, (int) safrozen_field( 'rating', $review->ID, 5 ) ) );
			?>
			<li class="review" style="--i: <?php echo (int) $i; ?>">
				<figure class="review__card">
					<?php /* translators: %d: rating out of 5 */ ?>
					<p class="review__stars" role="img" aria-label="<?php echo esc_attr( sprintf( __( '%d étoiles sur 5', 'safrozen' ), $rating ) ); ?>">
						<?php
						foreach ( range( 0, $rating - 1 ) as $s ) {
							echo safrozen_icon( 'star', array( 'class' => 'review__star', 'style' => "--s: $s" ) ); // phpcs:ignore
						}
						?>
					</p>
					<blockquote class="review__quote">
						<p><?php echo esc_html( safrozen_field( 'quote', $review->ID ) ); ?></p>
					</blockquote>
					<figcaption class="review__who">
						<span class="review__avatar" aria-hidden="true"><?php echo esc_html( safrozen_initials( $name ) ); ?></span>
						<span>
							<span class="review__name"><?php echo esc_html( $name ); ?></span>
							<span class="review__city"><?php echo esc_html( safrozen_field( 'city', $review->ID ) ); ?></span>
						</span>
					</figcaption>
				</figure>
			</li>
		<?php endforeach; ?>
	</ul>
</section>
