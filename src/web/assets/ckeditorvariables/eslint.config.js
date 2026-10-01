import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintConfigCKEditor5 from 'eslint-config-ckeditor5';
import eslintPluginCKEditor5Rules from 'eslint-plugin-ckeditor5-rules';

export default defineConfig( [
	eslintConfigCKEditor5,
	{
		name: 'Ignored files config',
		ignores: [
			// Ignore the entire `dist/`.
			'dist/**',

			// Ignore generated translation files.
			'lang/translations/**'
		]
	},
	{
		name: 'Base config',
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser
			}
		},
		linterOptions: {
			reportUnusedInlineConfigs: 'error',
			reportUnusedDisableDirectives: 'error'
		},
		plugins: {
			'ckeditor5-rules': eslintPluginCKEditor5Rules
		}
	},
	{
		files: [ 'scripts/**/*' ],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	}
] );
