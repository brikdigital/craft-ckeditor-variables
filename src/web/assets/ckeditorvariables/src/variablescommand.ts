import { Command } from "ckeditor5";

export default class CKEditorVariablesCommand extends Command {
    override execute({ identifier, property, label }: Record<string, any>) {
        const editor = this.editor;
        const selection = editor.model.document.selection;

        editor.model.change(writer => {
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

    override refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        if (!selection.focus?.parent) {
            this.isEnabled = false;
            return
        }

        this.isEnabled = model.schema.checkChild(model.document.getRoot()!, selection.focus.parent);
    }
}
