<?php

namespace brikdigital\craftckeditorvariables\web\assets\ckeditorvariables;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class CKEditorVariablesAsset extends BaseCkeditorPackageAsset
{
    public $sourcePath = __DIR__ . '/build';

    public $js = [
        'variables.js',
    ];

    public array $pluginNames = [
        'CKEditorVariables',
    ];

    public array $toolbarItems = [
        'ckeditorVariables',
    ];
}
