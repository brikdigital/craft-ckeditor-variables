import { Plugin } from 'ckeditor5/src/core.js';
import { addMenuToDropdown, createDropdown } from 'ckeditor5/src/ui.js';

import ckeditor5Icon from '../theme/icons/ckeditor.svg';

export default class CKEditorVariablesUI extends Plugin {
	init() {
		const editor = this.editor;

		// Define toolbar item
		editor.ui.componentFactory.add( 'ckeditorVariables', locale => {
			const dropdownView = createDropdown( locale );
			dropdownView.buttonView.set( {
				label: 'Variables',
				icon: ckeditor5Icon,
				tooltip: true,
				withText: true
			} );

			// Populate the list in the dropdown with items.
			addMenuToDropdown( dropdownView, editor.ui.view.body, getMenuDefinition() );

			// Disable the placeholder button when the command is disabled.
			const command = editor.commands.get( 'ckeditorVariable' );
			dropdownView.bind( 'isEnabled' ).to( command );

			// Execute the command when the dropdown item is clicked (executed).
			this.listenTo( dropdownView, 'execute', evt => {
				const variableType = evt.path[ 2 ].id ?? evt.path[ 1 ].id;
				if ( !variableType ) {
					throw new Error( 'dropdownView > execute: no variableType found for menu item' );
				}

				const data = {
					variableType,
					variable: evt.source.id,
					label: evt.source.label
				};

				if ( variableType === 'globals' ) {
					data.globalSet = evt.path[ 1 ].id;
				}

				if ( variableType === 'entryFields' ) {
					const { entrySlug, entrySection } =
            window.availableEntryFields.find( e => e.handle === evt.source.id ) ?? {};
					data.entrySlug = entrySlug;
					data.entrySection = entrySection;
				}

				if ( variableType === 'entryTypes' ) {
					data.entryTypeHandle = evt.path[ 1 ].id.split( '_' )[ 1 ];
				}

				editor.execute( 'ckeditorVariable', data );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

function getMenuDefinition() {
	const definition = [];

	const entryFields = window.availableEntryFields ?? [];
	definition.push( {
		id: 'entryFields',
		menu: 'Huidige entry',
		children: entryFields.map( f => ( {
			id: f.handle,
			label: f.name
		} ) )
	} );

	const globalSets = window.availableGlobalSets ?? [];
	definition.push( {
		id: 'globals',
		menu: 'Globals',
		children: globalSets.map( set => ( {
			id: set.handle,
			menu: set.name,
			children: set.fields.map( f => ( {
				id: f.handle,
				label: f.name
			} ) )
		} ) )
	} );

	const entryTypeFields = window.availableEntryTypeFields ?? [];
	definition.push( {
		id: 'entryTypes',
		menu: 'Entry types',
		children: Object.entries( entryTypeFields ).map( ( [ name, fields ] ) => ( {
			id: `entryTypes_${ name }`,
			menu: name,
			children: fields.map( f => ( {
				id: f.handle,
				label: f.name
			} ) )
		} ) )
	} );

	return definition;
}
