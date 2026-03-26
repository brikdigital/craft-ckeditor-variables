import { Plugin } from 'ckeditor5';

import ckeditor5Icon from '../theme/icons/ckeditor.svg';
import CKEditorVariablesEditing from './variablesediting.js';
import CKEditorVariablesUI from './variablesui.js';

export default class CKEditorVariables extends Plugin {
	public static get pluginName() {
		return 'Variables' as const;
	}

	static get requires() {
		return [CKEditorVariablesEditing, CKEditorVariablesUI]
	}
}
