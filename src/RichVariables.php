<?php

namespace brikdigital\craftrichvariables;

use brikdigital\craftrichvariables\models\Settings;
use brikdigital\craftrichvariables\web\assets\richvariables\RichVariablesAsset;
use Craft;
use craft\base\Model;
use craft\base\Plugin;
use craft\ckeditor\Field;
use craft\fields\PlainText;
use craft\htmlfield\events\ModifyPurifierConfigEvent;
use yii\base\Event;
use yii\web\View;

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
    private array $supportedFieldTypes = [PlainText::class];

    public bool $hasCpSettings = true;

    public function init(): void
    {
        parent::init();

        $this->attachEventHandlers();
        $this->registerGlobals();

        \craft\ckeditor\Plugin::registerCkeditorPackage(RichVariablesAsset::class);
    }

    private function attachEventHandlers()
    {
        // Add data attributes to HTML purifier
        Event::on(
            Field::class,
            Field::EVENT_MODIFY_PURIFIER_CONFIG,
            function (ModifyPurifierConfigEvent $event) {
                $dataAttributes = ['identifier', 'property', 'label'];
                if ($def = $event->config->getDefinition('HTML', true)) {
                    foreach ($dataAttributes as $dataAttribute) {
                        $def->addAttribute('span', "data-$dataAttribute", 'Text');
                    }
                }
            }
        );
    }

    private function registerGlobals(): void
    {
        if (!Craft::$app->getRequest()->getIsCpRequest())
            return;

        $globals = [];
        foreach ($this->getSettings()->globals as $handle) {
            $globalSet = Craft::$app->getGlobals()->getSetByHandle($handle);
            $fields = [];

            foreach ($globalSet->getFieldLayout()->getCustomFields() as $field) {
                if (in_array($field::class, $this->supportedFieldTypes)) {
                    $fields[] = [
                        'handle' => $field->getHandle(),
                        'name' => $field->name,
                        'value' => $globalSet->getFieldValue($field->getHandle()),
                    ];
                }
            }

            $globals[] = [
                'handle' => $globalSet->handle,
                'name' => $globalSet->name,
                'fields' => $fields
            ];
        }

        if ($json = json_encode($globals)) {
            $js = "window.globalSets = $json;";
            Craft::$app->view->registerJs($js, View::POS_HEAD);
        }
    }

    protected function createSettingsModel(): ?Model
    {
        return new Settings();
    }

    protected function settingsHtml(): ?string
    {
        $globals = [];
        foreach (Craft::$app->getGlobals()->getAllSets() as $globalSet) {
            $globals[] = [
                'label' => $globalSet->name,
                'value' => $globalSet->handle
            ];
        }
        return Craft::$app->getView()->renderTemplate(
            'ckeditor-rich-variables/settings',
            [
                'globals' => $globals,
                'settings' => $this->getSettings()
            ]
        );
    }
}
