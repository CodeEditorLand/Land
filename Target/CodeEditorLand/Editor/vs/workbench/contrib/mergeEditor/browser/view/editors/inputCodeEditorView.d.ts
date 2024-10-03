import { IAction } from '../../../../../../base/common/actions.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable, ITransaction } from '../../../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { InputState, ModifiedBaseRange } from '../../model/modifiedBaseRange.js';
import { MergeEditorViewModel } from '../viewModel.js';
import { IGutterItemInfo, IGutterItemView } from '../editorGutter.js';
import { CodeEditorView } from './codeEditorView.js';
export declare class InputCodeEditorView extends CodeEditorView {
    readonly inputNumber: 1 | 2;
    readonly otherInputNumber: number;
    constructor(inputNumber: 1 | 2, viewModel: IObservable<MergeEditorViewModel | undefined>, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, configurationService: IConfigurationService);
    private readonly modifiedBaseRangeGutterItemInfos;
    private readonly decorations;
}
export declare class ModifiedBaseRangeGutterItemModel implements IGutterItemInfo {
    readonly id: string;
    private readonly baseRange;
    private readonly inputNumber;
    private readonly viewModel;
    private readonly model;
    readonly range: import("../../model/lineRange.js").LineRange;
    constructor(id: string, baseRange: ModifiedBaseRange, inputNumber: 1 | 2, viewModel: MergeEditorViewModel);
    readonly enabled: IObservable<boolean, unknown>;
    readonly toggleState: IObservable<InputState>;
    readonly state: IObservable<{
        handled: boolean;
        focused: boolean;
    }>;
    setState(value: boolean, tx: ITransaction): void;
    toggleBothSides(): void;
    getContextMenuActions(): readonly IAction[];
}
export declare class MergeConflictGutterItemView extends Disposable implements IGutterItemView<ModifiedBaseRangeGutterItemModel> {
    private readonly item;
    private readonly checkboxDiv;
    private readonly isMultiLine;
    constructor(item: ModifiedBaseRangeGutterItemModel, target: HTMLElement, contextMenuService: IContextMenuService);
    layout(top: number, height: number, viewTop: number, viewHeight: number): void;
    update(baseRange: ModifiedBaseRangeGutterItemModel): void;
}
