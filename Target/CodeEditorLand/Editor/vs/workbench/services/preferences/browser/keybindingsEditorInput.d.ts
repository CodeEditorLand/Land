import { ThemeIcon } from '../../../../base/common/themables.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { KeybindingsEditorModel } from './keybindingsEditorModel.js';
export interface IKeybindingsEditorSearchOptions {
    searchValue: string;
    recordKeybindings: boolean;
    sortByPrecedence: boolean;
}
export declare class KeybindingsEditorInput extends EditorInput {
    static readonly ID: string;
    readonly keybindingsModel: KeybindingsEditorModel;
    searchOptions: IKeybindingsEditorSearchOptions | null;
    readonly resource: undefined;
    constructor(instantiationService: IInstantiationService);
    get typeId(): string;
    getName(): string;
    getIcon(): ThemeIcon;
    resolve(): Promise<KeybindingsEditorModel>;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
