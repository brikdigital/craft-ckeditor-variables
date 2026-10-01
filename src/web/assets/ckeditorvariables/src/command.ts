import { Command, type ModelElement } from 'ckeditor5';

export default class VariablesCommand extends Command {
	public override execute( {
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
	}: Record<string, string> ): void {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			const variableEl = writer.createElement( 'ckeditorVariable', {
				...Object.fromEntries( selection.getAttributes() ),
				'data-variabletype': variableType,
				'data-variable': variable,
				'data-label': label,
				'data-globalset': globalSet,
				'data-entrysection': entrySection,
				'data-entryslug': entrySlug,
				'data-entrytypehandle': entryTypeHandle
			} );

			editor.model.insertObject( variableEl );
		} );
	}

	public override refresh(): void {
		const model = this.editor.model;
		const focus = model.document.selection.focus;
		if ( !focus ) {
			return;
		}

		this.isEnabled = model.schema.checkChild( focus.parent as ModelElement, 'ckeditorVariable' );
	}
}
