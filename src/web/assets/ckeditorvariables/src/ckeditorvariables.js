import { Plugin } from 'ckeditor5/src/core.js';

import CKEditorVariablesEditing from "./ckeditorvariablesediting.js";
import CKEditorVariablesUI from "./ckeditorvariablesui.js";

export default class CKEditorVariables extends Plugin {
	static get pluginName() {
		return 'CKEditorVariables';
	}

	static get requires() {
		return [CKEditorVariablesEditing, CKEditorVariablesUI];
	}
}
