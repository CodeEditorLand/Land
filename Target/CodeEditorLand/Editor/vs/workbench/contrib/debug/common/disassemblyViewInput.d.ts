import { EditorInput } from '../../../common/editor/editorInput.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export declare class DisassemblyViewInput extends EditorInput {
    static readonly ID = "debug.disassemblyView.input";
    get typeId(): string;
    static _instance: DisassemblyViewInput;
    static get instance(): DisassemblyViewInput;
    readonly resource: undefined;
    getName(): string;
    getIcon(): ThemeIcon;
    matches(other: unknown): boolean;
}
