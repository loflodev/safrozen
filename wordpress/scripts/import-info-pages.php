<?php
/**
 * Fills the information pages from info-pages.json (exported from the React app's
 * src/shop/pages.ts by `pnpm wp:pages`): title, blocks, the "Page d'information"
 * template and its ACF fields. Also sets the shop's contact details and privacy
 * officer (Réglages Safrozen) and the footer's legal menu. Safe to re-run; it
 * overwrites these pages' content. import-landing.php runs it at the end.
 *
 * Run: wp eval-file wordpress/scripts/import-info-pages.php
 */

defined( 'ABSPATH' ) || exit;

$pages = json_decode( (string) file_get_contents( __DIR__ . '/info-pages.json' ), true );
if ( ! is_array( $pages ) ) {
	WP_CLI::error( 'info-pages.json is missing or invalid: run pnpm wp:pages.' );
}

/** An ACF field when ACF is on, else the raw meta (ACF reads it back the same way). */
function lxi_field( string $name, $value, $post_id ): void {
	if ( function_exists( 'update_field' ) ) {
		update_field( "field_sf_{$name}", $value, $post_id );
		return;
	}
	update_post_meta( $post_id, preg_replace( '/^[a-z]+_/', '', $name ), $value );
}

function lxi_text( string $text ): string {
	return nl2br( esc_html( $text ), false );
}

function lxi_paragraph( string $text ): string {
	return "<!-- wp:paragraph -->\n<p>" . lxi_text( $text ) . "</p>\n<!-- /wp:paragraph -->";
}

function lxi_list( array $items ): string {
	$lis = array_map( fn( $li ) => "<!-- wp:list-item -->\n<li>" . lxi_text( $li ) . "</li>\n<!-- /wp:list-item -->", $items );
	return "<!-- wp:list -->\n<ul class=\"wp-block-list\">" . implode( "\n", $lis ) . "</ul>\n<!-- /wp:list -->";
}

function lxi_body( array $blocks ): array {
	return array_map( fn( $b ) => is_array( $b ) ? lxi_list( $b ) : lxi_paragraph( $b ), $blocks );
}

/** A page's sections as core blocks; the FAQ's as Details blocks (the first one open). */
function lxi_content( array $page ): string {
	$out = array();
	foreach ( $page['sections'] as $i => $section ) {
		$heading = $section['heading'] ?? '';
		if ( 'faq' === $page['slug'] ) {
			$attrs = 0 === $i ? ' {"showContent":true}' : '';
			$open  = 0 === $i ? ' open' : '';
			$out[] = "<!-- wp:details$attrs -->\n<details class=\"wp-block-details\"$open><summary>" . esc_html( $heading ) . "</summary>"
				. implode( "\n\n", lxi_body( $section['body'] ) ) . "</details>\n<!-- /wp:details -->";
			continue;
		}
		if ( $heading ) {
			$out[] = "<!-- wp:heading -->\n<h2 class=\"wp-block-heading\">" . esc_html( $heading ) . "</h2>\n<!-- /wp:heading -->";
		}
		array_push( $out, ...lxi_body( $section['body'] ) );
	}
	return implode( "\n\n", $out );
}

// The French-law "Mentions légales" page becomes the terms of use, keeping its ID.
$old = get_page_by_path( 'mentions-legales' );
if ( $old && ! get_page_by_path( 'conditions-utilisation' ) ) {
	wp_update_post( array( 'ID' => $old->ID, 'post_name' => 'conditions-utilisation' ) );
}

$ids = array();
foreach ( $pages as $page ) {
	$found = get_page_by_path( $page['slug'] );
	$post  = array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_name'    => $page['slug'],
		'post_title'   => $page['title'],
		'post_content' => lxi_content( $page ),
	);
	$id = $found ? wp_update_post( array( 'ID' => $found->ID ) + $post ) : wp_insert_post( $post );
	update_post_meta( $id, '_wp_page_template', 'page-info.php' );
	lxi_field( 'info_lede', $page['lede'] ?? '', $id );
	lxi_field( 'info_updated', isset( $page['updated'] ) ? str_replace( '-', '', $page['updated'] ) : '', $id );
	lxi_field( 'info_contact_card', ! empty( $page['contact'] ) ? 1 : 0, $id );
	lxi_field( 'info_officer', ! empty( $page['officer'] ) ? 1 : 0, $id );
	$ids[ $page['slug'] ] = $id;
	WP_CLI::log( "page {$page['slug']} → $id" );
}

// Contact details and privacy officer (TODO: the street address and the officer's name).
$privacy = array_values( array_filter( $pages, fn( $p ) => 'confidentialite' === $p['slug'] ) )[0] ?? array();
$options = array(
	'contact_address'      => 'Québec, Canada H1L 3A9',
	'contact_phone'        => '+1 (438) 969 8712',
	'contact_email'        => 'infos@safrozen.com',
	'copyright_holder'     => 'Les Aliments Safrozen Foods',
);
// The officer is set in Réglages Safrozen; only pages.ts's officer, when it has one, overrides it.
if ( ! empty( $privacy['officer'] ) ) {
	$options['privacy_officer_name'] = $privacy['officer']['name'];
	$options['privacy_officer_role'] = $privacy['officer']['role'];
}
foreach ( $options as $name => $value ) {
	function_exists( 'update_field' ) ? update_field( "field_sf_options_$name", $value, 'option' ) : update_option( "options_$name", $value );
}

update_option( 'wp_page_for_privacy_policy', $ids['confidentialite'] );
update_option( 'woocommerce_terms_page_id', $ids['cgv'] );

// Footer legal menu: terms of use, terms of sale, privacy.
$name = 'Pied de page : liens légaux';
$menu = wp_get_nav_menu_object( $name );
if ( $menu ) {
	wp_delete_nav_menu( $menu->term_id );
}
$menu_id = wp_create_nav_menu( $name );
foreach ( array( array( 'Conditions d’utilisation', 'conditions-utilisation' ), array( 'CGV', 'cgv' ), array( 'Confidentialité', 'confidentialite' ) ) as $i => [ $label, $slug ] ) {
	wp_update_nav_menu_item(
		$menu_id,
		0,
		array(
			'menu-item-title'     => $label,
			'menu-item-status'    => 'publish',
			'menu-item-position'  => $i + 1,
			'menu-item-type'      => 'post_type',
			'menu-item-object'    => 'page',
			'menu-item-object-id' => $ids[ $slug ],
		)
	);
}
$locations                 = get_theme_mod( 'nav_menu_locations', array() );
$locations['footer-legal'] = $menu_id;
set_theme_mod( 'nav_menu_locations', $locations );

// Menu items without a label of their own follow the page title; the footer keeps
// the short "Retours" for the returns page (Footer.tsx).
foreach ( (array) get_posts( array( 'post_type' => 'nav_menu_item', 'numberposts' => -1, 'meta_key' => '_menu_item_object_id', 'meta_value' => $ids['retours'] ) ) as $item ) {
	wp_update_post( array( 'ID' => $item->ID, 'post_title' => 'Retours' ) );
}

WP_CLI::success( 'Information pages imported.' );
