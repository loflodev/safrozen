<?php
/**
 * Tableau de bord (Dashboard.tsx): a greeting, the latest order's progress and
 * shortcuts to the other sections.
 *
 * @var WP_User $current_user
 * @version 4.4.0
 */

defined( 'ABSPATH' ) || exit;

$latest = wc_get_orders(
	array(
		'customer' => get_current_user_id(),
		'limit'    => 1,
		'orderby'  => 'date',
		'order'    => 'DESC',
		'status'   => array_keys( wc_get_order_statuses() ),
	)
)[0] ?? null;

$links = array(
	array( 'orders', 'box', __( 'Commandes', 'safrozen' ), __( 'Historique et suivi', 'safrozen' ) ),
	array( 'edit-address', 'truck', __( 'Adresses', 'safrozen' ), __( 'Livraison et facturation', 'safrozen' ) ),
	array( 'edit-account', 'user', __( 'Détails du compte', 'safrozen' ), __( 'Nom, e-mail, mot de passe', 'safrozen' ) ),
);
?>
<div class="dash">
	<p class="dash__hello">
		<?php
		printf(
			/* translators: %s: customer name */
			esc_html__( 'Bonjour %s. D’ici, suivez vos commandes, gérez vos adresses et modifiez votre mot de passe.', 'safrozen' ),
			'<strong>' . esc_html( $current_user->first_name ?: $current_user->display_name ) . '</strong>'
		);
		?>
	</p>

	<?php if ( $latest ) : ?>
		<section class="panel dash__latest" aria-labelledby="latest-title">
			<div class="dash__latest-head">
				<h2 class="panel__title" id="latest-title">
					<?php
					/* translators: %s: order number */
					echo esc_html( sprintf( __( 'Dernière commande, n° %s', 'safrozen' ), $latest->get_order_number() ) );
					?>
				</h2>
				<p class="dash__meta">
					<?php echo esc_html( safrozen_order_date( $latest ) ); ?> · <?php echo wp_kses_post( $latest->get_formatted_order_total() ); ?>
					<?php echo null === safrozen_order_step( $latest ) ? safrozen_status_pill( $latest ) : ''; // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</p>
			</div>
			<?php get_template_part( 'template-parts/order/status-timeline', null, array( 'order' => $latest ) ); ?>
			<a class="btn-ghost" href="<?php echo esc_url( $latest->get_view_order_url() ); ?>"><?php esc_html_e( 'Voir la commande', 'safrozen' ); ?></a>
		</section>
	<?php else : ?>
		<section class="panel dash__latest">
			<h2 class="panel__title"><?php esc_html_e( 'Pas encore de commande', 'safrozen' ); ?></h2>
			<a class="btn-chip" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">
				<?php esc_html_e( 'Découvrir nos produits', 'safrozen' ); ?>
				<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			</a>
		</section>
	<?php endif; ?>

	<ul class="dash__links">
		<?php foreach ( $links as [ $endpoint, $icon, $title, $text ] ) : ?>
			<li>
				<a class="dash__card" href="<?php echo esc_url( wc_get_account_endpoint_url( $endpoint ) ); ?>">
					<span class="dash__icon" aria-hidden="true"><?php echo safrozen_icon( $icon ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<span class="dash__card-title"><?php echo esc_html( $title ); ?></span>
					<span class="dash__card-text"><?php echo esc_html( $text ); ?></span>
				</a>
			</li>
		<?php endforeach; ?>
	</ul>
</div>
<?php
do_action( 'woocommerce_account_dashboard' );
