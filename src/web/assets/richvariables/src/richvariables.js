import { Plugin } from 'ckeditor5/src/core.js';

import RichVariablesEditing from "./richvariablesediting.js";
import RichVariablesUI from "./richvariablesui.js";

export default class RichVariables extends Plugin {
	static get pluginName() {
		return 'RichVariables';
	}

	static get requires() {
		return [RichVariablesEditing, RichVariablesUI];
	}
}
