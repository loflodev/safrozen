<?php
/**
 * Template Name: Page d'information
 *
 * Information pages (InfoPage.tsx): notre histoire, livraison, FAQ, retours, CGV,
 * confidentialité, conditions d'utilisation. A terracotta header band (title, then
 * the lede and the update date below it), then the page's blocks in a white panel.
 * With three or more headings, a numbered "Sur cette page" list sits beside the text
 * (sticky from 900px; js/info.ts marks the current section); otherwise the text is
 * centred. Details blocks (the FAQ) are drawn as disclosures. The ACF group
 * "Legim : page d'information" holds the lede, the date and the contact card.
 */

defined( 'ABSPATH' ) || exit;

wp_enqueue_style( 'safrozen-info' );
wp_enqueue_script_module( 'safrozen-info' );

get_header();

while ( have_posts() ) :
	the_post();
	$lede     = (string) safrozen_field( 'lede' );
	$updated  = (string) safrozen_field( 'updated' );
	$content  = apply_filters( 'the_content', get_the_content() );
	$faq      = str_contains( $content, '<details' );
	$sections = $faq ? array() : safrozen_info_headings( $content );
	$toc      = count( $sections ) >= 3;
	if ( $toc ) {
		$content = safrozen_info_number_headings( $content, $sections );
	} elseif ( ! $faq ) {
		$content = safrozen_info_number_headings( $content, $sections, false );
	}
	?>
<main id="main" class="page info">
	<div class="info__hero">
		<header class="page-header">
			<?php echo safrozen_crumbs( array( array( get_the_title() ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<div class="section__head page-header__head">
				<h1 class="section__title"><?php the_title(); ?></h1>
				<?php if ( $lede || $updated ) : ?>
					<div class="info__intro">
						<?php if ( $lede ) : ?>
							<p class="section__lede"><?php echo esc_html( $lede ); ?></p>
						<?php endif; ?>
						<?php if ( $updated ) : ?>
							<p class="info__updated">
								<?php esc_html_e( 'Dernière mise à jour :', 'safrozen' ); ?>
								<time datetime="<?php echo esc_attr( $updated ); ?>"><?php echo esc_html( wp_date( 'j F Y', strtotime( $updated . ' 12:00' ) ) ); ?></time>
							</p>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		</header>
	</div>

	<?php if ( $faq ) : ?>
		<div class="info__faq"><?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
	<?php else : ?>
		<div class="info__layout"<?php echo $toc ? ' data-toc' : ''; ?>>
			<?php if ( $toc ) : ?>
				<nav class="info__toc" aria-labelledby="info-toc-title">
					<p class="info__toc-title" id="info-toc-title"><?php esc_html_e( 'Sur cette page', 'safrozen' ); ?></p>
					<ol>
						<?php foreach ( $sections as $i => $section ) : ?>
							<li>
								<a href="#<?php echo esc_attr( $section['id'] ); ?>">
									<span class="info__num" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $i + 1 ) ); ?></span>
									<?php echo esc_html( $section['label'] ); ?>
								</a>
							</li>
						<?php endforeach; ?>
					</ol>
				</nav>
			<?php endif; ?>
			<div class="info__main">
				<article class="panel info__article"<?php echo $toc ? ' data-numbered' : ''; ?>>
					<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</article>
				<?php if ( safrozen_field( 'contact_card' ) ) : ?>
					<?php get_template_part( 'template-parts/info-contact', null, array( 'officer' => (bool) safrozen_field( 'officer' ) ) ); ?>
				<?php endif; ?>
			</div>
		</div>
	<?php endif; ?>
</main>
	<?php
endwhile;

get_footer();
