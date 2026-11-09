<?php
/**
 * Contact Form 7: the theme writes the forms' markup itself (newsletter,
 * contact), so CF7 must not wrap it in paragraphs.
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'wpcf7_autop_or_not', '__return_false' );

// CF7's own stylesheet draws borders and colours of its own; the theme's apply instead.
add_filter( 'wpcf7_load_css', '__return_false' );

/** The CF7 form with this title (the import script creates them), or 0. */
function safrozen_form_id( string $title ): int {
	$ids = get_posts(
		array(
			'post_type'   => 'wpcf7_contact_form',
			'title'       => $title,
			'numberposts' => 1,
			'fields'      => 'ids',
		)
	);
	return $ids ? (int) $ids[0] : 0;
}
