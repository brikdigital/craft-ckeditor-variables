import type VariablesCommand from '../src/command';

export {};

declare global {
	interface Window {
		ALYX_DEBUG_LOGGING?: boolean;

		availableGlobalSets: Array<{
			name: string;
			handle: string;
			fields: Array<{
				name: string;
				handle: string;
			}>;
		}>;

		availableEntryFields: Array<{
			name: string;
			handle: string;
			entrySlug: string;
			entrySection: string;
		}>;

		availableEntryTypeFields: Record<string, Array<{
			name: string;
			handle: string;
		}>>;
	}
}
