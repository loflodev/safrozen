<?php
/**
 * What Rank Math can't build alone (docs/seo-a11y-tasks.md): the theme's data in
 * its JSON-LD graph (organisation, crumbs, FAQ, stores, recipes), llms.txt's
 * descriptions and extra sections, and the AI crawlers named in robots.txt.
 * Rank Math's own settings live in wordpress/scripts/import-seo.php.
 */

defined( 'ABSPATH' ) || exit;

// Pages have no default schema type (they're not Articles), which would also drop the
// Organization / WebSite / WebPage entities; keep those on every page.
add_filter( 'rank_math/schema/add_global_entities', '__return_true' );

/* --- Helpers ----------------------------------------------------------------------------------- */

/** A Canadian postal code's province, from Canada Post's first letter (G, H, J: Québec; K–P: Ontario). */
function safrozen_province( string $postcode ): string {
	$first = strtoupper( substr( ltrim( $postcode ), 0, 1 ) );
	if ( in_array( $first, array( 'G', 'H', 'J' ), true ) ) {
		return 'QC';
	}
	return in_array( $first, array( 'K', 'L', 'M', 'N', 'P' ), true ) ? 'ON' : '';
}

/** "25 min", "1 h 10" → an ISO 8601 duration, or '' when the field holds no number. */
function safrozen_iso_duration( string $text ): string {
	if ( ! preg_match( '/(?:(\d+)\s*h)?\s*(\d+)?/i', $text, $m ) || ( empty( $m[1] ) && empty( $m[2] ) ) ) {
		return '';
	}
	return 'PT' . ( empty( $m[1] ) ? '' : (int) $m[1] . 'H' ) . ( empty( $m[2] ) ? '' : (int) $m[2] . 'M' );
}

/** The company's details from "Réglages Safrozen", merged into Rank Math's Organization. */
function safrozen_schema_organization(): array {
	$email = (string) safrozen_option( 'contact_email' );
	$phone = (string) safrozen_option( 'contact_phone' );
	$same  = array_values( array_filter( wp_list_pluck( safrozen_socials(), 'url' ), fn( $url ) => $url && '#' !== $url ) );
	preg_match( '/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i', (string) safrozen_option( 'contact_address' ), $postcode );

	return array_filter(
		array(
			'url'          => home_url( '/' ),
			'email'        => $email ?: null,
			'telephone'    => $phone ?: null,
			'address'      => $postcode ? array(
				'@type'          => 'PostalAddress',
				'postalCode'     => strtoupper( $postcode[0] ),
				'addressRegion'  => safrozen_province( $postcode[0] ),
				'addressCountry' => 'CA',
			) : null,
			'brand'        => array(
				'@type' => 'Brand',
				'name'  => 'Legim Express',
			),
			'sameAs'       => $same ?: null,
			'contactPoint' => $email || $phone ? array(
				array_filter(
					array(
						'@type'       => 'ContactPoint',
						'contactType' => 'customer service',
						'email'       => $email ?: null,
						'telephone'   => $phone ?: null,
						'areaServed'  => 'CA',
					)
				),
			) : null,
		)
	);
}

/**
 * The trail the page prints (page-header.php, single-product.php), as
 * array( name, url ) from Accueil; empty on the front page and the 404.
 */
function safrozen_schema_crumbs(): array {
	if ( is_front_page() || is_404() ) {
		return array();
	}
	$crumbs  = array( array( __( 'Accueil', 'safrozen' ), home_url( '/' ) ) );
	$shop    = function_exists( 'wc_get_page_permalink' ) ? array( __( 'Boutique', 'safrozen' ), wc_get_page_permalink( 'shop' ) ) : null;
	$recipes = array( get_the_title( (int) get_option( 'page_for_posts' ) ) ?: __( 'Recettes', 'safrozen' ), safrozen_recipes_url() );

	if ( function_exists( 'is_product' ) && is_product() ) {
		$crumbs[] = $shop;
		$category = safrozen_product_category( get_the_ID() );
		if ( $category ) {
			$crumbs[] = array( $category->name, get_term_link( $category ) );
		}
		$crumbs[] = array( get_the_title(), get_permalink() );
	} elseif ( function_exists( 'is_product_category' ) && is_product_category() ) {
		$crumbs[] = $shop;
		$crumbs[] = array( single_term_title( '', false ), get_term_link( get_queried_object() ) );
	} elseif ( function_exists( 'is_shop' ) && is_shop() ) {
		$crumbs[] = $shop;
	} elseif ( is_singular( 'post' ) ) {
		$crumbs[] = $recipes;
		$crumbs[] = array( get_the_title(), get_permalink() );
	} elseif ( is_home() ) {
		$crumbs[] = $recipes;
	} elseif ( is_singular() ) {
		$crumbs[] = array( get_the_title(), get_permalink() );
	} else {
		return array();
	}
	return $crumbs;
}

/** The FAQ page's questions: each <details> block's <summary> and the text after it. */
function safrozen_schema_faq( WP_Post $page ): array {
	preg_match_all( '/<details\b[^>]*>\s*<summary[^>]*>(.*?)<\/summary>(.*?)<\/details>/s', do_blocks( $page->post_content ), $matches, PREG_SET_ORDER );
	$text = fn( string $html ): string => trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( $html ) ) );
	return array_map(
		fn( $m ) => array(
			'@type'          => 'Question',
			'name'           => $text( $m[1] ),
			'acceptedAnswer' => array(
				'@type' => 'Answer',
				'text'  => $text( $m[2] ),
			),
		),
		$matches
	);
}

/** The store locator's stores as an ItemList of Stores. */
function safrozen_schema_stores( string $id ): array {
	$stores = safrozen_stores();
	return array(
		'@type'           => 'ItemList',
		'@id'             => $id,
		'name'            => __( 'Points de vente Legim Express', 'safrozen' ),
		'numberOfItems'   => count( $stores ),
		'itemListElement' => array_map(
			fn( $store, $i ) => array(
				'@type'    => 'ListItem',
				'position' => $i + 1,
				'item'     => array_filter(
					array(
						'@type'     => 'Store',
						'name'      => $store['name'],
						'telephone' => $store['phone'] ?: null,
						'address'   => array(
							'@type'           => 'PostalAddress',
							'streetAddress'   => $store['address'],
							'addressLocality' => $store['city'],
							'postalCode'      => $store['postcode'],
							'addressRegion'   => safrozen_province( $store['postcode'] ),
							'addressCountry'  => 'CA',
						),
						'geo'       => $store['lat'] ? array(
							'@type'     => 'GeoCoordinates',
							'latitude'  => $store['lat'],
							'longitude' => $store['lng'],
						) : null,
					)
				),
			),
			$stores,
			array_keys( $stores )
		),
	);
}

/* --- JSON-LD ----------------------------------------------------------------------------------- */

/**
 * Rank Math's graph, completed: the company's contact details, the Product's
 * brand and seller, the page's crumbs, and the page types it can't tell apart
 * (the FAQ, the contact page, the store locator's list of stores).
 */
add_filter(
	'rank_math/json_ld',
	function ( $data ) {
		$url     = is_singular() ? get_permalink() : '';
		$crumbs  = safrozen_schema_crumbs();
		$webpage = null;

		foreach ( $data as $key => $entity ) {
			$type = $entity['@type'] ?? '';
			if ( 'Organization' === $type ) {
				$data[ $key ] = array_merge( $entity, safrozen_schema_organization() );
			} elseif ( 'Product' === $type ) {
				$data[ $key ]['brand'] = array(
					'@type' => 'Brand',
					'name'  => 'Legim Express',
				);
				if ( isset( $entity['offers']['seller'] ) ) {
					$data[ $key ]['offers']['seller'] = array( '@id' => home_url( '/#organization' ) );
				}
			} elseif ( str_ends_with( (string) ( $entity['@id'] ?? '' ), '#webpage' ) ) {
				$webpage = $key;
				// Rank Math takes the name from the <title>, entities and all ("&ndash;").
				if ( isset( $entity['name'] ) ) {
					$data[ $key ]['name'] = html_entity_decode( $entity['name'], ENT_QUOTES, 'UTF-8' );
				}
			}
		}

		if ( null !== $webpage ) {
			$page_id = $data[ $webpage ]['@id'];
			if ( count( $crumbs ) > 1 ) {
				$data[ $webpage ]['breadcrumb'] = array( '@id' => str_replace( '#webpage', '#breadcrumb', $page_id ) );
				$data['BreadcrumbList']         = array(
					'@type'           => 'BreadcrumbList',
					'@id'             => str_replace( '#webpage', '#breadcrumb', $page_id ),
					'itemListElement' => array_map(
						fn( $crumb, $i ) => array(
							'@type'    => 'ListItem',
							'position' => $i + 1,
							'name'     => wp_strip_all_tags( $crumb[0] ),
							'item'     => $crumb[1],
						),
						$crumbs,
						array_keys( $crumbs )
					),
				);
			}
			if ( is_page( 'faq' ) ) {
				// Rank Math merges a separate FAQPage into the WebPage (and removes it) after this filter.
				$questions = safrozen_schema_faq( get_post() );
				if ( $questions ) {
					$data['faq'] = array(
						'@type'      => 'FAQPage',
						'mainEntity' => $questions,
					);
				}
			} elseif ( is_page( 'contact' ) ) {
				$data[ $webpage ]['@type'] = 'ContactPage';
			} elseif ( is_page( 'points-de-vente' ) ) {
				$data['Stores']                 = safrozen_schema_stores( $url . '#magasins' );
				$data[ $webpage ]['mainEntity'] = array( '@id' => $url . '#magasins' );
			}
		}
		return $data;
	},
	99
);

/**
 * A recipe post's Recipe entity, from the same ACF fields single.php prints,
 * added to Rank Math's JSON-LD graph (posts default to no schema there).
 */
add_filter(
	'rank_math/json_ld',
	function ( $data ) {
		if ( ! is_singular( 'post' ) ) {
			return $data;
		}
		$recipe      = get_post();
		$ingredients = safrozen_lines( (string) safrozen_field( 'ingredients', $recipe->ID ) );
		$steps       = safrozen_lines( (string) safrozen_field( 'steps', $recipe->ID ) );
		if ( ! $ingredients || ! $steps ) {
			return $data;
		}
		$url    = get_permalink( $recipe );
		$time   = safrozen_iso_duration( (string) safrozen_field( 'time', $recipe->ID ) );
		$serves = (string) safrozen_field( 'serves', $recipe->ID );
		$image  = get_the_post_thumbnail_url( $recipe, 'full' );

		$data['Recipe'] = array_filter(
			array(
				'@type'              => 'Recipe',
				'@id'                => $url . '#recipe',
				'name'               => get_the_title( $recipe ),
				'description'        => wp_strip_all_tags( get_the_excerpt( $recipe ) ),
				'image'              => $image ? array( $image ) : null,
				'author'             => array( '@id' => home_url( '/#organization' ) ),
				'datePublished'      => get_the_date( 'c', $recipe ),
				'dateModified'       => get_the_modified_date( 'c', $recipe ),
				'mainEntityOfPage'   => array( '@id' => $url . '#webpage' ),
				'inLanguage'         => get_bloginfo( 'language' ),
				'recipeCuisine'      => 'Haïtienne',
				'recipeCategory'     => 'Plat principal',
				'totalTime'          => $time ?: null,
				'recipeYield'        => $serves ?: null,
				'recipeIngredient'   => $ingredients,
				'recipeInstructions' => array_map(
					fn( $step, $i ) => array(
						'@type' => 'HowToStep',
						'text'  => $step,
						'url'   => $url . '#etape-' . ( $i + 1 ),
					),
					$steps,
					array_keys( $steps )
				),
			)
		);
		return $data;
	}
);

/* --- llms.txt (Rank Math's module) ------------------------------------------------------------- */

add_filter( 'rank_math/llms_txt/remove_credit', '__return_true' );

// The posts are the recipes: list them under the blog page's name, not "Articles".
add_action(
	'rank_math/llms_txt/before_output',
	function () {
		$type = get_post_type_object( 'post' );
		if ( $type ) {
			$type->labels->name = get_the_title( (int) get_option( 'page_for_posts' ) ) ?: __( 'Recettes', 'safrozen' );
		}
	}
);

// Each entry: its meta description (the excerpts are shared and hold HTML), and a product's price.
add_filter(
	'rank_math/llms_txt/post_description',
	function ( $desc, $post ) {
		$desc = (string) get_post_meta( $post->ID, 'rank_math_description', true ) ?: $desc;
		$product = 'product' === $post->post_type && function_exists( 'wc_get_product' ) ? wc_get_product( $post ) : null;
		if ( $product && '' !== $product->get_price() ) {
			$desc .= ' Prix : ' . html_entity_decode( wp_strip_all_tags( wc_price( (float) $product->get_price() ) ), ENT_QUOTES, 'UTF-8' ) . '.';
		}
		return $desc;
	},
	10,
	2
);

// After the pages: where to buy in store, and how to reach the company.
add_filter(
	'rank_math/llms_txt/extra_content',
	function ( $extra ) {
		$lines = array( '## ' . __( 'Points de vente', 'safrozen' ) );
		foreach ( safrozen_stores() as $store ) {
			$lines[] = sprintf( '- %s : %s, %s %s', $store['name'], $store['address'], $store['city'], $store['postcode'] );
		}
		$lines[] = '';
		$lines[] = '## ' . __( 'Contact', 'safrozen' );
		foreach ( array(
			__( 'Courriel', 'safrozen' )  => safrozen_option( 'contact_email' ),
			__( 'Téléphone', 'safrozen' ) => safrozen_option( 'contact_phone' ),
			__( 'Adresse', 'safrozen' )   => safrozen_option( 'contact_address' ),
		) as $label => $value ) {
			if ( $value ) {
				$lines[] = "- $label : $value";
			}
		}
		return trim( implode( "\n", $lines ) . "\n\n" . $extra );
	}
);

/* --- robots.txt -------------------------------------------------------------------------------- */

/**
 * The AI crawlers, named in the "*" group so they share its rules (one group can
 * list several user agents): the site wants to be read and recommended by them.
 */
add_filter(
	'robots_txt',
	function ( $output ) {
		$bots = array( 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot' );
		$named = implode( "\n", array_map( fn( $bot ) => "User-agent: $bot", $bots ) );
		return preg_replace( '/^User-agent: \*$/m', "User-agent: *\n$named", $output, 1 );
	},
	99
);
