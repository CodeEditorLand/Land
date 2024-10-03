import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { SuggestModel } from './suggestModel.js';
export declare class OvertypingCapturer implements IDisposable {
    private static readonly _maxSelectionLength;
    private readonly _disposables;
    private _lastOvertyped;
    private _locked;
    constructor(editor: ICodeEditor, suggestModel: SuggestModel);
    getLastOvertypedInfo(idx: number): {
        value: string;
        multiline: boolean;
    } | undefined;
    dispose(): void;
}
