<?php
/**
 * Small helpers shared by the templates and blocks.
 */

defined( 'ABSPATH' ) || exit;

/** An ACF field, or $default when ACF is off or the field is empty. */
function safrozen_field( string $name, $post_id = false, $default = '' ) {
	if ( ! function_exists( 'get_field' ) ) {
		return $default;
	}
	$value = get_field( $name, $post_id );
	return ( null === $value || '' === $value || false === $value || array() === $value ) ? $default : $value;
}

/** A value from the "Réglages Legim" options page (safrozen-core). */
function safrozen_option( string $name, $default = '' ) {
	return safrozen_field( $name, 'option', $default );
}

/**
 * A product's look on its field panel: the five pastel stops of its hero
 * background (top to bottom), its line-texture tint and how its picture sits
 * (a 2:1 box canvas, or a photo shown whole). Set on the product (safrozen-core).
 *
 * @return array{field: string[], line: string, kind: string}
 */
function safrozen_product_look( int $product_id ): array {
	$field = array_values( array_filter( array_map( 'trim', explode( ',', (string) safrozen_field( 'field_colors', $product_id ) ) ) ) );
	$field = array_map( 'sanitize_hex_color', $field );
	if ( count( $field ) !== 5 || in_array( null, $field, true ) ) {
		// The lalo field, so a product without colours still draws a panel.
		$field = array( '#f4f9e9', '#eef5de', '#e8f2d1', '#e2efc7', '#dcebba' );
	}
	return array(
		'field' => $field,
		'line'  => sanitize_hex_color( (string) safrozen_field( 'line_color', $product_id ) ) ?: '#c9dca2',
		'kind'  => 'photo' === safrozen_field( 'image_kind', $product_id ) ? 'photo' : 'box',
	);
}

/** The look as the CSS custom properties the field panels read (--field-0..4, --field-line). */
function safrozen_field_style( array $look ): string {
	$vars = array();
	foreach ( $look['field'] as $i => $colour ) {
		$vars[] = "--field-$i:$colour";
	}
	$vars[] = '--field-line:' . $look['line'];
	return implode( ';', $vars );
}

/** Weight, portions and preparation time of a product, as label => value. */
function safrozen_product_specs( int $product_id ): array {
	return array_filter(
		array(
			__( 'Poids', 'safrozen' )    => safrozen_field( 'weight', $product_id ),
			__( 'Portions', 'safrozen' ) => safrozen_field( 'portions', $product_id ),
			__( 'Prêt en', 'safrozen' )  => safrozen_field( 'ready', $product_id ),
		)
	);
}

/** The hero's spec row for a product: its Poids, Portions and Prêt en fields, as written. */
function safrozen_hero_specs( int $product_id ): array {
	return array_values(
		array_filter(
			array(
				safrozen_field( 'weight', $product_id ),
				safrozen_field( 'portions', $product_id ),
				safrozen_field( 'ready', $product_id ),
			)
		)
	);
}

/** Social profiles from the options page; '#' until a URL is set. */
function safrozen_socials(): array {
	return array(
		array( 'label' => 'TikTok', 'icon' => 'tiktok', 'url' => safrozen_option( 'social_tiktok', '#' ) ),
		array( 'label' => 'Facebook', 'icon' => 'facebook', 'url' => safrozen_option( 'social_facebook', '#' ) ),
		array( 'label' => 'Instagram', 'icon' => 'instagram', 'url' => safrozen_option( 'social_instagram', '#' ) ),
	);
}

/** The round logo: the Customizer's site logo, else the theme's own. */
function safrozen_logo( string $class, string $alt = '', array $attrs = array() ): string {
	$id = (int) get_theme_mod( 'custom_logo' );
	$attrs = array_merge( array( 'class' => $class, 'alt' => $alt, 'decoding' => 'async' ), $attrs );
	if ( $id ) {
		return wp_get_attachment_image( $id, 'medium', false, $attrs );
	}
	$html = sprintf( '<img src="%s" width="257" height="257"', esc_url( SAFROZEN_URI . '/assets/images/logo.png' ) );
	foreach ( $attrs as $key => $value ) {
		$html .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( (string) $value ) );
	}
	return $html . '>';
}

/** Paragraphs from a plain textarea: one per blank-line-separated block. */
function safrozen_paragraphs( string $text ): array {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\R\s*\R/', $text ) ) ) );
}

/** Lines from a plain textarea: one per line. */
function safrozen_lines( string $text ): array {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\R/', $text ) ) ) );
}

/** A recipe's reading time: its ACF field, else about 200 words a minute, never less than one. */
function safrozen_reading_time( WP_Post $recipe ): string {
	$read = (string) safrozen_field( 'reading_time', $recipe->ID );
	if ( $read ) {
		return $read;
	}
	$minutes = max( 1, (int) round( str_word_count( wp_strip_all_tags( $recipe->post_content ) ) / 200 ) );
	/* translators: %d: minutes */
	return sprintf( __( '%d min de lecture', 'safrozen' ), $minutes );
}

/** The posts page (Recettes), or /recettes/ before it is set. */
function safrozen_recipes_url(): string {
	$page = (int) get_option( 'page_for_posts' );
	return $page ? get_permalink( $page ) : home_url( '/recettes/' );
}

/** Initials for a review avatar: "Jean-Robert L." → "JR". */
function safrozen_initials( string $name ): string {
	$parts = preg_split( '/[\s-]+/u', trim( $name ) );
	$initials = '';
	foreach ( $parts as $part ) {
		$initials .= mb_substr( $part, 0, 1 );
	}
	return mb_substr( $initials, 0, 2 );
}

/**
 * Breadcrumb trail (PageHeader.tsx's Crumbs): Accueil, then each crumb as
 * array( label, url ), the last one being the current page. Under 600px, with
 * two or more crumbs after Accueil, the middle ones fold into a "…" button
 * (js/crumbs.ts).
 *
 * @param array<array{0: string, 1?: string}> $crumbs
 */
function safrozen_crumbs( array $crumbs, string $class = '' ): string {
	if ( ! $crumbs ) {
		return '';
	}
	$link   = fn( array $c ) => empty( $c[1] ) ? '<span>' . esc_html( $c[0] ) . '</span>' : '<a href="' . esc_url( $c[1] ) . '">' . esc_html( $c[0] ) . '</a>';
	$middle = array_slice( $crumbs, 0, -1 );
	$last   = end( $crumbs );
	$fold   = count( $crumbs ) >= 2;
	$menu   = wp_unique_id( 'crumbs-menu-' );

	$html  = '<nav class="crumbs ' . esc_attr( $class ) . '" aria-label="' . esc_attr__( "Fil d'Ariane", 'safrozen' ) . '"' . ( $fold ? ' data-foldable' : '' ) . '><ol>';
	$html .= '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Accueil', 'safrozen' ) . '</a></li>';
	if ( $fold ) {
		$html .= '<li class="crumbs__more"><button type="button" class="crumbs__toggle" aria-expanded="false" aria-controls="' . esc_attr( $menu ) . '" aria-label="' . esc_attr__( 'Afficher le chemin complet', 'safrozen' ) . '">…</button>';
		$html .= '<ul class="crumbs__menu" id="' . esc_attr( $menu ) . '" hidden>';
		foreach ( $middle as $c ) {
			$html .= '<li>' . $link( $c ) . '</li>';
		}
		$html .= '</ul></li>';
	}
	foreach ( $middle as $c ) {
		$html .= '<li class="crumbs__mid">' . $link( $c ) . '</li>';
	}
	$html .= '<li class="crumbs__current">' . ( empty( $last[1] ) ? '<span aria-current="page">' . esc_html( $last[0] ) . '</span>' : $link( $last ) ) . '</li>';
	return $html . '</ol></nav>';
}

/**
 * A product on its hero field panel with the line texture (ProductArt.tsx):
 * a box is cropped 4:3 from its 2:1 canvas, a pack photo sits whole.
 */
function safrozen_product_art( WC_Product $product, string $class = '', bool $eager = false ): string {
	$look  = safrozen_product_look( $product->get_id() );
	$image = wp_get_attachment_image(
		$product->get_image_id(),
		'full',
		false,
		array(
			/* translators: %s: product name */
			'alt'      => sprintf( __( 'La boîte %s', 'safrozen' ), $product->get_name() ),
			'sizes'    => '(min-width: 1100px) 400px, (min-width: 600px) 50vw, 100vw',
			'loading'  => $eager ? 'eager' : 'lazy',
			'decoding' => 'async',
		)
	);
	return sprintf(
		'<div class="product-art product-art--%s %s" style="%s"><div class="product-art__texture" aria-hidden="true"></div>%s</div>',
		esc_attr( $look['kind'] ),
		esc_attr( $class ),
		esc_attr( safrozen_field_style( $look ) ),
		$image
	);
}

/**
 * The <h2> headings of an information page's rendered content, in order, as
 * array( id, label ): the anchors of its "Sur cette page" list (page-info.php).
 *
 * @return array<array{id: string, label: string}>
 */
function safrozen_info_headings( string $html ): array {
	preg_match_all( '/<h2\b[^>]*>(.*?)<\/h2>/is', $html, $matches );
	$sections = array();
	$seen     = array();
	foreach ( $matches[1] as $inner ) {
		$label = trim( wp_strip_all_tags( $inner ) );
		$id    = sanitize_title( $label ) ?: 'section';
		$base  = $id;
		for ( $n = 2; isset( $seen[ $id ] ); $n++ ) {
			$id = "$base-$n";
		}
		$seen[ $id ] = true;
		$sections[]  = array( 'id' => $id, 'label' => html_entity_decode( $label, ENT_QUOTES, 'UTF-8' ) );
	}
	return $sections;
}

/** Gives each <h2> its anchor and, when $number, its 01, 02… label (InfoPage.tsx). */
function safrozen_info_number_headings( string $html, array $sections, bool $number = true ): string {
	$i = 0;
	return preg_replace_callback(
		'/<h2\b([^>]*)>/i',
		function ( array $m ) use ( &$i, $sections, $number ) {
			$section = $sections[ $i ] ?? null;
			$index   = $i++;
			if ( ! $section ) {
				return $m[0];
			}
			$attrs = preg_replace( '/\sid="[^"]*"/', '', $m[1] );
			$open  = '<h2 id="' . esc_attr( $section['id'] ) . '"' . $attrs . '>';
			return $number ? $open . '<span class="info__num" aria-hidden="true">' . sprintf( '%02d', $index + 1 ) . '</span>' : $open;
		},
		$html
	);
}
