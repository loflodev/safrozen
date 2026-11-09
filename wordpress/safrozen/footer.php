<?php
/**
 * The footer (CLAUDE.md §14), then the mini-cart drawer and the toast region
 * the cart script fills (js/cart.ts), then the scripts' config.
 */

defined( 'ABSPATH' ) || exit;

$wordmark = get_bloginfo( 'name' );
$phone    = safrozen_option( 'contact_phone' );
$email    = safrozen_option( 'contact_email' );
// The shop's categories that hold products, in their WooCommerce order.
$categories = taxonomy_exists( 'product_cat' ) ? get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
		'orderby'    => 'menu_order',
	)
) : array();
$col = 0;
?>
<footer id="contact" class="footer" data-reveal-on>
	<div class="footer__grid">
		<div class="footer__col footer__about" style="--i: <?php echo $col++; ?>">
			<?php echo safrozen_logo( 'footer__logo', $wordmark, array( 'loading' => 'lazy' ) ); // phpcs:ignore ?>
			<p class="footer__text"><?php echo esc_html( safrozen_option( 'footer_about' ) ); ?></p>
		</div>

		<?php if ( $categories && ! is_wp_error( $categories ) ) : ?>
			<nav class="footer__col" aria-labelledby="footer-categories" style="--i: <?php echo $col++; ?>">
				<h2 class="footer__heading" id="footer-categories"><?php esc_html_e( 'Catégories', 'safrozen' ); ?></h2>
				<ul class="footer__list">
					<?php foreach ( $categories as $category ) : ?>
						<li><a class="footer__link" href="<?php echo esc_url( get_term_link( $category ) ); ?>"><?php echo esc_html( $category->name ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</nav>
		<?php endif; ?>

		<nav class="footer__col" aria-labelledby="footer-help" style="--i: <?php echo $col++; ?>">
			<h2 class="footer__heading" id="footer-help"><?php esc_html_e( 'Aide', 'safrozen' ); ?></h2>
			<ul class="footer__list">
				<?php foreach ( safrozen_menu_items( 'footer-help' ) as $item ) : ?>
					<li><a class="footer__link" href="<?php echo esc_url( $item->url ); ?>"><?php echo esc_html( $item->title ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</nav>

		<div class="footer__col" style="--i: <?php echo $col++; ?>">
			<h2 class="footer__heading"><?php esc_html_e( 'Contact', 'safrozen' ); ?></h2>
			<address class="footer__list footer__contact">
				<?php if ( safrozen_option( 'contact_address' ) ) : ?>
					<span><?php echo safrozen_icon( 'pin' ); // phpcs:ignore ?><?php echo esc_html( safrozen_option( 'contact_address' ) ); ?></span>
				<?php endif; ?>
				<?php if ( $phone ) : ?>
					<a class="footer__link" href="<?php echo esc_url( 'tel:' . preg_replace( '/[^\d+]/', '', $phone ) ); ?>"><?php echo safrozen_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( $phone ); ?></a>
				<?php endif; ?>
				<?php if ( $email ) : ?>
					<a class="footer__link" href="<?php echo esc_url( 'mailto:' . antispambot( $email ) ); ?>"><?php echo safrozen_icon( 'mail' ); // phpcs:ignore ?><?php echo esc_html( antispambot( $email ) ); ?></a>
				<?php endif; ?>
			</address>
		</div>

		<div class="footer__col" style="--i: <?php echo $col++; ?>">
			<h2 class="footer__heading"><?php esc_html_e( 'Suivez-nous', 'safrozen' ); ?></h2>
			<ul class="footer__socials">
				<?php foreach ( safrozen_socials() as $social ) : ?>
					<li><a class="footer__social" href="<?php echo esc_url( $social['url'] ); ?>" aria-label="<?php echo esc_attr( $social['label'] ); ?>"><?php echo safrozen_icon( $social['icon'] ); // phpcs:ignore ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</div>

	<p class="footer__wordmark" aria-hidden="true">
		<?php foreach ( mb_str_split( $wordmark ) as $i => $char ) : ?>
			<span style="--i: <?php echo (int) $i; ?>"><?php echo ' ' === $char ? '&nbsp;' : esc_html( $char ); ?></span>
		<?php endforeach; ?>
	</p>

	<div class="footer__bottom">
		<p>
			<?php
			/* translators: 1: year, 2: company name */
			echo esc_html( sprintf( __( '© %1$s %2$s. Tous droits réservés.', 'safrozen' ), wp_date( 'Y' ), safrozen_option( 'copyright_holder', get_bloginfo( 'name' ) ) ) );
			?>
		</p>
		<p class="footer__legal">
			<?php foreach ( safrozen_menu_items( 'footer-legal' ) as $item ) : ?>
				<a class="footer__link" href="<?php echo esc_url( $item->url ); ?>"><?php echo esc_html( $item->title ); ?></a>
			<?php endforeach; ?>
		</p>
	</div>
</footer>

<dialog class="minicart" aria-labelledby="minicart-title">
	<div class="minicart__inner"></div>
</dialog>
<div class="toast-region" aria-live="polite"></div>

<script type="application/json" id="safrozen-config"><?php echo wp_json_encode( safrozen_script_config() ); ?></script>
<?php wp_footer(); ?>
</body>
</html>
