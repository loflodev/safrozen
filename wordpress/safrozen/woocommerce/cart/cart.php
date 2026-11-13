<?php
/**
 * Panier (Cart.tsx): the lines left, the summary right (7 / 5 from 900px),
 * and on phones the total and the CTA in a bar pinned to the bottom. One
 * form posts to WooCommerce: quantities (js/checkout.ts sends them once the
 * stepper rests), the coupon, and removals as Woo's own links, whose notice
 * offers the undo.
 *
 * Overrides woocommerce/templates/cart/cart.php 11.2.0; the posts, nonces and hooks are WooCommerce's.
 *
 * @version 11.2.0
 */

defined( 'ABSPATH' ) || exit;

$cart = WC()->cart;

do_action( 'woocommerce_before_cart' );
?>
<form class="cart-form" action="<?php echo esc_url( wc_get_cart_url() ); ?>" method="post" data-cart-form>
	<div class="cart__layout">
		<section class="panel cart__lines" aria-labelledby="cart-lines-title">
			<h2 class="visually-hidden" id="cart-lines-title"><?php esc_html_e( 'Articles', 'safrozen' ); ?></h2>
			<?php do_action( 'woocommerce_before_cart_contents' ); ?>
			<ul>
				<?php
				foreach ( $cart->get_cart() as $key => $item ) :
					$product = apply_filters( 'woocommerce_cart_item_product', $item['data'], $item, $key );
					if ( ! $product || ! $product->exists() || $item['quantity'] <= 0 || ! apply_filters( 'woocommerce_cart_item_visible', true, $item, $key ) ) {
						continue;
					}
					$name   = $product->get_name();
					$link   = $product->is_visible() ? $product->get_permalink( $item ) : '';
					$max    = $product->get_max_purchase_quantity();
					$max    = $max > 0 ? min( $max, SAFROZEN_MAX_QTY ) : SAFROZEN_MAX_QTY;
					$weight = (string) safrozen_field( 'weight', $product->get_parent_id() ?: $product->get_id() );
					$qty    = (int) $item['quantity'];
					$input  = 'qty-' . $key;
					?>
					<li class="cart__line">
						<?php echo safrozen_product_art( wc_get_product( $product->get_parent_id() ?: $product->get_id() ), 'cart__art', false, 'cart' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
						<div class="cart__info">
							<?php if ( $link ) : ?>
								<a class="cart__name" href="<?php echo esc_url( $link ); ?>"><?php echo esc_html( $name ); ?></a>
							<?php else : ?>
								<span class="cart__name"><?php echo esc_html( $name ); ?></span>
							<?php endif; ?>
							<p class="cart__meta">
								<?php
								/* translators: %s: unit price */
								$unit = sprintf( __( '%s l’unité', 'safrozen' ), wp_strip_all_tags( WC()->cart->get_product_price( $product ) ) );
								echo esc_html( implode( ' · ', array_filter( array( $weight, $unit ) ) ) );
								?>
							</p>
							<div class="cart__controls">
								<?php if ( $product->is_sold_individually() ) : ?>
									<input type="hidden" name="cart[<?php echo esc_attr( $key ); ?>][qty]" value="1">
								<?php else : ?>
									<div class="stepper">
										<button type="button" class="stepper__btn" data-step="-1"<?php disabled( $qty <= 1 ); ?> aria-label="<?php echo esc_attr( sprintf( /* translators: %s: product */ __( 'Retirer un, %s', 'safrozen' ), $name ) ); ?>"><?php echo safrozen_icon( 'minus' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
										<label class="visually-hidden" for="<?php echo esc_attr( $input ); ?>"><?php echo esc_html( sprintf( /* translators: %s: product */ __( 'Quantité, %s', 'safrozen' ), $name ) ); ?></label>
										<input id="<?php echo esc_attr( $input ); ?>" class="stepper__input" type="number" inputmode="numeric" name="cart[<?php echo esc_attr( $key ); ?>][qty]" min="1" max="<?php echo (int) $max; ?>" value="<?php echo (int) $qty; ?>">
										<button type="button" class="stepper__btn" data-step="1"<?php disabled( $qty >= $max ); ?> aria-label="<?php echo esc_attr( sprintf( /* translators: %s: product */ __( 'Ajouter un, %s', 'safrozen' ), $name ) ); ?>"><?php echo safrozen_icon( 'plus' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
									</div>
								<?php endif; ?>
								<a class="cart__remove" href="<?php echo esc_url( wc_get_cart_remove_url( $key ) ); ?>">
									<?php echo safrozen_icon( 'trash' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
									<?php esc_html_e( 'Retirer', 'safrozen' ); ?><span class="visually-hidden"> <?php echo esc_html( $name ); ?></span>
								</a>
							</div>
						</div>
						<p class="cart__total"><?php echo wp_kses_post( $cart->get_product_subtotal( $product, $qty ) ); ?></p>
					</li>
				<?php endforeach; ?>
			</ul>
			<?php do_action( 'woocommerce_cart_contents' ); ?>
			<div class="cart__foot">
				<a class="link cart__continue" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Continuer mes achats', 'safrozen' ); ?></a>
				<?php // Shown without JS; with JS the steppers send the quantities themselves. ?>
				<button type="submit" class="btn-ghost cart__update" name="update_cart" value="1" data-update-cart><?php esc_html_e( 'Mettre à jour le panier', 'safrozen' ); ?></button>
			</div>
			<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce' ); ?>
			<?php do_action( 'woocommerce_after_cart_contents' ); ?>
		</section>

		<div class="cart__aside">
			<section class="summary panel" aria-labelledby="summary-title">
				<h2 class="panel__title" id="summary-title"><?php esc_html_e( 'Récapitulatif', 'safrozen' ); ?></h2>
				<dl class="summary__totals">
					<?php foreach ( safrozen_summary_rows( false ) as [ $label, $value, $modifier, $code ] ) : ?>
						<div<?php echo $modifier ? ' class="summary__' . esc_attr( $modifier ) . '"' : ''; ?>>
							<dt>
								<?php echo esc_html( $label ); ?>
								<?php if ( $code ) : ?>
									<a class="summary__remove" href="<?php echo esc_url( add_query_arg( 'remove_coupon', rawurlencode( $code ), wc_get_cart_url() ) ); ?>"><?php esc_html_e( 'Retirer', 'safrozen' ); ?><span class="visually-hidden"> <?php echo esc_html( $label ); ?></span></a>
								<?php endif; ?>
							</dt>
							<dd><?php echo wp_kses_post( $value ); ?></dd>
						</div>
					<?php endforeach; ?>
					<div class="summary__total">
						<dt><?php esc_html_e( 'Total estimé', 'safrozen' ); ?></dt>
						<dd class="price"><?php echo wp_kses_post( wc_price( $cart->get_cart_contents_total() ) ); ?></dd>
					</div>
				</dl>
				<?php if ( wc_coupons_enabled() && ! $cart->get_coupons() ) : ?>
					<div class="coupon">
						<label class="field__label" for="coupon_code"><?php esc_html_e( 'Code promo', 'safrozen' ); ?></label>
						<div class="coupon__row">
							<input id="coupon_code" class="field__control" name="coupon_code" autocomplete="off" autocapitalize="characters">
							<button type="submit" class="btn-ghost" name="apply_coupon" value="1"><?php esc_html_e( 'Appliquer', 'safrozen' ); ?></button>
						</div>
					</div>
				<?php endif; ?>
				<div class="summary__action">
					<a class="btn-chip cart__checkout" href="<?php echo esc_url( wc_get_checkout_url() ); ?>">
						<?php esc_html_e( 'Passer la commande', 'safrozen' ); ?>
						<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					</a>
					<p class="field__help cart__reassure">
						<?php
						$free_from = safrozen_free_from();
						echo esc_html(
							$free_from
								/* translators: %s: amount */
								? sprintf( __( 'Paiement sécurisé · Livraison offerte dès %s', 'safrozen' ), wp_strip_all_tags( wc_price( $free_from, array( 'decimals' => 0 ) ) ) )
								: __( 'Paiement sécurisé', 'safrozen' )
						);
						?>
					</p>
				</div>
			</section>
		</div>
	</div>

	<div class="checkout-bar">
		<span>
			<span class="checkout-bar__label"><?php esc_html_e( 'Total estimé', 'safrozen' ); ?></span>
			<span class="price"><?php echo wp_kses_post( wc_price( $cart->get_cart_contents_total() ) ); ?></span>
		</span>
		<a class="btn-chip" href="<?php echo esc_url( wc_get_checkout_url() ); ?>"><?php esc_html_e( 'Commander', 'safrozen' ); ?></a>
	</div>
</form>
<?php
do_action( 'woocommerce_after_cart' );
