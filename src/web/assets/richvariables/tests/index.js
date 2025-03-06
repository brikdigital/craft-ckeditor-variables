import { describe, expect, it } from 'vitest';
import { RichVariables as RichVariablesDll, icons } from '../src/index.js';
import RichVariables from '../src/richvariables.js';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 RichVariables DLL', () => {
	it( 'exports RichVariables', () => {
		expect( RichVariablesDll ).to.equal( RichVariables );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
