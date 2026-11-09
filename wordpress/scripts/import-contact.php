<?php
/**
 * The contact page (Contact.tsx): Contact Form 7's "Contact" form with the theme's
 * field markup (Field.tsx: label above, 52px pill control, error below), and the
 * page's template and ACF fields. Safe to re-run; it overwrites the form and the
 * page's fields. import-landing.php runs it at the end.
 *
 * Run: wp eval-file wordpress/scripts/import-contact.php
 */

defined( 'ABSPATH' ) || exit;

$subjects = array( 'Une commande', 'La livraison', 'Nos produits', 'Trouver un magasin', 'Devenir partenaire', 'Autre chose' );
$arrow    = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/** One field: visible label above its control (CF7 adds the error tip below). */
function lxc_field( string $id, string $label, string $tag, bool $full = false, bool $optional = false ): string {
	$extra = $optional ? ' <span class="field__optional">(facultatif)</span>' : '';
	return sprintf(
		'<div class="field%s"><label class="field__label" for="%s">%s%s</label>%s</div>',
		$full ? ' field--full' : '',
		$id,
		$label,
		$extra,
		$tag
	);
}

$markup = implode(
	"\n",
	array(
		'<div class="form-grid form-grid--2">',
		lxc_field( 'contact-name', 'Nom complet', '[text* your-name id:contact-name class:field__control autocomplete:name]', true ),
		lxc_field( 'contact-email', 'Adresse e-mail', '[email* your-email id:contact-email class:field__control autocomplete:email]' ),
		lxc_field( 'contact-phone', 'Téléphone', '[tel your-phone id:contact-phone class:field__control autocomplete:tel]', false, true ),
		lxc_field( 'contact-subject', 'Sujet', '[select your-subject id:contact-subject class:field__control "' . implode( '" "', $subjects ) . '"]', true ),
		lxc_field( 'contact-message', 'Message', '[textarea* your-message id:contact-message class:field__control minlength:10 x6]', true ),
		'</div>',
		'<button class="btn-chip contact__submit" type="submit">Envoyer le message ' . $arrow . '</button>',
	)
);

$form_id = safrozen_form_id( 'Contact' );
$form    = $form_id ? wpcf7_contact_form( $form_id ) : WPCF7_ContactForm::get_template( array( 'title' => 'Contact' ) );
$form->set_title( 'Contact' );
$form->set_properties(
	array(
		'form'                => $markup,
		'mail'                => array(
			'active'             => true,
			'subject'            => '[_site_title] [your-subject] : message de [your-name]',
			'sender'             => '[_site_title] <wordpress@[_site_domain]>',
			'recipient'          => '[_site_admin_email]',
			'body'               => "De : [your-name] <[your-email]>\nTéléphone : [your-phone]\nSujet : [your-subject]\n\n[your-message]\n\n--\n[_site_title] ([_site_url])",
			'additional_headers' => 'Reply-To: [your-email]',
			'attachments'        => '',
			'use_html'           => false,
			'exclude_blank'      => false,
		),
		// Flamingo files each message under the sender, with its subject.
		'additional_settings' => "flamingo_email: \"[your-email]\"\nflamingo_name: \"[your-name]\"\nflamingo_subject: \"[your-subject]\"",
		'messages'            => array_merge(
			$form->prop( 'messages' ),
			array(
				'mail_sent_ok'             => 'Merci ! Votre message est bien parti. Nous vous répondons sous un jour ouvrable.',
				'mail_sent_ng'             => 'Le message n’a pas pu partir. Réessayez, ou écrivez-nous directement par courriel.',
				'validation_error'         => 'Certains champs sont à corriger. Voir les messages sous les champs.',
				'spam'                     => 'Le message n’a pas pu partir. Réessayez, ou écrivez-nous directement par courriel.',
				'invalid_required'         => 'Ce champ est obligatoire.',
				'invalid_email'            => 'Saisissez une adresse e-mail valide, par exemple nom@exemple.com.',
				'invalid_tel'              => 'Saisissez un numéro de téléphone valide, par exemple 438 969-8712.',
				'invalid_too_short'        => 'Écrivez votre message (au moins 10 caractères).',
			)
		),
	)
);
$form_id = $form->save();
WP_CLI::log( "form Contact → $form_id" );

$page = get_page_by_path( 'contact' );
if ( ! $page ) {
	WP_CLI::error( 'The page "contact" is missing: run import-landing.php first.' );
}
update_post_meta( $page->ID, '_wp_page_template', 'page-contact.php' );

$chayotte = get_page_by_path( 'legim-a-la-chayotte', OBJECT, 'product' );
$fields   = array(
	'title'           => 'Parlons-en',
	'lede'            => 'Une question sur une commande, la livraison ou nos legims ? Nous répondons en un jour ouvrable.',
	'locator_title'   => 'Trouvez nos legims près de chez vous',
	'locator_text'    => 'Nos boîtes vous attendent au congélateur de nos épiciers partenaires. Cherchez le magasin le plus proche.',
	'locator_label'   => 'Trouver un magasin',
	'locator_product' => $chayotte ? $chayotte->ID : '',
	'form'            => $form_id,
);
foreach ( $fields as $name => $value ) {
	update_field( "field_sf_contact_$name", $value, $page->ID );
}
WP_CLI::success( "Contact page ready ({$page->ID})." );
