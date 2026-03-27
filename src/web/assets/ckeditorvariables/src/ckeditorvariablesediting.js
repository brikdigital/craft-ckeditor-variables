/* eslint-disable no-nested-ternary */

import { Plugin } from 'ckeditor5/src/core.js';
import { toWidget, Widget } from 'ckeditor5/src/widget.js';

import CKEditorVariablesCommand from './ckeditorvariablescommand.js';

export default class CKEditorVariablesEditing extends Plugin {
	static get requires() { // ADDED
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'ckeditorVariable', new CKEditorVariablesCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'ckeditorVariable', {
			// Behaves like a self-contained inline object (e.g. an inline image)
			// allowed in places where $text is allowed (e.g. in paragraphs).
			// The inline widget can have the same attributes as text (for example linkHref, bold).
			inheritAllFrom: '$inlineObject',
			// eslint-disable-next-line max-len
			allowAttributes: [
				'data-variabletype',
				'data-variable',
				'data-label',
				'data-globalset',
				'data-entrysection',
				'data-entryslug',
				'data-entrytypehandle'
			]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'ckeditor-variable' ]
			},
			model: ( viewElement, { writer: modelWriter } ) => {
				const variableType = viewElement.getAttribute( 'data-variabletype' );
				const variable = viewElement.getAttribute( 'data-variable' );
				const label = viewElement.getAttribute( 'data-label' );
				const globalSet = viewElement.getAttribute( 'data-globalset' );
				const entrySection = viewElement.getAttribute( 'data-entrysection' );
				const entrySlug = viewElement.getAttribute( 'data-entryslug' );
				const entryTypeHandle = viewElement.getAttribute( 'data-entrytypehandle' );

				return modelWriter.createElement( 'ckeditorVariable', {
					'data-variabletype': variableType,
					'data-variable': variable,
					'data-label': label,
					'data-globalset': globalSet,
					'data-entrysection': entrySection,
					'data-entryslug': entrySlug,
					'data-entrytypehandle': entryTypeHandle
				} );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'ckeditorVariable',
			view: ( modelItem, { writer: viewWriter } ) => {
				const widgetElement = createCKEditorVariableView( modelItem, viewWriter );

				// Enable widget handling on a ckeditor variable inside the editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'ckeditorVariable',
			view: ( modelItem, { writer: viewWriter } ) => createCKEditorVariableView( modelItem, viewWriter, true )
		} );

		// Helper method for both downcast converters.
		function createCKEditorVariableView( modelItem, viewWriter, dataDowncast = false ) {
			const variableType = modelItem.getAttribute( 'data-variabletype' );
			const variable = modelItem.getAttribute( 'data-variable' );
			const label = modelItem.getAttribute( 'data-label' );
			const globalSet = modelItem.getAttribute( 'data-globalset' );
			const entrySection = modelItem.getAttribute( 'data-entrysection' );
			const entrySlug = modelItem.getAttribute( 'data-entryslug' );
			const entryTypeHandle = modelItem.getAttribute( 'data-entrytypehandle' );

			const ckeditorVariableView = viewWriter.createContainerElement(
				dataDowncast ? 'span' : 'code',
				{
					class: 'ckeditor-variable',
					'data-variabletype': variableType,
					'data-variable': variable,
					'data-label': label,
					'data-globalset': globalSet,
					'data-entrysection': entrySection,
					'data-entryslug': entrySlug,
					'data-entrytypehandle': entryTypeHandle
				}
			);

			// eslint-disable-next-line no-nested-ternary
			const text = dataDowncast ?
				variableType === 'globals' ?
					`{globalset:${ globalSet }:${ variable }}` :
					variableType === 'entryFields' ?
						`{entry:${ entrySection }/${ entrySlug }:${ variable }}` :
						variableType === 'entryTypes' ?
							`[[${ entryTypeHandle } ^_^ ${ variable }]]` :
							`UNK_${ variableType }{${ variable },${ label },${ entrySection },${ entrySlug },${ entryTypeHandle }}` :
				`{${ label }}`;
			const innerText = viewWriter.createText( text );
			viewWriter.insert( viewWriter.createPositionAt( ckeditorVariableView, 0 ), innerText );

			return ckeditorVariableView;
		}
	}
}
