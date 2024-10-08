import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { MergeEditorViewModel } from '../view/viewModel.js';
export declare const conflictMarkers: {
    start: string;
    end: string;
};
export declare class MergeMarkersController extends Disposable {
    readonly editor: ICodeEditor;
    readonly mergeEditorViewModel: IObservable<MergeEditorViewModel | undefined>;
    private readonly viewZoneIds;
    private readonly disposableStore;
    constructor(editor: ICodeEditor, mergeEditorViewModel: IObservable<MergeEditorViewModel | undefined>);
    private updateDecorations;
}
