<?php
/**
 * Partners (CLAUDE.md §10): the retailers' logos in a row printed twice,
 * drifting left forever (js/blocks/partners.ts). Logos are a gallery field;
 * each logo's alt text is its name.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$logos = array_map( 'intval', (array) safrozen_field( 'logos', false, array() ) );
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'partenaires' ) ); ?>" class="section partners" data-reveal-on aria-labelledby="partners-title">
	<div class="section__head partners__head">
		<div class="veg-texture" aria-hidden="true"></div>
		<h2 class="section__title partners__title" id="partners-title"><?php echo esc_html( safrozen_field( 'title' ) ); ?></h2>
		<?php if ( safrozen_field( 'lede' ) ) : ?>
			<p class="section__lede partners__lede"><?php echo esc_html( safrozen_field( 'lede' ) ); ?></p>
		<?php endif; ?>
	</div>

	<div class="partners__viewport">
		<ul class="partners__track">
			<?php foreach ( array( 0, 1 ) as $copy ) : ?>
				<?php foreach ( $logos as $i => $logo ) : ?>
					<li class="partners__item" style="--i: <?php echo (int) $i; ?>"<?php echo $copy ? ' aria-hidden="true"' : ''; ?>>
						<?php
						$attrs = array(
							'class'    => 'partners__logo',
							'loading'  => 'lazy',
							'decoding' => 'async',
						);
						if ( $copy ) {
							$attrs['alt'] = '';
						}
						echo wp_get_attachment_image( $logo, 'full', false, $attrs );
						?>
					</li>
				<?php endforeach; ?>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
