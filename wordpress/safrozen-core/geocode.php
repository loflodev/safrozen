<?php
/**
 * Postal code → coordinates for the store locator: GET /wp-json/legim/v1/geocode?code=J5Y3P9
 * answers {lat, lng}, or 404 when the code is unknown. With a key in Réglages Safrozen
 * (google_geocoding_key) it asks Google's Geocoding API, which knows every Canadian
 * code; without one, OpenStreetMap's Nominatim (many codes missing). The key stays
 * on the server. Answers are cached (a month, a day for unknown codes, per
 * provider), and each visitor gets at most 30 uncached look-ups per 10 minutes, so
 * the key's quota can't be drained through the site.
 */

defined( 'ABSPATH' ) || exit;

const LEGIM_GEOCODE_LIMIT = 30;

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'legim/v1',
			'/geocode',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => 'legim_geocode_route',
				'args'                => array(
					'code' => array(
						'required'          => true,
						'type'              => 'string',
						'validate_callback' => fn( $v ) => is_string( $v ) && preg_match( '/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/', trim( $v ) ),
					),
				),
			)
		);
	}
);

function legim_geocode_key(): string {
	return trim( (string) ( function_exists( 'get_field' ) ? get_field( 'google_geocoding_key', 'option' ) : get_option( 'options_google_geocoding_key' ) ) );
}

/** @return WP_REST_Response|WP_Error */
function legim_geocode_route( WP_REST_Request $request ) {
	$raw   = strtoupper( preg_replace( '/\s/', '', (string) $request['code'] ) );
	$code  = substr( $raw, 0, 3 ) . ' ' . substr( $raw, 3 );
	$key   = legim_geocode_key();
	$cache = 'legim_geo_' . ( $key ? 'g' : 'o' ) . '_' . $raw;

	$point = get_transient( $cache );
	if ( false === $point ) {
		$ip    = 'legim_geo_ip_' . md5( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		$count = (int) get_transient( $ip );
		if ( $count >= LEGIM_GEOCODE_LIMIT ) {
			return new WP_Error( 'too_many', 'Trop de recherches. Réessayez dans quelques minutes.', array( 'status' => 429 ) );
		}
		set_transient( $ip, $count + 1, 10 * MINUTE_IN_SECONDS );

		$point = $key ? legim_geocode_google( $code, $key ) : legim_geocode_nominatim( $code );
		if ( is_wp_error( $point ) ) {
			return $point;
		}
		set_transient( $cache, $point ?? 'none', $point ? MONTH_IN_SECONDS : DAY_IN_SECONDS );
	}

	if ( ! is_array( $point ) ) {
		return new WP_Error( 'not_found', 'Code postal inconnu.', array( 'status' => 404 ) );
	}
	return new WP_REST_Response( $point );
}

/** @return array{lat: float, lng: float}|null|WP_Error */
function legim_geocode_google( string $code, string $key ) {
	$url = 'https://maps.googleapis.com/maps/api/geocode/json?' . http_build_query(
		array(
			'components' => "postal_code:$code|country:CA",
			'language'   => 'fr',
			'key'        => $key,
		)
	);
	$body = legim_geocode_fetch( $url );
	if ( is_wp_error( $body ) ) {
		return $body;
	}
	$status = $body['status'] ?? '';
	if ( 'ZERO_RESULTS' === $status ) {
		return null;
	}
	if ( 'OK' !== $status ) {
		// REQUEST_DENIED (bad or restricted key), OVER_QUERY_LIMIT…: the reason goes to the log, not the visitor.
		error_log( "legim geocode: Google $status " . ( $body['error_message'] ?? '' ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions
		return new WP_Error( 'geocode_failed', 'La recherche ne répond pas.', array( 'status' => 502 ) );
	}
	$location = $body['results'][0]['geometry']['location'] ?? null;
	return $location ? array( 'lat' => (float) $location['lat'], 'lng' => (float) $location['lng'] ) : null;
}

/** @return array{lat: float, lng: float}|null|WP_Error */
function legim_geocode_nominatim( string $code ) {
	$url  = 'https://nominatim.openstreetmap.org/search?' . http_build_query(
		array(
			'postalcode'   => $code,
			'countrycodes' => 'ca',
			'format'       => 'jsonv2',
			'limit'        => 1,
		)
	);
	$body = legim_geocode_fetch( $url );
	if ( is_wp_error( $body ) ) {
		return $body;
	}
	$hit = $body[0] ?? null;
	return $hit ? array( 'lat' => (float) $hit['lat'], 'lng' => (float) $hit['lon'] ) : null;
}

/** @return array|WP_Error The decoded JSON body. */
function legim_geocode_fetch( string $url ) {
	$response = wp_remote_get(
		$url,
		array(
			'timeout'    => 8,
			// Nominatim's policy asks for an identifying user agent.
			'user-agent' => 'Legim Express (' . home_url() . ')',
			'headers'    => array( 'Accept-Language' => 'fr-CA' ),
		)
	);
	$body = is_wp_error( $response ) ? null : json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $body ) ) {
		return new WP_Error( 'geocode_failed', 'La recherche ne répond pas.', array( 'status' => 502 ) );
	}
	return $body;
}
