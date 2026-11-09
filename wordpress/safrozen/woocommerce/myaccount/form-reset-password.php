<?php
/**
 * New password (ResetPassword.tsx), from the e-mailed link.
 *
 * @var array $args { @type string $key, $login }
 * @version 9.2.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_reset_password_form' );
?>
<form method="post" class="panel auth auth--single auth-form woocommerce-ResetPassword lost_reset_password" novalidate data-validate>
	<h2 class="panel__title" tabindex="-1"><?php esc_html_e( 'Choisir un nouveau mot de passe', 'safrozen' ); ?></h2>
	<div data-error-summary></div>
	<?php
	// phpcs:disable WordPress.Security.EscapeOutput
	echo safrozen_form_field(
		array(
			'id'           => 'password_1',
			'label'        => __( 'Nouveau mot de passe', 'safrozen' ),
			'type'         => 'password',
			'autocomplete' => 'new-password',
			/* translators: %d: minimum length */
			'help'         => sprintf( __( 'Au moins %d caractères.', 'safrozen' ), SAFROZEN_MIN_PASSWORD ),
			'rule'         => 'password',
			'attrs'        => array( 'data-min' => SAFROZEN_MIN_PASSWORD ),
		)
	);
	echo safrozen_form_field(
		array(
			'id'           => 'password_2',
			'label'        => __( 'Confirmez le mot de passe', 'safrozen' ),
			'type'         => 'password',
			'autocomplete' => 'new-password',
			'rule'         => 'match:password_1',
		)
	);
	// phpcs:enable
	?>
	<input type="hidden" name="reset_key" value="<?php echo esc_attr( $args['key'] ); ?>">
	<input type="hidden" name="reset_login" value="<?php echo esc_attr( $args['login'] ); ?>">
	<?php do_action( 'woocommerce_resetpassword_form' ); ?>
	<input type="hidden" name="wc_reset_password" value="true">
	<?php wp_nonce_field( 'reset_password', 'woocommerce-reset-password-nonce' ); ?>
	<button type="submit" class="btn-chip" value="<?php esc_attr_e( 'Enregistrer', 'safrozen' ); ?>" data-busy="<?php esc_attr_e( 'Enregistrement…', 'safrozen' ); ?>">
		<?php esc_html_e( 'Enregistrer le mot de passe', 'safrozen' ); ?>
		<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	</button>
</form>
<?php
do_action( 'woocommerce_after_reset_password_form' );
