<?php
/**
 * Newsletter (CLAUDE.md §13): the invitation and the sign-up form. The form
 * is Contact Form 7's "Infolettre" (Flamingo keeps the addresses); its
 * markup lives in the form itself, using the newsletter__* classes.
 *
 * @var array $block
 */

defined( 'ABSPATH' ) || exit;

$title = (string) safrozen_field( 'title' );
$form  = safrozen_field( 'form' );
$form  = $form instanceof WP_Post ? $form->ID : (int) $form;
?>
<section id="<?php echo esc_attr( safrozen_block_id( $block, 'infolettre' ) ); ?>" class="section newsletter" data-reveal-on aria-labelledby="newsletter-title">
	<div class="newsletter__panel">
		<div class="veg-texture newsletter__texture" aria-hidden="true"></div>
		<div class="newsletter__intro">
			<?php // Each word rises out of its own line; the label reads the title whole. ?>
			<h2 class="section__title newsletter__title" id="newsletter-title" aria-label="<?php echo esc_attr( $title ); ?>">
				<?php foreach ( preg_split( '/\s+/u', trim( $title ) ) as $i => $word ) : ?>
					<span class="newsletter__word" aria-hidden="true"><span style="--i: <?php echo (int) $i; ?>"><?php echo esc_html( $word ); ?></span></span>
				<?php endforeach; ?>
			</h2>
			<?php if ( safrozen_field( 'lede' ) ) : ?>
				<p class="newsletter__lede"><?php echo esc_html( safrozen_field( 'lede' ) ); ?></p>
			<?php endif; ?>
		</div>

		<?php
		if ( $form && shortcode_exists( 'contact-form-7' ) ) {
			echo do_shortcode( sprintf( '[contact-form-7 id="%d" html_class="newsletter__form" html_title="%s"]', $form, esc_attr__( "Inscription à l'infolettre", 'safrozen' ) ) );
		}
		?>
	</div>
</section>
