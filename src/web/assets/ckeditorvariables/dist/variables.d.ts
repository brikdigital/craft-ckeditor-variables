import { Plugin } from 'ckeditor5';
import CKEditorVariablesUI from './variablesui.js';
export default class CKEditorVariables extends Plugin {
    static get pluginName(): "Variables";
    static get requires(): (typeof CKEditorVariablesUI)[];
}
