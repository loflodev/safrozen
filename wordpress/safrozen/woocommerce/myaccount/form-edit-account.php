<?php
/**
 * Détails du compte (Details.tsx): name, display name and e-mail, then the
 * password change, which applies only when a new one is typed.
 *
 * @var WP_User $user
 * @version 11.0.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_edit_account_form' );

// phpcs:disable WordPress.Security.EscapeOutput -- safrozen_form_field() escapes.
?>
<form class="panel account-form" action="" method="post" novalidate data-validate aria-labelledby="details-title" <?php do_action( 'woocommerce_edit_account_form_tag' ); ?>>
	<h2 class="panel__title" id="details-title" tabindex="-1"><?php esc_html_e( 'Vos informations', 'safrozen' ); ?></h2>
	<div data-error-summary></div>
	<?php do_action( 'woocommerce_edit_account_form_start' ); ?>
	<div class="form-grid form-grid--2">
		<?php
		echo safrozen_form_field( array( 'id' => 'account_first_name', 'label' => __( 'Prénom', 'safrozen' ), 'value' => $user->first_name, 'autocomplete' => 'given-name', 'message' => __( 'Saisissez le prénom.', 'safrozen' ) ) );
		echo safrozen_form_field( array( 'id' => 'account_last_name', 'label' => __( 'Nom', 'safrozen' ), 'value' => $user->last_name, 'autocomplete' => 'family-name', 'message' => __( 'Saisissez le nom.', 'safrozen' ) ) );
		echo safrozen_form_field(
			array(
				'id'      => 'account_display_name',
				'label'   => __( 'Nom affiché', 'safrozen' ),
				'value'   => $user->display_name,
				'full'    => true,
				'help'    => __( 'Le nom qui vous accueille dans votre compte.', 'safrozen' ),
				'message' => __( 'Saisissez le nom affiché.', 'safrozen' ),
			)
		);
		echo safrozen_form_field( array( 'id' => 'account_email', 'label' => __( 'Adresse e-mail', 'safrozen' ), 'type' => 'email', 'value' => $user->user_email, 'full' => true, 'autocomplete' => 'email', 'inputmode' => 'email', 'rule' => 'email' ) );
		?>
	</div>
	<?php do_action( 'woocommerce_edit_account_form_fields' ); ?>

	<fieldset class="account-form__fieldset">
		<legend class="form-subhead"><?php esc_html_e( 'Changer de mot de passe', 'safrozen' ); ?></legend>
		<p class="field__help"><?php esc_html_e( 'Laissez ces champs vides pour garder le mot de passe actuel.', 'safrozen' ); ?></p>
		<?php
		echo safrozen_form_field( array( 'id' => 'password_current', 'label' => __( 'Mot de passe actuel', 'safrozen' ), 'type' => 'password', 'required' => false, 'autocomplete' => 'current-password', 'rule' => 'needed-by:password_1', 'message' => __( 'Saisissez votre mot de passe actuel.', 'safrozen' ) ) );
		echo safrozen_form_field(
			array(
				'id'           => 'password_1',
				'label'        => __( 'Nouveau mot de passe', 'safrozen' ),
				'type'         => 'password',
				'required'     => false,
				'autocomplete' => 'new-password',
				/* translators: %d: minimum length */
				'help'         => sprintf( __( 'Au moins %d caractères.', 'safrozen' ), SAFROZEN_MIN_PASSWORD ),
				'rule'         => 'password',
				'attrs'        => array( 'data-min' => SAFROZEN_MIN_PASSWORD ),
			)
		);
		echo safrozen_form_field( array( 'id' => 'password_2', 'label' => __( 'Confirmez le nouveau mot de passe', 'safrozen' ), 'type' => 'password', 'required' => false, 'autocomplete' => 'new-password', 'rule' => 'match:password_1' ) );
		?>
	</fieldset>
	<?php do_action( 'woocommerce_edit_account_form' ); ?>

	<div class="account-form__actions">
		<?php wp_nonce_field( 'save_account_details', 'save-account-details-nonce' ); ?>
		<button type="submit" class="btn-chip" name="save_account_details" value="<?php esc_attr_e( 'Enregistrer', 'safrozen' ); ?>" data-busy="<?php esc_attr_e( 'Enregistrement…', 'safrozen' ); ?>"><?php esc_html_e( 'Enregistrer les modifications', 'safrozen' ); ?></button>
		<input type="hidden" name="action" value="save_account_details">
	</div>
	<?php do_action( 'woocommerce_edit_account_form_end' ); ?>
</form>
<?php
// phpcs:enable
do_action( 'woocommerce_after_edit_account_form' );
