import type VariablesCommand from './command';

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		ckeditorVariable: VariablesCommand;
	}
}
