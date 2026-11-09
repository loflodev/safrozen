<?php
/**
 * Fills the "Points de vente" posts (CPT boutique) from stores.json (exported
 * from the React app's src/shop/stores.ts by `pnpm wp:stores`): one post per
 * store, keyed by its id, with its ACF fields. Stores no longer in the file go
 * to the trash. Safe to re-run. import-landing.php runs it at the end.
 *
 * Run: wp eval-file wordpress/scripts/import-stores.php
 */

defined( 'ABSPATH' ) || exit;

$stores = json_decode( (string) file_get_contents( __DIR__ . '/stores.json' ), true );
if ( ! is_array( $stores ) ) {
	WP_CLI::error( 'stores.json is missing or invalid: run pnpm wp:stores.' );
}

$kept = array();
foreach ( $stores as $store ) {
	$existing = get_posts(
		array(
			'post_type'      => 'boutique',
			'name'           => $store['id'],
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	$id = wp_insert_post(
		wp_slash(
			array(
				'ID'          => $existing[0] ?? 0,
				'post_type'   => 'boutique',
				'post_name'   => $store['id'],
				'post_title'  => $store['name'],
				'post_status' => 'publish',
			)
		),
		true
	);
	if ( is_wp_error( $id ) ) {
		WP_CLI::error( "store {$store['id']}: " . $id->get_error_message() );
	}
	foreach ( array( 'address', 'city', 'postcode', 'phone', 'hours', 'lat', 'lng' ) as $name ) {
		$value = $store[ $name ] ?? '';
		function_exists( 'update_field' ) ? update_field( "field_sf_boutique_$name", $value, $id ) : update_post_meta( $id, $name, $value );
	}
	$kept[] = (int) $id;
}

$stale = get_posts(
	array(
		'post_type'      => 'boutique',
		'post_status'    => 'any',
		'posts_per_page' => -1,
		'fields'         => 'ids',
		'post__not_in'   => $kept,
	)
);
foreach ( $stale as $id ) {
	wp_trash_post( $id );
}

WP_CLI::log( sprintf( 'stores: %d imported, %d trashed', count( $kept ), count( $stale ) ) );
