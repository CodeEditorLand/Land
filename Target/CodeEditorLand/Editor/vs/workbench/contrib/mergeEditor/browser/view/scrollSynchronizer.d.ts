import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { BaseCodeEditorView } from './editors/baseCodeEditorView.js';
import { IMergeEditorLayout } from './mergeEditor.js';
import { MergeEditorViewModel } from './viewModel.js';
import { InputCodeEditorView } from './editors/inputCodeEditorView.js';
import { ResultCodeEditorView } from './editors/resultCodeEditorView.js';
export declare class ScrollSynchronizer extends Disposable {
    private readonly viewModel;
    private readonly input1View;
    private readonly input2View;
    private readonly baseView;
    private readonly inputResultView;
    private readonly layout;
    private get model();
    private readonly reentrancyBarrier;
    readonly updateScrolling: () => void;
    private get shouldAlignResult();
    private get shouldAlignBase();
    constructor(viewModel: IObservable<MergeEditorViewModel | undefined>, input1View: InputCodeEditorView, input2View: InputCodeEditorView, baseView: IObservable<BaseCodeEditorView | undefined>, inputResultView: ResultCodeEditorView, layout: IObservable<IMergeEditorLayout>);
    private synchronizeScrolling;
}
