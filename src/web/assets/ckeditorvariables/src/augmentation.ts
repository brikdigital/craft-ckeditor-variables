import type { Variables } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Variables.pluginName ]: Variables;
	}
}
