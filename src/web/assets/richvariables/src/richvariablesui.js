import { Plugin } from "ckeditor5/src/core.js";
import { addMenuToDropdown, createDropdown } from "ckeditor5/src/ui.js";

import ckeditor5Icon from '../theme/icons/ckeditor.svg';

export default class RichVariablesUI extends Plugin {
	init() {
		const editor = this.editor;

		// Define toolbar item
		editor.ui.componentFactory.add( 'richVariables', locale => {
			const dropdownView = createDropdown( locale );
			dropdownView.buttonView.set( {
				label: 'Rich variables',
				icon: ckeditor5Icon,
				tooltip: true,
				withText: true
			} );

			// Populate the list in the dropdown with items.
			addMenuToDropdown(dropdownView, editor.ui.view.body, getMenuDefinition());

			// Disable the placeholder button when the command is disabled.
			const command = editor.commands.get( 'richVariable' );
			dropdownView.bind( 'isEnabled' ).to( command );

			// Execute the command when the dropdown item is clicked (executed).
			this.listenTo( dropdownView, 'execute', (evt) => {
				editor.execute( 'richVariable', { identifier: evt.path[1].id, property: evt.source.id, label: evt.source.label } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

function getMenuDefinition() {
	const definition = [];

	const globalSets = window.globalSets ?? [];
	globalSets.forEach((globalSet) => {
		const children = [];
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
