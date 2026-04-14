<?php

namespace brikdigital\craftckeditorvariables;

use brikdigital\craftckeditorvariables\models\Settings;
use brikdigital\craftckeditorvariables\web\assets\ckeditorvariables\CKEditorVariablesAsset;
use Craft;
use craft\base\FieldInterface;
use craft\base\Model;
use craft\base\Plugin;
use craft\ckeditor\Field as CKEditorField;
use craft\elements\Entry;
use craft\elements\GlobalSet;
use craft\events\TemplateEvent;
use craft\fieldlayoutelements\BaseField;
use craft\fieldlayoutelements\TextField;
use craft\fields\PlainText;
use craft\htmlfield\events\ModifyPurifierConfigEvent;
use craft\helpers\Cp as CpHelper;
use craft\models\FieldLayout;
use craft\web\View;
use yii\base\Event;

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
        $this->registerEntryFields();
        $this->registerEntryTypes();

        \craft\ckeditor\Plugin::registerCkeditorPackage(CKEditorVariablesAsset::class);
    }

    private function attachEventHandlers()
    {
        // Add data attributes to HTML purifier
        Event::on(
            CKEditorField::class,
            CKEditorField::EVENT_MODIFY_PURIFIER_CONFIG,
            function (ModifyPurifierConfigEvent $event) {
                $dataAttributes = ['variabletype', 'variable', 'label', 'globalset', 'entrysection', 'entryslug', 'entrytypehandle'];
                if ($def = $event->config->getDefinition('HTML', true)) {
                    foreach ($dataAttributes as $dataAttribute) {
                        $def->addAttribute('span', "data-$dataAttribute", 'Text');
                    }
                }
            }
        );

        Event::on(
            View::class,
            View::EVENT_AFTER_RENDER_TEMPLATE,
            function (TemplateEvent $event) {
                if (Craft::$app->request->isCpRequest) return;
                /** @var Entry $entry */
                if (empty($event->variables['entry'])) return;
                $entry = $event->variables['entry'];

                $event->output = preg_replace_callback("/\[\[(?<type>\w+) \^_\^ (?<field>\w+)]]/", function ($matches) use ($entry) {
                    if ($entry->type->handle !== $matches['type']) return '';
                    return $matches['field'] === 'title'
                        ? $entry->title
                        : $entry->getFieldValue($matches['field']);
                }, $event->output);
            }
        );
    }

    private function registerGlobals(): void
    {
        if (!Craft::$app->getRequest()->getIsCpRequest())
            return;

        $globals = [];
        foreach ($this->getSettings()->globals as $handle) {
            $globalSet = GlobalSet::find()->siteId(CpHelper::requestedSite()->id)->handle($handle)->one();
            $layout = $globalSet->getFieldLayout();
            $generatedValues = $globalSet->getGeneratedFieldValues();
            $fields = [];

            foreach ($layout->getCustomFields() as $field) {
                if (in_array($field::class, $this->supportedFieldTypes)) {
                    $fields[] = [
                        'handle' => $field->getHandle(),
                        'name' => $field->name,
                        'value' => $globalSet->getFieldValue($field->getHandle()),
                    ];
                }
            }

            foreach ($layout->getGeneratedFields() as $field) {
                $fields[] = [
                    'handle' => $field['handle'],
                    'name' => $field['name'],
                    'value' => $generatedValues[$field['handle']] ?? '<empty>',
                ];
            }

            $globals[] = [
                'handle' => $globalSet->handle,
                'name' => $globalSet->name,
                'fields' => $fields
            ];
        }

        if ($json = json_encode($globals)) {
            $js = "window.availableGlobalSets = $json;";
            Craft::$app->view->registerJs($js, View::POS_HEAD);
        }
    }

    private function registerEntryFields(): void {
        if (!Craft::$app->getRequest()->getIsCpRequest())
            return;

        $currentSite = Craft::$app->sites->currentSite;
        $entryFields = [];
        preg_match("/entries\/(?<section>\w+)\/(?<elementId>\d+)-(?<slug>(?:[^\/]*)?)/", Craft::$app->request->pathInfo, $matches);

        if (!empty($matches['slug'])) {
            $entry = Entry::find()->slug($matches['slug'])->siteId($currentSite->id)->one();
            if ($entry === null) return;

            $layout = $entry->getFieldLayout();
            if ($layout !== null) {
                $entryFields = collect($this->collectLayoutFields($layout))->map(function ($f) use ($entry) {
                    $f['entrySection'] = $entry->section->handle;
                    $f['entrySlug'] = $entry->slug;
                    return $f;
                });
            }
        }

        if (($json = json_encode($entryFields, JSON_THROW_ON_ERROR)) && count($entryFields) !== 0) {
            $js = "window.availableEntryFields = $json;";
            Craft::$app->view->registerJs($js, View::POS_HEAD);
        }
    }

    private function registerEntryTypes(): void {
        if (!Craft::$app->getRequest()->getIsCpRequest())
            return;

        $entryTypeFields = [];
        foreach ($this->getSettings()->entryTypes as $entryType) {
            $entryType = Craft::$app->entries->getEntryTypeByHandle($entryType);

            $layout = $entryType->getFieldLayout();
            if ($layout !== null) {
                $entryTypeFields[$entryType->handle] = collect($this->collectLayoutFields($layout));
            }
        }

        if (($json = json_encode($entryTypeFields)) && count($entryTypeFields) !== 0) {
            $js = "window.availableEntryTypeFields = $json;";
            Craft::$app->view->registerJs($js, View::POS_HEAD);
        }
    }

    private function collectLayoutFields(FieldLayout $layout) {
        $layoutFields = [];

        $fields = collect($layout->getCustomFields())
            ->filter(fn (BaseField|FieldInterface $f) =>
                $f instanceof TextField
                || $f instanceof PlainText
                || $f instanceof CKEditorField
            );

        $layoutFields[] = [
            'handle' => 'title',
            'name' => 'Titel',
        ];

        /** @var TextField|PlainText|CKEditorField $field */
        foreach ($fields as $i => $field) {
            $layoutFields[] = [
                'handle' => $field->handle,
                'name' => $field->name,
            ];
        }

        return $layoutFields;
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
