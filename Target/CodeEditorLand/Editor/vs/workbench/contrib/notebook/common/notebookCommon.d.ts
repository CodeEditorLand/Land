import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDiffResult } from '../../../../base/common/diff/diff.js';
import { Event } from '../../../../base/common/event.js';
import * as glob from '../../../../base/common/glob.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ISplice } from '../../../../base/common/sequence.js';
import { ThemeColor } from '../../../../base/common/themables.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ILineChange } from '../../../../editor/common/diff/legacyLinesDiffComputer.js';
import * as editorCommon from '../../../../editor/common/editorCommon.js';
import { Command, WorkspaceEditMetadata } from '../../../../editor/common/languages.js';
import { IReadonlyTextBuffer } from '../../../../editor/common/model.js';
import { IAccessibilityInformation } from '../../../../platform/accessibility/common/accessibility.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IFileReadLimits } from '../../../../platform/files/common/files.js';
import { UndoRedoGroup } from '../../../../platform/undoRedo/common/undoRedo.js';
import { IRevertOptions, ISaveOptions, IUntypedEditorInput } from '../../../common/editor.js';
import { NotebookTextModel } from './model/notebookTextModel.js';
import { ICellExecutionError } from './notebookExecutionStateService.js';
import { INotebookTextModelLike } from './notebookKernelService.js';
import { ICellRange } from './notebookRange.js';
import { RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { IWorkingCopyBackupMeta, IWorkingCopySaveEvent } from '../../../services/workingCopy/common/workingCopy.js';
export declare const NOTEBOOK_EDITOR_ID = "workbench.editor.notebook";
export declare const NOTEBOOK_DIFF_EDITOR_ID = "workbench.editor.notebookTextDiffEditor";
export declare const NOTEBOOK_MULTI_DIFF_EDITOR_ID = "workbench.editor.notebookMultiTextDiffEditor";
export declare const INTERACTIVE_WINDOW_EDITOR_ID = "workbench.editor.interactive";
export declare const REPL_EDITOR_ID = "workbench.editor.repl";
export declare const EXECUTE_REPL_COMMAND_ID = "replNotebook.input.execute";
export declare enum CellKind {
    Markup = 1,
    Code = 2
}
export declare const NOTEBOOK_DISPLAY_ORDER: readonly string[];
export declare const ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER: readonly string[];
export declare const RENDERER_EQUIVALENT_EXTENSIONS: ReadonlyMap<string, ReadonlySet<string>>;
export declare const RENDERER_NOT_AVAILABLE = "_notAvailable";
export type ContributedNotebookRendererEntrypoint = string | {
    readonly extends: string;
    readonly path: string;
};
export declare enum NotebookRunState {
    Running = 1,
    Idle = 2
}
export type NotebookDocumentMetadata = Record<string, unknown>;
export declare enum NotebookCellExecutionState {
    Unconfirmed = 1,
    Pending = 2,
    Executing = 3
}
export declare enum NotebookExecutionState {
    Unconfirmed = 1,
    Pending = 2,
    Executing = 3
}
export interface INotebookCellPreviousExecutionResult {
    executionOrder?: number;
    success?: boolean;
    duration?: number;
}
export interface NotebookCellMetadata {
    [key: string]: unknown;
}
export interface NotebookCellInternalMetadata {
    executionId?: string;
    executionOrder?: number;
    lastRunSuccess?: boolean;
    runStartTime?: number;
    runStartTimeAdjustment?: number;
    runEndTime?: number;
    renderDuration?: {
        [key: string]: number;
    };
    error?: ICellExecutionError;
}
export interface NotebookCellCollapseState {
    inputCollapsed?: boolean;
    outputCollapsed?: boolean;
}
export interface NotebookCellDefaultCollapseConfig {
    codeCell?: NotebookCellCollapseState;
    markupCell?: NotebookCellCollapseState;
}
export type InteractiveWindowCollapseCodeCells = 'always' | 'never' | 'fromEditor';
export type TransientCellMetadata = {
    readonly [K in keyof NotebookCellMetadata]?: boolean;
};
export type CellContentMetadata = {
    readonly [K in keyof NotebookCellMetadata]?: boolean;
};
export type TransientDocumentMetadata = {
    readonly [K in keyof NotebookDocumentMetadata]?: boolean;
};
export interface TransientOptions {
    readonly transientOutputs: boolean;
    readonly transientCellMetadata: TransientCellMetadata;
    readonly transientDocumentMetadata: TransientDocumentMetadata;
    readonly cellContentMetadata: CellContentMetadata;
}
export declare const enum NotebookRendererMatch {
    WithHardKernelDependency = 0,
    WithOptionalKernelDependency = 1,
    Pure = 2,
    Never = 3
}
export declare const enum RendererMessagingSpec {
    Always = "always",
    Never = "never",
    Optional = "optional"
}
export type NotebookRendererEntrypoint = {
    readonly extends: string | undefined;
    readonly path: URI;
};
export interface INotebookRendererInfo {
    readonly id: string;
    readonly displayName: string;
    readonly entrypoint: NotebookRendererEntrypoint;
    readonly extensionLocation: URI;
    readonly extensionId: ExtensionIdentifier;
    readonly messaging: RendererMessagingSpec;
    readonly mimeTypes: readonly string[];
    readonly isBuiltin: boolean;
    matchesWithoutKernel(mimeType: string): NotebookRendererMatch;
    matches(mimeType: string, kernelProvides: ReadonlyArray<string>): NotebookRendererMatch;
}
export interface INotebookStaticPreloadInfo {
    readonly type: string;
    readonly entrypoint: URI;
    readonly extensionLocation: URI;
    readonly localResourceRoots: readonly URI[];
}
export interface IOrderedMimeType {
    mimeType: string;
    rendererId: string;
    isTrusted: boolean;
}
export interface IOutputItemDto {
    readonly mime: string;
    readonly data: VSBuffer;
}
export interface IOutputDto {
    outputs: IOutputItemDto[];
    outputId: string;
    metadata?: Record<string, any>;
}
export interface ICellOutput {
    readonly versionId: number;
    outputs: IOutputItemDto[];
    metadata?: Record<string, any>;
    outputId: string;
    alternativeOutputId: string;
    onDidChangeData: Event<void>;
    replaceData(items: IOutputDto): void;
    appendData(items: IOutputItemDto[]): void;
    appendedSinceVersion(versionId: number, mime: string): VSBuffer | undefined;
    asDto(): IOutputDto;
    bumpVersion(): void;
    dispose(): void;
}
export interface CellInternalMetadataChangedEvent {
    readonly lastRunSuccessChanged?: boolean;
}
export interface INotebookDocumentMetadataTextModel {
    readonly uri: URI;
    readonly onDidChange: Event<void>;
    readonly metadata: Readonly<NotebookDocumentMetadata>;
    readonly textBuffer: IReadonlyTextBuffer;
    getValue(): string;
    getHash(): string;
}
export interface ICell {
    readonly uri: URI;
    handle: number;
    language: string;
    cellKind: CellKind;
    outputs: ICellOutput[];
    metadata: NotebookCellMetadata;
    internalMetadata: NotebookCellInternalMetadata;
    getHashValue(): number;
    textBuffer: IReadonlyTextBuffer;
    onDidChangeOutputs?: Event<NotebookCellOutputsSplice>;
    onDidChangeOutputItems?: Event<void>;
    onDidChangeLanguage: Event<string>;
    onDidChangeMetadata: Event<void>;
    onDidChangeInternalMetadata: Event<CellInternalMetadataChangedEvent>;
}
export interface INotebookTextModel extends INotebookTextModelLike {
    readonly notebookType: string;
    readonly viewType: string;
    metadata: NotebookDocumentMetadata;
    readonly transientOptions: TransientOptions;
    readonly uri: URI;
    readonly versionId: number;
    readonly length: number;
    readonly cells: readonly ICell[];
    reset(cells: ICellDto2[], metadata: NotebookDocumentMetadata, transientOptions: TransientOptions): void;
    applyEdits(rawEdits: ICellEditOperation[], synchronous: boolean, beginSelectionState: ISelectionState | undefined, endSelectionsComputer: () => ISelectionState | undefined, undoRedoGroup: UndoRedoGroup | undefined, computeUndoRedo?: boolean): boolean;
    onDidChangeContent: Event<NotebookTextModelChangedEvent>;
    onWillDispose: Event<void>;
}
export type NotebookCellTextModelSplice<T> = [
    start: number,
    deleteCount: number,
    newItems: T[]
];
export type NotebookCellOutputsSplice = {
    start: number;
    deleteCount: number;
    newOutputs: ICellOutput[];
};
export interface IMainCellDto {
    handle: number;
    url: string;
    source: string[];
    eol: string;
    versionId: number;
    language: string;
    cellKind: CellKind;
    outputs: IOutputDto[];
    metadata?: NotebookCellMetadata;
    internalMetadata?: NotebookCellInternalMetadata;
}
export declare enum NotebookCellsChangeType {
    ModelChange = 1,
    Move = 2,
    ChangeCellLanguage = 5,
    Initialize = 6,
    ChangeCellMetadata = 7,
    Output = 8,
    OutputItem = 9,
    ChangeCellContent = 10,
    ChangeDocumentMetadata = 11,
    ChangeCellInternalMetadata = 12,
    ChangeCellMime = 13,
    Unknown = 100
}
export interface NotebookCellsInitializeEvent<T> {
    readonly kind: NotebookCellsChangeType.Initialize;
    readonly changes: NotebookCellTextModelSplice<T>[];
}
export interface NotebookCellContentChangeEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellContent;
    readonly index: number;
}
export interface NotebookCellsModelChangedEvent<T> {
    readonly kind: NotebookCellsChangeType.ModelChange;
    readonly changes: NotebookCellTextModelSplice<T>[];
}
export interface NotebookCellsModelMoveEvent<T> {
    readonly kind: NotebookCellsChangeType.Move;
    readonly index: number;
    readonly length: number;
    readonly newIdx: number;
    readonly cells: T[];
}
export interface NotebookOutputChangedEvent {
    readonly kind: NotebookCellsChangeType.Output;
    readonly index: number;
    readonly outputs: IOutputDto[];
    readonly append: boolean;
}
export interface NotebookOutputItemChangedEvent {
    readonly kind: NotebookCellsChangeType.OutputItem;
    readonly index: number;
    readonly outputId: string;
    readonly outputItems: IOutputItemDto[];
    readonly append: boolean;
}
export interface NotebookCellsChangeLanguageEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellLanguage;
    readonly index: number;
    readonly language: string;
}
export interface NotebookCellsChangeMimeEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellMime;
    readonly index: number;
    readonly mime: string | undefined;
}
export interface NotebookCellsChangeMetadataEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellMetadata;
    readonly index: number;
    readonly metadata: NotebookCellMetadata;
}
export interface NotebookCellsChangeInternalMetadataEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellInternalMetadata;
    readonly index: number;
    readonly internalMetadata: NotebookCellInternalMetadata;
}
export interface NotebookDocumentChangeMetadataEvent {
    readonly kind: NotebookCellsChangeType.ChangeDocumentMetadata;
    readonly metadata: NotebookDocumentMetadata;
}
export interface NotebookDocumentUnknownChangeEvent {
    readonly kind: NotebookCellsChangeType.Unknown;
}
export type NotebookRawContentEventDto = NotebookCellsInitializeEvent<IMainCellDto> | NotebookDocumentChangeMetadataEvent | NotebookCellContentChangeEvent | NotebookCellsModelChangedEvent<IMainCellDto> | NotebookCellsModelMoveEvent<IMainCellDto> | NotebookOutputChangedEvent | NotebookOutputItemChangedEvent | NotebookCellsChangeLanguageEvent | NotebookCellsChangeMimeEvent | NotebookCellsChangeMetadataEvent | NotebookCellsChangeInternalMetadataEvent | NotebookDocumentUnknownChangeEvent;
export type NotebookCellsChangedEventDto = {
    readonly rawEvents: NotebookRawContentEventDto[];
    readonly versionId: number;
};
export type NotebookRawContentEvent = (NotebookCellsInitializeEvent<ICell> | NotebookDocumentChangeMetadataEvent | NotebookCellContentChangeEvent | NotebookCellsModelChangedEvent<ICell> | NotebookCellsModelMoveEvent<ICell> | NotebookOutputChangedEvent | NotebookOutputItemChangedEvent | NotebookCellsChangeLanguageEvent | NotebookCellsChangeMimeEvent | NotebookCellsChangeMetadataEvent | NotebookCellsChangeInternalMetadataEvent | NotebookDocumentUnknownChangeEvent) & {
    transient: boolean;
};
export declare enum SelectionStateType {
    Handle = 0,
    Index = 1
}
export interface ISelectionHandleState {
    kind: SelectionStateType.Handle;
    primary: number | null;
    selections: number[];
}
export interface ISelectionIndexState {
    kind: SelectionStateType.Index;
    focus: ICellRange;
    selections: ICellRange[];
}
export type ISelectionState = ISelectionHandleState | ISelectionIndexState;
export type NotebookTextModelChangedEvent = {
    readonly rawEvents: NotebookRawContentEvent[];
    readonly versionId: number;
    readonly synchronous: boolean | undefined;
    readonly endSelectionState: ISelectionState | undefined;
};
export type NotebookTextModelWillAddRemoveEvent = {
    readonly rawEvent: NotebookCellsModelChangedEvent<ICell>;
};
export declare const enum CellEditType {
    Replace = 1,
    Output = 2,
    Metadata = 3,
    CellLanguage = 4,
    DocumentMetadata = 5,
    Move = 6,
    OutputItems = 7,
    PartialMetadata = 8,
    PartialInternalMetadata = 9
}
export interface ICellDto2 {
    source: string;
    language: string;
    mime: string | undefined;
    cellKind: CellKind;
    outputs: IOutputDto[];
    metadata?: NotebookCellMetadata;
    internalMetadata?: NotebookCellInternalMetadata;
    collapseState?: NotebookCellCollapseState;
}
export interface ICellReplaceEdit {
    editType: CellEditType.Replace;
    index: number;
    count: number;
    cells: ICellDto2[];
}
export interface ICellOutputEdit {
    editType: CellEditType.Output;
    index: number;
    outputs: IOutputDto[];
    append?: boolean;
}
export interface ICellOutputEditByHandle {
    editType: CellEditType.Output;
    handle: number;
    outputs: IOutputDto[];
    append?: boolean;
}
export interface ICellOutputItemEdit {
    editType: CellEditType.OutputItems;
    outputId: string;
    items: IOutputItemDto[];
    append?: boolean;
}
export interface ICellMetadataEdit {
    editType: CellEditType.Metadata;
    index: number;
    metadata: NotebookCellMetadata;
}
export type NullablePartialNotebookCellMetadata = {
    [Key in keyof Partial<NotebookCellMetadata>]: NotebookCellMetadata[Key] | null;
};
export interface ICellPartialMetadataEdit {
    editType: CellEditType.PartialMetadata;
    index: number;
    metadata: NullablePartialNotebookCellMetadata;
}
export interface ICellPartialMetadataEditByHandle {
    editType: CellEditType.PartialMetadata;
    handle: number;
    metadata: NullablePartialNotebookCellMetadata;
}
export type NullablePartialNotebookCellInternalMetadata = {
    [Key in keyof Partial<NotebookCellInternalMetadata>]: NotebookCellInternalMetadata[Key] | null;
};
export interface ICellPartialInternalMetadataEdit {
    editType: CellEditType.PartialInternalMetadata;
    index: number;
    internalMetadata: NullablePartialNotebookCellInternalMetadata;
}
export interface ICellPartialInternalMetadataEditByHandle {
    editType: CellEditType.PartialInternalMetadata;
    handle: number;
    internalMetadata: NullablePartialNotebookCellInternalMetadata;
}
export interface ICellLanguageEdit {
    editType: CellEditType.CellLanguage;
    index: number;
    language: string;
}
export interface IDocumentMetadataEdit {
    editType: CellEditType.DocumentMetadata;
    metadata: NotebookDocumentMetadata;
}
export interface ICellMoveEdit {
    editType: CellEditType.Move;
    index: number;
    length: number;
    newIdx: number;
}
export type IImmediateCellEditOperation = ICellOutputEditByHandle | ICellPartialMetadataEditByHandle | ICellOutputItemEdit | ICellPartialInternalMetadataEdit | ICellPartialInternalMetadataEditByHandle | ICellPartialMetadataEdit;
export type ICellEditOperation = IImmediateCellEditOperation | ICellReplaceEdit | ICellOutputEdit | ICellMetadataEdit | ICellPartialMetadataEdit | ICellPartialInternalMetadataEdit | IDocumentMetadataEdit | ICellMoveEdit | ICellOutputItemEdit | ICellLanguageEdit;
export interface IWorkspaceNotebookCellEdit {
    metadata?: WorkspaceEditMetadata;
    resource: URI;
    notebookVersionId: number | undefined;
    cellEdit: ICellPartialMetadataEdit | IDocumentMetadataEdit | ICellReplaceEdit;
}
export interface IWorkspaceNotebookCellEditDto {
    metadata?: WorkspaceEditMetadata;
    resource: URI;
    notebookVersionId: number | undefined;
    cellEdit: ICellPartialMetadataEdit | IDocumentMetadataEdit | ICellReplaceEdit;
}
export interface NotebookData {
    readonly cells: ICellDto2[];
    readonly metadata: NotebookDocumentMetadata;
}
export interface INotebookContributionData {
    extension?: ExtensionIdentifier;
    providerDisplayName: string;
    displayName: string;
    filenamePattern: (string | glob.IRelativePattern | INotebookExclusiveDocumentFilter)[];
    priority?: RegisteredEditorPriority;
}
export declare namespace NotebookMetadataUri {
    const scheme = "vscode-notebook-metadata";
    function generate(notebook: URI): URI;
    function parse(metadata: URI): URI | undefined;
}
export declare namespace CellUri {
    const scheme = "vscode-notebook-cell";
    function generate(notebook: URI, handle: number): URI;
    function parse(cell: URI): {
        notebook: URI;
        handle: number;
    } | undefined;
    function generateCellOutputUri(notebook: URI, outputId?: string): URI;
    function parseCellOutputUri(uri: URI): {
        notebook: URI;
        outputId?: string;
    } | undefined;
    function generateCellPropertyUri(notebook: URI, handle: number, scheme: string): URI;
    function parseCellPropertyUri(uri: URI, propertyScheme: string): {
        notebook: URI;
        handle: number;
    } | undefined;
}
export declare class MimeTypeDisplayOrder {
    private readonly defaultOrder;
    private readonly order;
    constructor(initialValue?: readonly string[], defaultOrder?: readonly string[]);
    sort(mimetypes: Iterable<string>): string[];
    prioritize(chosenMimetype: string, otherMimetypes: readonly string[]): void;
    toArray(): string[];
    private findIndex;
}
export declare function diff<T>(before: T[], after: T[], contains: (a: T) => boolean, equal?: (a: T, b: T) => boolean): ISplice<T>[];
export interface ICellEditorViewState {
    selections: editorCommon.ICursorState[];
}
export declare const NOTEBOOK_EDITOR_CURSOR_BOUNDARY: RawContextKey<"top" | "none" | "bottom" | "both">;
export declare const NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY: RawContextKey<"start" | "end" | "none" | "both">;
export interface INotebookLoadOptions {
    forceReadFromFile?: boolean;
    readonly limits?: IFileReadLimits;
}
export type NotebookEditorModelCreationOptions = {
    limits?: IFileReadLimits;
    scratchpad?: boolean;
    viewType?: string;
};
export interface IResolvedNotebookEditorModel extends INotebookEditorModel {
    notebook: NotebookTextModel;
}
export interface INotebookEditorModel extends IDisposable {
    readonly onDidChangeDirty: Event<void>;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    readonly onDidChangeOrphaned: Event<void>;
    readonly onDidChangeReadonly: Event<void>;
    readonly onDidRevertUntitled: Event<void>;
    readonly resource: URI;
    readonly viewType: string;
    readonly notebook: INotebookTextModel | undefined;
    readonly hasErrorState: boolean;
    isResolved(): boolean;
    isDirty(): boolean;
    isModified(): boolean;
    isReadonly(): boolean | IMarkdownString;
    isOrphaned(): boolean;
    hasAssociatedFilePath(): boolean;
    load(options?: INotebookLoadOptions): Promise<IResolvedNotebookEditorModel>;
    save(options?: ISaveOptions): Promise<boolean>;
    saveAs(target: URI): Promise<IUntypedEditorInput | undefined>;
    revert(options?: IRevertOptions): Promise<void>;
}
export interface INotebookDiffEditorModel extends IDisposable {
    original: IResolvedNotebookEditorModel;
    modified: IResolvedNotebookEditorModel;
}
export interface NotebookDocumentBackupData extends IWorkingCopyBackupMeta {
    readonly viewType: string;
    readonly backupId?: string;
    readonly mtime?: number;
}
export declare enum NotebookEditorPriority {
    default = "default",
    option = "option"
}
export interface INotebookFindOptions {
    regex?: boolean;
    wholeWord?: boolean;
    caseSensitive?: boolean;
    wordSeparators?: string;
    includeMarkupInput?: boolean;
    includeMarkupPreview?: boolean;
    includeCodeInput?: boolean;
    includeOutput?: boolean;
    findScope?: INotebookFindScope;
}
export interface INotebookFindScope {
    findScopeType: NotebookFindScopeType;
    selectedCellRanges?: ICellRange[];
    selectedTextRanges?: Range[];
}
export declare enum NotebookFindScopeType {
    Cells = "cells",
    Text = "text",
    None = "none"
}
export interface INotebookExclusiveDocumentFilter {
    include?: string | glob.IRelativePattern;
    exclude?: string | glob.IRelativePattern;
}
export interface INotebookDocumentFilter {
    viewType?: string | string[];
    filenamePattern?: string | glob.IRelativePattern | INotebookExclusiveDocumentFilter;
}
export declare function isDocumentExcludePattern(filenamePattern: string | glob.IRelativePattern | INotebookExclusiveDocumentFilter): filenamePattern is {
    include: string | glob.IRelativePattern;
    exclude: string | glob.IRelativePattern;
};
export declare function notebookDocumentFilterMatch(filter: INotebookDocumentFilter, viewType: string, resource: URI): boolean;
export interface INotebookCellStatusBarItemProvider {
    viewType: string;
    onDidChangeStatusBarItems?: Event<void>;
    provideCellStatusBarItems(uri: URI, index: number, token: CancellationToken): Promise<INotebookCellStatusBarItemList | undefined>;
}
export interface INotebookDiffResult {
    cellsDiff: IDiffResult;
    metadataChanged: boolean;
    linesDiff?: {
        originalCellhandle: number;
        modifiedCellhandle: number;
        lineChanges: ILineChange[];
    }[];
}
export interface INotebookCellStatusBarItem {
    readonly alignment: CellStatusbarAlignment;
    readonly priority?: number;
    readonly text: string;
    readonly color?: string | ThemeColor;
    readonly backgroundColor?: string | ThemeColor;
    readonly tooltip?: string | IMarkdownString;
    readonly command?: string | Command;
    readonly accessibilityInformation?: IAccessibilityInformation;
    readonly opacity?: string;
    readonly onlyShowWhenActive?: boolean;
}
export interface INotebookCellStatusBarItemList {
    items: INotebookCellStatusBarItem[];
    dispose?(): void;
}
export type ShowCellStatusBarType = 'hidden' | 'visible' | 'visibleAfterExecute';
export declare const NotebookSetting: {
    readonly displayOrder: "notebook.displayOrder";
    readonly cellToolbarLocation: "notebook.cellToolbarLocation";
    readonly cellToolbarVisibility: "notebook.cellToolbarVisibility";
    readonly showCellStatusBar: "notebook.showCellStatusBar";
    readonly textDiffEditorPreview: "notebook.diff.enablePreview";
    readonly diffOverviewRuler: "notebook.diff.overviewRuler";
    readonly experimentalInsertToolbarAlignment: "notebook.experimental.insertToolbarAlignment";
    readonly compactView: "notebook.compactView";
    readonly focusIndicator: "notebook.cellFocusIndicator";
    readonly insertToolbarLocation: "notebook.insertToolbarLocation";
    readonly globalToolbar: "notebook.globalToolbar";
    readonly stickyScrollEnabled: "notebook.stickyScroll.enabled";
    readonly stickyScrollMode: "notebook.stickyScroll.mode";
    readonly undoRedoPerCell: "notebook.undoRedoPerCell";
    readonly consolidatedOutputButton: "notebook.consolidatedOutputButton";
    readonly showFoldingControls: "notebook.showFoldingControls";
    readonly dragAndDropEnabled: "notebook.dragAndDropEnabled";
    readonly cellEditorOptionsCustomizations: "notebook.editorOptionsCustomizations";
    readonly consolidatedRunButton: "notebook.consolidatedRunButton";
    readonly openGettingStarted: "notebook.experimental.openGettingStarted";
    readonly globalToolbarShowLabel: "notebook.globalToolbarShowLabel";
    readonly markupFontSize: "notebook.markup.fontSize";
    readonly markdownLineHeight: "notebook.markdown.lineHeight";
    readonly interactiveWindowCollapseCodeCells: "interactiveWindow.collapseCellInputCode";
    readonly outputScrollingDeprecated: "notebook.experimental.outputScrolling";
    readonly outputScrolling: "notebook.output.scrolling";
    readonly textOutputLineLimit: "notebook.output.textLineLimit";
    readonly LinkifyOutputFilePaths: "notebook.output.linkifyFilePaths";
    readonly minimalErrorRendering: "notebook.output.minimalErrorRendering";
    readonly formatOnSave: "notebook.formatOnSave.enabled";
    readonly insertFinalNewline: "notebook.insertFinalNewline";
    readonly defaultFormatter: "notebook.defaultFormatter";
    readonly formatOnCellExecution: "notebook.formatOnCellExecution";
    readonly codeActionsOnSave: "notebook.codeActionsOnSave";
    readonly outputWordWrap: "notebook.output.wordWrap";
    readonly outputLineHeightDeprecated: "notebook.outputLineHeight";
    readonly outputLineHeight: "notebook.output.lineHeight";
    readonly outputFontSizeDeprecated: "notebook.outputFontSize";
    readonly outputFontSize: "notebook.output.fontSize";
    readonly outputFontFamilyDeprecated: "notebook.outputFontFamily";
    readonly outputFontFamily: "notebook.output.fontFamily";
    readonly findFilters: "notebook.find.filters";
    readonly logging: "notebook.logging";
    readonly confirmDeleteRunningCell: "notebook.confirmDeleteRunningCell";
    readonly remoteSaving: "notebook.experimental.remoteSave";
    readonly gotoSymbolsAllSymbols: "notebook.gotoSymbols.showAllSymbols";
    readonly outlineShowMarkdownHeadersOnly: "notebook.outline.showMarkdownHeadersOnly";
    readonly outlineShowCodeCells: "notebook.outline.showCodeCells";
    readonly outlineShowCodeCellSymbols: "notebook.outline.showCodeCellSymbols";
    readonly breadcrumbsShowCodeCells: "notebook.breadcrumbs.showCodeCells";
    readonly scrollToRevealCell: "notebook.scrolling.revealNextCellOnExecute";
    readonly cellChat: "notebook.experimental.cellChat";
    readonly cellGenerate: "notebook.experimental.generate";
    readonly notebookVariablesView: "notebook.experimental.variablesView";
    readonly InteractiveWindowPromptToSave: "interactiveWindow.promptToSaveOnClose";
    readonly cellFailureDiagnostics: "notebook.cellFailureDiagnostics";
    readonly outputBackupSizeLimit: "notebook.backup.sizeLimit";
    readonly multiCursor: "notebook.multiCursor.enabled";
};
export declare const enum CellStatusbarAlignment {
    Left = 1,
    Right = 2
}
export declare class NotebookWorkingCopyTypeIdentifier {
    private static _prefix;
    static create(notebookType: string, viewType?: string): string;
    static parse(candidate: string): {
        notebookType: string;
        viewType: string;
    } | undefined;
}
export interface NotebookExtensionDescription {
    readonly id: ExtensionIdentifier;
    readonly location: UriComponents | undefined;
}
export declare function isTextStreamMime(mimeType: string): boolean;
export declare function compressOutputItemStreams(outputs: Uint8Array[]): {
    data: VSBuffer;
    didCompression: boolean;
};
export declare const MOVE_CURSOR_1_LINE_COMMAND: string;
export interface INotebookKernelSourceAction {
    readonly label: string;
    readonly description?: string;
    readonly detail?: string;
    readonly command?: string | Command;
    readonly documentation?: UriComponents | string;
}
