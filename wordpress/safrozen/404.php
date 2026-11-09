<?php
/**
 * Not found (NotFound.tsx): the title, one line and the way home.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="main" class="page">
	<div class="section__head">
		<h1 class="section__title"><?php esc_html_e( 'Page introuvable', 'safrozen' ); ?></h1>
		<p class="section__lede"><?php esc_html_e( "Cette page n'existe pas ou a été déplacée.", 'safrozen' ); ?></p>
	</div>
	<a class="btn-chip" href="<?php echo esc_url( home_url( '/' ) ); ?>">
		<?php esc_html_e( "Retour à l'accueil", 'safrozen' ); ?>
		<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	</a>
</main>
<?php
get_footer();
