import './media/dirtydiffDecorator.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import * as ext from '../../../common/contributions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { URI } from '../../../../base/common/uri.js';
import { ISCMService } from '../common/scm.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ServicesAccessor, EditorAction } from '../../../../editor/browser/editorExtensions.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IEditorContribution, IDiffEditorModel, IEditorModel } from '../../../../editor/common/editorCommon.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ISplice } from '../../../../base/common/sequence.js';
import { IResolvedTextFileEditorModel, ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IChange } from '../../../../editor/common/diff/legacyLinesDiffComputer.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IQuickDiffService, QuickDiff } from '../common/quickDiff.js';
export interface IModelRegistry {
    getModel(editorModel: IEditorModel, codeEditor: ICodeEditor): DirtyDiffModel | undefined;
}
export interface DirtyDiffContribution extends IEditorContribution {
    getChanges(): IChange[];
}
export declare const isDirtyDiffVisible: RawContextKey<boolean>;
export declare class ShowPreviousChangeAction extends EditorAction {
    private readonly outerEditor?;
    constructor(outerEditor?: ICodeEditor | undefined);
    run(accessor: ServicesAccessor): void;
}
export declare class ShowNextChangeAction extends EditorAction {
    private readonly outerEditor?;
    constructor(outerEditor?: ICodeEditor | undefined);
    run(accessor: ServicesAccessor): void;
}
export declare class GotoPreviousChangeAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class GotoNextChangeAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class DirtyDiffController extends Disposable implements DirtyDiffContribution {
    private editor;
    private readonly configurationService;
    private readonly instantiationService;
    static readonly ID = "editor.contrib.dirtydiff";
    static get(editor: ICodeEditor): DirtyDiffController | null;
    modelRegistry: IModelRegistry | null;
    private model;
    private widget;
    private readonly isDirtyDiffVisible;
    private session;
    private mouseDownInfo;
    private enabled;
    private readonly gutterActionDisposables;
    private stylesheet;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private onDidChangeGutterAction;
    canNavigate(): boolean;
    refresh(): void;
    next(lineNumber?: number): void;
    previous(lineNumber?: number): void;
    close(): void;
    private assertWidget;
    private onDidModelChange;
    private onEditorMouseDown;
    private onEditorMouseUp;
    getChanges(): IChange[];
    dispose(): void;
}
export declare function getOriginalResource(quickDiffService: IQuickDiffService, uri: URI, language: string | undefined, isSynchronized: boolean | undefined): Promise<URI | null>;
type LabeledChange = {
    change: IChange;
    label: string;
    uri: URI;
};
export declare class DirtyDiffModel extends Disposable {
    private readonly scmService;
    private readonly quickDiffService;
    private readonly editorWorkerService;
    private readonly configurationService;
    private readonly textModelResolverService;
    private readonly progressService;
    private _quickDiffs;
    private _originalModels;
    private _originalTextModels;
    private _model;
    get original(): ITextModel[];
    private diffDelayer;
    private _quickDiffsPromise?;
    private repositoryDisposables;
    private readonly originalModelDisposables;
    private _disposed;
    private readonly _onDidChange;
    readonly onDidChange: Event<{
        changes: LabeledChange[];
        diff: ISplice<LabeledChange>[];
    }>;
    private _changes;
    get changes(): LabeledChange[];
    private _mapChanges;
    get mapChanges(): Map<string, number[]>;
    constructor(textFileModel: IResolvedTextFileEditorModel, scmService: ISCMService, quickDiffService: IQuickDiffService, editorWorkerService: IEditorWorkerService, configurationService: IConfigurationService, textModelResolverService: ITextModelService, progressService: IProgressService);
    get quickDiffs(): readonly QuickDiff[];
    getDiffEditorModel(originalUri: string): IDiffEditorModel | undefined;
    private onDidAddRepository;
    private triggerDiff;
    private setChanges;
    private diff;
    private getQuickDiffsPromise;
    private getOriginalResource;
    findNextClosestChange(lineNumber: number, inclusive?: boolean, provider?: string): number;
    findPreviousClosestChange(lineNumber: number, inclusive?: boolean, provider?: string): number;
    dispose(): void;
}
export declare class DirtyDiffWorkbenchController extends Disposable implements ext.IWorkbenchContribution, IModelRegistry {
    private readonly editorService;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly textFileService;
    private enabled;
    private viewState;
    private items;
    private readonly transientDisposables;
    private stylesheet;
    constructor(editorService: IEditorService, instantiationService: IInstantiationService, configurationService: IConfigurationService, textFileService: ITextFileService);
    private onDidChangeConfiguration;
    private onDidChangeDiffWidthConfiguration;
    private onDidChangeDiffVisibilityConfiguration;
    private setViewState;
    private enable;
    private disable;
    private onEditorsChanged;
    getModel(editorModel: ITextModel, codeEditor: ICodeEditor): DirtyDiffModel | undefined;
    dispose(): void;
}
export {};
