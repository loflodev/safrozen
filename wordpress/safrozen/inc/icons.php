<?php
/**
 * Inline SVG icons (the React reference's icons.tsx). No icon library.
 */

defined( 'ABSPATH' ) || exit;

/**
 * @param string $name  Icon name (see the list below).
 * @param array  $attrs Extra attributes, e.g. width, height, class.
 */
function safrozen_icon( string $name, array $attrs = array() ): string {
	// [ filled?, inner markup ]
	static $icons = array(
		'instagram'    => array( false, '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>' ),
		'facebook'     => array( true, '<path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.1H7.7v3h2.6V21h3.2Z"/>' ),
		'tiktok'       => array( true, '<path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7 7 0 0 1-3.8-1.2v6.1A5.7 5.7 0 1 1 11 9v3.1a2.7 2.7 0 1 0 2.6 2.7V3h3Z"/>' ),
		'cart'         => array( false, '<path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>' ),
		'arrow-right'  => array( false, '<path d="M5 12h14M13 6l6 6-6 6"/>' ),
		'menu'         => array( false, '<path d="M4 7h16M4 12h16M4 17h16"/>' ),
		'close'        => array( false, '<path d="M6 6l12 12M18 6 6 18"/>' ),
		'snowflake'    => array( false, '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>' ),
		'leaf'         => array( false, '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19c3-4 6-7 10-9"/>' ),
		'timer'        => array( false, '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 3h5"/>' ),
		'star'         => array( true, '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z"/>' ),
		'pin'          => array( false, '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>' ),
		'phone'        => array( false, '<path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z"/>' ),
		'mail'         => array( false, '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>' ),
		'clock'        => array( false, '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>' ),
		'user'         => array( false, '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>' ),
		'minus'        => array( false, '<path d="M5 12h14"/>' ),
		'plus'         => array( false, '<path d="M12 5v14M5 12h14"/>' ),
		'check'        => array( false, '<path d="m5 12.5 4.5 4.5L19 7.5"/>' ),
		'trash'        => array( false, '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>' ),
		'chevron-down' => array( false, '<path d="m6 9 6 6 6-6"/>' ),
		'truck'        => array( false, '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>' ),
		'box'          => array( false, '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9"/>' ),
		'sort'         => array( false, '<path d="M4 6h9M4 12h6M4 18h3M17 5v14M14 16l3 3 3-3"/>' ),
		'home'         => array( false, '<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"/>' ),
		'book'         => array( false, '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5ZM12 6.5v13"/>' ),
		'question'     => array( false, '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.9.7c0 1.8-2.5 2.2-2.5 3.8"/><path d="M12 17h.01"/>' ),
		'logout'       => array( false, '<path d="M14 4H6v16h8M10 12h10M17 8.5l3.5 3.5-3.5 3.5"/>' ),
	);
	if ( ! isset( $icons[ $name ] ) ) {
		return '';
	}
	[ $filled, $inner ] = $icons[ $name ];

	$attrs = array_merge(
		array(
			'width'       => 20,
			'height'      => 20,
			'viewBox'     => '0 0 24 24',
			'aria-hidden' => 'true',
			'focusable'   => 'false',
		),
		$filled ? array( 'fill' => 'currentColor' ) : array(
			'fill'            => 'none',
			'stroke'          => 'currentColor',
			'stroke-width'    => '1.8',
			'stroke-linecap'  => 'round',
			'stroke-linejoin' => 'round',
		),
		$attrs
	);
	$html = '';
	foreach ( $attrs as $key => $value ) {
		$html .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( (string) $value ) );
	}
	return "<svg$html>$inner</svg>";
}

/** Icons an editor can pick for a Benefits card. */
function safrozen_icon_choices(): array {
	return array(
		'snowflake' => __( 'Flocon (congelé)', 'safrozen' ),
		'leaf'      => __( 'Feuille (écologique)', 'safrozen' ),
		'timer'     => __( 'Minuteur (rapide)', 'safrozen' ),
		'truck'     => __( 'Camion (livraison)', 'safrozen' ),
		'box'       => __( 'Boîte', 'safrozen' ),
		'star'      => __( 'Étoile', 'safrozen' ),
	);
}
