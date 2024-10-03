import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ICodeEditor, IViewZoneChangeAccessor } from '../../../../../editor/browser/editorBrowser.js';
import { ModifiedBaseRange } from '../model/modifiedBaseRange.js';
import { MergeEditorViewModel } from './viewModel.js';
export declare class ConflictActionsFactory extends Disposable {
    private readonly _editor;
    private readonly _styleClassName;
    private readonly _styleElement;
    constructor(_editor: ICodeEditor);
    private _updateLensStyle;
    private _getLayoutInfo;
    createWidget(viewZoneChangeAccessor: IViewZoneChangeAccessor, lineNumber: number, items: IObservable<IContentWidgetAction[]>, viewZoneIdsToCleanUp: string[]): IDisposable;
}
export declare class ActionsSource {
    private readonly viewModel;
    private readonly modifiedBaseRange;
    constructor(viewModel: MergeEditorViewModel, modifiedBaseRange: ModifiedBaseRange);
    private getItemsInput;
    readonly itemsInput1: IObservable<IContentWidgetAction[], unknown>;
    readonly itemsInput2: IObservable<IContentWidgetAction[], unknown>;
    readonly resultItems: IObservable<IContentWidgetAction[], unknown>;
    readonly isEmpty: IObservable<boolean, unknown>;
    readonly inputIsEmpty: IObservable<boolean, unknown>;
}
export interface IContentWidgetAction {
    text: string;
    tooltip?: string;
    action?: () => Promise<void>;
}
