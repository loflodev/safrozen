<?php
/**
 * WooCommerce error notices as the theme's .notice / notice--error (CLAUDE.md §17).
 *
 * @var array $notices Each with 'notice' (HTML) and 'data'.
 */

defined( 'ABSPATH' ) || exit;

if ( ! $notices ) {
	return;
}
?>
<div class="notice notice--error" role="alert">
	<?php foreach ( $notices as $notice ) : ?>
		<p<?php echo wc_get_notice_data_attr( $notice ); // phpcs:ignore WordPress.Security.EscapeOutput ?>><?php echo wc_kses_notice( $notice['notice'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
	<?php endforeach; ?>
</div>
