<?php
/**
 * Template Name: Contact
 *
 * Contact (Contact.tsx): the store locator band first (the page's main action,
 * on a product's hero field), then the shop's details, the form and the socials.
 * Phones stack details, form, socials; from 900px the form sits left (7) and the
 * details over the socials right (5). Texts are in the ACF group "Legim : page
 * Contact"; the details and socials come from Réglages Safrozen; the form is Contact
 * Form 7's "Contact" (Flamingo keeps the messages).
 */

defined( 'ABSPATH' ) || exit;

wp_enqueue_style( 'safrozen-contact' );

$address = (string) safrozen_option( 'contact_address' );
$phone   = (string) safrozen_option( 'contact_phone' );
$email   = (string) safrozen_option( 'contact_email' );
$hours   = (string) safrozen_option( 'contact_hours' );
$locator = get_page_by_path( 'points-de-vente' );
// Not $product: templates run in global scope, and Woo's the_post hook (which
// Rank Math triggers inside wp_head) unsets that global before the band is drawn.
$band    = wc_get_product( (int) safrozen_field( 'locator_product' ) ) ?: null;
$form    = (int) safrozen_field( 'form' );

/** A row: the whole line is the tap target (chip icon, quiet label, value in ink). */
$row = function ( string $href, string $icon, string $label, string $value, string $extra = '' ): void {
	printf(
		'<a class="contact-row" href="%s"%s><span class="contact-row__icon" aria-hidden="true">%s</span><span class="contact-row__text"><span class="contact-row__label">%s</span>%s</span></a>',
		esc_url( $href ),
		$extra, // phpcs:ignore WordPress.Security.EscapeOutput -- fixed attributes below
		safrozen_icon( $icon ), // phpcs:ignore WordPress.Security.EscapeOutput
		$label, // phpcs:ignore WordPress.Security.EscapeOutput -- escaped by the caller
		esc_html( $value )
	);
};

get_header();
?>
<main id="main" class="page contact">
	<?php
	get_template_part(
		'template-parts/page-header',
		null,
		array(
			'title'  => safrozen_field( 'title', false, get_the_title() ),
			'lede'   => safrozen_field( 'lede' ),
			'crumbs' => array( array( get_the_title() ) ),
		)
	);
	?>

	<?php if ( $locator ) : ?>
		<section class="contact-locator" style="<?php echo esc_attr( $band ? safrozen_field_style( safrozen_product_look( $band->get_id() ) ) : '' ); ?>" aria-labelledby="contact-locator-title">
			<div class="contact-locator__texture" aria-hidden="true"></div>
			<div class="contact-locator__copy">
				<h2 class="contact-locator__title" id="contact-locator-title"><?php echo esc_html( safrozen_field( 'locator_title' ) ); ?></h2>
				<?php if ( safrozen_field( 'locator_text' ) ) : ?>
					<p class="contact-locator__text"><?php echo esc_html( safrozen_field( 'locator_text' ) ); ?></p>
				<?php endif; ?>
				<a class="btn-chip contact-locator__cta" href="<?php echo esc_url( get_permalink( $locator ) ); ?>">
					<?php echo esc_html( safrozen_field( 'locator_label', false, __( 'Trouver un magasin', 'safrozen' ) ) ); ?>
					<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore ?>
				</a>
			</div>
			<?php
			if ( $band && $band->get_image_id() ) {
				echo wp_get_attachment_image(
					$band->get_image_id(),
					'large',
					false,
					array(
						'class'    => 'contact-locator__art',
						'alt'      => '',
						'sizes'    => '(min-width: 900px) 30rem, 18rem',
						'loading'  => 'eager',
						'decoding' => 'async',
					)
				);
			}
			?>
		</section>
	<?php endif; ?>

	<div class="contact__layout">
		<section class="panel contact__info" aria-labelledby="contact-info-title">
			<h2 class="panel__title" id="contact-info-title"><?php esc_html_e( 'Nos coordonnées', 'safrozen' ); ?></h2>
			<address class="contact__list">
				<?php
				if ( $phone ) {
					$row( 'tel:' . preg_replace( '/[^\d+]/', '', $phone ), 'phone', esc_html__( 'Appelez-nous', 'safrozen' ), $phone );
				}
				if ( $email ) {
					$row( 'mailto:' . antispambot( $email ), 'mail', esc_html__( 'Écrivez-nous', 'safrozen' ), antispambot( $email ) );
				}
				if ( $address ) {
					$row(
						'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( $address ),
						'pin',
						esc_html__( 'Venez nous voir', 'safrozen' ) . '<span class="visually-hidden"> ' . esc_html__( '(itinéraire, nouvel onglet)', 'safrozen' ) . '</span>',
						$address,
						' target="_blank" rel="noreferrer"'
					);
				}
				?>
			</address>
			<?php if ( $hours ) : ?>
				<p class="contact__hours"><?php echo safrozen_icon( 'clock' ); // phpcs:ignore ?><?php echo esc_html( $hours ); ?></p>
			<?php endif; ?>
		</section>

		<section class="panel contact__form" aria-labelledby="contact-form-title">
			<h2 class="panel__title" id="contact-form-title"><?php esc_html_e( 'Envoyez-nous un message', 'safrozen' ); ?></h2>
			<?php
			if ( $form && shortcode_exists( 'contact-form-7' ) ) {
				echo do_shortcode( sprintf( '[contact-form-7 id="%d" html_class="contact-form" html_title="%s"]', $form, esc_attr__( 'Envoyez-nous un message', 'safrozen' ) ) );
			}
			?>
		</section>

		<section class="panel contact__social" aria-labelledby="contact-social-title">
			<h2 class="panel__title" id="contact-social-title"><?php esc_html_e( 'Suivez-nous', 'safrozen' ); ?></h2>
			<ul class="contact__socials">
				<?php foreach ( safrozen_socials() as $social ) : ?>
					<li>
						<?php
						// The profile's handle from its URL (".../@legimexpress" → "@legimexpress"), else the brand.
						$handle = trim( (string) wp_parse_url( $social['url'], PHP_URL_PATH ), '/' );
						$handle = $handle ? ( str_starts_with( $handle, '@' ) ? $handle : '@' . basename( $handle ) ) : 'Legim Express';
						$row( $social['url'], $social['icon'], esc_html( $social['label'] ), $handle );
						?>
					</li>
				<?php endforeach; ?>
			</ul>
		</section>
	</div>
</main>
<?php
get_footer();
