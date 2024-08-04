<?php
// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

/**
 * Hooks for JSLibraries.
 *
 * @file
 */

namespace JSLibraries;

use MediaWiki\Hook\ParserFirstCallInitHook;
use MediaWiki\MediaWikiServices;
use MediaWiki\Hook\BeforePageDisplayHook;
use OutputPage;
use Parser;

class Hooks implements BeforePageDisplayHook, ParserFirstCallInitHook
{
	/**
	 * @var string
	 */
	private $loaderPostfix = '';

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

	public function onParserFirstCallInit($parser) {
		$configs = MediaWikiServices::getInstance()->getMainConfig();

		if ($configs->get( 'JSLibrariesLoader' )) {
			$this->loaderPostfix = $configs->get( 'JSLibrariesLoaderPostfix' );
			$parser->setFunctionHook( 'jslibrariesloader', [ $this, 'renderJSLibrariesLoader' ] );
		};
	}

	public function renderJSLibrariesLoader(Parser $parser, ...$moduleNames) {
		if (count($moduleNames) === 0) {
			return '';
		}
		$output = $parser->getOutput();
		$modules = [
			'scripts' => [],
			'styles' => []
		];

		foreach($moduleNames as $moduleName) {
			$moduleFullName = $moduleName . $this->loaderPostfix;
			if (strstr($moduleName, '.styles')) {
				$modules['styles'][] = $moduleFullName;
				continue;
			}
			$modules['scripts'][] = $moduleFullName;
		}

		if (count($modules['styles']) > 0) {
			$output->addModuleStyles( $modules['styles'] );
		}

		if (count($modules['scripts']) > 0) {
			$output->addModules( $modules['scripts'] );
		}

		return '';
	}
}
