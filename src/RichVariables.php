<?php

namespace brikdigital\craftrichvariables;

use brikdigital\craftrichvariables\web\assets\richvariables\RichVariablesAsset;
use Craft;
use craft\base\Plugin;
use craft\ckeditor\Field;
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
        $app = Craft::$app;
        if ($app->getRequest()->getIsCpRequest()) {
            $globalSets = $app->getGlobals()->getAllSets();

            $globals = [];
            foreach ($globalSets as $globalSet) {
                $fields = [];
                foreach ($globalSet->getFieldLayout()->getCustomFields() as $field) {
                    $fields[] = [
                        'handle' => $field->handle,
                        'name' => $field->name,
                        'value' => $globalSet->getFieldValue($field->handle),
                    ];
                }

                $globals[] = [
                    'handle' => $globalSet->handle,
                    'name' => $globalSet->name,
                    'fields' => $fields
                ];
            }

            $js = 'window.globalSets = ' . json_encode($globals) . ';';

            $app->view->registerJs($js, View::POS_HEAD);
        }
    }
}
