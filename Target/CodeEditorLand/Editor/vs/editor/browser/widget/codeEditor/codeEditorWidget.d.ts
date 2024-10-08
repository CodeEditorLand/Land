import '../../services/markerDecorations.js';
import { IKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { IMouseWheelEvent } from '../../../../base/browser/mouseEvent.js';
import { Emitter, EmitterOptions, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import './editor.css';
import { EditorConfiguration, IEditorConstructionOptions } from '../../config/editorConfiguration.js';
import * as editorBrowser from '../../editorBrowser.js';
import { IEditorContributionDescription } from '../../editorExtensions.js';
import { ICodeEditorService } from '../../services/codeEditorService.js';
import { View } from '../../view.js';
import { CodeEditorContributions } from './codeEditorContributions.js';
import { ConfigurationChangedEvent, EditorLayoutInfo, EditorOption, FindComputedEditorOptionValueById, IComputedEditorOptions, IEditorOptions } from '../../../common/config/editorOptions.js';
import { IDimension } from '../../../common/core/dimension.js';
import { IPosition, Position } from '../../../common/core/position.js';
import { IRange, Range } from '../../../common/core/range.js';
import { ISelection, Selection } from '../../../common/core/selection.js';
import { IWordAtPosition } from '../../../common/core/wordHelper.js';
import { CursorChangeReason, ICursorPositionChangedEvent, ICursorSelectionChangedEvent } from '../../../common/cursorEvents.js';
import * as editorCommon from '../../../common/editorCommon.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { IAttachedView, ICursorStateComputer, IIdentifiedSingleEditOperation, IModelDecoration, IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel } from '../../../common/model.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent } from '../../../common/textModelEvents.js';
import { IEditorWhitespace, IViewModel } from '../../../common/viewModel.js';
import { ViewModel } from '../../../common/viewModel/viewModelImpl.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyValue, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
export declare class CodeEditorWidget extends Disposable implements editorBrowser.ICodeEditor {
    private readonly languageConfigurationService;
    private static readonly dropIntoEditorDecorationOptions;
    private readonly _deliveryQueue;
    protected readonly _contributions: CodeEditorContributions;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<void>;
    private readonly _onDidChangeModelContent;
    readonly onDidChangeModelContent: Event<IModelContentChangedEvent>;
    private readonly _onDidChangeModelLanguage;
    readonly onDidChangeModelLanguage: Event<IModelLanguageChangedEvent>;
    private readonly _onDidChangeModelLanguageConfiguration;
    readonly onDidChangeModelLanguageConfiguration: Event<IModelLanguageConfigurationChangedEvent>;
    private readonly _onDidChangeModelOptions;
    readonly onDidChangeModelOptions: Event<IModelOptionsChangedEvent>;
    private readonly _onDidChangeModelDecorations;
    readonly onDidChangeModelDecorations: Event<IModelDecorationsChangedEvent>;
    private readonly _onDidChangeModelTokens;
    readonly onDidChangeModelTokens: Event<IModelTokensChangedEvent>;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<ConfigurationChangedEvent>;
    protected readonly _onWillChangeModel: Emitter<editorCommon.IModelChangedEvent>;
    readonly onWillChangeModel: Event<editorCommon.IModelChangedEvent>;
    protected readonly _onDidChangeModel: Emitter<editorCommon.IModelChangedEvent>;
    readonly onDidChangeModel: Event<editorCommon.IModelChangedEvent>;
    private readonly _onDidChangeCursorPosition;
    readonly onDidChangeCursorPosition: Event<ICursorPositionChangedEvent>;
    private readonly _onDidChangeCursorSelection;
    readonly onDidChangeCursorSelection: Event<ICursorSelectionChangedEvent>;
    private readonly _onDidAttemptReadOnlyEdit;
    readonly onDidAttemptReadOnlyEdit: Event<void>;
    private readonly _onDidLayoutChange;
    readonly onDidLayoutChange: Event<EditorLayoutInfo>;
    private readonly _editorTextFocus;
    readonly onDidFocusEditorText: Event<void>;
    readonly onDidBlurEditorText: Event<void>;
    private readonly _editorWidgetFocus;
    readonly onDidFocusEditorWidget: Event<void>;
    readonly onDidBlurEditorWidget: Event<void>;
    private readonly _onWillType;
    readonly onWillType: Event<string>;
    private readonly _onDidType;
    readonly onDidType: Event<string>;
    private readonly _onDidCompositionStart;
    readonly onDidCompositionStart: Event<void>;
    private readonly _onDidCompositionEnd;
    readonly onDidCompositionEnd: Event<void>;
    private readonly _onDidPaste;
    readonly onDidPaste: Event<editorBrowser.IPasteEvent>;
    private readonly _onMouseUp;
    readonly onMouseUp: Event<editorBrowser.IEditorMouseEvent>;
    private readonly _onMouseDown;
    readonly onMouseDown: Event<editorBrowser.IEditorMouseEvent>;
    private readonly _onMouseDrag;
    readonly onMouseDrag: Event<editorBrowser.IEditorMouseEvent>;
    private readonly _onMouseDrop;
    readonly onMouseDrop: Event<editorBrowser.IPartialEditorMouseEvent>;
    private readonly _onMouseDropCanceled;
    readonly onMouseDropCanceled: Event<void>;
    private readonly _onDropIntoEditor;
    readonly onDropIntoEditor: Event<{
        readonly position: IPosition;
        readonly event: DragEvent;
    }>;
    private readonly _onContextMenu;
    readonly onContextMenu: Event<editorBrowser.IEditorMouseEvent>;
    private readonly _onMouseMove;
    readonly onMouseMove: Event<editorBrowser.IEditorMouseEvent>;
    private readonly _onMouseLeave;
    readonly onMouseLeave: Event<editorBrowser.IPartialEditorMouseEvent>;
    private readonly _onMouseWheel;
    readonly onMouseWheel: Event<IMouseWheelEvent>;
    private readonly _onKeyUp;
    readonly onKeyUp: Event<IKeyboardEvent>;
    private readonly _onKeyDown;
    readonly onKeyDown: Event<IKeyboardEvent>;
    private readonly _onDidContentSizeChange;
    readonly onDidContentSizeChange: Event<editorCommon.IContentSizeChangedEvent>;
    private readonly _onDidScrollChange;
    readonly onDidScrollChange: Event<editorCommon.IScrollEvent>;
    private readonly _onDidChangeViewZones;
    readonly onDidChangeViewZones: Event<void>;
    private readonly _onDidChangeHiddenAreas;
    readonly onDidChangeHiddenAreas: Event<void>;
    private _updateCounter;
    private readonly _onWillTriggerEditorOperationEvent;
    readonly onWillTriggerEditorOperationEvent: Event<editorCommon.ITriggerEditorOperationEvent>;
    private readonly _onBeginUpdate;
    readonly onBeginUpdate: Event<void>;
    private readonly _onEndUpdate;
    readonly onEndUpdate: Event<void>;
    get isSimpleWidget(): boolean;
    get contextMenuId(): MenuId;
    private readonly _telemetryData?;
    private readonly _domElement;
    private readonly _overflowWidgetsDomNode;
    private readonly _id;
    private readonly _configuration;
    private _contributionsDisposable;
    protected readonly _actions: Map<string, editorCommon.IEditorAction>;
    protected _modelData: ModelData | null;
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _contextKeyService: IContextKeyService;
    get contextKeyService(): IContextKeyService;
    private readonly _notificationService;
    protected readonly _codeEditorService: ICodeEditorService;
    private readonly _commandService;
    private readonly _themeService;
    private readonly _focusTracker;
    private _contentWidgets;
    private _overlayWidgets;
    private _glyphMarginWidgets;
    /**
     * map from "parent" decoration type to live decoration ids.
     */
    private _decorationTypeKeysToIds;
    private _decorationTypeSubtypes;
    private _bannerDomNode;
    private _dropIntoEditorDecorations;
    constructor(domElement: HTMLElement, _options: Readonly<IEditorConstructionOptions>, codeEditorWidgetOptions: ICodeEditorWidgetOptions, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    writeScreenReaderContent(reason: string): void;
    protected _createConfiguration(isSimpleWidget: boolean, contextMenuId: MenuId, options: Readonly<IEditorConstructionOptions>, accessibilityService: IAccessibilityService): EditorConfiguration;
    getId(): string;
    getEditorType(): string;
    dispose(): void;
    invokeWithinContext<T>(fn: (accessor: ServicesAccessor) => T): T;
    updateOptions(newOptions: Readonly<IEditorOptions> | undefined): void;
    getOptions(): IComputedEditorOptions;
    getOption<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
    getRawOptions(): IEditorOptions;
    getOverflowWidgetsDomNode(): HTMLElement | undefined;
    getConfiguredWordAtPosition(position: Position): IWordAtPosition | null;
    getValue(options?: {
        preserveBOM: boolean;
        lineEnding: string;
    } | null): string;
    setValue(newValue: string): void;
    getModel(): ITextModel | null;
    setModel(_model?: ITextModel | editorCommon.IDiffEditorModel | editorCommon.IDiffEditorViewModel | null): void;
    private _removeDecorationTypes;
    getVisibleRanges(): Range[];
    getVisibleRangesPlusViewportAboveBelow(): Range[];
    getWhitespaces(): IEditorWhitespace[];
    private static _getVerticalOffsetAfterPosition;
    getTopForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getTopForPosition(lineNumber: number, column: number): number;
    private static _getVerticalOffsetForPosition;
    getBottomForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    setHiddenAreas(ranges: IRange[], source?: unknown, forceUpdate?: boolean): void;
    getVisibleColumnFromPosition(rawPosition: IPosition): number;
    getStatusbarColumn(rawPosition: IPosition): number;
    getPosition(): Position | null;
    setPosition(position: IPosition, source?: string): void;
    private _sendRevealRange;
    revealLine(lineNumber: number, scrollType?: editorCommon.ScrollType): void;
    revealLineInCenter(lineNumber: number, scrollType?: editorCommon.ScrollType): void;
    revealLineInCenterIfOutsideViewport(lineNumber: number, scrollType?: editorCommon.ScrollType): void;
    revealLineNearTop(lineNumber: number, scrollType?: editorCommon.ScrollType): void;
    private _revealLine;
    revealPosition(position: IPosition, scrollType?: editorCommon.ScrollType): void;
    revealPositionInCenter(position: IPosition, scrollType?: editorCommon.ScrollType): void;
    revealPositionInCenterIfOutsideViewport(position: IPosition, scrollType?: editorCommon.ScrollType): void;
    revealPositionNearTop(position: IPosition, scrollType?: editorCommon.ScrollType): void;
    private _revealPosition;
    getSelection(): Selection | null;
    getSelections(): Selection[] | null;
    setSelection(range: IRange, source?: string): void;
    setSelection(editorRange: Range, source?: string): void;
    setSelection(selection: ISelection, source?: string): void;
    setSelection(editorSelection: Selection, source?: string): void;
    private _setSelectionImpl;
    revealLines(startLineNumber: number, endLineNumber: number, scrollType?: editorCommon.ScrollType): void;
    revealLinesInCenter(startLineNumber: number, endLineNumber: number, scrollType?: editorCommon.ScrollType): void;
    revealLinesInCenterIfOutsideViewport(startLineNumber: number, endLineNumber: number, scrollType?: editorCommon.ScrollType): void;
    revealLinesNearTop(startLineNumber: number, endLineNumber: number, scrollType?: editorCommon.ScrollType): void;
    private _revealLines;
    revealRange(range: IRange, scrollType?: editorCommon.ScrollType, revealVerticalInCenter?: boolean, revealHorizontal?: boolean): void;
    revealRangeInCenter(range: IRange, scrollType?: editorCommon.ScrollType): void;
    revealRangeInCenterIfOutsideViewport(range: IRange, scrollType?: editorCommon.ScrollType): void;
    revealRangeNearTop(range: IRange, scrollType?: editorCommon.ScrollType): void;
    revealRangeNearTopIfOutsideViewport(range: IRange, scrollType?: editorCommon.ScrollType): void;
    revealRangeAtTop(range: IRange, scrollType?: editorCommon.ScrollType): void;
    private _revealRange;
    setSelections(ranges: readonly ISelection[], source?: string, reason?: CursorChangeReason): void;
    getContentWidth(): number;
    getScrollWidth(): number;
    getScrollLeft(): number;
    getContentHeight(): number;
    getScrollHeight(): number;
    getScrollTop(): number;
    setScrollLeft(newScrollLeft: number, scrollType?: editorCommon.ScrollType): void;
    setScrollTop(newScrollTop: number, scrollType?: editorCommon.ScrollType): void;
    setScrollPosition(position: editorCommon.INewScrollPosition, scrollType?: editorCommon.ScrollType): void;
    hasPendingScrollAnimation(): boolean;
    saveViewState(): editorCommon.ICodeEditorViewState | null;
    restoreViewState(s: editorCommon.IEditorViewState | null): void;
    handleInitialized(): void;
    onVisible(): void;
    onHide(): void;
    getContribution<T extends editorCommon.IEditorContribution>(id: string): T | null;
    getActions(): editorCommon.IEditorAction[];
    getSupportedActions(): editorCommon.IEditorAction[];
    getAction(id: string): editorCommon.IEditorAction | null;
    trigger(source: string | null | undefined, handlerId: string, payload: any): void;
    protected _triggerCommand(handlerId: string, payload: any): void;
    private _startComposition;
    private _endComposition;
    private _type;
    private _compositionType;
    private _paste;
    private _cut;
    private _triggerEditorCommand;
    _getViewModel(): IViewModel | null;
    pushUndoStop(): boolean;
    popUndoStop(): boolean;
    executeEdits(source: string | null | undefined, edits: IIdentifiedSingleEditOperation[], endCursorState?: ICursorStateComputer | Selection[]): boolean;
    executeCommand(source: string | null | undefined, command: editorCommon.ICommand): void;
    executeCommands(source: string | null | undefined, commands: editorCommon.ICommand[]): void;
    createDecorationsCollection(decorations?: IModelDeltaDecoration[]): EditorDecorationsCollection;
    changeDecorations(callback: (changeAccessor: IModelDecorationsChangeAccessor) => any): any;
    getLineDecorations(lineNumber: number): IModelDecoration[] | null;
    getDecorationsInRange(range: Range): IModelDecoration[] | null;
    /**
     * @deprecated
     */
    deltaDecorations(oldDecorations: string[], newDecorations: IModelDeltaDecoration[]): string[];
    removeDecorations(decorationIds: string[]): void;
    setDecorationsByType(description: string, decorationTypeKey: string, decorationOptions: editorCommon.IDecorationOptions[]): void;
    setDecorationsByTypeFast(decorationTypeKey: string, ranges: IRange[]): void;
    removeDecorationsByType(decorationTypeKey: string): void;
    getLayoutInfo(): EditorLayoutInfo;
    createOverviewRuler(cssClassName: string): editorBrowser.IOverviewRuler | null;
    getContainerDomNode(): HTMLElement;
    getDomNode(): HTMLElement | null;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    layout(dimension?: IDimension, postponeRendering?: boolean): void;
    focus(): void;
    hasTextFocus(): boolean;
    hasWidgetFocus(): boolean;
    addContentWidget(widget: editorBrowser.IContentWidget): void;
    layoutContentWidget(widget: editorBrowser.IContentWidget): void;
    removeContentWidget(widget: editorBrowser.IContentWidget): void;
    addOverlayWidget(widget: editorBrowser.IOverlayWidget): void;
    layoutOverlayWidget(widget: editorBrowser.IOverlayWidget): void;
    removeOverlayWidget(widget: editorBrowser.IOverlayWidget): void;
    addGlyphMarginWidget(widget: editorBrowser.IGlyphMarginWidget): void;
    layoutGlyphMarginWidget(widget: editorBrowser.IGlyphMarginWidget): void;
    removeGlyphMarginWidget(widget: editorBrowser.IGlyphMarginWidget): void;
    changeViewZones(callback: (accessor: editorBrowser.IViewZoneChangeAccessor) => void): void;
    getTargetAtClientPoint(clientX: number, clientY: number): editorBrowser.IMouseTarget | null;
    getScrolledVisiblePosition(rawPosition: IPosition): {
        top: number;
        left: number;
        height: number;
    } | null;
    getOffsetForColumn(lineNumber: number, column: number): number;
    render(forceRedraw?: boolean): void;
    setAriaOptions(options: editorBrowser.IEditorAriaOptions): void;
    applyFontInfo(target: HTMLElement): void;
    setBanner(domNode: HTMLElement | null, domNodeHeight: number): void;
    protected _attachModel(model: ITextModel | null): void;
    protected _createView(viewModel: ViewModel): [View, boolean];
    protected _postDetachModelCleanup(detachedModel: ITextModel | null): void;
    private _detachModel;
    private _registerDecorationType;
    private _removeDecorationType;
    private _resolveDecorationOptions;
    getTelemetryData(): {
        [key: string]: any;
    } | undefined;
    hasModel(): this is editorBrowser.IActiveCodeEditor;
    private showDropIndicatorAt;
    private removeDropIndicator;
    setContextValue(key: string, value: ContextKeyValue): void;
    private _beginUpdate;
    private _endUpdate;
}
export interface ICodeEditorWidgetOptions {
    /**
     * Is this a simple widget (not a real code editor)?
     * Defaults to false.
     */
    isSimpleWidget?: boolean;
    /**
     * Contributions to instantiate.
     * When provided, only the contributions included will be instantiated.
     * To include the defaults, those must be provided as well via [...EditorExtensionsRegistry.getEditorContributions()]
     * Defaults to EditorExtensionsRegistry.getEditorContributions().
     */
    contributions?: IEditorContributionDescription[];
    /**
     * Telemetry data associated with this CodeEditorWidget.
     * Defaults to null.
     */
    telemetryData?: object;
    /**
     * The ID of the context menu.
     * Defaults to MenuId.SimpleEditorContext or MenuId.EditorContext depending on whether the widget is simple.
     */
    contextMenuId?: MenuId;
}
declare class ModelData {
    readonly model: ITextModel;
    readonly viewModel: ViewModel;
    readonly view: View;
    readonly hasRealView: boolean;
    readonly listenersToRemove: IDisposable[];
    readonly attachedView: IAttachedView;
    constructor(model: ITextModel, viewModel: ViewModel, view: View, hasRealView: boolean, listenersToRemove: IDisposable[], attachedView: IAttachedView);
    dispose(): void;
}
export declare class BooleanEventEmitter extends Disposable {
    private readonly _emitterOptions;
    private readonly _onDidChangeToTrue;
    readonly onDidChangeToTrue: Event<void>;
    private readonly _onDidChangeToFalse;
    readonly onDidChangeToFalse: Event<void>;
    private _value;
    constructor(_emitterOptions: EmitterOptions);
    setValue(_value: boolean): void;
}
export declare class EditorModeContext extends Disposable {
    private readonly _editor;
    private readonly _contextKeyService;
    private readonly _languageFeaturesService;
    private readonly _langId;
    private readonly _hasCompletionItemProvider;
    private readonly _hasCodeActionsProvider;
    private readonly _hasCodeLensProvider;
    private readonly _hasDefinitionProvider;
    private readonly _hasDeclarationProvider;
    private readonly _hasImplementationProvider;
    private readonly _hasTypeDefinitionProvider;
    private readonly _hasHoverProvider;
    private readonly _hasDocumentHighlightProvider;
    private readonly _hasDocumentSymbolProvider;
    private readonly _hasReferenceProvider;
    private readonly _hasRenameProvider;
    private readonly _hasDocumentFormattingProvider;
    private readonly _hasDocumentSelectionFormattingProvider;
    private readonly _hasMultipleDocumentFormattingProvider;
    private readonly _hasMultipleDocumentSelectionFormattingProvider;
    private readonly _hasSignatureHelpProvider;
    private readonly _hasInlayHintsProvider;
    private readonly _isInEmbeddedEditor;
    constructor(_editor: CodeEditorWidget, _contextKeyService: IContextKeyService, _languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    reset(): void;
    private _update;
}
declare class EditorDecorationsCollection implements editorCommon.IEditorDecorationsCollection {
    private readonly _editor;
    private _decorationIds;
    private _isChangingDecorations;
    get length(): number;
    constructor(_editor: editorBrowser.ICodeEditor, decorations: IModelDeltaDecoration[] | undefined);
    onDidChange(listener: (e: IModelDecorationsChangedEvent) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
    getRange(index: number): Range | null;
    getRanges(): Range[];
    has(decoration: IModelDecoration): boolean;
    clear(): void;
    set(newDecorations: readonly IModelDeltaDecoration[]): string[];
    append(newDecorations: readonly IModelDeltaDecoration[]): string[];
}
export {};
