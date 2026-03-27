<?php

namespace brikdigital\craftckeditorvariables;

use brikdigital\craftckeditorvariables\models\Settings;
use brikdigital\craftckeditorvariables\web\assets\ckeditorvariables\CKEditorVariablesAsset;
use Craft;
use craft\base\FieldInterface;
use craft\base\Model;
use craft\base\Plugin;
use craft\ckeditor\Field as CKEditorField;
use craft\fieldlayoutelements\BaseField;
use craft\fieldlayoutelements\entries\EntryTitleField;
use craft\fieldlayoutelements\TextField;
use craft\fields\PlainText;
use craft\helpers\ArrayHelper;
use craft\htmlfield\events\ModifyPurifierConfigEvent;
use yii\base\Event;
use yii\web\View;

/**
 * CKEditor variables plugin
 *
 * @method static CKEditorVariables getInstance()
 * @author brikdigital
 * @copyright brikdigital
 * @license MIT
 */
class CKEditorVariables extends Plugin
{
    private array $supportedFieldTypes = [PlainText::class];

    public bool $hasCpSettings = true;

    public function init(): void
    {
        parent::init();

        $this->attachEventHandlers();
        $this->registerGlobals();

        \craft\ckeditor\Plugin::registerCkeditorPackage(CKEditorVariablesAsset::class);
    }

    private function attachEventHandlers()
    {
        // Add data attributes to HTML purifier
        Event::on(
            CKEditorField::class,
            CKEditorField::EVENT_MODIFY_PURIFIER_CONFIG,
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

        $entryFields = [];
        preg_match("/entries\/(?<section>\w+)\/(?<elementId>\d+)-(?<slug>(?:[^\/]*)?)/", Craft::$app->request->pathInfo, $matches);
        if (!empty($matches['slug'])) {
            $entry = Craft::$app->entries->getEntryById($matches['elementId']);
            $layout = $entry->getFieldLayout();
            if ($layout !== null) {
                $fields = collect($layout->getCustomFields())
                    ->filter(fn (BaseField|FieldInterface $f) =>
                        $f instanceof TextField
                        || $f instanceof PlainText
                        || $f instanceof CKEditorField
                    );

                $values = $fields->map(fn (TextField|PlainText|CKEditorField $f) =>
                    $f instanceof CKEditorField ? $entry->getFieldValue($f->handle)->rawContent :
                    $entry->getFieldValue($f->handle)
                );

                $entryFields[] = [
                    'entrySection' => $entry->section->handle,
                    'entrySlug' => $entry->slug,
                    'handle' => 'title',
                    'name' => 'Titel',
                    'value' => $entry->title,
                ];

                /** @var TextField|PlainText|CKEditorField $field */
                foreach ($fields as $i => $field) {
                    $entryFields[] = [
                        'entrySection' => $entry->section->handle,
                        'entrySlug' => $entry->slug,
                        'handle' => $field->handle,
                        'name' => $field->name,
                        'value' => $values[$i],
                    ];
                }
            }
        }

        if ($json = json_encode($globals)) {
            $js = "window.availableGlobalSets = $json;";
            Craft::$app->view->registerJs($js, View::POS_HEAD);
        }
        if (($json = json_encode($entryFields)) && !empty($entryFields)) {
            $js = "window.availableEntryFields = $json;";
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
                'value' => $globalSet->handle,
            ];
        }

        $entryTypes = [];
        foreach (Craft::$app->entries->getAllEntryTypes() as $entryType) {
            $entryTypes[] = [
                'label' => $entryType->name,
                'value' => $entryType->handle,
            ];
        }

        return Craft::$app->getView()->renderTemplate(
            'ckeditor-variables/settings',
            [
                'globals' => $globals,
                'entryTypes' => $entryTypes,
                'settings' => $this->getSettings(),
            ]
        );
    }
}
