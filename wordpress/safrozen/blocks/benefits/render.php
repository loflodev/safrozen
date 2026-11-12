<?php
/**
 * Benefits (CLAUDE.md §7): on the cream, the title over a kitchen-timer dial
 * that sweeps to the ready time (the brand badge's words around it), then the
 * cards, each filled with one product's field (its "Couleurs de champ"). No
 * picture: the dial is drawn here, and js/blocks/benefits.ts plays it.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$minutes = max( 1, min( 60, (int) safrozen_field( 'minutes', false, 20 ) ) );
$cards   = (array) safrozen_field( 'cards', false, array() );
$heading = (string) safrozen_field( 'heading', false, __( 'Pourquoi Legim Express', 'safrozen' ) );

// The brand name in its wordmark face, kept on one line, then " ?".
$title = str_replace(
	'Legim Express',
	'<span class="benefits__brand">Legim Express</span>',
	esc_html( rtrim( $heading, " ?\u{00a0}" ) )
) . '&nbsp;?';

// Dial geometry, in the SVG's 200-unit box (centre 100, 100); the ring of
// words runs outside the face, in the box's 32-unit margin.
$face_min = 60;
$tick_out = 90;
$arc_r    = 70;
$words_r  = 112;
// The brand badge's three lines, clockwise on a circle that starts at 6 o'clock.
$ring_words = array(
	'PRÊT EN'      => '27%',
	'READY IN'     => '50%',
	'LAP PARE NAN' => '75.5%',
);
$id = safrozen_block_id( $block, 'avantages' );
?>
<section id="<?php echo esc_attr( $id ); ?>" class="benefits" data-reveal-on aria-labelledby="benefits-title">
	<div class="benefits__lead">
		<h2 class="section__title benefits__title" id="benefits-title"><?php echo $title; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped above ?></h2>

		<?php // A kitchen timer: an hour's face, the arc sweeping to the ready time. ?>
		<div class="benefits__dial" data-target="<?php echo (int) $minutes; ?>">
			<p class="visually-hidden">
				<?php
				printf(
					/* translators: %d: minutes */
					esc_html__( 'Prêt en %d minutes.', 'safrozen' ),
					(int) $minutes
				);
				?>
				<span lang="en">Ready in <?php echo (int) $minutes; ?> minutes.</span>
				<span lang="ht">Lap pare nan <?php echo (int) $minutes; ?> minit.</span>
			</p>
			<svg class="benefits__face" viewBox="-32 -32 264 264" aria-hidden="true">
				<defs>
					<path id="benefits-words" d="<?php echo esc_attr( sprintf( 'M 100 %1$d A %2$d %2$d 0 1 1 100 %3$d A %2$d %2$d 0 1 1 100 %1$d', 100 + $words_r, $words_r, 100 - $words_r ) ); ?>" />
				</defs>
				<?php foreach ( $ring_words as $word => $at ) : ?>
					<text class="benefits__word"><textPath href="#benefits-words" startOffset="<?php echo esc_attr( $at ); ?>" text-anchor="middle"><?php echo esc_html( $word ); ?></textPath></text>
				<?php endforeach; ?>
				<circle class="benefits__plate" cx="100" cy="100" r="98" />
				<?php for ( $i = 0; $i < $face_min; $i++ ) : ?>
					<line class="benefits__tick<?php echo 0 === $i % 5 ? ' benefits__tick--hour' : ''; ?>" x1="100" y1="<?php echo 100 - $tick_out; ?>" x2="100" y2="<?php echo 100 - $tick_out + ( 0 === $i % 5 ? 8 : 4 ); ?>" transform="rotate(<?php echo $i * 6; ?> 100 100)" />
				<?php endfor; ?>
				<circle class="benefits__track" cx="100" cy="100" r="<?php echo $arc_r; ?>" />
				<?php // Drawn full (the ready time) without JS; benefits.ts plays it from 0. ?>
				<circle class="benefits__arc" cx="100" cy="100" r="<?php echo $arc_r; ?>" pathLength="<?php echo $face_min; ?>" transform="rotate(-90 100 100)" style="stroke-dasharray: <?php echo (int) $minutes; ?> <?php echo $face_min; ?>" />
				<g class="benefits__tip" transform="rotate(<?php echo $minutes / $face_min * 360; ?> 100 100)">
					<circle cx="100" cy="<?php echo 100 - $arc_r; ?>" r="7" />
				</g>
			</svg>
			<div class="benefits__counter" aria-hidden="true">
				<?php // The sign hangs left of the number, so the number itself is centred. ?>
				<span class="benefits__value">
					<span class="benefits__sign"><span>+</span><span>−</span></span>
					<span class="benefits__num"><?php echo (int) $minutes; ?></span>
				</span>
				<span class="benefits__unit">MIN</span>
			</div>
		</div>
	</div>

	<ul class="benefits__list">
		<?php
		foreach ( $cards as $card ) :
			$look = safrozen_product_look( (int) ( $card['product'] ?? 0 ) );
			?>
			<li class="benefit-card" style="<?php echo esc_attr( "--field-top:{$look['field'][1]};--field-bottom:{$look['field'][4]}" ); ?>">
				<span class="benefit-card__icon"><?php echo safrozen_icon( $card['icon'] ?? 'snowflake', array( 'width' => 22, 'height' => 22 ) ); // phpcs:ignore ?></span>
				<h3 class="benefit-card__title"><?php echo esc_html( $card['title'] ?? '' ); ?></h3>
			</li>
		<?php endforeach; ?>
	</ul>
</section>
