import { Command } from 'ckeditor5/src/core.js';

export default class CKEditorVariablesCommand extends Command {
	execute( {
		// Base data
		variableType,
		variable,
		label,
		// Global set data
		globalSet,
		// Entry field data
		entrySection,
		entrySlug,
		// Entry type field data
		entryTypeHandle
	} ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			// Create a <ckeditorVariable> element with the "name" attribute (and all the selection attributes)...
			const ckeditorVariable = writer.createElement( 'ckeditorVariable', {
				...Object.fromEntries( selection.getAttributes() ),
				'data-variabletype': variableType,
				'data-variable': variable,
				'data-label': label,
				'data-globalset': globalSet,
				'data-entrysection': entrySection,
				'data-entryslug': entrySlug,
				'data-entrytypehandle': entryTypeHandle
			} );

			// ... and insert it into the document. Put the selection on the inserted element.
			editor.model.insertObject( ckeditorVariable );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		this.isEnabled = model.schema.checkChild( selection.focus.parent, 'ckeditorVariable' );
	}
}
