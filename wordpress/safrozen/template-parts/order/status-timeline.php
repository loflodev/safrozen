<?php
/**
 * Order progress (StatusTimeline.tsx): Reçue · Préparée · En livraison · Livrée,
 * with Paiement after Reçue for an Interac order. The steps reached are in the
 * chip gradient, the current one with its line; a payment still awaited shows
 * a clock instead of a check.
 *
 * @var array $args { @type WC_Order $order }
 */

defined( 'ABSPATH' ) || exit;

$order = $args['order'];
$at    = safrozen_order_step( $order );
$wait  = safrozen_awaits_transfer( $order );
if ( null === $at ) {
	return;
}
?>
<ol class="timeline" style="--steps: <?php echo count( safrozen_status_steps( $order ) ); ?>">
	<?php foreach ( safrozen_status_steps( $order ) as $i => [ $label, $detail ] ) : ?>
		<?php
		$state = $i < $at ? 'done' : ( $i === $at ? 'current' : 'todo' );
		$icon  = 'todo' === $state ? '' : ( 'current' === $state && $wait ? 'clock' : 'check' );
		?>
		<li class="timeline__step" data-state="<?php echo esc_attr( $state ); ?>"<?php echo 'current' === $state ? ' aria-current="step"' : ''; ?><?php echo 'clock' === $icon ? ' data-waiting' : ''; ?>>
			<span class="timeline__dot" aria-hidden="true"><?php echo $icon ? safrozen_icon( $icon ) : ''; // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
			<span class="timeline__label">
				<?php echo esc_html( $label ); ?>
				<span class="visually-hidden"><?php echo esc_html( 'todo' === $state ? __( ', à venir', 'safrozen' ) : ( 'current' === $state ? __( ', en cours', 'safrozen' ) : __( ', terminé', 'safrozen' ) ) ); ?></span>
			</span>
			<?php if ( 'current' === $state ) : ?>
				<span class="timeline__detail"><?php echo esc_html( $detail ); ?></span>
			<?php endif; ?>
		</li>
	<?php endforeach; ?>
</ol>
