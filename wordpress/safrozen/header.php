<?php
/**
 * Document head and the fixed navbar: logo, menu chip, socials chip, account
 * and cart chips, and the menu toggle under 900px (CLAUDE.md §5).
 */

defined( 'ABSPATH' ) || exit;

$on_home    = is_front_page();
$account    = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/mon-compte/' );
$cart_url   = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/panier/' );
$cart_count = function_exists( 'safrozen_cart_count' ) ? safrozen_cart_count() : 0;
$user       = wp_get_current_user();

// The mobile panel's last group follows the visitor: sign in, or the account and sign out.
$on_account   = function_exists( 'is_account_page' ) && is_account_page() && ! is_wc_endpoint_url();
$account_menu = $user->exists()
	? array(
		array( __( 'Mon compte', 'safrozen' ), $account, 'user', $on_account ),
		array( __( 'Déconnexion', 'safrozen' ), function_exists( 'wc_logout_url' ) ? wc_logout_url( home_url( '/' ) ) : wp_logout_url( home_url( '/' ) ), 'logout', false ),
	)
	: array( array( __( 'Se connecter', 'safrozen' ), $account, 'user', $on_account ) );
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="nav" data-open="false">
	<a class="nav__brand" href="<?php echo esc_url( $on_home ? '#accueil' : home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( sprintf( __( '%s, accueil', 'safrozen' ), get_bloginfo( 'name' ) ) ); ?>">
		<?php echo safrozen_logo( 'nav__logo' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	</a>

	<nav class="nav__menu nav__chip" id="nav-menu" aria-label="<?php esc_attr_e( 'Principal', 'safrozen' ); ?>">
		<ul class="nav__links">
			<?php foreach ( safrozen_menu_items( 'primary' ) as $item ) : ?>
				<?php $current = safrozen_menu_current( $item ); ?>
				<li>
					<a class="nav__pill" href="<?php echo esc_url( safrozen_menu_href( $item ) ); ?>"<?php echo $current ? ' aria-current="' . esc_attr( $current ) . '"' : ''; ?>><?php echo esc_html( $item->title ); ?></a>
				</li>
			<?php endforeach; ?>
		</ul>

		<?php // Under 900px the panel shows every destination by group, each with an icon (CLAUDE.md §5). ?>
		<div class="nav__groups">
			<?php foreach ( safrozen_menu_groups() as $g => $group ) : ?>
				<section class="nav__group">
					<h2 class="nav__group-title" id="nav-group-<?php echo (int) $g; ?>"><?php echo esc_html( $group['title'] ); ?></h2>
					<ul aria-labelledby="nav-group-<?php echo (int) $g; ?>">
						<?php foreach ( $group['items'] as $item ) : ?>
							<?php $current = safrozen_menu_current( $item ); ?>
							<li>
								<a class="nav__pill nav__item" href="<?php echo esc_url( safrozen_menu_href( $item ) ); ?>"<?php echo $current ? ' aria-current="' . esc_attr( $current ) . '"' : ''; ?>><?php echo safrozen_icon( safrozen_menu_icon( $item ) ); // phpcs:ignore ?><?php echo esc_html( $item->title ); ?></a>
							</li>
						<?php endforeach; ?>
					</ul>
				</section>
			<?php endforeach; ?>
			<section class="nav__group">
				<h2 class="nav__group-title" id="nav-group-compte"><?php esc_html_e( 'Mon compte', 'safrozen' ); ?></h2>
				<ul aria-labelledby="nav-group-compte">
					<?php foreach ( $account_menu as [ $label, $href, $icon, $current ] ) : ?>
						<li>
							<a class="nav__pill nav__item" href="<?php echo esc_url( $href ); ?>"<?php echo $current ? ' aria-current="page"' : ''; ?>><?php echo safrozen_icon( $icon ); // phpcs:ignore ?><?php echo esc_html( $label ); ?></a>
						</li>
					<?php endforeach; ?>
				</ul>
			</section>
		</div>
	</nav>

	<div class="nav__end">
		<ul class="nav__socials nav__chip">
			<?php foreach ( safrozen_socials() as $social ) : ?>
				<li>
					<a class="nav__pill nav__icon" href="<?php echo esc_url( $social['url'] ); ?>" aria-label="<?php echo esc_attr( $social['label'] ); ?>"><?php echo safrozen_icon( $social['icon'] ); // phpcs:ignore ?></a>
				</li>
			<?php endforeach; ?>
		</ul>

		<a class="nav__chip nav__pill nav__icon nav__round nav__account" href="<?php echo esc_url( $account ); ?>" aria-label="<?php echo esc_attr( $user->exists() ? sprintf( __( 'Mon compte, %s', 'safrozen' ), $user->display_name ) : __( 'Mon compte, se connecter', 'safrozen' ) ); ?>">
			<?php echo safrozen_icon( 'user' ); // phpcs:ignore ?>
		</a>

		<?php // The chip opens the mini-cart (js/cart.ts); the link stays for new tabs and no JS. ?>
		<a class="nav__chip nav__pill nav__icon nav__round" href="<?php echo esc_url( $cart_url ); ?>" data-cart-open aria-label="<?php echo esc_attr( sprintf( _n( 'Panier, %d article', 'Panier, %d articles', $cart_count, 'safrozen' ), $cart_count ) ); ?>">
			<?php echo safrozen_icon( 'cart' ); // phpcs:ignore ?>
			<?php if ( $cart_count > 0 ) : ?>
				<span class="nav__badge"><?php echo (int) $cart_count; ?></span>
			<?php endif; ?>
		</a>

		<button type="button" class="nav__chip nav__pill nav__icon nav__round nav__toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="<?php esc_attr_e( 'Ouvrir le menu', 'safrozen' ); ?>">
			<span data-icon="menu"><?php echo safrozen_icon( 'menu' ); // phpcs:ignore ?></span>
			<span data-icon="close" hidden><?php echo safrozen_icon( 'close' ); // phpcs:ignore ?></span>
		</button>
	</div>
</header>
