<?php
// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

/**
 * Hooks for JSLibraries.
 *
 * @file
 */

namespace JSLibraries;

use OutputPage;

class Hooks implements
	\MediaWiki\Hook\BeforePageDisplayHook
{

	/**
	 * Customisations to OutputPage right before page display.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$out->addModules( [ 'ext.JSLibraries.vendors' ] );
	}
}
