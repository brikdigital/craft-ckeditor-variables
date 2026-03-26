import { addMenuToDropdown, createDropdown, Plugin } from "ckeditor5";
import icon from '../theme/icons/ckeditor.svg';
import { MenuChild, MenuDefinition } from "./headers/global.js";

export default class CKEditorVariablesUI extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add('variables', locale => {
            const dropdownView = createDropdown(locale);
            dropdownView.buttonView.set({
                label: 'Variables',
                icon,
                tooltip: true,
                withText: true
            });

            addMenuToDropdown(dropdownView, editor.ui.view.body, getMenuDefinition());

            const command = editor.commands.get('ckeditorVariable');
            if (!command) throw new Error('CKEditorVariables command missing!');
            dropdownView.bind('isEnabled').to(command);

            this.listenTo(dropdownView, 'execute', (evt) => {
                // @ts-expect-error Explicitly non-typeable. How hostile...
                editor.execute('ckeditorVariable', { identifier: evt.path[1].id, property: evt.source.id, label: evt.source.label });
                editor.editing.view.focus();
            });

            return dropdownView;
        });
    }
}

function getMenuDefinition() {
    const definition: MenuDefinition[] = [];

    const globalSets = window.availableGlobalSets ?? [];
    globalSets.forEach((globalSet) => {
        const children: MenuChild[] = [];
        globalSet.fields.forEach((field) => {
            children.push({
                id: field.handle,
                label: field.name,
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
