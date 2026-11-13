<?php
/**
 * Store locator (StoreLocator.tsx), the page "points-de-vente": a postal code
 * search, a Leaflet map and the store cards. The stores are the "Points de vente"
 * posts (safrozen-core); every card is printed here, sorted by name, so the page is
 * a full list with directions links even without JS. js/locator.ts adds the map,
 * the search (?code=H2T1R2 in the URL) and sorts the cards by distance.
 */

defined( 'ABSPATH' ) || exit;

wp_enqueue_style( 'safrozen-locator' );
wp_enqueue_script_module( 'safrozen-locator' );
// The map's tiles come from OpenStreetMap: open that connection while the script loads.
add_filter(
	'wp_resource_hints',
	function ( array $urls, string $type ): array {
		if ( 'preconnect' === $type ) {
			$urls[] = 'https://tile.openstreetmap.org'; // Leaflet's tiles are plain (no-CORS) <img>s.
		}
		return $urls;
	},
	10,
	2
);

$stores = safrozen_stores();

/** Google Maps search for the store (mapsUrl in stores.ts). */
$maps_url = fn( array $s ): string => 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( "{$s['name']}, {$s['address']}, {$s['city']} {$s['postcode']}" );

get_header();
?>
<main id="main" class="page locator">
	<?php
	get_template_part(
		'template-parts/page-header',
		null,
		array(
			'title'  => get_the_title(),
			'lede'   => __( 'Entrez votre code postal : nous vous montrons l’épicerie la plus proche qui a nos produits au congélateur.', 'safrozen' ),
			'crumbs' => array( array( get_the_title() ) ),
		)
	);
	?>

	<div class="locator__layout">
		<form class="panel locator__search" role="search" aria-label="<?php esc_attr_e( 'Chercher un magasin', 'safrozen' ); ?>" novalidate>
			<div class="field">
				<label class="field__label" for="locator-postcode"><?php esc_html_e( 'Votre code postal', 'safrozen' ); ?></label>
				<div class="field__box">
					<input class="field__control" id="locator-postcode" name="code" type="text" autocomplete="postal-code" autocapitalize="characters" spellcheck="false" enterkeyhint="search" maxlength="7" aria-required="true" aria-describedby="locator-postcode-help">
					<button type="button" class="field__end locator__clear" aria-label="<?php esc_attr_e( 'Effacer le code postal et la recherche', 'safrozen' ); ?>" hidden>
						<?php echo safrozen_icon( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					</button>
				</div>
				<p class="field__help" id="locator-postcode-help"><?php esc_html_e( 'Par exemple H2T 1R2.', 'safrozen' ); ?></p>
			</div>
			<div class="locator__actions">
				<button type="submit" class="btn-chip locator__submit">
					<span class="locator__submit-label"><?php esc_html_e( 'Chercher', 'safrozen' ); ?></span>
					<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</button>
				<button type="button" class="btn-ghost locator__geo" hidden>
					<?php echo safrozen_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					<?php esc_html_e( 'Utiliser ma position', 'safrozen' ); ?>
				</button>
			</div>
			<p class="notice notice--error locator__error" role="alert" hidden></p>
			<p class="locator__status" role="status">
				<?php
				/* translators: %d: number of stores */
				echo esc_html( sprintf( _n( '%d épicerie partenaire a nos produits au congélateur.', '%d épiceries partenaires ont nos produits au congélateur.', count( $stores ), 'safrozen' ), count( $stores ) ) );
				?>
			</p>
		</form>

		<div class="locator__map" hidden>
			<div class="store-map" role="region" aria-label="<?php esc_attr_e( 'Carte des magasins', 'safrozen' ); ?>"></div>
		</div>

		<section class="locator__results" aria-labelledby="locator-results-title">
			<h2 class="visually-hidden" id="locator-results-title"><?php esc_html_e( 'Tous les magasins', 'safrozen' ); ?></h2>
			<ol class="locator__list">
				<?php foreach ( $stores as $s ) : ?>
					<li data-id="<?php echo esc_attr( $s['id'] ); ?>">
						<article class="store-card">
							<div class="store-card__head">
								<h3 class="store-card__name"><?php echo esc_html( $s['name'] ); ?></h3>
								<span class="store-card__km" hidden></span>
							</div>
							<p class="store-card__line">
								<?php echo safrozen_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
								<?php echo esc_html( "{$s['address']}, {$s['city']} {$s['postcode']}" ); ?>
							</p>
							<?php if ( $s['hours'] ) : ?>
								<p class="store-card__line">
									<?php echo safrozen_icon( 'clock' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
									<?php echo esc_html( $s['hours'] ); ?>
								</p>
							<?php endif; ?>
							<?php if ( $s['phone'] ) : ?>
								<p class="store-card__line">
									<?php echo safrozen_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
									<a class="link" href="<?php echo esc_url( 'tel:+1' . preg_replace( '/\D/', '', $s['phone'] ) ); ?>"><?php echo esc_html( $s['phone'] ); ?></a>
								</p>
							<?php endif; ?>
							<div class="store-card__actions">
								<a class="btn-chip" href="<?php echo esc_url( $maps_url( $s ) ); ?>" target="_blank" rel="noreferrer">
									<?php esc_html_e( 'Itinéraire', 'safrozen' ); ?>
									<span class="visually-hidden">
										<?php
										/* translators: %s: store name */
										echo esc_html( sprintf( __( 'vers %s dans Google Maps (nouvel onglet)', 'safrozen' ), $s['name'] ) );
										?>
									</span>
									<?php echo safrozen_icon( 'arrow-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
								</a>
								<button type="button" class="link store-card__show" hidden><?php esc_html_e( 'Voir sur la carte', 'safrozen' ); ?></button>
							</div>
						</article>
					</li>
				<?php endforeach; ?>
			</ol>
			<button type="button" class="btn-ghost locator__more" hidden></button>
		</section>
	</div>
</main>
<script type="application/json" id="locator-stores"><?php echo wp_json_encode( $stores ); ?></script>
<?php
get_footer();
