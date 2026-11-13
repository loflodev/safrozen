<?php
/**
 * Mon compte, signed out (Login.tsx): one card, the form on the left and an
 * illustration on the right. The line under the form swaps both to the other
 * mode (js/auth.ts; without JS the links' #inscription / #connexion targets do
 * it in CSS). A failed sign-up comes back on the sign-up side.
 *
 * Overrides woocommerce/templates/myaccount/form-login.php 9.9.0; the posts,
 * nonces and hooks are WooCommerce's.
 *
 * @version 9.9.0
 */

defined( 'ABSPATH' ) || exit;

$can_register = 'yes' === get_option( 'woocommerce_enable_myaccount_registration' );
// phpcs:disable WordPress.Security.NonceVerification -- re-renders posted values and reads links' query args.
// The confirmation's "Créer mon compte" opens sign-up with the order's e-mail (?email=).
$invited      = isset( $_GET['email'] ) && is_string( $_GET['email'] ) ? sanitize_email( wp_unslash( $_GET['email'] ) ) : '';
$mode         = $can_register && ( ! empty( $_POST['register'] ) || ( $invited && empty( $_POST['login'] ) ) ) ? 'register' : 'login';
$posted       = fn( string $key ) => isset( $_POST[ $key ] ) && is_string( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';
// The checkout's "Connectez-vous" comes back to the checkout once signed in (?redirect_to=).
$redirect     = isset( $_GET['redirect_to'] ) && is_string( $_GET['redirect_to'] ) ? wp_validate_redirect( esc_url_raw( wp_unslash( $_GET['redirect_to'] ) ), '' ) : '';
// phpcs:enable
$privacy      = get_privacy_policy_url();

// Each mode's art is a photo covering a hero field with its line texture,
// faded out under the caption. Sign in's carries the "±20 MIN" badge.
$art = array(
	'login'    => array(
		'image'   => 'benefits-bg-2-1600.webp',
		'badge'   => true,
		'product' => 'legim-au-lalo',
		'title'   => __( 'Content de vous revoir', 'safrozen' ),
		'text'    => __( 'Vos commandes, vos adresses et le suivi de vos livraisons vous attendent.', 'safrozen' ),
	),
	'register' => array(
		'image'   => '3box-product-2048.webp',
		'badge'   => false,
		'product' => 'legim-a-la-chayotte',
		'title'   => __( 'Rejoignez la famille Legim Express', 'safrozen' ),
		'text'    => __( 'Commandez plus vite, suivez vos livraisons et recevez nos nouvelles recettes.', 'safrozen' ),
	),
);

do_action( 'woocommerce_before_customer_login_form' );
?>
<div class="auth-card" data-mode="<?php echo esc_attr( $mode ); ?>"<?php echo $can_register ? ' data-auth' : ''; ?>>
	<div class="auth-card__forms">
		<div class="auth-card__pane auth-card__pane--login" id="connexion">
			<form class="auth-form woocommerce-form woocommerce-form-login login" method="post" novalidate data-validate aria-labelledby="signin-title">
				<h2 class="panel__title" id="signin-title" tabindex="-1"><?php esc_html_e( 'Se connecter', 'safrozen' ); ?></h2>
				<div data-error-summary></div>
				<?php do_action( 'woocommerce_login_form_start' ); ?>
				<?php
				// phpcs:disable WordPress.Security.EscapeOutput
				echo safrozen_form_field(
					array(
						'id'           => 'username',
						'label'        => __( 'Adresse e-mail', 'safrozen' ),
						'type'         => 'email',
						'value'        => $posted( 'username' ),
						'autocomplete' => 'username',
						'inputmode'    => 'email',
						'rule'         => 'email',
					)
				);
				echo safrozen_form_field(
					array(
						'id'           => 'password',
						'label'        => __( 'Mot de passe', 'safrozen' ),
						'type'         => 'password',
						'autocomplete' => 'current-password',
						'message'      => __( 'Saisissez votre mot de passe.', 'safrozen' ),
					)
				);
				// phpcs:enable
				?>
				<?php do_action( 'woocommerce_login_form' ); ?>
				<div class="auth-form__row">
					<label class="check">
						<input name="rememberme" type="checkbox" id="rememberme" value="forever" checked>
						<?php esc_html_e( 'Rester connecté', 'safrozen' ); ?>
					</label>
					<a class="link auth__lost" href="<?php echo esc_url( wp_lostpassword_url() ); ?>"><?php esc_html_e( 'Mot de passe oublié ?', 'safrozen' ); ?></a>
				</div>
				<?php wp_nonce_field( 'woocommerce-login', 'woocommerce-login-nonce' ); ?>
				<?php if ( $redirect ) : ?>
					<input type="hidden" name="redirect" value="<?php echo esc_url( $redirect ); ?>">
				<?php endif; ?>
				<button type="submit" class="btn-chip" name="login" value="<?php esc_attr_e( 'Se connecter', 'safrozen' ); ?>" data-busy="<?php esc_attr_e( 'Connexion…', 'safrozen' ); ?>">
					<?php esc_html_e( 'Se connecter', 'safrozen' ); ?>
					<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</button>
				<?php do_action( 'woocommerce_login_form_end' ); ?>
			</form>
			<?php if ( $can_register ) : ?>
				<p class="auth-card__switch">
					<?php esc_html_e( 'Pas encore de compte ?', 'safrozen' ); ?>
					<a class="link auth-card__toggle" href="#inscription" data-auth-to="register"><?php esc_html_e( 'Créer un compte', 'safrozen' ); ?></a>
				</p>
			<?php endif; ?>
		</div>

		<?php if ( $can_register ) : ?>
			<div class="auth-card__pane auth-card__pane--register" id="inscription">
				<form class="auth-form woocommerce-form woocommerce-form-register register" method="post" novalidate data-validate aria-labelledby="register-title" <?php do_action( 'woocommerce_register_form_tag' ); ?>>
					<h2 class="panel__title" id="register-title" tabindex="-1"><?php esc_html_e( 'Créer un compte', 'safrozen' ); ?></h2>
					<div data-error-summary></div>
					<?php do_action( 'woocommerce_register_form_start' ); ?>
					<?php
					// phpcs:disable WordPress.Security.EscapeOutput
					if ( 'no' === get_option( 'woocommerce_registration_generate_username' ) ) {
						echo safrozen_form_field(
							array(
								'id'           => 'reg_username',
								'name'         => 'username',
								'label'        => __( 'Nom d’utilisateur', 'safrozen' ),
								'value'        => $posted( 'username' ),
								'autocomplete' => 'username',
								'message'      => __( 'Saisissez un nom d’utilisateur.', 'safrozen' ),
							)
						);
					}
					echo safrozen_form_field(
						array(
							'id'           => 'reg_email',
							'name'         => 'email',
							'label'        => __( 'Adresse e-mail', 'safrozen' ),
							'type'         => 'email',
							'value'        => $posted( 'email' ) ?: $invited,
							'autocomplete' => 'email',
							'inputmode'    => 'email',
							'rule'         => 'email',
						)
					);
					if ( 'no' === get_option( 'woocommerce_registration_generate_password' ) ) {
						echo safrozen_form_field(
							array(
								'id'           => 'reg_password',
								'name'         => 'password',
								'label'        => __( 'Mot de passe', 'safrozen' ),
								'type'         => 'password',
								'autocomplete' => 'new-password',
								/* translators: %d: minimum length */
								'help'         => sprintf( __( 'Au moins %d caractères.', 'safrozen' ), SAFROZEN_MIN_PASSWORD ),
								'rule'         => 'password',
								'attrs'        => array( 'data-min' => SAFROZEN_MIN_PASSWORD ),
							)
						);
					} else {
						echo '<p class="field__help">' . esc_html__( 'Vous recevrez par e-mail un lien pour choisir votre mot de passe.', 'safrozen' ) . '</p>';
					}
					// phpcs:enable
					?>
					<?php do_action( 'woocommerce_register_form' ); ?>
					<p class="field__help">
						<?php esc_html_e( 'Vos données servent à traiter vos commandes et à gérer votre compte, comme décrit dans notre', 'safrozen' ); ?>
						<?php if ( $privacy ) : ?>
							<a class="link" href="<?php echo esc_url( $privacy ); ?>"><?php esc_html_e( 'politique de confidentialité', 'safrozen' ); ?></a>.
						<?php else : ?>
							<?php esc_html_e( 'politique de confidentialité', 'safrozen' ); ?>.
						<?php endif; ?>
					</p>
					<?php wp_nonce_field( 'woocommerce-register', 'woocommerce-register-nonce' ); ?>
					<button type="submit" class="btn-chip" name="register" value="<?php esc_attr_e( 'Créer mon compte', 'safrozen' ); ?>" data-busy="<?php esc_attr_e( 'Création…', 'safrozen' ); ?>">
						<?php esc_html_e( 'Créer mon compte', 'safrozen' ); ?>
						<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					</button>
					<?php do_action( 'woocommerce_register_form_end' ); ?>
				</form>
				<p class="auth-card__switch">
					<?php esc_html_e( 'Déjà client ?', 'safrozen' ); ?>
					<a class="link auth-card__toggle" href="#connexion" data-auth-to="login"><?php esc_html_e( 'Se connecter', 'safrozen' ); ?></a>
				</p>
			</div>
		<?php endif; ?>
	</div>

	<div class="auth-card__art" aria-hidden="true">
		<?php foreach ( $can_register ? $art : array( 'login' => $art['login'] ) as $key => $a ) : ?>
			<?php
			$product = get_page_by_path( $a['product'], OBJECT, 'product' );
			$image   = safrozen_source_image( $a['image'] );
			?>
			<figure class="auth-art auth-art--<?php echo esc_attr( $key ); ?>" style="<?php echo esc_attr( $product ? safrozen_field_style( safrozen_product_look( $product->ID ) ) : '' ); ?>">
				<div class="auth-art__texture"></div>
				<div class="auth-art__media">
					<?php
					if ( $image ) {
						echo wp_get_attachment_image( $image, 'full', false, array( 'class' => 'auth-art__photo', 'alt' => '', 'loading' => 'login' === $key ? 'eager' : 'lazy', 'decoding' => 'async', 'sizes' => '(min-width: 900px) 50vw, 100vw' ) );
					}
					?>
					<?php if ( $a['badge'] ) : ?>
						<?php // Static "±20 MIN" in the photo's empty "Ready in" disc (the Benefits dial's centre, §7). ?>
						<span class="auth-art__badge">
							<span class="auth-art__value">
								<span class="auth-art__sign">
									<span>+</span>
									<span>−</span>
								</span>
								20
							</span>
							<span class="auth-art__unit">MIN</span>
						</span>
					<?php endif; ?>
				</div>
				<figcaption>
					<span class="auth-art__title"><?php echo esc_html( $a['title'] ); ?></span>
					<span class="auth-art__text"><?php echo esc_html( $a['text'] ); ?></span>
				</figcaption>
			</figure>
		<?php endforeach; ?>
	</div>
</div>
<?php do_action( 'woocommerce_after_customer_login_form' ); ?>
