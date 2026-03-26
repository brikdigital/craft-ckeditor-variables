import { Command, Plugin, Widget, toWidget, createDropdown, addMenuToDropdown } from 'ckeditor5';

var ckeditor = "<svg width='68' height='64' viewBox='0 0 68 64' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><path d='M43.71 11.025a11.508 11.508 0 0 0-1.213 5.159c0 6.42 5.244 11.625 11.713 11.625.083 0 .167 0 .25-.002v16.282a5.464 5.464 0 0 1-2.756 4.739L30.986 60.7a5.548 5.548 0 0 1-5.512 0L4.756 48.828A5.464 5.464 0 0 1 2 44.089V20.344c0-1.955 1.05-3.76 2.756-4.738L25.474 3.733a5.548 5.548 0 0 1 5.512 0l12.724 7.292z' fill='#FFF'/><path d='M45.684 8.79a12.604 12.604 0 0 0-1.329 5.65c0 7.032 5.744 12.733 12.829 12.733.091 0 .183-.001.274-.003v17.834a5.987 5.987 0 0 1-3.019 5.19L31.747 63.196a6.076 6.076 0 0 1-6.037 0L3.02 50.193A5.984 5.984 0 0 1 0 45.003V18.997c0-2.14 1.15-4.119 3.019-5.19L25.71.804a6.076 6.076 0 0 1 6.037 0L45.684 8.79zm-29.44 11.89c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49.001zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h18.479c.833 0 1.509-.67 1.509-1.498v-.715c0-.827-.676-1.498-1.51-1.498H16.244zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49.001zm41.191-14.459c-5.835 0-10.565-4.695-10.565-10.486 0-5.792 4.73-10.487 10.565-10.487C63.27 3.703 68 8.398 68 14.19c0 5.791-4.73 10.486-10.565 10.486v-.001z' fill='#1EBC61' fill-rule='nonzero'/><path d='M60.857 15.995c0-.467-.084-.875-.251-1.225a2.547 2.547 0 0 0-.686-.88 2.888 2.888 0 0 0-1.026-.531 4.418 4.418 0 0 0-1.259-.175c-.134 0-.283.006-.447.018-.15.01-.3.034-.446.07l.075-1.4h3.587v-1.8h-5.462l-.214 5.06c.319-.116.682-.21 1.089-.28.406-.071.77-.107 1.088-.107.218 0 .437.021.655.063.218.041.413.114.585.218s.313.244.422.419c.109.175.163.391.163.65 0 .424-.132.745-.396.961a1.434 1.434 0 0 1-.938.325c-.352 0-.656-.1-.912-.3-.256-.2-.43-.453-.523-.762l-1.925.588c.1.35.258.664.472.943.214.279.47.514.767.706.298.191.63.339.995.443.365.104.749.156 1.151.156.437 0 .86-.064 1.272-.193.41-.13.778-.323 1.1-.581a2.8 2.8 0 0 0 .775-.981c.193-.396.29-.864.29-1.405h-.001z' fill='#FFF' fill-rule='nonzero'/></g></svg>\n";

class CKEditorVariablesCommand extends Command {
    execute({ identifier, property, label }) {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        editor.model.change((writer)=>{
            // Create a <ckeditorVariable> element with the "name" attribute (and all the selection attributes)...
            const ckeditorVariable = writer.createElement('ckeditorVariable', {
                ...Object.fromEntries(selection.getAttributes()),
                'data-identifier': identifier,
                'data-property': property,
                'data-label': label
            });
            // ... and insert it into the document. Put the selection on the inserted element.
            editor.model.insertObject(ckeditorVariable);
        });
    }
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        if (!selection.focus?.parent) {
            this.isEnabled = false;
            return;
        }
        this.isEnabled = model.schema.checkChild(model.document.getRoot(), selection.focus.parent);
    }
}

class CKEditorVariablesEditing extends Plugin {
    static get requires() {
        return [
            Widget
        ];
    }
    init() {
        this._defineSchema();
        this._defineConverters();
        this.editor.commands.add('ckeditorVariable', new CKEditorVariablesCommand(this.editor));
    }
    _defineSchema() {
        const schema = this.editor.model.schema;
        schema.register('ckeditorVariable', {
            // Behaves like a self-contained inline object (e.g. an inline image)
            // allowed in places where $text is allowed (e.g. in paragraphs).
            // The inline widget can have the same attributes as text (for example linkHref, bold).
            inheritAllFrom: '$inlineObject',
            allowAttributes: [
                'data-identifier',
                'data-property',
                'data-label'
            ]
        });
    }
    _defineConverters() {
        const conversion = this.editor.conversion;
        conversion.for('upcast').elementToElement({
            view: {
                name: 'span',
                classes: [
                    'ckeditor-variable'
                ]
            },
            model: (viewElement, { writer: modelWriter })=>{
                const identifier = viewElement.getAttribute('data-identifier');
                const property = viewElement.getAttribute('data-property');
                const label = viewElement.getAttribute('data-label');
                return modelWriter.createElement('ckeditorVariable', {
                    'data-identifier': identifier,
                    'data-property': property,
                    'data-label': label
                });
            }
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'ckeditorVariable',
            view: (modelItem, { writer: viewWriter })=>{
                const widgetElement = createCKEditorVariableView(modelItem, viewWriter);
                // Enable widget handling on a ckeditor variable inside the editing view.
                return toWidget(widgetElement, viewWriter);
            }
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'ckeditorVariable',
            view: (modelItem, { writer: viewWriter })=>createCKEditorVariableView(modelItem, viewWriter, true)
        });
        // Helper method for both downcast converters.
        function createCKEditorVariableView(modelItem, viewWriter, dataDowncast = false) {
            const identifier = modelItem.getAttribute('data-identifier');
            const property = modelItem.getAttribute('data-property');
            const label = modelItem.getAttribute('data-label');
            const ckeditorVariableView = viewWriter.createContainerElement(dataDowncast ? 'span' : 'code', {
                class: 'ckeditor-variable',
                'data-identifier': identifier,
                'data-property': property,
                'data-label': label
            });
            const text = dataDowncast ? `{globalset:${identifier}:${property}}` : `{${label}}`;
            const innerText = viewWriter.createText(text);
            viewWriter.insert(viewWriter.createPositionAt(ckeditorVariableView, 0), innerText);
            return ckeditorVariableView;
        }
    }
}

class CKEditorVariablesUI extends Plugin {
    init() {
        const editor = this.editor;
        editor.ui.componentFactory.add('variables', (locale)=>{
            const dropdownView = createDropdown(locale);
            dropdownView.buttonView.set({
                label: 'Variables',
                icon: ckeditor,
                tooltip: true,
                withText: true
            });
            addMenuToDropdown(dropdownView, editor.ui.view.body, getMenuDefinition());
            const command = editor.commands.get('ckeditorVariable');
            if (!command) throw new Error('CKEditorVariables command missing!');
            dropdownView.bind('isEnabled').to(command);
            this.listenTo(dropdownView, 'execute', (evt)=>{
                // @ts-expect-error Explicitly non-typeable. How hostile...
                editor.execute('ckeditorVariable', {
                    identifier: evt.path[1].id,
                    property: evt.source.id,
                    label: evt.source.label
                });
                editor.editing.view.focus();
            });
            return dropdownView;
        });
    }
}
function getMenuDefinition() {
    const definition = [];
    const globalSets = window.availableGlobalSets ?? [];
    globalSets.forEach((globalSet)=>{
        const children = [];
        globalSet.fields.forEach((field)=>{
            children.push({
                id: field.handle,
                label: field.name
            });
        });
        definition.push({
            id: globalSet.handle,
            menu: globalSet.name,
            children: children
        });
    });
    return definition;
}

class CKEditorVariables extends Plugin {
    static get pluginName() {
        return 'Variables';
    }
    static get requires() {
        return [
            CKEditorVariablesEditing,
            CKEditorVariablesUI
        ];
    }
}

const icons = {
    ckeditor
};

export { CKEditorVariables as Variables, icons };
//# sourceMappingURL=index.js.map
