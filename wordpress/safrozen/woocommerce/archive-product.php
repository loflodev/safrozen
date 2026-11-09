<?php
/**
 * Boutique and its category archives (Shop.tsx): the header, category pills and
 * the sort, the count, then the product cards (content-product.php) or an
 * empty state. Categories are links (shareable URLs); the sort is WooCommerce's
 * own ?orderby, submitted on change.
 */

defined( 'ABSPATH' ) || exit;

$shop_url = wc_get_page_permalink( 'shop' );
$current  = is_product_category() ? get_queried_object() : null;
$terms    = get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'parent'     => 0,
		'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
	)
);
$sorts    = array(
	'menu_order' => __( 'Les plus populaires', 'safrozen' ),
	'price'      => __( 'Prix croissant', 'safrozen' ),
	'price-desc' => __( 'Prix décroissant', 'safrozen' ),
);
// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a read-only sort.
$sort  = isset( $_GET['orderby'], $sorts[ wp_unslash( $_GET['orderby'] ) ] ) ? sanitize_key( wp_unslash( $_GET['orderby'] ) ) : 'menu_order';
$total = (int) wc_get_loop_prop( 'total' );

get_header();
?>
<main id="main" class="page shop">
	<?php
	get_template_part(
		'template-parts/page-header',
		null,
		array(
			'title'  => __( 'Nos produits', 'safrozen' ),
			'lede'   => __( 'Précuits et congelés, prêts en 20 minutes. Livrés au froid dans le Grand Montréal.', 'safrozen' ),
			'crumbs' => $current
				? array( array( __( 'Boutique', 'safrozen' ), $shop_url ), array( $current->name ) )
				: array( array( __( 'Boutique', 'safrozen' ) ) ),
		)
	);
	?>

	<div class="shop__bar">
		<nav class="shop__filters" aria-label="<?php esc_attr_e( 'Catégories', 'safrozen' ); ?>">
			<a class="filter-pill" href="<?php echo esc_url( $shop_url ); ?>"<?php echo $current ? '' : ' aria-current="page"'; ?>><?php esc_html_e( 'Tout', 'safrozen' ); ?></a>
			<?php foreach ( is_array( $terms ) ? $terms : array() as $term ) : ?>
				<a class="filter-pill" href="<?php echo esc_url( get_term_link( $term ) ); ?>"<?php echo $current && $current->term_id === $term->term_id ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $term->name ); ?></a>
			<?php endforeach; ?>
		</nav>
		<form class="shop__sort" method="get">
			<label class="field__label" for="tri"><?php esc_html_e( 'Trier par', 'safrozen' ); ?></label>
			<?php // Under 600px the select is drawn as a round icon button; tapping it still opens the native picker. ?>
			<span class="shop__sort-control"<?php echo 'menu_order' === $sort ? '' : ' data-active'; ?>>
				<select id="tri" class="field__control" name="orderby" data-autosubmit>
					<?php foreach ( $sorts as $value => $label ) : ?>
						<option value="<?php echo esc_attr( $value ); ?>"<?php selected( $sort, $value ); ?>><?php echo esc_html( $label ); ?></option>
					<?php endforeach; ?>
				</select>
				<?php echo safrozen_icon( 'sort', array( 'class' => 'shop__sort-icon' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			</span>
			<noscript><button type="submit" class="btn-ghost"><?php esc_html_e( 'Trier', 'safrozen' ); ?></button></noscript>
		</form>
	</div>

	<?php woocommerce_output_all_notices(); ?>

	<p class="shop__count" aria-live="polite">
		<?php
		/* translators: %d: number of products */
		echo esc_html( sprintf( _n( '%d produit', '%d produits', $total, 'safrozen' ), $total ) );
		?>
	</p>

	<?php if ( woocommerce_product_loop() && have_posts() ) : ?>
		<ul class="product-grid">
			<?php
			while ( have_posts() ) {
				the_post();
				wc_get_template_part( 'content', 'product' );
			}
			?>
		</ul>
		<?php woocommerce_pagination(); ?>
	<?php else : ?>
		<div class="empty panel">
			<div class="veg-texture" aria-hidden="true"></div>
			<h2 class="panel__title"><?php esc_html_e( "Aucun produit ici pour l'instant", 'safrozen' ); ?></h2>
			<div class="empty__action">
				<a class="btn-ghost" href="<?php echo esc_url( $shop_url ); ?>"><?php esc_html_e( 'Voir tous les produits', 'safrozen' ); ?></a>
			</div>
		</div>
	<?php endif; ?>
</main>
<?php
get_footer();
