import {
	addMenuToDropdown,
	createDropdown,
	type DropdownMenuDefinition,
	Plugin
} from 'ckeditor5';

import variablesIcon from '../theme/variables.svg';

export default class VariablesUI extends Plugin {
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'ckeditorVariables', locale => {
			const dropdownView = createDropdown( locale );
			dropdownView.buttonView.set( {
				label: 'Variables',
				icon: variablesIcon,
				tooltip: true,
				withText: true
			} );

			addMenuToDropdown( dropdownView, editor.ui.view.body, getMenuDefinition() );

			const command = editor.commands.get( 'ckeditorVariable' );
			if ( command ) {
				dropdownView.bind( 'isEnabled' ).to( command );
			}

			this.listenTo( dropdownView, 'execute', evt => {
				// @ts-expect-error whose idea was it to type things as `object`
				const variableType = evt.path[ 2 ].id ?? evt.path[ 1 ].id;
				if ( !variableType ) {
					throw new Error( 'dropdownView > execute: no variableType found for menu item' );
				}

				const data: Record<string, string> = {
					variableType,
					// @ts-expect-error whose idea was it to type things as `object`
					variable: evt.source.id,
					// @ts-expect-error whose idea was it to type things as `object`
					label: evt.source.label
				};

				if ( variableType === 'globals' ) {
					// @ts-expect-error whose idea was it to type things as `object`
					data.globalSet = evt.path[ 1 ].id;
				}

				if ( variableType === 'entryFields' ) {
					// @ts-expect-error whose idea was it to type things as `object`
					const entryField = window.availableEntryFields.find( e => e.handle === evt.source.id );
					if ( entryField ) {
						data.entrySlug = entryField.entrySlug;
						data.entrySection = entryField.entrySection;
					} else {
						if ( window.ALYX_DEBUG_LOGGING ) {
							console.warn(
								// @ts-expect-error whose idea was it to type things as `object`
								`[ckeditorVariables/execute] Entry field with handle '${ evt.source.id }'` +
								'wasn\'t found in window.availableEntryFields!'
							);
						}
					}
				}

				if ( variableType === 'entryTypes' ) {
					// @ts-expect-error whose idea was it to type things as `object`
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
	const definition: DropdownMenuDefinition = [];

	const entryFields = window.availableEntryFields ?? [];
	if ( entryFields.length ) {
		definition.push( {
			id: 'entryFields',
			menu: 'Huidige entry',
			children: entryFields.map( f => ( {
				id: f.handle,
				label: f.name
			} ) )
		} );
	}

	const globalSets = window.availableGlobalSets ?? [];
	if ( globalSets.length ) {
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
	}

	const entryTypeFields = window.availableEntryTypeFields ?? [];
	if ( entryTypeFields.length ) {
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
	}

	return definition;
}
