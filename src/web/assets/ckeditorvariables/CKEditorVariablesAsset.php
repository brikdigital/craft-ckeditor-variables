<?php

namespace brikdigital\craftckeditorvariables\web\assets\ckeditorvariables;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class CKEditorVariablesAsset extends BaseCkeditorPackageAsset
{
	public $sourcePath = __DIR__ . '/dist/browser';

	public string $namespace = '@brikdigital/ckeditor5-variables';

	public $js = [
		['index.es.js', 'type' => 'module'],
	];

	public array $pluginNames = [
		'Variables',
	];
}
