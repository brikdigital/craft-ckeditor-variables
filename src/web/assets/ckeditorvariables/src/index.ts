import { Plugin } from 'ckeditor5';
import VariablesUI from './ui';
import VariablesEditing from './editing';

export class Variables extends Plugin {
	public static get pluginName() {
		return 'Variables' as const;
	}

	public static get requires() {
		return [ VariablesUI, VariablesEditing ];
	}
}
