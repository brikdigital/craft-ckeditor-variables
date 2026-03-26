import { Plugin, Widget } from "ckeditor5";
export default class CKEditorVariablesEditing extends Plugin {
    static get requires(): (typeof Widget)[];
    init(): void;
    _defineSchema(): void;
    _defineConverters(): void;
}
