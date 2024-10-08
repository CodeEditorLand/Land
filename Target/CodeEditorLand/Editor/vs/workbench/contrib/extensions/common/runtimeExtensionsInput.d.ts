import { URI } from '../../../../base/common/uri.js';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export declare class RuntimeExtensionsInput extends EditorInput {
    static readonly ID = "workbench.runtimeExtensions.input";
    get typeId(): string;
    get capabilities(): EditorInputCapabilities;
    static _instance: RuntimeExtensionsInput;
    static get instance(): RuntimeExtensionsInput;
    readonly resource: URI;
    getName(): string;
    getIcon(): ThemeIcon;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
