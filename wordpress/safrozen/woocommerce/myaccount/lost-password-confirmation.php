<?php
/**
 * After a lost-password request: the same answer whether or not the address
 * has an account.
 *
 * @version 3.9.0
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="panel auth auth--single">
	<?php do_action( 'woocommerce_before_lost_password_confirmation_message' ); ?>
	<p class="notice notice--success" role="status"><?php esc_html_e( 'Si un compte existe pour cette adresse, un lien pour choisir un nouveau mot de passe vient de lui être envoyé. Il peut prendre quelques minutes à arriver ; pensez à vérifier les courriels indésirables.', 'safrozen' ); ?></p>
	<?php do_action( 'woocommerce_after_lost_password_confirmation_message' ); ?>
	<a class="btn-ghost" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"><?php esc_html_e( 'Retour à la connexion', 'safrozen' ); ?></a>
</div>
