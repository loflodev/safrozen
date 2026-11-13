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

/** A value from the "Réglages Safrozen" options page (safrozen-core). */
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

/**
 * Weight, calories and fibres of a product, as label => value. The labels are
 * fixed here; the values are the product's weight / portions / ready fields
 * ("300 g / portion", "80", "8 g"). An empty field is left out.
 */
function safrozen_product_specs( int $product_id ): array {
	return array_filter(
		array_map(
			fn( $value ) => trim( (string) $value ),
			array(
				__( 'Poids', 'safrozen' )    => safrozen_field( 'weight', $product_id ),
				__( 'Calories', 'safrozen' ) => safrozen_field( 'portions', $product_id ),
				__( 'Fibres', 'safrozen' )   => safrozen_field( 'ready', $product_id ),
			)
		)
	);
}

/** The specs as one line each, label then value ("Calories 80"). */
function safrozen_spec_lines( int $product_id ): array {
	$specs = safrozen_product_specs( $product_id );
	return array_map( fn( $label, $value ) => "$label $value", array_keys( $specs ), $specs );
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
	// WebP at 128 and 256 (logo.png is their 257px source); callers pass `sizes`.
	$dir  = SAFROZEN_URI . '/assets/images/';
	$html = sprintf(
		'<img src="%1$s" srcset="%2$s 128w, %1$s 256w" width="257" height="257"',
		esc_url( $dir . 'logo-256.webp' ),
		esc_url( $dir . 'logo-128.webp' )
	);
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

/** The 4:3 panel's width in each place it's shown (measured), for `sizes`: media query => length. */
const SAFROZEN_ART_SLOTS = array(
	'card'    => array(
		'(min-width: 1367px)' => '387px',
		'(min-width: 1100px)' => '31.6vw - 45px',
		'(min-width: 600px)'  => '47.5vw - 2.75rem',
		''                    => '95vw - 2.5rem',
	),
	'product' => array(
		'(min-width: 1357px)' => '720px',
		'(min-width: 900px)'  => '56vw - 40px',
		''                    => '95vw - 1rem',
	),
	'cart'    => array(
		'(min-width: 900px)' => '128px',
		''                   => '96px',
	),
);

/**
 * A product on its hero field panel with the line texture (ProductArt.tsx):
 * a box is cropped 4:3 from its 2:1 canvas, a pack photo sits whole.
 * $slot is a SAFROZEN_ART_SLOTS key.
 */
function safrozen_product_art( WC_Product $product, string $class = '', bool $eager = false, string $slot = 'card' ): string {
	$look = safrozen_product_look( $product->get_id() );
	// A box covers the 4:3 panel (a 2:1 box is drawn 1.5× its width), a photo is contained in it.
	$meta  = wp_get_attachment_metadata( $product->get_image_id() );
	$ratio = empty( $meta['height'] ) ? 4 / 3 : $meta['width'] / $meta['height'];
	$scale = 'photo' === $look['kind'] ? min( 1, 0.75 * $ratio ) : max( 1, 0.75 * $ratio );
	$sizes = array();
	foreach ( SAFROZEN_ART_SLOTS[ $slot ] as $media => $length ) {
		$sizes[] = trim( sprintf( '%s calc((%s) * %.2F)', $media, $length, $scale ) );
	}
	$image = wp_get_attachment_image(
		$product->get_image_id(),
		'full',
		false,
		array(
			/* translators: %s: product name */
			'alt'      => sprintf( __( 'La boîte %s', 'safrozen' ), $product->get_name() ),
			'sizes'    => implode( ', ', $sizes ),
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

/**
 * The "Points de vente" posts (safrozen-core) as plain rows, sorted by name: the
 * store locator's cards and map data, and its schema (inc/seo.php).
 *
 * @return array<array{id: string, name: string, address: string, city: string, postcode: string, phone: string, hours: string, lat: float, lng: float}>
 */
function safrozen_stores(): array {
	return array_map(
		fn( WP_Post $post ) => array(
			'id'       => $post->post_name,
			'name'     => get_the_title( $post ),
			'address'  => (string) safrozen_field( 'address', $post->ID ),
			'city'     => (string) safrozen_field( 'city', $post->ID ),
			'postcode' => (string) safrozen_field( 'postcode', $post->ID ),
			'phone'    => (string) safrozen_field( 'phone', $post->ID ),
			'hours'    => (string) safrozen_field( 'hours', $post->ID ),
			'lat'      => (float) safrozen_field( 'lat', $post->ID ),
			'lng'      => (float) safrozen_field( 'lng', $post->ID ),
		),
		get_posts(
			array(
				'post_type'      => 'boutique',
				'posts_per_page' => -1,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		)
	);
}

/** A product's category for its crumbs: the first one that isn't Woo's default ("Non classé"). */
function safrozen_product_category( int $product_id ): ?WP_Term {
	$terms = get_the_terms( $product_id, 'product_cat' );
	if ( ! is_array( $terms ) ) {
		return null;
	}
	$terms = array_filter( $terms, fn( $t ) => (int) get_option( 'default_product_cat' ) !== $t->term_id );
	return array_values( $terms )[0] ?? null;
}
