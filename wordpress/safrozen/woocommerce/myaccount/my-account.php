<?php
/**
 * Signed in (AccountLayout.tsx): the pill nav beside the section from 900px.
 *
 * @version 3.5.0
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="account__layout">
	<?php do_action( 'woocommerce_account_navigation' ); ?>
	<div class="account__content">
		<?php do_action( 'woocommerce_account_content' ); ?>
	</div>
</div>
