import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IReader } from '../../../../../base/common/observable.js';
import { ICodeEditor, IViewZoneChangeAccessor } from '../../../../../editor/browser/editorBrowser.js';
import { MergeEditorViewModel } from './viewModel.js';
export declare class ViewZoneComputer {
    private readonly input1Editor;
    private readonly input2Editor;
    private readonly resultEditor;
    private readonly conflictActionsFactoryInput1;
    private readonly conflictActionsFactoryInput2;
    private readonly conflictActionsFactoryResult;
    constructor(input1Editor: ICodeEditor, input2Editor: ICodeEditor, resultEditor: ICodeEditor);
    computeViewZones(reader: IReader, viewModel: MergeEditorViewModel, options: {
        shouldAlignResult: boolean;
        shouldAlignBase: boolean;
        codeLensesVisible: boolean;
        showNonConflictingChanges: boolean;
    }): MergeEditorViewZones;
}
export declare class MergeEditorViewZones {
    readonly input1ViewZones: readonly MergeEditorViewZone[];
    readonly input2ViewZones: readonly MergeEditorViewZone[];
    readonly baseViewZones: readonly MergeEditorViewZone[];
    readonly resultViewZones: readonly MergeEditorViewZone[];
    constructor(input1ViewZones: readonly MergeEditorViewZone[], input2ViewZones: readonly MergeEditorViewZone[], baseViewZones: readonly MergeEditorViewZone[], resultViewZones: readonly MergeEditorViewZone[]);
}
export declare abstract class MergeEditorViewZone {
    abstract create(viewZoneChangeAccessor: IViewZoneChangeAccessor, viewZoneIdsToCleanUp: string[], disposableStore: DisposableStore): void;
}
