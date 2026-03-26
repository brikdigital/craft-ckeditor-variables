import { Command } from "ckeditor5";
export default class CKEditorVariablesCommand extends Command {
    execute({ identifier, property, label }: Record<string, any>): void;
    refresh(): void;
}
