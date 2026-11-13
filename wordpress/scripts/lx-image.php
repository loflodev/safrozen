<?php
/**
 * The media import shared by the import scripts: an image from the React
 * app's public/images, imported once and found again by its file name.
 */

defined( 'ABSPATH' ) || exit;

require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

/** Imports an image once (keyed by file name) and returns its attachment ID. */
function lx_image( string $path, string $alt = '' ): int {
	$source = basename( $path );
	$found  = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'meta_key'    => '_lx_source',
			'meta_value'  => $source,
			'fields'      => 'ids',
		)
	);
	if ( $found ) {
		return (int) $found[0];
	}
	$tmp = wp_tempnam( $source );
	copy( $path, $tmp );
	$name = str_replace( '&', 'and', $source );
	$id   = media_handle_sideload( array( 'name' => $name, 'tmp_name' => $tmp ), 0 );
	if ( is_wp_error( $id ) ) {
		WP_CLI::error( "$source: " . $id->get_error_message() );
	}
	update_post_meta( $id, '_wp_attachment_image_alt', $alt );
	update_post_meta( $id, '_lx_source', $source );
	WP_CLI::log( "image $source → $id" );
	return (int) $id;
}
