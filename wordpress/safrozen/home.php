<?php
/**
 * Recettes, the posts page (RecipesArchive.tsx): every recipe, newest first,
 * 3 / 2 / 1 columns, then page links when there are more than one page.
 * The lede is the posts page's excerpt; category.php draws a category the same way.
 */

defined( 'ABSPATH' ) || exit;

wp_enqueue_style( 'safrozen-recipes-page' );

$posts_page = (int) get_option( 'page_for_posts' );
$title      = is_category() ? single_cat_title( '', false ) : ( $posts_page ? get_the_title( $posts_page ) : __( 'Recettes', 'safrozen' ) );
$crumbs     = is_category()
	? array( array( __( 'Recettes', 'safrozen' ), safrozen_recipes_url() ), array( $title ) )
	: array( array( $title ) );
if ( is_category() ) {
	$lede = wp_strip_all_tags( category_description() );
} else {
	$lede = $posts_page && has_excerpt( $posts_page ) ? get_the_excerpt( $posts_page ) : __( 'Des idées simples pour apprêter Legim Express à votre goût, en 20 minutes ou presque.', 'safrozen' );
}

get_header();
?>
<main id="main" class="page">
	<?php
	get_template_part(
		'template-parts/page-header',
		null,
		array(
			'title'  => is_category() ? $title : __( 'Nos recettes', 'safrozen' ),
			'lede'   => trim( $lede ),
			'crumbs' => $crumbs,
		)
	);
	?>

	<?php if ( have_posts() ) : ?>
		<ol class="recipes-grid">
			<?php
			$i = 0;
			while ( have_posts() ) :
				the_post();
				?>
				<li style="--i: <?php echo (int) $i++; ?>">
					<?php get_template_part( 'template-parts/recipe-card', null, array( 'post' => get_post(), 'heading' => 2 ) ); ?>
				</li>
			<?php endwhile; ?>
		</ol>
		<?php
		the_posts_pagination(
			array(
				'class'              => 'recipes-pages',
				'screen_reader_text' => __( 'Pages de recettes', 'safrozen' ),
				'aria_label'         => __( 'Pages de recettes', 'safrozen' ),
				'prev_text'          => __( 'Précédentes', 'safrozen' ),
				'next_text'          => __( 'Suivantes', 'safrozen' ),
				'mid_size'           => 1,
			)
		);
		?>
	<?php else : ?>
		<div class="empty panel">
			<div class="veg-texture" aria-hidden="true"></div>
			<h2 class="panel__title"><?php esc_html_e( 'Aucune recette pour le moment', 'safrozen' ); ?></h2>
			<p class="empty__text"><?php esc_html_e( 'Nos premières idées de recettes arrivent bientôt.', 'safrozen' ); ?></p>
			<div class="empty__action">
				<a class="btn-ghost" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( "Retour à l'accueil", 'safrozen' ); ?></a>
			</div>
		</div>
	<?php endif; ?>
</main>
<?php
get_footer();
