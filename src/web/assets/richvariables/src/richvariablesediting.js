import {Plugin} from "ckeditor5/src/core.js";
import {toWidget, Widget} from "ckeditor5/src/widget.js";

import RichVariablesCommand from "./richvariablescommand.js";

export default class RichVariablesEditing extends Plugin {
	static get requires() {                                                    // ADDED
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'richVariable', new RichVariablesCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'richVariable', {
			// Behaves like a self-contained inline object (e.g. an inline image)
			// allowed in places where $text is allowed (e.g. in paragraphs).
			// The inline widget can have the same attributes as text (for example linkHref, bold).
			inheritAllFrom: '$inlineObject',
			allowAttributes: ['data-identifier', 'data-property', 'data-label']
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: ['rich-variable'],
			},
			model: ( viewElement, { writer: modelWriter } ) => {
				const identifier = viewElement.getAttribute('data-identifier');
				const property = viewElement.getAttribute('data-property');
				const label = viewElement.getAttribute('data-label');

				return modelWriter.createElement( 'richVariable', {
					'data-identifier': identifier,
					'data-property': property,
					'data-label': label
				} );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'richVariable',
			view: ( modelItem, { writer: viewWriter } ) => {
				const widgetElement = createRichVariableView( modelItem, viewWriter );

				// Enable widget handling on a rich variable inside the editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'richVariable',
			view: ( modelItem, { writer: viewWriter } ) => createRichVariableView(modelItem, viewWriter, true)
		} );

		// Helper method for both downcast converters.
		function createRichVariableView( modelItem, viewWriter, dataDowncast = false ) {
			const identifier = modelItem.getAttribute('data-identifier');
			const property = modelItem.getAttribute('data-property');
			const label = modelItem.getAttribute('data-label');

			const richVariableView = viewWriter.createContainerElement(dataDowncast ? 'span' : 'code', {
				class: 'rich-variable',
				'data-identifier': identifier,
				'data-property': property,
				'data-label': label
			});

			const text = dataDowncast ? `{globalset:${identifier}:${property}}` : `{${label}}`;
			const innerText = viewWriter.createText(text);
			viewWriter.insert(viewWriter.createPositionAt(richVariableView, 0), innerText);

			return richVariableView;
		}
	}
}
