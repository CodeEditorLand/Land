import { Event } from '../../base/common/event.js';
import { DeepRequiredNonNullable } from '../../base/common/types.js';
import { URI } from '../../base/common/uri.js';
import { Disposable, IDisposable } from '../../base/common/lifecycle.js';
import { IDiffEditor, IEditor, IEditorViewState } from '../../editor/common/editorCommon.js';
import { IEditorOptions, IResourceEditorInput, ITextResourceEditorInput, IBaseTextResourceEditorInput, IBaseUntypedEditorInput, ITextEditorOptions } from '../../platform/editor/common/editor.js';
import type { EditorInput } from './editor/editorInput.js';
import { IInstantiationService, ServicesAccessor, BrandedService } from '../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../platform/contextkey/common/contextkey.js';
import { IEncodingSupport, ILanguageSupport } from '../services/textfile/common/textfiles.js';
import { IEditorGroup } from '../services/editor/common/editorGroupsService.js';
import { ICompositeControl, IComposite } from './composite.js';
import { IFileReadLimits, IFileService } from '../../platform/files/common/files.js';
import { IPathData } from '../../platform/window/common/window.js';
import { IExtUri } from '../../base/common/resources.js';
import { IEditorService } from '../services/editor/common/editorService.js';
import { ILogService } from '../../platform/log/common/log.js';
import { IErrorWithActions } from '../../base/common/errorMessage.js';
import { IAction } from '../../base/common/actions.js';
import Severity from '../../base/common/severity.js';
import { IPreferencesService } from '../services/preferences/common/preferences.js';
import { IReadonlyEditorGroupModel } from './editor/editorGroupModel.js';
export declare const EditorExtensions: {
    EditorPane: string;
    EditorFactory: string;
};
export declare const DEFAULT_EDITOR_ASSOCIATION: {
    id: string;
    displayName: string;
    providerDisplayName: string;
};
export declare const SIDE_BY_SIDE_EDITOR_ID = "workbench.editor.sidebysideEditor";
export declare const TEXT_DIFF_EDITOR_ID = "workbench.editors.textDiffEditor";
export declare const BINARY_DIFF_EDITOR_ID = "workbench.editors.binaryResourceDiffEditor";
export interface IEditorDescriptor<T extends IEditorPane> {
    readonly typeId: string;
    readonly name: string;
    instantiate(instantiationService: IInstantiationService, group: IEditorGroup): T;
    describes(editorPane: T): boolean;
}
export interface IEditorPane extends IComposite {
    readonly onDidChangeControl: Event<void>;
    readonly onDidChangeSelection?: Event<IEditorPaneSelectionChangeEvent>;
    readonly onDidChangeScroll?: Event<void>;
    readonly input: EditorInput | undefined;
    readonly options: IEditorOptions | undefined;
    readonly group: IEditorGroup;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    readonly onDidChangeSizeConstraints: Event<{
        width: number;
        height: number;
    } | undefined>;
    readonly scopedContextKeyService: IContextKeyService | undefined;
    getControl(): IEditorControl | undefined;
    getViewState(): object | undefined;
    getSelection?(): IEditorPaneSelection | undefined;
    getScrollPosition?(): IEditorPaneScrollPosition;
    setScrollPosition?(scrollPosition: IEditorPaneScrollPosition): void;
    isVisible(): boolean;
}
export interface IEditorPaneSelectionChangeEvent {
    reason: EditorPaneSelectionChangeReason;
}
export declare const enum EditorPaneSelectionChangeReason {
    PROGRAMMATIC = 1,
    USER = 2,
    EDIT = 3,
    NAVIGATION = 4,
    JUMP = 5
}
export interface IEditorPaneSelection {
    compare(otherSelection: IEditorPaneSelection): EditorPaneSelectionCompareResult;
    restore(options: IEditorOptions): IEditorOptions;
    log?(): string;
}
export declare const enum EditorPaneSelectionCompareResult {
    IDENTICAL = 1,
    SIMILAR = 2,
    DIFFERENT = 3
}
export interface IEditorPaneWithSelection extends IEditorPane {
    readonly onDidChangeSelection: Event<IEditorPaneSelectionChangeEvent>;
    getSelection(): IEditorPaneSelection | undefined;
}
export declare function isEditorPaneWithSelection(editorPane: IEditorPane | undefined): editorPane is IEditorPaneWithSelection;
export interface IEditorPaneWithScrolling extends IEditorPane {
    readonly onDidChangeScroll: Event<void>;
    getScrollPosition(): IEditorPaneScrollPosition;
    setScrollPosition(position: IEditorPaneScrollPosition): void;
}
export declare function isEditorPaneWithScrolling(editorPane: IEditorPane | undefined): editorPane is IEditorPaneWithScrolling;
export interface IEditorPaneScrollPosition {
    readonly scrollTop: number;
    readonly scrollLeft?: number;
}
export declare function findViewStateForEditor(input: EditorInput, group: GroupIdentifier, editorService: IEditorService): object | undefined;
export interface IVisibleEditorPane extends IEditorPane {
    readonly input: EditorInput;
}
export interface ITextEditorPane extends IEditorPane {
    getControl(): IEditor | undefined;
}
export interface ITextDiffEditorPane extends IEditorPane {
    getControl(): IDiffEditor | undefined;
}
export interface IEditorControl extends ICompositeControl {
}
export interface IFileEditorFactory {
    typeId: string;
    createFileEditor(resource: URI, preferredResource: URI | undefined, preferredName: string | undefined, preferredDescription: string | undefined, preferredEncoding: string | undefined, preferredLanguageId: string | undefined, preferredContents: string | undefined, instantiationService: IInstantiationService): IFileEditorInput;
    isFileEditor(obj: unknown): obj is IFileEditorInput;
}
export interface IEditorFactoryRegistry {
    registerFileEditorFactory(factory: IFileEditorFactory): void;
    getFileEditorFactory(): IFileEditorFactory;
    registerEditorSerializer<Services extends BrandedService[]>(editorTypeId: string, ctor: {
        new (...Services: Services): IEditorSerializer;
    }): IDisposable;
    getEditorSerializer(editor: EditorInput): IEditorSerializer | undefined;
    getEditorSerializer(editorTypeId: string): IEditorSerializer | undefined;
    start(accessor: ServicesAccessor): void;
}
export interface IEditorSerializer {
    canSerialize(editor: EditorInput): boolean;
    serialize(editor: EditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditor: string): EditorInput | undefined;
}
export interface IUntitledTextResourceEditorInput extends IBaseTextResourceEditorInput {
    readonly resource: URI | undefined;
}
export interface IResourceSideBySideEditorInput extends IBaseUntypedEditorInput {
    readonly primary: IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput;
    readonly secondary: IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput;
}
export interface IResourceDiffEditorInput extends IBaseUntypedEditorInput {
    readonly original: IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput;
    readonly modified: IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput;
}
export interface IResourceMultiDiffEditorInput extends IBaseUntypedEditorInput {
    readonly multiDiffSource?: URI;
    readonly resources?: IMultiDiffEditorResource[];
    readonly isTransient?: boolean;
}
export interface IMultiDiffEditorResource extends IResourceDiffEditorInput {
    readonly goToFileResource?: URI;
}
export type IResourceMergeEditorInputSide = (IResourceEditorInput | ITextResourceEditorInput) & {
    detail?: string;
};
export interface IResourceMergeEditorInput extends IBaseUntypedEditorInput {
    readonly input1: IResourceMergeEditorInputSide;
    readonly input2: IResourceMergeEditorInputSide;
    readonly base: IResourceEditorInput | ITextResourceEditorInput;
    readonly result: IResourceEditorInput | ITextResourceEditorInput;
}
export declare function isResourceEditorInput(editor: unknown): editor is IResourceEditorInput;
export declare function isResourceDiffEditorInput(editor: unknown): editor is IResourceDiffEditorInput;
export declare function isResourceMultiDiffEditorInput(editor: unknown): editor is IResourceMultiDiffEditorInput;
export declare function isResourceSideBySideEditorInput(editor: unknown): editor is IResourceSideBySideEditorInput;
export declare function isUntitledResourceEditorInput(editor: unknown): editor is IUntitledTextResourceEditorInput;
export declare function isResourceMergeEditorInput(editor: unknown): editor is IResourceMergeEditorInput;
export declare const enum Verbosity {
    SHORT = 0,
    MEDIUM = 1,
    LONG = 2
}
export declare const enum SaveReason {
    EXPLICIT = 1,
    AUTO = 2,
    FOCUS_CHANGE = 3,
    WINDOW_CHANGE = 4
}
export type SaveSource = string;
declare class SaveSourceFactory {
    private readonly mapIdToSaveSource;
    registerSource(id: string, label: string): SaveSource;
    getSourceLabel(source: SaveSource): string;
}
export declare const SaveSourceRegistry: SaveSourceFactory;
export interface ISaveOptions {
    reason?: SaveReason;
    readonly source?: SaveSource;
    readonly force?: boolean;
    readonly skipSaveParticipants?: boolean;
    readonly availableFileSystems?: string[];
}
export interface IRevertOptions {
    readonly force?: boolean;
    readonly soft?: boolean;
}
export interface IMoveResult {
    editor: EditorInput | IUntypedEditorInput;
    options?: IEditorOptions;
}
export declare const enum EditorInputCapabilities {
    None = 0,
    Readonly = 2,
    Untitled = 4,
    Singleton = 8,
    RequiresTrust = 16,
    CanSplitInGroup = 32,
    ForceDescription = 64,
    CanDropIntoEditor = 128,
    MultipleEditors = 256,
    Scratchpad = 512
}
export type IUntypedEditorInput = IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput | IResourceDiffEditorInput | IResourceMultiDiffEditorInput | IResourceSideBySideEditorInput | IResourceMergeEditorInput;
export declare abstract class AbstractEditorInput extends Disposable {
}
export declare function isEditorInput(editor: unknown): editor is EditorInput;
export interface EditorInputWithPreferredResource {
    readonly preferredResource: URI;
}
export interface ISideBySideEditorInput extends EditorInput {
    primary: EditorInput;
    secondary: EditorInput;
}
export declare function isSideBySideEditorInput(editor: unknown): editor is ISideBySideEditorInput;
export interface IDiffEditorInput extends EditorInput {
    modified: EditorInput;
    original: EditorInput;
}
export declare function isDiffEditorInput(editor: unknown): editor is IDiffEditorInput;
export interface IUntypedFileEditorInput extends ITextResourceEditorInput {
    forceFile: true;
}
export interface IFileEditorInput extends EditorInput, IEncodingSupport, ILanguageSupport, EditorInputWithPreferredResource {
    readonly resource: URI;
    setPreferredResource(preferredResource: URI): void;
    setPreferredName(name: string): void;
    setPreferredDescription(description: string): void;
    setPreferredEncoding(encoding: string): void;
    setPreferredLanguageId(languageId: string): void;
    setPreferredContents(contents: string): void;
    setForceOpenAsBinary(): void;
    isResolved(): boolean;
}
export interface IFileLimitedEditorInputOptions extends IEditorOptions {
    readonly limits?: IFileReadLimits;
}
export interface IFileEditorInputOptions extends ITextEditorOptions, IFileLimitedEditorInputOptions {
}
export declare function createTooLargeFileError(group: IEditorGroup, input: EditorInput, options: IEditorOptions | undefined, message: string, preferencesService: IPreferencesService): Error;
export interface EditorInputWithOptions {
    editor: EditorInput;
    options?: IEditorOptions;
}
export interface EditorInputWithOptionsAndGroup extends EditorInputWithOptions {
    group: IEditorGroup;
}
export declare function isEditorInputWithOptions(editor: unknown): editor is EditorInputWithOptions;
export declare function isEditorInputWithOptionsAndGroup(editor: unknown): editor is EditorInputWithOptionsAndGroup;
export interface IEditorOpenContext {
    newInGroup?: boolean;
}
export interface IEditorIdentifier {
    groupId: GroupIdentifier;
    editor: EditorInput;
}
export declare function isEditorIdentifier(identifier: unknown): identifier is IEditorIdentifier;
export interface IEditorCommandsContext {
    groupId: GroupIdentifier;
    editorIndex?: number;
    preserveFocus?: boolean;
}
export declare function isEditorCommandsContext(context: unknown): context is IEditorCommandsContext;
export declare enum EditorCloseContext {
    UNKNOWN = 0,
    REPLACE = 1,
    MOVE = 2,
    UNPIN = 3
}
export interface IEditorCloseEvent extends IEditorIdentifier {
    readonly context: EditorCloseContext;
    readonly index: number;
    readonly sticky: boolean;
}
export interface IActiveEditorChangeEvent {
    editor: EditorInput | undefined;
}
export interface IEditorWillMoveEvent extends IEditorIdentifier {
    readonly target: GroupIdentifier;
}
export interface IEditorWillOpenEvent extends IEditorIdentifier {
}
export interface IWillInstantiateEditorPaneEvent {
    readonly typeId: string;
}
export type GroupIdentifier = number;
export declare const enum GroupModelChangeKind {
    GROUP_ACTIVE = 0,
    GROUP_INDEX = 1,
    GROUP_LABEL = 2,
    GROUP_LOCKED = 3,
    EDITORS_SELECTION = 4,
    EDITOR_OPEN = 5,
    EDITOR_CLOSE = 6,
    EDITOR_MOVE = 7,
    EDITOR_ACTIVE = 8,
    EDITOR_LABEL = 9,
    EDITOR_CAPABILITIES = 10,
    EDITOR_PIN = 11,
    EDITOR_TRANSIENT = 12,
    EDITOR_STICKY = 13,
    EDITOR_DIRTY = 14,
    EDITOR_WILL_DISPOSE = 15
}
export interface IWorkbenchEditorConfiguration {
    workbench?: {
        editor?: IEditorPartConfiguration;
        iconTheme?: string;
    };
}
interface IEditorPartLimitConfiguration {
    enabled?: boolean;
    excludeDirty?: boolean;
    value?: number;
    perEditorGroup?: boolean;
}
export interface IEditorPartLimitOptions extends Required<IEditorPartLimitConfiguration> {
}
interface IEditorPartDecorationsConfiguration {
    badges?: boolean;
    colors?: boolean;
}
export interface IEditorPartDecorationOptions extends Required<IEditorPartDecorationsConfiguration> {
}
interface IEditorPartConfiguration {
    showTabs?: 'multiple' | 'single' | 'none';
    wrapTabs?: boolean;
    scrollToSwitchTabs?: boolean;
    highlightModifiedTabs?: boolean;
    tabActionLocation?: 'left' | 'right';
    tabActionCloseVisibility?: boolean;
    tabActionUnpinVisibility?: boolean;
    alwaysShowEditorActions?: boolean;
    tabSizing?: 'fit' | 'shrink' | 'fixed';
    tabSizingFixedMinWidth?: number;
    tabSizingFixedMaxWidth?: number;
    pinnedTabSizing?: 'normal' | 'compact' | 'shrink';
    pinnedTabsOnSeparateRow?: boolean;
    tabHeight?: 'default' | 'compact';
    preventPinnedEditorClose?: PreventPinnedEditorClose;
    titleScrollbarSizing?: 'default' | 'large';
    focusRecentEditorAfterClose?: boolean;
    showIcons?: boolean;
    enablePreview?: boolean;
    enablePreviewFromQuickOpen?: boolean;
    enablePreviewFromCodeNavigation?: boolean;
    closeOnFileDelete?: boolean;
    openPositioning?: 'left' | 'right' | 'first' | 'last';
    openSideBySideDirection?: 'right' | 'down';
    closeEmptyGroups?: boolean;
    autoLockGroups?: Set<string>;
    revealIfOpen?: boolean;
    mouseBackForwardToNavigate?: boolean;
    labelFormat?: 'default' | 'short' | 'medium' | 'long';
    restoreViewState?: boolean;
    splitInGroupLayout?: 'vertical' | 'horizontal';
    splitSizing?: 'auto' | 'split' | 'distribute';
    splitOnDragAndDrop?: boolean;
    dragToOpenWindow?: boolean;
    centeredLayoutFixedWidth?: boolean;
    doubleClickTabToToggleEditorGroupSizes?: 'maximize' | 'expand' | 'off';
    editorActionsLocation?: 'default' | 'titleBar' | 'hidden';
    limit?: IEditorPartLimitConfiguration;
    decorations?: IEditorPartDecorationsConfiguration;
}
export interface IEditorPartOptions extends DeepRequiredNonNullable<IEditorPartConfiguration> {
    hasIcons: boolean;
}
export interface IEditorPartOptionsChangeEvent {
    oldPartOptions: IEditorPartOptions;
    newPartOptions: IEditorPartOptions;
}
export declare enum SideBySideEditor {
    PRIMARY = 1,
    SECONDARY = 2,
    BOTH = 3,
    ANY = 4
}
export interface IFindEditorOptions {
    supportSideBySide?: SideBySideEditor.PRIMARY | SideBySideEditor.SECONDARY | SideBySideEditor.ANY;
}
export interface IMatchEditorOptions {
    supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
    strictEquals?: boolean;
}
export interface IEditorResourceAccessorOptions {
    supportSideBySide?: SideBySideEditor;
    filterByScheme?: string | string[];
}
declare class EditorResourceAccessorImpl {
    getOriginalUri(editor: EditorInput | IUntypedEditorInput | undefined | null): URI | undefined;
    getOriginalUri(editor: EditorInput | IUntypedEditorInput | undefined | null, options: IEditorResourceAccessorOptions & {
        supportSideBySide?: SideBySideEditor.PRIMARY | SideBySideEditor.SECONDARY | SideBySideEditor.ANY;
    }): URI | undefined;
    getOriginalUri(editor: EditorInput | IUntypedEditorInput | undefined | null, options: IEditorResourceAccessorOptions & {
        supportSideBySide: SideBySideEditor.BOTH;
    }): URI | {
        primary?: URI;
        secondary?: URI;
    } | undefined;
    getOriginalUri(editor: EditorInput | IUntypedEditorInput | undefined | null, options?: IEditorResourceAccessorOptions): URI | {
        primary?: URI;
        secondary?: URI;
    } | undefined;
    private getSideEditors;
    getCanonicalUri(editor: EditorInput | IUntypedEditorInput | undefined | null): URI | undefined;
    getCanonicalUri(editor: EditorInput | IUntypedEditorInput | undefined | null, options: IEditorResourceAccessorOptions & {
        supportSideBySide?: SideBySideEditor.PRIMARY | SideBySideEditor.SECONDARY | SideBySideEditor.ANY;
    }): URI | undefined;
    getCanonicalUri(editor: EditorInput | IUntypedEditorInput | undefined | null, options: IEditorResourceAccessorOptions & {
        supportSideBySide: SideBySideEditor.BOTH;
    }): URI | {
        primary?: URI;
        secondary?: URI;
    } | undefined;
    getCanonicalUri(editor: EditorInput | IUntypedEditorInput | undefined | null, options?: IEditorResourceAccessorOptions): URI | {
        primary?: URI;
        secondary?: URI;
    } | undefined;
    private filterUri;
}
export type PreventPinnedEditorClose = 'keyboardAndMouse' | 'keyboard' | 'mouse' | 'never' | undefined;
export declare enum EditorCloseMethod {
    UNKNOWN = 0,
    KEYBOARD = 1,
    MOUSE = 2
}
export declare function preventEditorClose(group: IEditorGroup | IReadonlyEditorGroupModel, editor: EditorInput, method: EditorCloseMethod, configuration: IEditorPartConfiguration): boolean;
export declare const EditorResourceAccessor: EditorResourceAccessorImpl;
export declare const enum CloseDirection {
    LEFT = 0,
    RIGHT = 1
}
export interface IEditorMemento<T> {
    saveEditorState(group: IEditorGroup, resource: URI, state: T): void;
    saveEditorState(group: IEditorGroup, editor: EditorInput, state: T): void;
    loadEditorState(group: IEditorGroup, resource: URI): T | undefined;
    loadEditorState(group: IEditorGroup, editor: EditorInput): T | undefined;
    clearEditorState(resource: URI, group?: IEditorGroup): void;
    clearEditorState(editor: EditorInput, group?: IEditorGroup): void;
    clearEditorStateOnDispose(resource: URI, editor: EditorInput): void;
    moveEditorState(source: URI, target: URI, comparer: IExtUri): void;
}
export declare function pathsToEditors(paths: IPathData[] | undefined, fileService: IFileService, logService: ILogService): Promise<ReadonlyArray<IResourceEditorInput | IUntitledTextResourceEditorInput | undefined>>;
export declare const enum EditorsOrder {
    MOST_RECENTLY_ACTIVE = 0,
    SEQUENTIAL = 1
}
export declare function isTextEditorViewState(candidate: unknown): candidate is IEditorViewState;
export interface IEditorOpenErrorOptions {
    forceMessage?: boolean;
    forceSeverity?: Severity;
    allowDialog?: boolean;
}
export interface IEditorOpenError extends IErrorWithActions, IEditorOpenErrorOptions {
}
export declare function isEditorOpenError(obj: unknown): obj is IEditorOpenError;
export declare function createEditorOpenError(messageOrError: string | Error, actions: IAction[], options?: IEditorOpenErrorOptions): IEditorOpenError;
export interface IToolbarActions {
    readonly primary: IAction[];
    readonly secondary: IAction[];
}
export {};
