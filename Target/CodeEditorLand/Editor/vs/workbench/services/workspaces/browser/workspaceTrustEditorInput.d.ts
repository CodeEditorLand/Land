import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
export declare class WorkspaceTrustEditorInput extends EditorInput {
    static readonly ID: string;
    get capabilities(): EditorInputCapabilities;
    get typeId(): string;
    readonly resource: URI;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    getName(): string;
    getIcon(): ThemeIcon;
}
