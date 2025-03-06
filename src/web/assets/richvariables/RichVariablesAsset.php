<?php

namespace brikdigital\craftrichvariables\web\assets\richvariables;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class RichVariablesAsset extends BaseCkeditorPackageAsset
{
    public $sourcePath = __DIR__ . '/build';

    public $js = [
        'rich-variables.js',
    ];

    public array $pluginNames = [
        'RichVariables',
    ];

    public array $toolbarItems = [
        'richVariables',
    ];
}
