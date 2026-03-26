<?php

namespace brikdigital\craftckeditorvariables\web\assets\ckeditor5variables;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class CKEditorVariablesAsset extends BaseCkeditorPackageAsset
{
	public $sourcePath = __DIR__ . '/dist';
	public string $namespace = '@brikdigital/ckeditor-variables';

    public $js = [
        ['index.js', 'type' => 'module'],
    ];

    public array $pluginNames = [
        'CKEditorVariables',
    ];

    public array $toolbarItems = [
        'ckeditorVariables',
    ];
}
