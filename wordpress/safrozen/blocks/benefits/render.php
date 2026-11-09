<?php
/**
 * Benefits (CLAUDE.md §7): the bb6 collage with the ±20 MIN counter on its
 * ring, then the cards. The picture is part of the theme, not a field: the
 * counter and the layout are measured on it (--disc-x/y, --cut-x, --crop-w in
 * benefits.css), so swapping it means re-measuring them.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$minutes = max( 1, (int) safrozen_field( 'minutes', false, 20 ) );
$cards   = (array) safrozen_field( 'cards', false, array() );
$img     = SAFROZEN_URI . '/assets/images/bb6-';
$srcset  = implode( ', ', array_map( fn( $w ) => "{$img}{$w}.webp {$w}w", array( 960, 1440, 2160, 2880 ) ) );
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'avantages' ) ); ?>" class="benefits" aria-labelledby="benefits-title">
	<div class="benefits__texture" aria-hidden="true"></div>
	<div class="benefits__stage">
		<h2 class="visually-hidden" id="benefits-title"><?php echo esc_html( safrozen_field( 'heading', false, __( 'Pourquoi Legim Express', 'safrozen' ) ) ); ?></h2>
		<div class="benefits__art" aria-hidden="true">
			<div class="benefits__canvas">
				<img
					class="benefits__img"
					src="<?php echo esc_url( $img . '1440.webp' ); ?>"
					srcset="<?php echo esc_attr( $srcset ); ?>"
					sizes="(min-width: 1200px) max(100vw, 160svh), 190vw"
					width="1440"
					height="900"
					alt=""
					loading="lazy"
					decoding="async"
				>
				<?php // Hover area over the printed ring: replays the count. ?>
				<div class="benefits__ring"></div>
				<div class="benefits__counter">
					<span class="benefits__sign"><span>+</span><span>−</span></span>
					<span class="benefits__num" data-target="<?php echo (int) $minutes; ?>"><?php echo (int) $minutes; ?></span>
					<span class="benefits__unit">MIN</span>
				</div>
			</div>
		</div>

		<div class="benefits__copy">
			<ul class="benefits__list">
				<?php foreach ( $cards as $card ) : ?>
					<li class="benefit-card">
						<span class="benefit-card__icon"><?php echo safrozen_icon( $card['icon'] ?? 'snowflake', array( 'width' => 22, 'height' => 22 ) ); // phpcs:ignore ?></span>
						<h3 class="benefit-card__title"><?php echo esc_html( $card['title'] ?? '' ); ?></h3>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
	</div>
</section>
