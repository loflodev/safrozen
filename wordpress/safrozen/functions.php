<?php
/**
 * Safrozen theme bootstrap. Styles and scripts are built by Vite into build/
 * (see wordpress/vite.config.ts); content types live in the safrozen-core plugin.
 */

defined( 'ABSPATH' ) || exit;

define( 'SAFROZEN_DIR', get_template_directory() );
define( 'SAFROZEN_URI', get_template_directory_uri() );

require SAFROZEN_DIR . '/inc/setup.php';
require SAFROZEN_DIR . '/inc/assets.php';
require SAFROZEN_DIR . '/inc/icons.php';
require SAFROZEN_DIR . '/inc/template-tags.php';
require SAFROZEN_DIR . '/inc/blocks.php';
require SAFROZEN_DIR . '/inc/forms.php';

if ( class_exists( 'WooCommerce' ) ) {
	require SAFROZEN_DIR . '/inc/woocommerce.php';
	require SAFROZEN_DIR . '/inc/account.php';
	require SAFROZEN_DIR . '/inc/checkout.php';
}
