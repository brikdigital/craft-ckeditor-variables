import { describe, expect, it } from 'vitest';
import { Variables as VariablesDll, icons } from '../src/index.js';
import Variables from '../src/variables.js';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 Variables DLL', () => {
	it( 'exports Variables', () => {
		expect( VariablesDll ).to.equal( Variables );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
