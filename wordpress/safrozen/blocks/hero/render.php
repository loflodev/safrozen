<?php
/**
 * Hero wheel (CLAUDE.md §6): one screen, the products turn in place (autoplay,
 * or a scroll on the box). Products come from WooCommerce, each with its hero title, box
 * (the product image, on a 2:1 canvas) and background (safrozen-core fields).
 * The script (js/blocks/hero.ts) drives the wheel; this prints the first
 * product as active.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$products = array_values( array_filter( (array) safrozen_field( 'products', false, array() ), fn( $p ) => $p instanceof WP_Post ) );
if ( ! $products ) {
	return;
}

$brand = safrozen_field( 'brand', false, 'Legim Express' );
// The 2:1 canvas's drawn width (--art-w in hero.css), measured: portrait ≈ 163vw − 100px; landscape
// from 900px ≈ 106vw − 185px, held at 1262px once the 1280px frame stops growing (1376px).
$sizes = '(max-aspect-ratio: 5/4) calc(163vw - 100px), (min-width: 1376px) 1262px, (min-width: 900px) calc(106vw - 185px), 100vw';

$slides = array_map(
	fn( WP_Post $p ) => array(
		'title' => safrozen_field( 'hero_title', $p->ID, get_the_title( $p ) ),
		'url'   => get_permalink( $p ),
		'look'  => safrozen_product_look( $p->ID ),
		'box'   => (int) get_post_thumbnail_id( $p ),
		'bg'    => (int) safrozen_field( 'background_image', $p->ID, 0 ),
		'specs' => safrozen_product_specs( $p->ID ),
	),
	$products
);
// Every slide needs its box: the script pairs boxes, backgrounds and titles by position.
$slides = array_values( array_filter( $slides, fn( $slide ) => $slide['box'] ) );
if ( ! $slides ) {
	return;
}
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'accueil' ) ); ?>" class="wheel" aria-labelledby="hero-title">
	<div class="wheel__stage">
		<div class="wheel__backgrounds" aria-hidden="true">
			<?php foreach ( $slides as $slide ) : ?>
				<div class="wheel__bg" style="<?php echo esc_attr( safrozen_field_style( $slide['look'] ) ); ?>">
					<?php
					if ( $slide['bg'] ) {
						echo wp_get_attachment_image(
							$slide['bg'],
							'full',
							false,
							array(
								'class'    => 'wheel__bg-art',
								'sizes'    => $sizes,
								'alt'      => '',
								'loading'  => false,
								'decoding' => 'async',
							)
						);
					}
					?>
					<div class="wheel__texture"></div>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="wheel__layer">
			<?php // Lifted and bobbed as one while the box is hovered (hero.css). ?>
			<div class="wheel__boxes">
			<?php
			foreach ( $slides as $i => $slide ) {
				/* translators: %s: product title, e.g. "Au Lalo" */
				$alt = sprintf( __( 'Boîte %1$s %2$s', 'safrozen' ), $brand, $slide['title'] );
				echo wp_get_attachment_image(
					$slide['box'],
					'full',
					false,
					array(
						'class'         => 'wheel__box',
						'sizes'         => $sizes,
						'alt'           => 0 === $i ? $alt : '',
						'aria-hidden'   => 0 === $i ? 'false' : 'true',
						'data-alt'      => $alt,
						'data-url'      => $slide['url'],
						'loading'       => false,
						'decoding'      => 'async',
						'fetchpriority' => 0 === $i ? 'high' : 'auto',
					)
				);
			}
			?>
			</div>
			<?php // Hover and touch area over the box artwork: a scroll here turns the wheel. ?>
			<div class="wheel__hit" aria-hidden="true"></div>
		</div>

		<div class="hero">
			<h1 class="hero__heading" id="hero-title">
				<span class="hero__brand"><?php echo esc_html( $brand ); ?></span>
				<span class="hero__titles">
					<?php foreach ( $slides as $i => $slide ) : ?>
						<span class="hero__title" data-active="<?php echo 0 === $i ? 'true' : 'false'; ?>" aria-hidden="<?php echo 0 === $i ? 'false' : 'true'; ?>"><?php echo esc_html( $slide['title'] ); ?></span>
					<?php endforeach; ?>
				</span>
			</h1>
			<p class="hero__desc"><?php echo esc_html( safrozen_field( 'description' ) ); ?></p>
			<?php // Each product's own specs (fixed labels, the product's values); the script shows the active one's. ?>
			<?php foreach ( $slides as $i => $slide ) : ?>
				<p class="hero__specs"<?php echo 0 === $i ? '' : ' hidden'; ?>>
					<?php foreach ( $slide['specs'] as $label => $value ) : ?>
						<span><span class="hero__spec-label"><?php echo esc_html( $label ); ?></span> <?php echo esc_html( $value ); ?></span>
					<?php endforeach; ?>
				</p>
			<?php endforeach; ?>
			<?php // Orders the product on screen; the script follows the wheel. ?>
			<a class="hero__cta" href="<?php echo esc_url( $slides[0]['url'] ); ?>">
				<?php echo esc_html( safrozen_field( 'cta_label', false, __( 'Commandez', 'safrozen' ) ) ); ?>
				<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore ?>
			</a>
			<p class="visually-hidden" aria-live="polite"><?php echo esc_html( $brand . ' ' . $slides[0]['title'] ); ?></p>
		</div>

		<ol class="wheel__dots" aria-hidden="true">
			<?php foreach ( $slides as $i => $slide ) : ?>
				<li<?php echo 0 === $i ? ' class="is-active"' : ''; ?>></li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>
