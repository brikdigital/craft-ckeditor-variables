import {Command} from "ckeditor5/src/core.js";

export default class RichVariablesCommand extends Command {
	execute( { identifier, property, label } ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			// Create a <richVariable> element with the "name" attribute (and all the selection attributes)...
			const richVariable = writer.createElement( 'richVariable', {
				...Object.fromEntries( selection.getAttributes() ),
				'data-identifier': identifier,
				'data-property': property,
				'data-label': label
			} );

			// ... and insert it into the document. Put the selection on the inserted element.
			editor.model.insertObject( richVariable );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		this.isEnabled = model.schema.checkChild(selection.focus.parent, 'richVariable');
	}
}
