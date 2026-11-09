<?php
/**
 * The contact card at the end of an information page (InfoPage.tsx): a quiet
 * terracotta panel with the shop's e-mail, phone and address from "Réglages
 * Legim", and a "Nous écrire" button to the contact page. On the privacy policy
 * it also names the privacy officer (Loi 25).
 *
 * @var array $args { @type bool $officer Show the privacy officer's name and role. }
 */

defined( 'ABSPATH' ) || exit;

$officer = ! empty( $args['officer'] );
$name    = (string) safrozen_option( 'privacy_officer_name' );
$role    = (string) safrozen_option( 'privacy_officer_role' );
$email   = (string) safrozen_option( 'contact_email' );
$phone   = (string) safrozen_option( 'contact_phone' );
$address = (string) safrozen_option( 'contact_address' );
$holder  = (string) safrozen_option( 'copyright_holder', get_bloginfo( 'name' ) );
$contact = get_page_by_path( 'contact' );
?>
<aside class="info__contact tint" aria-labelledby="info-contact-title">
	<span class="info__contact-icon" aria-hidden="true"><?php echo safrozen_icon( 'mail' ); // phpcs:ignore ?></span>
	<h2 class="panel__title" id="info-contact-title">
		<?php echo $officer ? esc_html__( 'Nous joindre', 'safrozen' ) : esc_html__( 'Une question sur cette page ?', 'safrozen' ); ?>
	</h2>
	<dl class="info__facts">
		<?php if ( $officer && $name ) : ?>
			<div><dt><?php esc_html_e( 'Responsable', 'safrozen' ); ?></dt><dd><?php echo esc_html( $name ); ?></dd></div>
		<?php endif; ?>
		<?php if ( $officer && $role ) : ?>
			<div><dt><?php esc_html_e( 'Fonction', 'safrozen' ); ?></dt><dd><?php echo esc_html( $role ); ?></dd></div>
		<?php endif; ?>
		<?php if ( $email ) : ?>
			<div><dt><?php esc_html_e( 'Courriel', 'safrozen' ); ?></dt><dd><a class="link" href="mailto:<?php echo esc_attr( antispambot( $email ) ); ?>"><?php echo esc_html( antispambot( $email ) ); ?></a></dd></div>
		<?php endif; ?>
		<?php if ( $phone ) : ?>
			<div><dt><?php esc_html_e( 'Téléphone', 'safrozen' ); ?></dt><dd><a class="link" href="<?php echo esc_url( 'tel:' . preg_replace( '/[^\d+]/', '', $phone ) ); ?>"><?php echo esc_html( $phone ); ?></a></dd></div>
		<?php endif; ?>
		<?php if ( $address ) : ?>
			<div class="info__facts-wide"><dt><?php esc_html_e( 'Adresse postale', 'safrozen' ); ?></dt><dd><?php echo esc_html( "$holder, $address" ); ?></dd></div>
		<?php endif; ?>
	</dl>
	<?php if ( $contact ) : ?>
		<a class="btn-chip" href="<?php echo esc_url( get_permalink( $contact ) ); ?>">
			<?php esc_html_e( 'Nous écrire', 'safrozen' ); ?>
			<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore ?>
		</a>
	<?php endif; ?>
</aside>
