<?php

namespace brikdigital\craftrichvariables;

use brikdigital\craftrichvariables\web\assets\richvariables\RichVariablesAsset;
use craft\base\Plugin;

/**
 * Rich variables plugin
 *
 * @method static RichVariables getInstance()
 * @author brikdigital
 * @copyright brikdigital
 * @license MIT
 */
class RichVariables extends Plugin
{
    public bool $hasCpSettings = true;

    public function init(): void
    {
        parent::init();

        \craft\ckeditor\Plugin::registerCkeditorPackage(RichVariablesAsset::class);
    }
}
