<?php
/**
 * Site hardening (docs/security-tasks.md): visitors can't list the site's
 * users or open author pages (S1), a login is refused after 5 failures for
 * the same name from the same address in 15 minutes (S2, wp-login.php and
 * Mon compte alike), and every front-end page sends the security headers (S4).
 */

defined( 'ABSPATH' ) || exit;

const LEGIM_LOGIN_LIMIT  = 5;
const LEGIM_LOGIN_WINDOW = 15 * MINUTE_IN_SECONDS;

/* --- Users stay private (S1) ------------------------------------------------------------------ */

// /wp/v2/users answers only people who write (the block editor's author picker).
add_filter(
	'rest_endpoints',
	function ( array $endpoints ): array {
		if ( current_user_can( 'edit_posts' ) ) {
			return $endpoints;
		}
		foreach ( array_keys( $endpoints ) as $route ) {
			if ( str_starts_with( $route, '/wp/v2/users' ) ) {
				unset( $endpoints[ $route ] );
			}
		}
		return $endpoints;
	}
);

// Author archives (and ?author=1, which would redirect to the login name) are a 404.
add_action(
	'template_redirect',
	function () {
		if ( is_author() || isset( $_GET['author'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			nocache_headers();
		}
	},
	1
);

// Embeds of a recipe don't name its author either.
add_filter(
	'oembed_response_data',
	function ( array $data ): array {
		unset( $data['author_name'], $data['author_url'] );
		return $data;
	}
);

/* --- Login attempts (S2) ---------------------------------------------------------------------- */

/** The counter for one name from one address (the e-mail or the login, as typed). */
function legim_login_key( string $username ): string {
	return 'legim_login_' . md5( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) . '|' . strtolower( trim( $username ) ) );
}

// After WordPress's own checks (20): over the limit, even the right password is refused.
add_filter(
	'authenticate',
	function ( $user, $username ) {
		$username = (string) $username;
		if ( '' === $username || (int) get_transient( legim_login_key( $username ) ) < LEGIM_LOGIN_LIMIT ) {
			return $user;
		}
		return new WP_Error( 'too_many_attempts', __( 'Trop de tentatives de connexion. Réessayez dans 15 minutes.', 'safrozen-core' ) );
	},
	30,
	2
);

add_action(
	'wp_login_failed',
	function ( $username ) {
		$key = legim_login_key( (string) $username );
		set_transient( $key, (int) get_transient( $key ) + 1, LEGIM_LOGIN_WINDOW );
	}
);

// A successful sign-in clears the counter, whether the login or the e-mail was typed.
add_action(
	'wp_login',
	function ( $login, WP_User $user ) {
		delete_transient( legim_login_key( (string) $login ) );
		delete_transient( legim_login_key( $user->user_email ) );
	},
	10,
	2
);

/* --- Headers (S4) ----------------------------------------------------------------------------- */

// No CSP yet: Square, the map tiles and the inline config need a report-only trial first.
add_action(
	'send_headers',
	function () {
		header( 'X-Content-Type-Options: nosniff' );
		header( 'X-Frame-Options: SAMEORIGIN' );
		header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		// The store locator's "Utiliser ma position" needs geolocation on the site itself.
		header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(self)' );
		if ( is_ssl() && 'production' === wp_get_environment_type() ) {
			header( 'Strict-Transport-Security: max-age=31536000' );
		}
	}
);
