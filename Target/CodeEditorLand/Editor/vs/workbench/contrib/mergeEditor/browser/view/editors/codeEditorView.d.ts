import { IView } from '../../../../../../base/browser/ui/grid/grid.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { IEditorContributionDescription } from '../../../../../../editor/browser/editorExtensions.js';
import { CodeEditorWidget } from '../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IEditorOptions } from '../../../../../../editor/common/config/editorOptions.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { Selection } from '../../../../../../editor/common/core/selection.js';
import { MenuId } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { MergeEditorViewModel } from '../viewModel.js';
export declare abstract class CodeEditorView extends Disposable {
    private readonly instantiationService;
    readonly viewModel: IObservable<undefined | MergeEditorViewModel>;
    private readonly configurationService;
    readonly model: IObservable<import("../../model/mergeEditorModel.js").MergeEditorModel | undefined, unknown>;
    protected readonly htmlElements: {
        description: HTMLSpanElement;
        root: HTMLSpanElement & HTMLDivElement;
        title: HTMLSpanElement;
        detail: HTMLSpanElement;
        toolbar: HTMLSpanElement;
        header: HTMLDivElement;
        editor: HTMLDivElement;
        gutterDiv: HTMLDivElement;
    };
    private readonly _onDidViewChange;
    readonly view: IView;
    protected readonly checkboxesVisible: IObservable<boolean, unknown>;
    protected readonly showDeletionMarkers: IObservable<boolean, unknown>;
    protected readonly useSimplifiedDecorations: IObservable<boolean, unknown>;
    readonly editor: CodeEditorWidget;
    updateOptions(newOptions: Readonly<IEditorOptions>): void;
    readonly isFocused: IObservable<boolean, unknown>;
    readonly cursorPosition: IObservable<import("../../../../../../editor/common/core/position.js").Position | null, unknown>;
    readonly selection: IObservable<Selection[] | null, unknown>;
    readonly cursorLineNumber: IObservable<number | undefined, unknown>;
    constructor(instantiationService: IInstantiationService, viewModel: IObservable<undefined | MergeEditorViewModel>, configurationService: IConfigurationService);
    protected getEditorContributions(): IEditorContributionDescription[];
}
export declare function createSelectionsAutorun(codeEditorView: CodeEditorView, translateRange: (baseRange: Range, viewModel: MergeEditorViewModel) => Range): IDisposable;
export declare class TitleMenu extends Disposable {
    constructor(menuId: MenuId, targetHtmlElement: HTMLElement, instantiationService: IInstantiationService);
}
