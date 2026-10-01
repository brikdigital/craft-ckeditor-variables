/* eslint-disable no-nested-ternary */

import { type ModelElement, Plugin, toWidget, type ViewDowncastWriter, Widget } from 'ckeditor5';
import VariablesCommand from './command';

export default class VariablesEditing extends Plugin {
	public static get requires() {
		return [ Widget ];
	}

	public init(): void {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'ckeditorVariable', new VariablesCommand( this.editor ) );
	}

	private _defineSchema(): void {
		this.editor.model.schema.register( 'ckeditorVariable', {
			inheritAllFrom: '$inlineObject',
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

	private _defineConverters(): void {
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

				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'ckeditorVariable',
			view: ( modelItem, { writer: viewWriter } ) => createCKEditorVariableView( modelItem, viewWriter, true )
		} );

		function createCKEditorVariableView( modelItem: ModelElement, viewWriter: ViewDowncastWriter, dataDowncast = false ) {
			const variableType = modelItem.getAttribute( 'data-variabletype' );
			const variable = modelItem.getAttribute( 'data-variable' );
			const label = modelItem.getAttribute( 'data-label' );
			const globalSet = modelItem.getAttribute( 'data-globalset' );
			const entrySection = modelItem.getAttribute( 'data-entrysection' );
			const entrySlug = modelItem.getAttribute( 'data-entryslug' );
			const entryTypeHandle = modelItem.getAttribute( 'data-entrytypehandle' );

			const ckeditorVariableView = viewWriter.createContainerElement( dataDowncast ? 'span' : 'code', {
				class: 'ckeditor-variable',
				'data-variabletype': variableType,
				'data-variable': variable,
				'data-label': label,
				'data-globalset': globalSet,
				'data-entrysection': entrySection,
				'data-entryslug': entrySlug,
				'data-entrytypehandle': entryTypeHandle
			} );

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
