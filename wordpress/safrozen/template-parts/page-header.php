<?php
/**
 * Inner page header (PageHeader.tsx): breadcrumbs, the page's <h1> and a lede
 * at the right from 900px, like the landing's section heads.
 *
 * @var array $args {
 *     @type string $title  The page title.
 *     @type string $lede   Optional line beside it.
 *     @type array  $crumbs array( label, url ) pairs after Accueil, the last one current.
 * }
 */

defined( 'ABSPATH' ) || exit;

$args = wp_parse_args(
	$args ?? array(),
	array(
		'title'  => get_the_title(),
		'lede'   => '',
		'crumbs' => array( array( get_the_title() ) ),
	)
);
?>
<header class="page-header">
	<?php echo safrozen_crumbs( $args['crumbs'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	<div class="section__head page-header__head">
		<h1 class="section__title"><?php echo esc_html( $args['title'] ); ?></h1>
		<?php if ( $args['lede'] ) : ?>
			<p class="section__lede"><?php echo esc_html( $args['lede'] ); ?></p>
		<?php endif; ?>
	</div>
</header>
