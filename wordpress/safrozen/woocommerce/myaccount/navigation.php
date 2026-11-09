<?php
/**
 * The account's sections as pills (the current one in ink): a column from
 * 900px, a row that scrolls sideways below.
 *
 * @version 9.3.0
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_account_navigation' );
?>
<nav class="account__nav" aria-label="<?php esc_attr_e( 'Mon compte', 'safrozen' ); ?>">
	<ul>
		<?php foreach ( wc_get_account_menu_items() as $endpoint => $label ) : ?>
			<?php $current = wc_is_current_account_menu_item( $endpoint ); ?>
			<li>
				<a class="account__link<?php echo $current ? ' active' : ''; ?>" href="<?php echo esc_url( wc_get_account_endpoint_url( $endpoint ) ); ?>"<?php echo $current ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $label ); ?></a>
			</li>
		<?php endforeach; ?>
	</ul>
</nav>
<?php do_action( 'woocommerce_after_account_navigation' ); ?>
