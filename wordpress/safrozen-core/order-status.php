<?php
/**
 * Two order statuses between "En cours" and "Terminée", so the customer's
 * timeline (Reçue · Préparée · En livraison · Livrée, with Paiement after Reçue
 * for Interac orders, which wait "En attente" until set to "En cours") follows what the shop
 * does: "Préparée" once the boxes are packed, "En livraison" once they left.
 * The shop sets them from the order screen or the orders list's bulk actions.
 */

defined( 'ABSPATH' ) || exit;

const LEGIM_ORDER_STATUSES = array(
	'wc-preparee'     => 'Préparée',
	'wc-en-livraison' => 'En livraison',
);

add_action(
	'init',
	function () {
		foreach ( LEGIM_ORDER_STATUSES as $status => $label ) {
			register_post_status(
				$status,
				array(
					'label'                     => $label,
					'public'                    => false,
					'exclude_from_search'       => false,
					'show_in_admin_all_list'    => true,
					'show_in_admin_status_list' => true,
					'label_count'               => array(
						'singular' => $label . ' <span class="count">(%s)</span>',
						'plural'   => $label . ' <span class="count">(%s)</span>',
						'context'  => null,
						'domain'   => 'safrozen-core',
					),
				)
			);
		}
	}
);

// In the status list, right after "En cours".
add_filter(
	'wc_order_statuses',
	function ( array $statuses ) {
		$out = array();
		foreach ( $statuses as $key => $label ) {
			$out[ $key ] = $label;
			if ( 'wc-processing' === $key ) {
				foreach ( LEGIM_ORDER_STATUSES as $status => $ours ) {
					$out[ $status ] = $ours;
				}
			}
		}
		return $out;
	}
);

// Paid orders: they count in reports and the customer can't pay them again.
add_filter( 'woocommerce_order_is_paid_statuses', fn( array $s ) => array_merge( $s, array( 'preparee', 'en-livraison' ) ) );

// Bulk actions on the orders list (HPOS and legacy screens).
foreach ( array( 'bulk_actions-woocommerce_page_wc-orders', 'bulk_actions-edit-shop_order' ) as $hook ) {
	add_filter(
		$hook,
		function ( array $actions ) {
			foreach ( LEGIM_ORDER_STATUSES as $status => $label ) {
				/* translators: %s: order status */
				$actions[ 'mark_' . substr( $status, 3 ) ] = sprintf( __( 'Changer l’état en %s', 'safrozen-core' ), mb_strtolower( $label ) );
			}
			return $actions;
		}
	);
}
