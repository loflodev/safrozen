<?php
/**
 * WooCommerce success notices as the theme's .notice / notice--success (CLAUDE.md §17).
 *
 * @var array $notices Each with 'notice' (HTML) and 'data'.
 */

defined( 'ABSPATH' ) || exit;

if ( ! $notices ) {
	return;
}
?>
<div class="notice notice--success" role="status">
	<?php foreach ( $notices as $notice ) : ?>
		<p<?php echo wc_get_notice_data_attr( $notice ); // phpcs:ignore WordPress.Security.EscapeOutput ?>><?php echo wc_kses_notice( $notice['notice'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
	<?php endforeach; ?>
</div>
