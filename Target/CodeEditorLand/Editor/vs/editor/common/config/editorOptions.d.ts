import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { ScrollbarVisibility } from '../../../base/common/scrollable.js';
import { FontInfo } from './fontInfo.js';
import { AccessibilitySupport } from '../../../platform/accessibility/common/accessibility.js';
import { IConfigurationPropertySchema } from '../../../platform/configuration/common/configurationRegistry.js';
export type EditorAutoClosingStrategy = 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
export type EditorAutoSurroundStrategy = 'languageDefined' | 'quotes' | 'brackets' | 'never';
export type EditorAutoClosingEditStrategy = 'always' | 'auto' | 'never';
export declare const enum EditorAutoIndentStrategy {
    None = 0,
    Keep = 1,
    Brackets = 2,
    Advanced = 3,
    Full = 4
}
export interface IEditorOptions {
    inDiffEditor?: boolean;
    ariaLabel?: string;
    ariaRequired?: boolean;
    screenReaderAnnounceInlineSuggestion?: boolean;
    tabIndex?: number;
    rulers?: (number | IRulerOption)[];
    wordSegmenterLocales?: string | string[];
    wordSeparators?: string;
    selectionClipboard?: boolean;
    lineNumbers?: LineNumbersType;
    cursorSurroundingLines?: number;
    cursorSurroundingLinesStyle?: 'default' | 'all';
    renderFinalNewline?: 'on' | 'off' | 'dimmed';
    unusualLineTerminators?: 'auto' | 'off' | 'prompt';
    selectOnLineNumbers?: boolean;
    lineNumbersMinChars?: number;
    glyphMargin?: boolean;
    lineDecorationsWidth?: number | string;
    revealHorizontalRightPadding?: number;
    roundedSelection?: boolean;
    extraEditorClassName?: string;
    readOnly?: boolean;
    readOnlyMessage?: IMarkdownString;
    domReadOnly?: boolean;
    linkedEditing?: boolean;
    renameOnType?: boolean;
    renderValidationDecorations?: 'editable' | 'on' | 'off';
    scrollbar?: IEditorScrollbarOptions;
    stickyScroll?: IEditorStickyScrollOptions;
    minimap?: IEditorMinimapOptions;
    find?: IEditorFindOptions;
    fixedOverflowWidgets?: boolean;
    overviewRulerLanes?: number;
    overviewRulerBorder?: boolean;
    cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
    mouseWheelZoom?: boolean;
    mouseStyle?: 'text' | 'default' | 'copy';
    cursorSmoothCaretAnimation?: 'off' | 'explicit' | 'on';
    cursorStyle?: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
    cursorWidth?: number;
    fontLigatures?: boolean | string;
    fontVariations?: boolean | string;
    defaultColorDecorators?: boolean;
    disableLayerHinting?: boolean;
    disableMonospaceOptimizations?: boolean;
    hideCursorInOverviewRuler?: boolean;
    scrollBeyondLastLine?: boolean;
    scrollBeyondLastColumn?: number;
    smoothScrolling?: boolean;
    automaticLayout?: boolean;
    wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
    wordWrapOverride1?: 'off' | 'on' | 'inherit';
    wordWrapOverride2?: 'off' | 'on' | 'inherit';
    wordWrapColumn?: number;
    wrappingIndent?: 'none' | 'same' | 'indent' | 'deepIndent';
    wrappingStrategy?: 'simple' | 'advanced';
    wordWrapBreakBeforeCharacters?: string;
    wordWrapBreakAfterCharacters?: string;
    wordBreak?: 'normal' | 'keepAll';
    stopRenderingLineAfter?: number;
    hover?: IEditorHoverOptions;
    links?: boolean;
    colorDecorators?: boolean;
    colorDecoratorsActivatedOn?: 'clickAndHover' | 'click' | 'hover';
    colorDecoratorsLimit?: number;
    comments?: IEditorCommentsOptions;
    contextmenu?: boolean;
    mouseWheelScrollSensitivity?: number;
    fastScrollSensitivity?: number;
    scrollPredominantAxis?: boolean;
    columnSelection?: boolean;
    multiCursorModifier?: 'ctrlCmd' | 'alt';
    multiCursorMergeOverlapping?: boolean;
    multiCursorPaste?: 'spread' | 'full';
    multiCursorLimit?: number;
    accessibilitySupport?: 'auto' | 'off' | 'on';
    accessibilityPageSize?: number;
    suggest?: ISuggestOptions;
    inlineSuggest?: IInlineSuggestOptions;
    experimentalInlineEdit?: IInlineEditOptions;
    smartSelect?: ISmartSelectOptions;
    gotoLocation?: IGotoLocationOptions;
    quickSuggestions?: boolean | IQuickSuggestionsOptions;
    quickSuggestionsDelay?: number;
    padding?: IEditorPaddingOptions;
    parameterHints?: IEditorParameterHintOptions;
    autoClosingBrackets?: EditorAutoClosingStrategy;
    autoClosingComments?: EditorAutoClosingStrategy;
    autoClosingQuotes?: EditorAutoClosingStrategy;
    autoClosingDelete?: EditorAutoClosingEditStrategy;
    autoClosingOvertype?: EditorAutoClosingEditStrategy;
    autoSurround?: EditorAutoSurroundStrategy;
    autoIndent?: 'none' | 'keep' | 'brackets' | 'advanced' | 'full';
    stickyTabStops?: boolean;
    formatOnType?: boolean;
    formatOnPaste?: boolean;
    dragAndDrop?: boolean;
    suggestOnTriggerCharacters?: boolean;
    acceptSuggestionOnEnter?: 'on' | 'smart' | 'off';
    acceptSuggestionOnCommitCharacter?: boolean;
    snippetSuggestions?: 'top' | 'bottom' | 'inline' | 'none';
    emptySelectionClipboard?: boolean;
    copyWithSyntaxHighlighting?: boolean;
    suggestSelection?: 'first' | 'recentlyUsed' | 'recentlyUsedByPrefix';
    suggestFontSize?: number;
    suggestLineHeight?: number;
    tabCompletion?: 'on' | 'off' | 'onlySnippets';
    selectionHighlight?: boolean;
    occurrencesHighlight?: 'off' | 'singleFile' | 'multiFile';
    codeLens?: boolean;
    codeLensFontFamily?: string;
    codeLensFontSize?: number;
    lightbulb?: IEditorLightbulbOptions;
    codeActionsOnSaveTimeout?: number;
    folding?: boolean;
    foldingStrategy?: 'auto' | 'indentation';
    foldingHighlight?: boolean;
    foldingImportsByDefault?: boolean;
    foldingMaximumRegions?: number;
    showFoldingControls?: 'always' | 'never' | 'mouseover';
    unfoldOnClickAfterEndOfLine?: boolean;
    matchBrackets?: 'never' | 'near' | 'always';
    experimentalGpuAcceleration?: 'on' | 'off';
    experimentalWhitespaceRendering?: 'svg' | 'font' | 'off';
    renderWhitespace?: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
    renderControlCharacters?: boolean;
    renderLineHighlight?: 'none' | 'gutter' | 'line' | 'all';
    renderLineHighlightOnlyWhenFocus?: boolean;
    useTabStops?: boolean;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    showUnused?: boolean;
    peekWidgetDefaultFocus?: 'tree' | 'editor';
    placeholder?: string | undefined;
    definitionLinkOpensInPeek?: boolean;
    showDeprecated?: boolean;
    matchOnWordStartOnly?: boolean;
    inlayHints?: IEditorInlayHintsOptions;
    useShadowDOM?: boolean;
    guides?: IGuidesOptions;
    unicodeHighlight?: IUnicodeHighlightOptions;
    bracketPairColorization?: IBracketPairColorizationOptions;
    dropIntoEditor?: IDropIntoEditorOptions;
    experimentalEditContextEnabled?: boolean;
    pasteAs?: IPasteAsOptions;
    tabFocusMode?: boolean;
    inlineCompletionsAccessibilityVerbose?: boolean;
}
export declare const MINIMAP_GUTTER_WIDTH = 8;
export interface IDiffEditorBaseOptions {
    enableSplitViewResizing?: boolean;
    splitViewDefaultRatio?: number;
    renderSideBySide?: boolean;
    renderSideBySideInlineBreakpoint?: number | undefined;
    useInlineViewWhenSpaceIsLimited?: boolean;
    compactMode?: boolean;
    maxComputationTime?: number;
    maxFileSize?: number;
    ignoreTrimWhitespace?: boolean;
    renderIndicators?: boolean;
    renderMarginRevertIcon?: boolean;
    renderGutterMenu?: boolean;
    originalEditable?: boolean;
    diffCodeLens?: boolean;
    renderOverviewRuler?: boolean;
    diffWordWrap?: 'off' | 'on' | 'inherit';
    diffAlgorithm?: 'legacy' | 'advanced';
    accessibilityVerbose?: boolean;
    experimental?: {
        showMoves?: boolean;
        showEmptyDecorations?: boolean;
        useTrueInlineView?: boolean;
    };
    isInEmbeddedEditor?: boolean;
    onlyShowAccessibleDiffViewer?: boolean;
    hideUnchangedRegions?: {
        enabled?: boolean;
        revealLineCount?: number;
        minimumLineCount?: number;
        contextLineCount?: number;
    };
}
export interface IDiffEditorOptions extends IEditorOptions, IDiffEditorBaseOptions {
}
export type ValidDiffEditorBaseOptions = Readonly<Required<IDiffEditorBaseOptions>>;
export declare class ConfigurationChangedEvent {
    private readonly _values;
    constructor(values: boolean[]);
    hasChanged(id: EditorOption): boolean;
}
export interface IComputedEditorOptions {
    get<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
}
export interface IEnvironmentalOptions {
    readonly memory: ComputeOptionsMemory | null;
    readonly outerWidth: number;
    readonly outerHeight: number;
    readonly fontInfo: FontInfo;
    readonly extraEditorClassName: string;
    readonly isDominatedByLongLines: boolean;
    readonly viewLineCount: number;
    readonly lineNumbersDigitCount: number;
    readonly emptySelectionClipboard: boolean;
    readonly pixelRatio: number;
    readonly tabFocusMode: boolean;
    readonly accessibilitySupport: AccessibilitySupport;
    readonly glyphMarginDecorationLaneCount: number;
}
export declare class ComputeOptionsMemory {
    stableMinimapLayoutInput: IMinimapLayoutInput | null;
    stableFitMaxMinimapScale: number;
    stableFitRemainingWidth: number;
    constructor();
}
export interface IEditorOption<K extends EditorOption, V> {
    readonly id: K;
    readonly name: string;
    defaultValue: V;
    readonly schema: IConfigurationPropertySchema | {
        [path: string]: IConfigurationPropertySchema;
    } | undefined;
    validate(input: any): V;
    compute(env: IEnvironmentalOptions, options: IComputedEditorOptions, value: V): V;
    applyUpdate(value: V | undefined, update: V): ApplyUpdateResult<V>;
}
type PossibleKeyName0<V> = {
    [K in keyof IEditorOptions]: IEditorOptions[K] extends V | undefined ? K : never;
}[keyof IEditorOptions];
type PossibleKeyName<V> = NonNullable<PossibleKeyName0<V>>;
declare abstract class BaseEditorOption<K extends EditorOption, T, V> implements IEditorOption<K, V> {
    readonly id: K;
    readonly name: string;
    readonly defaultValue: V;
    readonly schema: IConfigurationPropertySchema | {
        [path: string]: IConfigurationPropertySchema;
    } | undefined;
    constructor(id: K, name: PossibleKeyName<T>, defaultValue: V, schema?: IConfigurationPropertySchema | {
        [path: string]: IConfigurationPropertySchema;
    });
    applyUpdate(value: V | undefined, update: V): ApplyUpdateResult<V>;
    abstract validate(input: any): V;
    compute(env: IEnvironmentalOptions, options: IComputedEditorOptions, value: V): V;
}
export declare class ApplyUpdateResult<T> {
    readonly newValue: T;
    readonly didChange: boolean;
    constructor(newValue: T, didChange: boolean);
}
declare abstract class ComputedEditorOption<K extends EditorOption, V> implements IEditorOption<K, V> {
    readonly id: K;
    readonly name: '_never_';
    readonly defaultValue: V;
    readonly schema: IConfigurationPropertySchema | undefined;
    constructor(id: K);
    applyUpdate(value: V | undefined, update: V): ApplyUpdateResult<V>;
    validate(input: any): V;
    abstract compute(env: IEnvironmentalOptions, options: IComputedEditorOptions, value: V): V;
}
export declare function boolean(value: any, defaultValue: boolean): boolean;
export declare function clampedInt<T>(value: any, defaultValue: T, minimum: number, maximum: number): number | T;
export declare function clampedFloat<T extends number>(value: any, defaultValue: T, minimum: number, maximum: number): number | T;
export declare function stringSet<T>(value: T | undefined, defaultValue: T, allowedValues: ReadonlyArray<T>, renamedValues?: Record<string, T>): T;
export interface IEditorCommentsOptions {
    insertSpace?: boolean;
    ignoreEmptyLines?: boolean;
}
export type EditorCommentsOptions = Readonly<Required<IEditorCommentsOptions>>;
export declare const enum TextEditorCursorBlinkingStyle {
    Hidden = 0,
    Blink = 1,
    Smooth = 2,
    Phase = 3,
    Expand = 4,
    Solid = 5
}
export declare function cursorBlinkingStyleFromString(cursorBlinkingStyle: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'): TextEditorCursorBlinkingStyle;
export declare enum TextEditorCursorStyle {
    Line = 1,
    Block = 2,
    Underline = 3,
    LineThin = 4,
    BlockOutline = 5,
    UnderlineThin = 6
}
export declare function cursorStyleToString(cursorStyle: TextEditorCursorStyle): 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
export declare function cursorStyleFromString(cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin'): TextEditorCursorStyle;
export interface IEditorFindOptions {
    cursorMoveOnType?: boolean;
    seedSearchStringFromSelection?: 'never' | 'always' | 'selection';
    autoFindInSelection?: 'never' | 'always' | 'multiline';
    addExtraSpaceOnTop?: boolean;
    globalFindClipboard?: boolean;
    loop?: boolean;
}
export type EditorFindOptions = Readonly<Required<IEditorFindOptions>>;
export declare class EditorFontLigatures extends BaseEditorOption<EditorOption.fontLigatures, boolean | string, string> {
    static OFF: string;
    static ON: string;
    constructor();
    validate(input: any): string;
}
export declare class EditorFontVariations extends BaseEditorOption<EditorOption.fontVariations, boolean | string, string> {
    static OFF: string;
    static TRANSLATE: string;
    constructor();
    validate(input: any): string;
    compute(env: IEnvironmentalOptions, options: IComputedEditorOptions, value: string): string;
}
export type GoToLocationValues = 'peek' | 'gotoAndPeek' | 'goto';
export interface IGotoLocationOptions {
    multiple?: GoToLocationValues;
    multipleDefinitions?: GoToLocationValues;
    multipleTypeDefinitions?: GoToLocationValues;
    multipleDeclarations?: GoToLocationValues;
    multipleImplementations?: GoToLocationValues;
    multipleReferences?: GoToLocationValues;
    multipleTests?: GoToLocationValues;
    alternativeDefinitionCommand?: string;
    alternativeTypeDefinitionCommand?: string;
    alternativeDeclarationCommand?: string;
    alternativeImplementationCommand?: string;
    alternativeReferenceCommand?: string;
    alternativeTestsCommand?: string;
}
export type GoToLocationOptions = Readonly<Required<IGotoLocationOptions>>;
export interface IEditorHoverOptions {
    enabled?: boolean;
    delay?: number;
    sticky?: boolean;
    hidingDelay?: number;
    above?: boolean;
}
export type EditorHoverOptions = Readonly<Required<IEditorHoverOptions>>;
export interface OverviewRulerPosition {
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
}
export declare const enum RenderMinimap {
    None = 0,
    Text = 1,
    Blocks = 2
}
export interface EditorLayoutInfo {
    readonly width: number;
    readonly height: number;
    readonly glyphMarginLeft: number;
    readonly glyphMarginWidth: number;
    readonly glyphMarginDecorationLaneCount: number;
    readonly lineNumbersLeft: number;
    readonly lineNumbersWidth: number;
    readonly decorationsLeft: number;
    readonly decorationsWidth: number;
    readonly contentLeft: number;
    readonly contentWidth: number;
    readonly minimap: EditorMinimapLayoutInfo;
    readonly viewportColumn: number;
    readonly isWordWrapMinified: boolean;
    readonly isViewportWrapping: boolean;
    readonly wrappingColumn: number;
    readonly verticalScrollbarWidth: number;
    readonly horizontalScrollbarHeight: number;
    readonly overviewRuler: OverviewRulerPosition;
}
export interface EditorMinimapLayoutInfo {
    readonly renderMinimap: RenderMinimap;
    readonly minimapLeft: number;
    readonly minimapWidth: number;
    readonly minimapHeightIsEditorHeight: boolean;
    readonly minimapIsSampling: boolean;
    readonly minimapScale: number;
    readonly minimapLineHeight: number;
    readonly minimapCanvasInnerWidth: number;
    readonly minimapCanvasInnerHeight: number;
    readonly minimapCanvasOuterWidth: number;
    readonly minimapCanvasOuterHeight: number;
}
export interface EditorLayoutInfoComputerEnv {
    readonly memory: ComputeOptionsMemory | null;
    readonly outerWidth: number;
    readonly outerHeight: number;
    readonly isDominatedByLongLines: boolean;
    readonly lineHeight: number;
    readonly viewLineCount: number;
    readonly lineNumbersDigitCount: number;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly maxDigitWidth: number;
    readonly pixelRatio: number;
    readonly glyphMarginDecorationLaneCount: number;
}
export interface IEditorLayoutComputerInput {
    readonly outerWidth: number;
    readonly outerHeight: number;
    readonly isDominatedByLongLines: boolean;
    readonly lineHeight: number;
    readonly lineNumbersDigitCount: number;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly maxDigitWidth: number;
    readonly pixelRatio: number;
    readonly glyphMargin: boolean;
    readonly lineDecorationsWidth: string | number;
    readonly folding: boolean;
    readonly minimap: Readonly<Required<IEditorMinimapOptions>>;
    readonly scrollbar: InternalEditorScrollbarOptions;
    readonly lineNumbers: InternalEditorRenderLineNumbersOptions;
    readonly lineNumbersMinChars: number;
    readonly scrollBeyondLastLine: boolean;
    readonly wordWrap: 'wordWrapColumn' | 'on' | 'off' | 'bounded';
    readonly wordWrapColumn: number;
    readonly wordWrapMinified: boolean;
    readonly accessibilitySupport: AccessibilitySupport;
}
export interface IMinimapLayoutInput {
    readonly outerWidth: number;
    readonly outerHeight: number;
    readonly lineHeight: number;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly pixelRatio: number;
    readonly scrollBeyondLastLine: boolean;
    readonly paddingTop: number;
    readonly paddingBottom: number;
    readonly minimap: Readonly<Required<IEditorMinimapOptions>>;
    readonly verticalScrollbarWidth: number;
    readonly viewLineCount: number;
    readonly remainingWidth: number;
    readonly isViewportWrapping: boolean;
}
export declare class EditorLayoutInfoComputer extends ComputedEditorOption<EditorOption.layoutInfo, EditorLayoutInfo> {
    constructor();
    compute(env: IEnvironmentalOptions, options: IComputedEditorOptions, _: EditorLayoutInfo): EditorLayoutInfo;
    static computeContainedMinimapLineCount(input: {
        viewLineCount: number;
        scrollBeyondLastLine: boolean;
        paddingTop: number;
        paddingBottom: number;
        height: number;
        lineHeight: number;
        pixelRatio: number;
    }): {
        typicalViewportLineCount: number;
        extraLinesBeforeFirstLine: number;
        extraLinesBeyondLastLine: number;
        desiredRatio: number;
        minimapLineCount: number;
    };
    private static _computeMinimapLayout;
    static computeLayout(options: IComputedEditorOptions, env: EditorLayoutInfoComputerEnv): EditorLayoutInfo;
}
export declare enum ShowLightbulbIconMode {
    Off = "off",
    OnCode = "onCode",
    On = "on"
}
export interface IEditorLightbulbOptions {
    enabled?: ShowLightbulbIconMode;
}
export type EditorLightbulbOptions = Readonly<Required<IEditorLightbulbOptions>>;
export interface IEditorStickyScrollOptions {
    enabled?: boolean;
    maxLineCount?: number;
    defaultModel?: 'outlineModel' | 'foldingProviderModel' | 'indentationModel';
    scrollWithEditor?: boolean;
}
export type EditorStickyScrollOptions = Readonly<Required<IEditorStickyScrollOptions>>;
export interface IEditorInlayHintsOptions {
    enabled?: 'on' | 'off' | 'offUnlessPressed' | 'onUnlessPressed';
    fontSize?: number;
    fontFamily?: string;
    padding?: boolean;
    maximumLength?: number;
}
export type EditorInlayHintsOptions = Readonly<Required<IEditorInlayHintsOptions>>;
export interface IEditorMinimapOptions {
    enabled?: boolean;
    autohide?: boolean;
    side?: 'right' | 'left';
    size?: 'proportional' | 'fill' | 'fit';
    showSlider?: 'always' | 'mouseover';
    renderCharacters?: boolean;
    maxColumn?: number;
    scale?: number;
    showRegionSectionHeaders?: boolean;
    showMarkSectionHeaders?: boolean;
    sectionHeaderFontSize?: number;
    sectionHeaderLetterSpacing?: number;
}
export type EditorMinimapOptions = Readonly<Required<IEditorMinimapOptions>>;
export interface IEditorPaddingOptions {
    top?: number;
    bottom?: number;
}
export type InternalEditorPaddingOptions = Readonly<Required<IEditorPaddingOptions>>;
export interface IEditorParameterHintOptions {
    enabled?: boolean;
    cycle?: boolean;
}
export type InternalParameterHintOptions = Readonly<Required<IEditorParameterHintOptions>>;
export type QuickSuggestionsValue = 'on' | 'inline' | 'off';
export interface IQuickSuggestionsOptions {
    other?: boolean | QuickSuggestionsValue;
    comments?: boolean | QuickSuggestionsValue;
    strings?: boolean | QuickSuggestionsValue;
}
export interface InternalQuickSuggestionsOptions {
    readonly other: QuickSuggestionsValue;
    readonly comments: QuickSuggestionsValue;
    readonly strings: QuickSuggestionsValue;
}
export type LineNumbersType = 'on' | 'off' | 'relative' | 'interval' | ((lineNumber: number) => string);
export declare const enum RenderLineNumbersType {
    Off = 0,
    On = 1,
    Relative = 2,
    Interval = 3,
    Custom = 4
}
export interface InternalEditorRenderLineNumbersOptions {
    readonly renderType: RenderLineNumbersType;
    readonly renderFn: ((lineNumber: number) => string) | null;
}
export declare function filterValidationDecorations(options: IComputedEditorOptions): boolean;
export interface IRulerOption {
    readonly column: number;
    readonly color: string | null;
}
export interface IEditorScrollbarOptions {
    arrowSize?: number;
    vertical?: 'auto' | 'visible' | 'hidden';
    horizontal?: 'auto' | 'visible' | 'hidden';
    useShadows?: boolean;
    verticalHasArrows?: boolean;
    horizontalHasArrows?: boolean;
    handleMouseWheel?: boolean;
    alwaysConsumeMouseWheel?: boolean;
    horizontalScrollbarSize?: number;
    verticalScrollbarSize?: number;
    verticalSliderSize?: number;
    horizontalSliderSize?: number;
    scrollByPage?: boolean;
    ignoreHorizontalScrollbarInContentHeight?: boolean;
}
export interface InternalEditorScrollbarOptions {
    readonly arrowSize: number;
    readonly vertical: ScrollbarVisibility;
    readonly horizontal: ScrollbarVisibility;
    readonly useShadows: boolean;
    readonly verticalHasArrows: boolean;
    readonly horizontalHasArrows: boolean;
    readonly handleMouseWheel: boolean;
    readonly alwaysConsumeMouseWheel: boolean;
    readonly horizontalScrollbarSize: number;
    readonly horizontalSliderSize: number;
    readonly verticalScrollbarSize: number;
    readonly verticalSliderSize: number;
    readonly scrollByPage: boolean;
    readonly ignoreHorizontalScrollbarInContentHeight: boolean;
}
export type InUntrustedWorkspace = 'inUntrustedWorkspace';
export declare const inUntrustedWorkspace: InUntrustedWorkspace;
export interface IUnicodeHighlightOptions {
    nonBasicASCII?: boolean | InUntrustedWorkspace;
    invisibleCharacters?: boolean;
    ambiguousCharacters?: boolean;
    includeComments?: boolean | InUntrustedWorkspace;
    includeStrings?: boolean | InUntrustedWorkspace;
    allowedCharacters?: Record<string, true>;
    allowedLocales?: Record<string | '_os' | '_vscode', true>;
}
export type InternalUnicodeHighlightOptions = Required<Readonly<IUnicodeHighlightOptions>>;
export declare const unicodeHighlightConfigKeys: {
    allowedCharacters: string;
    invisibleCharacters: string;
    nonBasicASCII: string;
    ambiguousCharacters: string;
    includeComments: string;
    includeStrings: string;
    allowedLocales: string;
};
export interface IInlineSuggestOptions {
    enabled?: boolean;
    mode?: 'prefix' | 'subword' | 'subwordSmart';
    showToolbar?: 'always' | 'onHover' | 'never';
    syntaxHighlightingEnabled?: boolean;
    suppressSuggestions?: boolean;
    keepOnBlur?: boolean;
    fontFamily?: string | 'default';
}
export type InternalInlineSuggestOptions = Readonly<Required<IInlineSuggestOptions>>;
export interface IInlineEditOptions {
    enabled?: boolean;
    showToolbar?: 'always' | 'onHover' | 'never';
    fontFamily?: string | 'default';
    keepOnBlur?: boolean;
}
export type InternalInlineEditOptions = Readonly<Required<IInlineEditOptions>>;
export interface IBracketPairColorizationOptions {
    enabled?: boolean;
    independentColorPoolPerBracketType?: boolean;
}
export type InternalBracketPairColorizationOptions = Readonly<Required<IBracketPairColorizationOptions>>;
export interface IGuidesOptions {
    bracketPairs?: boolean | 'active';
    bracketPairsHorizontal?: boolean | 'active';
    highlightActiveBracketPair?: boolean;
    indentation?: boolean;
    highlightActiveIndentation?: boolean | 'always';
}
export type InternalGuidesOptions = Readonly<Required<IGuidesOptions>>;
export interface ISuggestOptions {
    insertMode?: 'insert' | 'replace';
    filterGraceful?: boolean;
    snippetsPreventQuickSuggestions?: boolean;
    localityBonus?: boolean;
    shareSuggestSelections?: boolean;
    selectionMode?: 'always' | 'never' | 'whenTriggerCharacter' | 'whenQuickSuggestion';
    showIcons?: boolean;
    showStatusBar?: boolean;
    preview?: boolean;
    previewMode?: 'prefix' | 'subword' | 'subwordSmart';
    showInlineDetails?: boolean;
    showMethods?: boolean;
    showFunctions?: boolean;
    showConstructors?: boolean;
    showDeprecated?: boolean;
    matchOnWordStartOnly?: boolean;
    showFields?: boolean;
    showVariables?: boolean;
    showClasses?: boolean;
    showStructs?: boolean;
    showInterfaces?: boolean;
    showModules?: boolean;
    showProperties?: boolean;
    showEvents?: boolean;
    showOperators?: boolean;
    showUnits?: boolean;
    showValues?: boolean;
    showConstants?: boolean;
    showEnums?: boolean;
    showEnumMembers?: boolean;
    showKeywords?: boolean;
    showWords?: boolean;
    showColors?: boolean;
    showFiles?: boolean;
    showReferences?: boolean;
    showFolders?: boolean;
    showTypeParameters?: boolean;
    showIssues?: boolean;
    showUsers?: boolean;
    showSnippets?: boolean;
}
export type InternalSuggestOptions = Readonly<Required<ISuggestOptions>>;
export interface ISmartSelectOptions {
    selectLeadingAndTrailingWhitespace?: boolean;
    selectSubwords?: boolean;
}
export type SmartSelectOptions = Readonly<Required<ISmartSelectOptions>>;
export declare const enum WrappingIndent {
    None = 0,
    Same = 1,
    Indent = 2,
    DeepIndent = 3
}
export interface EditorWrappingInfo {
    readonly isDominatedByLongLines: boolean;
    readonly isWordWrapMinified: boolean;
    readonly isViewportWrapping: boolean;
    readonly wrappingColumn: number;
}
export interface IDropIntoEditorOptions {
    enabled?: boolean;
    showDropSelector?: 'afterDrop' | 'never';
}
export type EditorDropIntoEditorOptions = Readonly<Required<IDropIntoEditorOptions>>;
export interface IPasteAsOptions {
    enabled?: boolean;
    showPasteSelector?: 'afterPaste' | 'never';
}
export type EditorPasteAsOptions = Readonly<Required<IPasteAsOptions>>;
export declare const EDITOR_FONT_DEFAULTS: {
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
};
export declare const editorOptionsRegistry: IEditorOption<EditorOption, any>[];
export declare const enum EditorOption {
    acceptSuggestionOnCommitCharacter = 0,
    acceptSuggestionOnEnter = 1,
    accessibilitySupport = 2,
    accessibilityPageSize = 3,
    ariaLabel = 4,
    ariaRequired = 5,
    autoClosingBrackets = 6,
    autoClosingComments = 7,
    screenReaderAnnounceInlineSuggestion = 8,
    autoClosingDelete = 9,
    autoClosingOvertype = 10,
    autoClosingQuotes = 11,
    autoIndent = 12,
    automaticLayout = 13,
    autoSurround = 14,
    bracketPairColorization = 15,
    guides = 16,
    codeLens = 17,
    codeLensFontFamily = 18,
    codeLensFontSize = 19,
    colorDecorators = 20,
    colorDecoratorsLimit = 21,
    columnSelection = 22,
    comments = 23,
    contextmenu = 24,
    copyWithSyntaxHighlighting = 25,
    cursorBlinking = 26,
    cursorSmoothCaretAnimation = 27,
    cursorStyle = 28,
    cursorSurroundingLines = 29,
    cursorSurroundingLinesStyle = 30,
    cursorWidth = 31,
    disableLayerHinting = 32,
    disableMonospaceOptimizations = 33,
    domReadOnly = 34,
    dragAndDrop = 35,
    dropIntoEditor = 36,
    experimentalEditContextEnabled = 37,
    emptySelectionClipboard = 38,
    experimentalGpuAcceleration = 39,
    experimentalWhitespaceRendering = 40,
    extraEditorClassName = 41,
    fastScrollSensitivity = 42,
    find = 43,
    fixedOverflowWidgets = 44,
    folding = 45,
    foldingStrategy = 46,
    foldingHighlight = 47,
    foldingImportsByDefault = 48,
    foldingMaximumRegions = 49,
    unfoldOnClickAfterEndOfLine = 50,
    fontFamily = 51,
    fontInfo = 52,
    fontLigatures = 53,
    fontSize = 54,
    fontWeight = 55,
    fontVariations = 56,
    formatOnPaste = 57,
    formatOnType = 58,
    glyphMargin = 59,
    gotoLocation = 60,
    hideCursorInOverviewRuler = 61,
    hover = 62,
    inDiffEditor = 63,
    inlineSuggest = 64,
    inlineEdit = 65,
    letterSpacing = 66,
    lightbulb = 67,
    lineDecorationsWidth = 68,
    lineHeight = 69,
    lineNumbers = 70,
    lineNumbersMinChars = 71,
    linkedEditing = 72,
    links = 73,
    matchBrackets = 74,
    minimap = 75,
    mouseStyle = 76,
    mouseWheelScrollSensitivity = 77,
    mouseWheelZoom = 78,
    multiCursorMergeOverlapping = 79,
    multiCursorModifier = 80,
    multiCursorPaste = 81,
    multiCursorLimit = 82,
    occurrencesHighlight = 83,
    overviewRulerBorder = 84,
    overviewRulerLanes = 85,
    padding = 86,
    pasteAs = 87,
    parameterHints = 88,
    peekWidgetDefaultFocus = 89,
    placeholder = 90,
    definitionLinkOpensInPeek = 91,
    quickSuggestions = 92,
    quickSuggestionsDelay = 93,
    readOnly = 94,
    readOnlyMessage = 95,
    renameOnType = 96,
    renderControlCharacters = 97,
    renderFinalNewline = 98,
    renderLineHighlight = 99,
    renderLineHighlightOnlyWhenFocus = 100,
    renderValidationDecorations = 101,
    renderWhitespace = 102,
    revealHorizontalRightPadding = 103,
    roundedSelection = 104,
    rulers = 105,
    scrollbar = 106,
    scrollBeyondLastColumn = 107,
    scrollBeyondLastLine = 108,
    scrollPredominantAxis = 109,
    selectionClipboard = 110,
    selectionHighlight = 111,
    selectOnLineNumbers = 112,
    showFoldingControls = 113,
    showUnused = 114,
    snippetSuggestions = 115,
    smartSelect = 116,
    smoothScrolling = 117,
    stickyScroll = 118,
    stickyTabStops = 119,
    stopRenderingLineAfter = 120,
    suggest = 121,
    suggestFontSize = 122,
    suggestLineHeight = 123,
    suggestOnTriggerCharacters = 124,
    suggestSelection = 125,
    tabCompletion = 126,
    tabIndex = 127,
    unicodeHighlighting = 128,
    unusualLineTerminators = 129,
    useShadowDOM = 130,
    useTabStops = 131,
    wordBreak = 132,
    wordSegmenterLocales = 133,
    wordSeparators = 134,
    wordWrap = 135,
    wordWrapBreakAfterCharacters = 136,
    wordWrapBreakBeforeCharacters = 137,
    wordWrapColumn = 138,
    wordWrapOverride1 = 139,
    wordWrapOverride2 = 140,
    wrappingIndent = 141,
    wrappingStrategy = 142,
    showDeprecated = 143,
    inlayHints = 144,
    editorClassName = 145,
    pixelRatio = 146,
    tabFocusMode = 147,
    layoutInfo = 148,
    wrappingInfo = 149,
    defaultColorDecorators = 150,
    colorDecoratorsActivatedOn = 151,
    inlineCompletionsAccessibilityVerbose = 152
}
export declare const EditorOptions: {
    acceptSuggestionOnCommitCharacter: IEditorOption<EditorOption.acceptSuggestionOnCommitCharacter, boolean>;
    acceptSuggestionOnEnter: IEditorOption<EditorOption.acceptSuggestionOnEnter, "on" | "off" | "smart">;
    accessibilitySupport: IEditorOption<EditorOption.accessibilitySupport, AccessibilitySupport>;
    accessibilityPageSize: IEditorOption<EditorOption.accessibilityPageSize, number>;
    ariaLabel: IEditorOption<EditorOption.ariaLabel, string>;
    ariaRequired: IEditorOption<EditorOption.ariaRequired, boolean>;
    screenReaderAnnounceInlineSuggestion: IEditorOption<EditorOption.screenReaderAnnounceInlineSuggestion, boolean>;
    autoClosingBrackets: IEditorOption<EditorOption.autoClosingBrackets, "always" | "never" | "languageDefined" | "beforeWhitespace">;
    autoClosingComments: IEditorOption<EditorOption.autoClosingComments, "always" | "never" | "languageDefined" | "beforeWhitespace">;
    autoClosingDelete: IEditorOption<EditorOption.autoClosingDelete, "always" | "auto" | "never">;
    autoClosingOvertype: IEditorOption<EditorOption.autoClosingOvertype, "always" | "auto" | "never">;
    autoClosingQuotes: IEditorOption<EditorOption.autoClosingQuotes, "always" | "never" | "languageDefined" | "beforeWhitespace">;
    autoIndent: IEditorOption<EditorOption.autoIndent, EditorAutoIndentStrategy>;
    automaticLayout: IEditorOption<EditorOption.automaticLayout, boolean>;
    autoSurround: IEditorOption<EditorOption.autoSurround, "never" | "languageDefined" | "quotes" | "brackets">;
    bracketPairColorization: IEditorOption<EditorOption.bracketPairColorization, Readonly<Required<IBracketPairColorizationOptions>>>;
    bracketPairGuides: IEditorOption<EditorOption.guides, Readonly<Required<IGuidesOptions>>>;
    stickyTabStops: IEditorOption<EditorOption.stickyTabStops, boolean>;
    codeLens: IEditorOption<EditorOption.codeLens, boolean>;
    codeLensFontFamily: IEditorOption<EditorOption.codeLensFontFamily, string>;
    codeLensFontSize: IEditorOption<EditorOption.codeLensFontSize, number>;
    colorDecorators: IEditorOption<EditorOption.colorDecorators, boolean>;
    colorDecoratorActivatedOn: IEditorOption<EditorOption.colorDecoratorsActivatedOn, "click" | "hover" | "clickAndHover">;
    colorDecoratorsLimit: IEditorOption<EditorOption.colorDecoratorsLimit, number>;
    columnSelection: IEditorOption<EditorOption.columnSelection, boolean>;
    comments: IEditorOption<EditorOption.comments, Readonly<Required<IEditorCommentsOptions>>>;
    contextmenu: IEditorOption<EditorOption.contextmenu, boolean>;
    copyWithSyntaxHighlighting: IEditorOption<EditorOption.copyWithSyntaxHighlighting, boolean>;
    cursorBlinking: IEditorOption<EditorOption.cursorBlinking, TextEditorCursorBlinkingStyle>;
    cursorSmoothCaretAnimation: IEditorOption<EditorOption.cursorSmoothCaretAnimation, "on" | "off" | "explicit">;
    cursorStyle: IEditorOption<EditorOption.cursorStyle, TextEditorCursorStyle>;
    cursorSurroundingLines: IEditorOption<EditorOption.cursorSurroundingLines, number>;
    cursorSurroundingLinesStyle: IEditorOption<EditorOption.cursorSurroundingLinesStyle, "default" | "all">;
    cursorWidth: IEditorOption<EditorOption.cursorWidth, number>;
    disableLayerHinting: IEditorOption<EditorOption.disableLayerHinting, boolean>;
    disableMonospaceOptimizations: IEditorOption<EditorOption.disableMonospaceOptimizations, boolean>;
    domReadOnly: IEditorOption<EditorOption.domReadOnly, boolean>;
    dragAndDrop: IEditorOption<EditorOption.dragAndDrop, boolean>;
    emptySelectionClipboard: IEditorOption<EditorOption.emptySelectionClipboard, boolean>;
    dropIntoEditor: IEditorOption<EditorOption.dropIntoEditor, Readonly<Required<IDropIntoEditorOptions>>>;
    experimentalEditContextEnabled: IEditorOption<EditorOption.experimentalEditContextEnabled, boolean>;
    stickyScroll: IEditorOption<EditorOption.stickyScroll, Readonly<Required<IEditorStickyScrollOptions>>>;
    experimentalGpuAcceleration: IEditorOption<EditorOption.experimentalGpuAcceleration, "on" | "off">;
    experimentalWhitespaceRendering: IEditorOption<EditorOption.experimentalWhitespaceRendering, "svg" | "off" | "font">;
    extraEditorClassName: IEditorOption<EditorOption.extraEditorClassName, string>;
    fastScrollSensitivity: IEditorOption<EditorOption.fastScrollSensitivity, number>;
    find: IEditorOption<EditorOption.find, Readonly<Required<IEditorFindOptions>>>;
    fixedOverflowWidgets: IEditorOption<EditorOption.fixedOverflowWidgets, boolean>;
    folding: IEditorOption<EditorOption.folding, boolean>;
    foldingStrategy: IEditorOption<EditorOption.foldingStrategy, "auto" | "indentation">;
    foldingHighlight: IEditorOption<EditorOption.foldingHighlight, boolean>;
    foldingImportsByDefault: IEditorOption<EditorOption.foldingImportsByDefault, boolean>;
    foldingMaximumRegions: IEditorOption<EditorOption.foldingMaximumRegions, number>;
    unfoldOnClickAfterEndOfLine: IEditorOption<EditorOption.unfoldOnClickAfterEndOfLine, boolean>;
    fontFamily: IEditorOption<EditorOption.fontFamily, string>;
    fontInfo: IEditorOption<EditorOption.fontInfo, FontInfo>;
    fontLigatures2: IEditorOption<EditorOption.fontLigatures, string>;
    fontSize: IEditorOption<EditorOption.fontSize, number>;
    fontWeight: IEditorOption<EditorOption.fontWeight, string>;
    fontVariations: IEditorOption<EditorOption.fontVariations, string>;
    formatOnPaste: IEditorOption<EditorOption.formatOnPaste, boolean>;
    formatOnType: IEditorOption<EditorOption.formatOnType, boolean>;
    glyphMargin: IEditorOption<EditorOption.glyphMargin, boolean>;
    gotoLocation: IEditorOption<EditorOption.gotoLocation, Readonly<Required<IGotoLocationOptions>>>;
    hideCursorInOverviewRuler: IEditorOption<EditorOption.hideCursorInOverviewRuler, boolean>;
    hover: IEditorOption<EditorOption.hover, Readonly<Required<IEditorHoverOptions>>>;
    inDiffEditor: IEditorOption<EditorOption.inDiffEditor, boolean>;
    letterSpacing: IEditorOption<EditorOption.letterSpacing, number>;
    lightbulb: IEditorOption<EditorOption.lightbulb, Readonly<Required<IEditorLightbulbOptions>>>;
    lineDecorationsWidth: IEditorOption<EditorOption.lineDecorationsWidth, number>;
    lineHeight: IEditorOption<EditorOption.lineHeight, number>;
    lineNumbers: IEditorOption<EditorOption.lineNumbers, InternalEditorRenderLineNumbersOptions>;
    lineNumbersMinChars: IEditorOption<EditorOption.lineNumbersMinChars, number>;
    linkedEditing: IEditorOption<EditorOption.linkedEditing, boolean>;
    links: IEditorOption<EditorOption.links, boolean>;
    matchBrackets: IEditorOption<EditorOption.matchBrackets, "always" | "never" | "near">;
    minimap: IEditorOption<EditorOption.minimap, Readonly<Required<IEditorMinimapOptions>>>;
    mouseStyle: IEditorOption<EditorOption.mouseStyle, "default" | "copy" | "text">;
    mouseWheelScrollSensitivity: IEditorOption<EditorOption.mouseWheelScrollSensitivity, number>;
    mouseWheelZoom: IEditorOption<EditorOption.mouseWheelZoom, boolean>;
    multiCursorMergeOverlapping: IEditorOption<EditorOption.multiCursorMergeOverlapping, boolean>;
    multiCursorModifier: IEditorOption<EditorOption.multiCursorModifier, "altKey" | "ctrlKey" | "metaKey">;
    multiCursorPaste: IEditorOption<EditorOption.multiCursorPaste, "spread" | "full">;
    multiCursorLimit: IEditorOption<EditorOption.multiCursorLimit, number>;
    occurrencesHighlight: IEditorOption<EditorOption.occurrencesHighlight, "off" | "singleFile" | "multiFile">;
    overviewRulerBorder: IEditorOption<EditorOption.overviewRulerBorder, boolean>;
    overviewRulerLanes: IEditorOption<EditorOption.overviewRulerLanes, number>;
    padding: IEditorOption<EditorOption.padding, Readonly<Required<IEditorPaddingOptions>>>;
    pasteAs: IEditorOption<EditorOption.pasteAs, Readonly<Required<IPasteAsOptions>>>;
    parameterHints: IEditorOption<EditorOption.parameterHints, Readonly<Required<IEditorParameterHintOptions>>>;
    peekWidgetDefaultFocus: IEditorOption<EditorOption.peekWidgetDefaultFocus, "editor" | "tree">;
    placeholder: IEditorOption<EditorOption.placeholder, string | undefined>;
    definitionLinkOpensInPeek: IEditorOption<EditorOption.definitionLinkOpensInPeek, boolean>;
    quickSuggestions: IEditorOption<EditorOption.quickSuggestions, InternalQuickSuggestionsOptions>;
    quickSuggestionsDelay: IEditorOption<EditorOption.quickSuggestionsDelay, number>;
    readOnly: IEditorOption<EditorOption.readOnly, boolean>;
    readOnlyMessage: IEditorOption<EditorOption.readOnlyMessage, IMarkdownString | undefined>;
    renameOnType: IEditorOption<EditorOption.renameOnType, boolean>;
    renderControlCharacters: IEditorOption<EditorOption.renderControlCharacters, boolean>;
    renderFinalNewline: IEditorOption<EditorOption.renderFinalNewline, "on" | "off" | "dimmed">;
    renderLineHighlight: IEditorOption<EditorOption.renderLineHighlight, "none" | "all" | "line" | "gutter">;
    renderLineHighlightOnlyWhenFocus: IEditorOption<EditorOption.renderLineHighlightOnlyWhenFocus, boolean>;
    renderValidationDecorations: IEditorOption<EditorOption.renderValidationDecorations, "on" | "off" | "editable">;
    renderWhitespace: IEditorOption<EditorOption.renderWhitespace, "selection" | "none" | "all" | "boundary" | "trailing">;
    revealHorizontalRightPadding: IEditorOption<EditorOption.revealHorizontalRightPadding, number>;
    roundedSelection: IEditorOption<EditorOption.roundedSelection, boolean>;
    rulers: IEditorOption<EditorOption.rulers, IRulerOption[]>;
    scrollbar: IEditorOption<EditorOption.scrollbar, InternalEditorScrollbarOptions>;
    scrollBeyondLastColumn: IEditorOption<EditorOption.scrollBeyondLastColumn, number>;
    scrollBeyondLastLine: IEditorOption<EditorOption.scrollBeyondLastLine, boolean>;
    scrollPredominantAxis: IEditorOption<EditorOption.scrollPredominantAxis, boolean>;
    selectionClipboard: IEditorOption<EditorOption.selectionClipboard, boolean>;
    selectionHighlight: IEditorOption<EditorOption.selectionHighlight, boolean>;
    selectOnLineNumbers: IEditorOption<EditorOption.selectOnLineNumbers, boolean>;
    showFoldingControls: IEditorOption<EditorOption.showFoldingControls, "mouseover" | "always" | "never">;
    showUnused: IEditorOption<EditorOption.showUnused, boolean>;
    showDeprecated: IEditorOption<EditorOption.showDeprecated, boolean>;
    inlayHints: IEditorOption<EditorOption.inlayHints, Readonly<Required<IEditorInlayHintsOptions>>>;
    snippetSuggestions: IEditorOption<EditorOption.snippetSuggestions, "top" | "none" | "bottom" | "inline">;
    smartSelect: IEditorOption<EditorOption.smartSelect, Readonly<Required<ISmartSelectOptions>>>;
    smoothScrolling: IEditorOption<EditorOption.smoothScrolling, boolean>;
    stopRenderingLineAfter: IEditorOption<EditorOption.stopRenderingLineAfter, number>;
    suggest: IEditorOption<EditorOption.suggest, Readonly<Required<ISuggestOptions>>>;
    inlineSuggest: IEditorOption<EditorOption.inlineSuggest, Readonly<Required<IInlineSuggestOptions>>>;
    inlineEdit: IEditorOption<EditorOption.inlineEdit, Readonly<Required<IInlineEditOptions>>>;
    inlineCompletionsAccessibilityVerbose: IEditorOption<EditorOption.inlineCompletionsAccessibilityVerbose, boolean>;
    suggestFontSize: IEditorOption<EditorOption.suggestFontSize, number>;
    suggestLineHeight: IEditorOption<EditorOption.suggestLineHeight, number>;
    suggestOnTriggerCharacters: IEditorOption<EditorOption.suggestOnTriggerCharacters, boolean>;
    suggestSelection: IEditorOption<EditorOption.suggestSelection, "first" | "recentlyUsed" | "recentlyUsedByPrefix">;
    tabCompletion: IEditorOption<EditorOption.tabCompletion, "on" | "off" | "onlySnippets">;
    tabIndex: IEditorOption<EditorOption.tabIndex, number>;
    unicodeHighlight: IEditorOption<EditorOption.unicodeHighlighting, Required<Readonly<IUnicodeHighlightOptions>>>;
    unusualLineTerminators: IEditorOption<EditorOption.unusualLineTerminators, "prompt" | "off" | "auto">;
    useShadowDOM: IEditorOption<EditorOption.useShadowDOM, boolean>;
    useTabStops: IEditorOption<EditorOption.useTabStops, boolean>;
    wordBreak: IEditorOption<EditorOption.wordBreak, "normal" | "keepAll">;
    wordSegmenterLocales: IEditorOption<EditorOption.wordSegmenterLocales, string[]>;
    wordSeparators: IEditorOption<EditorOption.wordSeparators, string>;
    wordWrap: IEditorOption<EditorOption.wordWrap, "on" | "off" | "wordWrapColumn" | "bounded">;
    wordWrapBreakAfterCharacters: IEditorOption<EditorOption.wordWrapBreakAfterCharacters, string>;
    wordWrapBreakBeforeCharacters: IEditorOption<EditorOption.wordWrapBreakBeforeCharacters, string>;
    wordWrapColumn: IEditorOption<EditorOption.wordWrapColumn, number>;
    wordWrapOverride1: IEditorOption<EditorOption.wordWrapOverride1, "on" | "off" | "inherit">;
    wordWrapOverride2: IEditorOption<EditorOption.wordWrapOverride2, "on" | "off" | "inherit">;
    editorClassName: IEditorOption<EditorOption.editorClassName, string>;
    defaultColorDecorators: IEditorOption<EditorOption.defaultColorDecorators, boolean>;
    pixelRatio: IEditorOption<EditorOption.pixelRatio, number>;
    tabFocusMode: IEditorOption<EditorOption.tabFocusMode, boolean>;
    layoutInfo: IEditorOption<EditorOption.layoutInfo, EditorLayoutInfo>;
    wrappingInfo: IEditorOption<EditorOption.wrappingInfo, EditorWrappingInfo>;
    wrappingIndent: IEditorOption<EditorOption.wrappingIndent, WrappingIndent>;
    wrappingStrategy: IEditorOption<EditorOption.wrappingStrategy, "simple" | "advanced">;
};
type EditorOptionsType = typeof EditorOptions;
type FindEditorOptionsKeyById<T extends EditorOption> = {
    [K in keyof EditorOptionsType]: EditorOptionsType[K]['id'] extends T ? K : never;
}[keyof EditorOptionsType];
type ComputedEditorOptionValue<T extends IEditorOption<any, any>> = T extends IEditorOption<any, infer R> ? R : never;
export type FindComputedEditorOptionValueById<T extends EditorOption> = NonNullable<ComputedEditorOptionValue<EditorOptionsType[FindEditorOptionsKeyById<T>]>>;
export {};
