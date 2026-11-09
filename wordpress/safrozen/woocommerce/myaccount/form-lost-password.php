<?php
/**
 * Lost password (LostPassword.tsx): one panel, the e-mail and the button. The
 * answer never says whether an account exists.
 *
 * @version 9.2.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_lost_password_form' );
?>
<form method="post" class="panel auth auth--single auth-form woocommerce-ResetPassword lost_reset_password" novalidate data-validate>
	<h2 class="panel__title" tabindex="-1"><?php esc_html_e( 'Réinitialiser le mot de passe', 'safrozen' ); ?></h2>
	<p class="auth__lede"><?php esc_html_e( 'Saisissez l’adresse e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.', 'safrozen' ); ?></p>
	<div data-error-summary></div>
	<?php
	echo safrozen_form_field( // phpcs:ignore WordPress.Security.EscapeOutput
		array(
			'id'           => 'user_login',
			'label'        => __( 'Adresse e-mail', 'safrozen' ),
			'type'         => 'email',
			'autocomplete' => 'username',
			'inputmode'    => 'email',
			'rule'         => 'email',
		)
	);
	?>
	<?php do_action( 'woocommerce_lostpassword_form' ); ?>
	<input type="hidden" name="wc_reset_password" value="true">
	<?php wp_nonce_field( 'lost_password', 'woocommerce-lost-password-nonce' ); ?>
	<button type="submit" class="btn-chip" value="<?php esc_attr_e( 'Envoyer le lien', 'safrozen' ); ?>" data-busy="<?php esc_attr_e( 'Envoi…', 'safrozen' ); ?>">
		<?php esc_html_e( 'Envoyer le lien', 'safrozen' ); ?>
		<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	</button>
	<a class="link auth__lost" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"><?php esc_html_e( 'Retour à la connexion', 'safrozen' ); ?></a>
</form>
<?php
do_action( 'woocommerce_after_lost_password_form' );
