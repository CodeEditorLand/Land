import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { CancellationTokenSource, CancellationToken } from '../../../../base/common/cancellation.js';
export declare class EditorKeybindingCancellationTokenSource extends CancellationTokenSource {
    readonly editor: ICodeEditor;
    private readonly _unregister;
    constructor(editor: ICodeEditor, parent?: CancellationToken);
    dispose(): void;
}
