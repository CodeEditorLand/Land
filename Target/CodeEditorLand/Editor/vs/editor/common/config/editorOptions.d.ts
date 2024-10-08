import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { ScrollbarVisibility } from '../../../base/common/scrollable.js';
import { FontInfo } from './fontInfo.js';
import { AccessibilitySupport } from '../../../platform/accessibility/common/accessibility.js';
import { IConfigurationPropertySchema } from '../../../platform/configuration/common/configurationRegistry.js';
/**
 * Configuration options for auto closing quotes and brackets
 */
export type EditorAutoClosingStrategy = 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
/**
 * Configuration options for auto wrapping quotes and brackets
 */
export type EditorAutoSurroundStrategy = 'languageDefined' | 'quotes' | 'brackets' | 'never';
/**
 * Configuration options for typing over closing quotes or brackets
 */
export type EditorAutoClosingEditStrategy = 'always' | 'auto' | 'never';
/**
 * Configuration options for auto indentation in the editor
 */
export declare const enum EditorAutoIndentStrategy {
    None = 0,
    Keep = 1,
    Brackets = 2,
    Advanced = 3,
    Full = 4
}
/**
 * Configuration options for the editor.
 */
export interface IEditorOptions {
    /**
     * This editor is used inside a diff editor.
     */
    inDiffEditor?: boolean;
    /**
     * The aria label for the editor's textarea (when it is focused).
     */
    ariaLabel?: string;
    /**
     * Whether the aria-required attribute should be set on the editors textarea.
     */
    ariaRequired?: boolean;
    /**
     * Control whether a screen reader announces inline suggestion content immediately.
     */
    screenReaderAnnounceInlineSuggestion?: boolean;
    /**
     * The `tabindex` property of the editor's textarea
     */
    tabIndex?: number;
    /**
     * Render vertical lines at the specified columns.
     * Defaults to empty array.
     */
    rulers?: (number | IRulerOption)[];
    /**
     * Locales used for segmenting lines into words when doing word related navigations or operations.
     *
     * Specify the BCP 47 language tag of the word you wish to recognize (e.g., ja, zh-CN, zh-Hant-TW, etc.).
     * Defaults to empty array
     */
    wordSegmenterLocales?: string | string[];
    /**
     * A string containing the word separators used when doing word navigation.
     * Defaults to `~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?
     */
    wordSeparators?: string;
    /**
     * Enable Linux primary clipboard.
     * Defaults to true.
     */
    selectionClipboard?: boolean;
    /**
     * Control the rendering of line numbers.
     * If it is a function, it will be invoked when rendering a line number and the return value will be rendered.
     * Otherwise, if it is a truthy, line numbers will be rendered normally (equivalent of using an identity function).
     * Otherwise, line numbers will not be rendered.
     * Defaults to `on`.
     */
    lineNumbers?: LineNumbersType;
    /**
     * Controls the minimal number of visible leading and trailing lines surrounding the cursor.
     * Defaults to 0.
    */
    cursorSurroundingLines?: number;
    /**
     * Controls when `cursorSurroundingLines` should be enforced
     * Defaults to `default`, `cursorSurroundingLines` is not enforced when cursor position is changed
     * by mouse.
    */
    cursorSurroundingLinesStyle?: 'default' | 'all';
    /**
     * Render last line number when the file ends with a newline.
     * Defaults to 'on' for Windows and macOS and 'dimmed' for Linux.
    */
    renderFinalNewline?: 'on' | 'off' | 'dimmed';
    /**
     * Remove unusual line terminators like LINE SEPARATOR (LS), PARAGRAPH SEPARATOR (PS).
     * Defaults to 'prompt'.
     */
    unusualLineTerminators?: 'auto' | 'off' | 'prompt';
    /**
     * Should the corresponding line be selected when clicking on the line number?
     * Defaults to true.
     */
    selectOnLineNumbers?: boolean;
    /**
     * Control the width of line numbers, by reserving horizontal space for rendering at least an amount of digits.
     * Defaults to 5.
     */
    lineNumbersMinChars?: number;
    /**
     * Enable the rendering of the glyph margin.
     * Defaults to true in vscode and to false in monaco-editor.
     */
    glyphMargin?: boolean;
    /**
     * The width reserved for line decorations (in px).
     * Line decorations are placed between line numbers and the editor content.
     * You can pass in a string in the format floating point followed by "ch". e.g. 1.3ch.
     * Defaults to 10.
     */
    lineDecorationsWidth?: number | string;
    /**
     * When revealing the cursor, a virtual padding (px) is added to the cursor, turning it into a rectangle.
     * This virtual padding ensures that the cursor gets revealed before hitting the edge of the viewport.
     * Defaults to 30 (px).
     */
    revealHorizontalRightPadding?: number;
    /**
     * Render the editor selection with rounded borders.
     * Defaults to true.
     */
    roundedSelection?: boolean;
    /**
     * Class name to be added to the editor.
     */
    extraEditorClassName?: string;
    /**
     * Should the editor be read only. See also `domReadOnly`.
     * Defaults to false.
     */
    readOnly?: boolean;
    /**
     * The message to display when the editor is readonly.
     */
    readOnlyMessage?: IMarkdownString;
    /**
     * Should the textarea used for input use the DOM `readonly` attribute.
     * Defaults to false.
     */
    domReadOnly?: boolean;
    /**
     * Enable linked editing.
     * Defaults to false.
     */
    linkedEditing?: boolean;
    /**
     * deprecated, use linkedEditing instead
     */
    renameOnType?: boolean;
    /**
     * Should the editor render validation decorations.
     * Defaults to editable.
     */
    renderValidationDecorations?: 'editable' | 'on' | 'off';
    /**
     * Control the behavior and rendering of the scrollbars.
     */
    scrollbar?: IEditorScrollbarOptions;
    /**
     * Control the behavior of sticky scroll options
     */
    stickyScroll?: IEditorStickyScrollOptions;
    /**
     * Control the behavior and rendering of the minimap.
     */
    minimap?: IEditorMinimapOptions;
    /**
     * Control the behavior of the find widget.
     */
    find?: IEditorFindOptions;
    /**
     * Display overflow widgets as `fixed`.
     * Defaults to `false`.
     */
    fixedOverflowWidgets?: boolean;
    /**
     * The number of vertical lanes the overview ruler should render.
     * Defaults to 3.
     */
    overviewRulerLanes?: number;
    /**
     * Controls if a border should be drawn around the overview ruler.
     * Defaults to `true`.
     */
    overviewRulerBorder?: boolean;
    /**
     * Control the cursor animation style, possible values are 'blink', 'smooth', 'phase', 'expand' and 'solid'.
     * Defaults to 'blink'.
     */
    cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
    /**
     * Zoom the font in the editor when using the mouse wheel in combination with holding Ctrl.
     * Defaults to false.
     */
    mouseWheelZoom?: boolean;
    /**
     * Control the mouse pointer style, either 'text' or 'default' or 'copy'
     * Defaults to 'text'
     */
    mouseStyle?: 'text' | 'default' | 'copy';
    /**
     * Enable smooth caret animation.
     * Defaults to 'off'.
     */
    cursorSmoothCaretAnimation?: 'off' | 'explicit' | 'on';
    /**
     * Control the cursor style, either 'block' or 'line'.
     * Defaults to 'line'.
     */
    cursorStyle?: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
    /**
     * Control the width of the cursor when cursorStyle is set to 'line'
     */
    cursorWidth?: number;
    /**
     * Enable font ligatures.
     * Defaults to false.
     */
    fontLigatures?: boolean | string;
    /**
     * Enable font variations.
     * Defaults to false.
     */
    fontVariations?: boolean | string;
    /**
     * Controls whether to use default color decorations or not using the default document color provider
     */
    defaultColorDecorators?: boolean;
    /**
     * Disable the use of `transform: translate3d(0px, 0px, 0px)` for the editor margin and lines layers.
     * The usage of `transform: translate3d(0px, 0px, 0px)` acts as a hint for browsers to create an extra layer.
     * Defaults to false.
     */
    disableLayerHinting?: boolean;
    /**
     * Disable the optimizations for monospace fonts.
     * Defaults to false.
     */
    disableMonospaceOptimizations?: boolean;
    /**
     * Should the cursor be hidden in the overview ruler.
     * Defaults to false.
     */
    hideCursorInOverviewRuler?: boolean;
    /**
     * Enable that scrolling can go one screen size after the last line.
     * Defaults to true.
     */
    scrollBeyondLastLine?: boolean;
    /**
     * Enable that scrolling can go beyond the last column by a number of columns.
     * Defaults to 5.
     */
    scrollBeyondLastColumn?: number;
    /**
     * Enable that the editor animates scrolling to a position.
     * Defaults to false.
     */
    smoothScrolling?: boolean;
    /**
     * Enable that the editor will install a ResizeObserver to check if its container dom node size has changed.
     * Defaults to false.
     */
    automaticLayout?: boolean;
    /**
     * Control the wrapping of the editor.
     * When `wordWrap` = "off", the lines will never wrap.
     * When `wordWrap` = "on", the lines will wrap at the viewport width.
     * When `wordWrap` = "wordWrapColumn", the lines will wrap at `wordWrapColumn`.
     * When `wordWrap` = "bounded", the lines will wrap at min(viewport width, wordWrapColumn).
     * Defaults to "off".
     */
    wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
    /**
     * Override the `wordWrap` setting.
     */
    wordWrapOverride1?: 'off' | 'on' | 'inherit';
    /**
     * Override the `wordWrapOverride1` setting.
     */
    wordWrapOverride2?: 'off' | 'on' | 'inherit';
    /**
     * Control the wrapping of the editor.
     * When `wordWrap` = "off", the lines will never wrap.
     * When `wordWrap` = "on", the lines will wrap at the viewport width.
     * When `wordWrap` = "wordWrapColumn", the lines will wrap at `wordWrapColumn`.
     * When `wordWrap` = "bounded", the lines will wrap at min(viewport width, wordWrapColumn).
     * Defaults to 80.
     */
    wordWrapColumn?: number;
    /**
     * Control indentation of wrapped lines. Can be: 'none', 'same', 'indent' or 'deepIndent'.
     * Defaults to 'same' in vscode and to 'none' in monaco-editor.
     */
    wrappingIndent?: 'none' | 'same' | 'indent' | 'deepIndent';
    /**
     * Controls the wrapping strategy to use.
     * Defaults to 'simple'.
     */
    wrappingStrategy?: 'simple' | 'advanced';
    /**
     * Configure word wrapping characters. A break will be introduced before these characters.
     */
    wordWrapBreakBeforeCharacters?: string;
    /**
     * Configure word wrapping characters. A break will be introduced after these characters.
     */
    wordWrapBreakAfterCharacters?: string;
    /**
     * Sets whether line breaks appear wherever the text would otherwise overflow its content box.
     * When wordBreak = 'normal', Use the default line break rule.
     * When wordBreak = 'keepAll', Word breaks should not be used for Chinese/Japanese/Korean (CJK) text. Non-CJK text behavior is the same as for normal.
     */
    wordBreak?: 'normal' | 'keepAll';
    /**
     * Performance guard: Stop rendering a line after x characters.
     * Defaults to 10000.
     * Use -1 to never stop rendering
     */
    stopRenderingLineAfter?: number;
    /**
     * Configure the editor's hover.
     */
    hover?: IEditorHoverOptions;
    /**
     * Enable detecting links and making them clickable.
     * Defaults to true.
     */
    links?: boolean;
    /**
     * Enable inline color decorators and color picker rendering.
     */
    colorDecorators?: boolean;
    /**
     * Controls what is the condition to spawn a color picker from a color dectorator
     */
    colorDecoratorsActivatedOn?: 'clickAndHover' | 'click' | 'hover';
    /**
     * Controls the max number of color decorators that can be rendered in an editor at once.
     */
    colorDecoratorsLimit?: number;
    /**
     * Control the behaviour of comments in the editor.
     */
    comments?: IEditorCommentsOptions;
    /**
     * Enable custom contextmenu.
     * Defaults to true.
     */
    contextmenu?: boolean;
    /**
     * A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.
     * Defaults to 1.
     */
    mouseWheelScrollSensitivity?: number;
    /**
     * FastScrolling mulitplier speed when pressing `Alt`
     * Defaults to 5.
     */
    fastScrollSensitivity?: number;
    /**
     * Enable that the editor scrolls only the predominant axis. Prevents horizontal drift when scrolling vertically on a trackpad.
     * Defaults to true.
     */
    scrollPredominantAxis?: boolean;
    /**
     * Enable that the selection with the mouse and keys is doing column selection.
     * Defaults to false.
     */
    columnSelection?: boolean;
    /**
     * The modifier to be used to add multiple cursors with the mouse.
     * Defaults to 'alt'
     */
    multiCursorModifier?: 'ctrlCmd' | 'alt';
    /**
     * Merge overlapping selections.
     * Defaults to true
     */
    multiCursorMergeOverlapping?: boolean;
    /**
     * Configure the behaviour when pasting a text with the line count equal to the cursor count.
     * Defaults to 'spread'.
     */
    multiCursorPaste?: 'spread' | 'full';
    /**
     * Controls the max number of text cursors that can be in an active editor at once.
     */
    multiCursorLimit?: number;
    /**
     * Configure the editor's accessibility support.
     * Defaults to 'auto'. It is best to leave this to 'auto'.
     */
    accessibilitySupport?: 'auto' | 'off' | 'on';
    /**
     * Controls the number of lines in the editor that can be read out by a screen reader
     */
    accessibilityPageSize?: number;
    /**
     * Suggest options.
     */
    suggest?: ISuggestOptions;
    inlineSuggest?: IInlineSuggestOptions;
    experimentalInlineEdit?: IInlineEditOptions;
    /**
     * Smart select options.
     */
    smartSelect?: ISmartSelectOptions;
    /**
     *
     */
    gotoLocation?: IGotoLocationOptions;
    /**
     * Enable quick suggestions (shadow suggestions)
     * Defaults to true.
     */
    quickSuggestions?: boolean | IQuickSuggestionsOptions;
    /**
     * Quick suggestions show delay (in ms)
     * Defaults to 10 (ms)
     */
    quickSuggestionsDelay?: number;
    /**
     * Controls the spacing around the editor.
     */
    padding?: IEditorPaddingOptions;
    /**
     * Parameter hint options.
     */
    parameterHints?: IEditorParameterHintOptions;
    /**
     * Options for auto closing brackets.
     * Defaults to language defined behavior.
     */
    autoClosingBrackets?: EditorAutoClosingStrategy;
    /**
     * Options for auto closing comments.
     * Defaults to language defined behavior.
     */
    autoClosingComments?: EditorAutoClosingStrategy;
    /**
     * Options for auto closing quotes.
     * Defaults to language defined behavior.
     */
    autoClosingQuotes?: EditorAutoClosingStrategy;
    /**
     * Options for pressing backspace near quotes or bracket pairs.
     */
    autoClosingDelete?: EditorAutoClosingEditStrategy;
    /**
     * Options for typing over closing quotes or brackets.
     */
    autoClosingOvertype?: EditorAutoClosingEditStrategy;
    /**
     * Options for auto surrounding.
     * Defaults to always allowing auto surrounding.
     */
    autoSurround?: EditorAutoSurroundStrategy;
    /**
     * Controls whether the editor should automatically adjust the indentation when users type, paste, move or indent lines.
     * Defaults to advanced.
     */
    autoIndent?: 'none' | 'keep' | 'brackets' | 'advanced' | 'full';
    /**
     * Emulate selection behaviour of tab characters when using spaces for indentation.
     * This means selection will stick to tab stops.
     */
    stickyTabStops?: boolean;
    /**
     * Enable format on type.
     * Defaults to false.
     */
    formatOnType?: boolean;
    /**
     * Enable format on paste.
     * Defaults to false.
     */
    formatOnPaste?: boolean;
    /**
     * Controls if the editor should allow to move selections via drag and drop.
     * Defaults to false.
     */
    dragAndDrop?: boolean;
    /**
     * Enable the suggestion box to pop-up on trigger characters.
     * Defaults to true.
     */
    suggestOnTriggerCharacters?: boolean;
    /**
     * Accept suggestions on ENTER.
     * Defaults to 'on'.
     */
    acceptSuggestionOnEnter?: 'on' | 'smart' | 'off';
    /**
     * Accept suggestions on provider defined characters.
     * Defaults to true.
     */
    acceptSuggestionOnCommitCharacter?: boolean;
    /**
     * Enable snippet suggestions. Default to 'true'.
     */
    snippetSuggestions?: 'top' | 'bottom' | 'inline' | 'none';
    /**
     * Copying without a selection copies the current line.
     */
    emptySelectionClipboard?: boolean;
    /**
     * Syntax highlighting is copied.
     */
    copyWithSyntaxHighlighting?: boolean;
    /**
     * The history mode for suggestions.
     */
    suggestSelection?: 'first' | 'recentlyUsed' | 'recentlyUsedByPrefix';
    /**
     * The font size for the suggest widget.
     * Defaults to the editor font size.
     */
    suggestFontSize?: number;
    /**
     * The line height for the suggest widget.
     * Defaults to the editor line height.
     */
    suggestLineHeight?: number;
    /**
     * Enable tab completion.
     */
    tabCompletion?: 'on' | 'off' | 'onlySnippets';
    /**
     * Enable selection highlight.
     * Defaults to true.
     */
    selectionHighlight?: boolean;
    /**
     * Enable semantic occurrences highlight.
     * Defaults to 'singleFile'.
     * 'off' disables occurrence highlighting
     * 'singleFile' triggers occurrence highlighting in the current document
     * 'multiFile'  triggers occurrence highlighting across valid open documents
     */
    occurrencesHighlight?: 'off' | 'singleFile' | 'multiFile';
    /**
     * Controls delay for occurrences highlighting
     * Defaults to 250.
     * Minimum value is 0
     * Maximum value is 2000
     */
    occurrencesHighlightDelay?: number;
    /**
     * Show code lens
     * Defaults to true.
     */
    codeLens?: boolean;
    /**
     * Code lens font family. Defaults to editor font family.
     */
    codeLensFontFamily?: string;
    /**
     * Code lens font size. Default to 90% of the editor font size
     */
    codeLensFontSize?: number;
    /**
     * Control the behavior and rendering of the code action lightbulb.
     */
    lightbulb?: IEditorLightbulbOptions;
    /**
     * Timeout for running code actions on save.
     */
    codeActionsOnSaveTimeout?: number;
    /**
     * Enable code folding.
     * Defaults to true.
     */
    folding?: boolean;
    /**
     * Selects the folding strategy. 'auto' uses the strategies contributed for the current document, 'indentation' uses the indentation based folding strategy.
     * Defaults to 'auto'.
     */
    foldingStrategy?: 'auto' | 'indentation';
    /**
     * Enable highlight for folded regions.
     * Defaults to true.
     */
    foldingHighlight?: boolean;
    /**
     * Auto fold imports folding regions.
     * Defaults to true.
     */
    foldingImportsByDefault?: boolean;
    /**
     * Maximum number of foldable regions.
     * Defaults to 5000.
     */
    foldingMaximumRegions?: number;
    /**
     * Controls whether the fold actions in the gutter stay always visible or hide unless the mouse is over the gutter.
     * Defaults to 'mouseover'.
     */
    showFoldingControls?: 'always' | 'never' | 'mouseover';
    /**
     * Controls whether clicking on the empty content after a folded line will unfold the line.
     * Defaults to false.
     */
    unfoldOnClickAfterEndOfLine?: boolean;
    /**
     * Enable highlighting of matching brackets.
     * Defaults to 'always'.
     */
    matchBrackets?: 'never' | 'near' | 'always';
    /**
     * Enable experimental rendering using WebGPU.
     * Defaults to 'off'.
     */
    experimentalGpuAcceleration?: 'on' | 'off';
    /**
     * Enable experimental whitespace rendering.
     * Defaults to 'svg'.
     */
    experimentalWhitespaceRendering?: 'svg' | 'font' | 'off';
    /**
     * Enable rendering of whitespace.
     * Defaults to 'selection'.
     */
    renderWhitespace?: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
    /**
     * Enable rendering of control characters.
     * Defaults to true.
     */
    renderControlCharacters?: boolean;
    /**
     * Enable rendering of current line highlight.
     * Defaults to all.
     */
    renderLineHighlight?: 'none' | 'gutter' | 'line' | 'all';
    /**
     * Control if the current line highlight should be rendered only the editor is focused.
     * Defaults to false.
     */
    renderLineHighlightOnlyWhenFocus?: boolean;
    /**
     * Inserting and deleting whitespace follows tab stops.
     */
    useTabStops?: boolean;
    /**
     * The font family
     */
    fontFamily?: string;
    /**
     * The font weight
     */
    fontWeight?: string;
    /**
     * The font size
     */
    fontSize?: number;
    /**
     * The line height
     */
    lineHeight?: number;
    /**
     * The letter spacing
     */
    letterSpacing?: number;
    /**
     * Controls fading out of unused variables.
     */
    showUnused?: boolean;
    /**
     * Controls whether to focus the inline editor in the peek widget by default.
     * Defaults to false.
     */
    peekWidgetDefaultFocus?: 'tree' | 'editor';
    /**
     * Sets a placeholder for the editor.
     * If set, the placeholder is shown if the editor is empty.
    */
    placeholder?: string | undefined;
    /**
     * Controls whether the definition link opens element in the peek widget.
     * Defaults to false.
     */
    definitionLinkOpensInPeek?: boolean;
    /**
     * Controls strikethrough deprecated variables.
     */
    showDeprecated?: boolean;
    /**
     * Controls whether suggestions allow matches in the middle of the word instead of only at the beginning
     */
    matchOnWordStartOnly?: boolean;
    /**
     * Control the behavior and rendering of the inline hints.
     */
    inlayHints?: IEditorInlayHintsOptions;
    /**
     * Control if the editor should use shadow DOM.
     */
    useShadowDOM?: boolean;
    /**
     * Controls the behavior of editor guides.
    */
    guides?: IGuidesOptions;
    /**
     * Controls the behavior of the unicode highlight feature
     * (by default, ambiguous and invisible characters are highlighted).
     */
    unicodeHighlight?: IUnicodeHighlightOptions;
    /**
     * Configures bracket pair colorization (disabled by default).
    */
    bracketPairColorization?: IBracketPairColorizationOptions;
    /**
     * Controls dropping into the editor from an external source.
     *
     * When enabled, this shows a preview of the drop location and triggers an `onDropIntoEditor` event.
     */
    dropIntoEditor?: IDropIntoEditorOptions;
    /**
     * Sets whether the new experimental edit context should be used instead of the text area.
     */
    experimentalEditContextEnabled?: boolean;
    /**
     * Controls support for changing how content is pasted into the editor.
     */
    pasteAs?: IPasteAsOptions;
    /**
     * Controls whether the editor / terminal receives tabs or defers them to the workbench for navigation.
     */
    tabFocusMode?: boolean;
    /**
     * Controls whether the accessibility hint should be provided to screen reader users when an inline completion is shown.
     */
    inlineCompletionsAccessibilityVerbose?: boolean;
}
/**
 * @internal
 * The width of the minimap gutter, in pixels.
 */
export declare const MINIMAP_GUTTER_WIDTH = 8;
export interface IDiffEditorBaseOptions {
    /**
     * Allow the user to resize the diff editor split view.
     * Defaults to true.
     */
    enableSplitViewResizing?: boolean;
    /**
     * The default ratio when rendering side-by-side editors.
     * Must be a number between 0 and 1, min sizes apply.
     * Defaults to 0.5
     */
    splitViewDefaultRatio?: number;
    /**
     * Render the differences in two side-by-side editors.
     * Defaults to true.
     */
    renderSideBySide?: boolean;
    /**
     * When `renderSideBySide` is enabled, `useInlineViewWhenSpaceIsLimited` is set,
     * and the diff editor has a width less than `renderSideBySideInlineBreakpoint`, the inline view is used.
     */
    renderSideBySideInlineBreakpoint?: number | undefined;
    /**
     * When `renderSideBySide` is enabled, `useInlineViewWhenSpaceIsLimited` is set,
     * and the diff editor has a width less than `renderSideBySideInlineBreakpoint`, the inline view is used.
     */
    useInlineViewWhenSpaceIsLimited?: boolean;
    /**
     * If set, the diff editor is optimized for small views.
     * Defaults to `false`.
    */
    compactMode?: boolean;
    /**
     * Timeout in milliseconds after which diff computation is cancelled.
     * Defaults to 5000.
     */
    maxComputationTime?: number;
    /**
     * Maximum supported file size in MB.
     * Defaults to 50.
     */
    maxFileSize?: number;
    /**
     * Compute the diff by ignoring leading/trailing whitespace
     * Defaults to true.
     */
    ignoreTrimWhitespace?: boolean;
    /**
     * Render +/- indicators for added/deleted changes.
     * Defaults to true.
     */
    renderIndicators?: boolean;
    /**
     * Shows icons in the glyph margin to revert changes.
     * Default to true.
     */
    renderMarginRevertIcon?: boolean;
    /**
     * Indicates if the gutter menu should be rendered.
    */
    renderGutterMenu?: boolean;
    /**
     * Original model should be editable?
     * Defaults to false.
     */
    originalEditable?: boolean;
    /**
     * Should the diff editor enable code lens?
     * Defaults to false.
     */
    diffCodeLens?: boolean;
    /**
     * Is the diff editor should render overview ruler
     * Defaults to true
     */
    renderOverviewRuler?: boolean;
    /**
     * Control the wrapping of the diff editor.
     */
    diffWordWrap?: 'off' | 'on' | 'inherit';
    /**
     * Diff Algorithm
    */
    diffAlgorithm?: 'legacy' | 'advanced';
    /**
     * Whether the diff editor aria label should be verbose.
     */
    accessibilityVerbose?: boolean;
    experimental?: {
        /**
         * Defaults to false.
         */
        showMoves?: boolean;
        showEmptyDecorations?: boolean;
        /**
         * Only applies when `renderSideBySide` is set to false.
        */
        useTrueInlineView?: boolean;
    };
    /**
     * Is the diff editor inside another editor
     * Defaults to false
     */
    isInEmbeddedEditor?: boolean;
    /**
     * If the diff editor should only show the difference review mode.
     */
    onlyShowAccessibleDiffViewer?: boolean;
    hideUnchangedRegions?: {
        enabled?: boolean;
        revealLineCount?: number;
        minimumLineCount?: number;
        contextLineCount?: number;
    };
}
/**
 * Configuration options for the diff editor.
 */
export interface IDiffEditorOptions extends IEditorOptions, IDiffEditorBaseOptions {
}
/**
 * @internal
 */
export type ValidDiffEditorBaseOptions = Readonly<Required<IDiffEditorBaseOptions>>;
/**
 * An event describing that the configuration of the editor has changed.
 */
export declare class ConfigurationChangedEvent {
    private readonly _values;
    /**
     * @internal
     */
    constructor(values: boolean[]);
    hasChanged(id: EditorOption): boolean;
}
/**
 * All computed editor options.
 */
export interface IComputedEditorOptions {
    get<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
}
/**
 * @internal
 */
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
/**
 * @internal
 */
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
    /**
     * @internal
     */
    readonly schema: IConfigurationPropertySchema | {
        [path: string]: IConfigurationPropertySchema;
    } | undefined;
    /**
     * @internal
     */
    validate(input: any): V;
    /**
     * @internal
     */
    compute(env: IEnvironmentalOptions, options: IComputedEditorOptions, value: V): V;
    /**
     * Might modify `value`.
    */
    applyUpdate(value: V | undefined, update: V): ApplyUpdateResult<V>;
}
/**
 * @internal
 */
type PossibleKeyName0<V> = {
    [K in keyof IEditorOptions]: IEditorOptions[K] extends V | undefined ? K : never;
}[keyof IEditorOptions];
/**
 * @internal
 */
type PossibleKeyName<V> = NonNullable<PossibleKeyName0<V>>;
/**
 * @internal
 */
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
/**
 * @internal
 */
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
/**
 * @internal
 */
export declare function boolean(value: any, defaultValue: boolean): boolean;
/**
 * @internal
 */
export declare function clampedInt<T>(value: any, defaultValue: T, minimum: number, maximum: number): number | T;
/**
 * @internal
 */
export declare function clampedFloat<T extends number>(value: any, defaultValue: T, minimum: number, maximum: number): number | T;
/**
 * @internal
 */
export declare function stringSet<T>(value: T | undefined, defaultValue: T, allowedValues: ReadonlyArray<T>, renamedValues?: Record<string, T>): T;
/**
 * Configuration options for editor comments
 */
export interface IEditorCommentsOptions {
    /**
     * Insert a space after the line comment token and inside the block comments tokens.
     * Defaults to true.
     */
    insertSpace?: boolean;
    /**
     * Ignore empty lines when inserting line comments.
     * Defaults to true.
     */
    ignoreEmptyLines?: boolean;
}
/**
 * @internal
 */
export type EditorCommentsOptions = Readonly<Required<IEditorCommentsOptions>>;
/**
 * The kind of animation in which the editor's cursor should be rendered.
 */
export declare const enum TextEditorCursorBlinkingStyle {
    /**
     * Hidden
     */
    Hidden = 0,
    /**
     * Blinking
     */
    Blink = 1,
    /**
     * Blinking with smooth fading
     */
    Smooth = 2,
    /**
     * Blinking with prolonged filled state and smooth fading
     */
    Phase = 3,
    /**
     * Expand collapse animation on the y axis
     */
    Expand = 4,
    /**
     * No-Blinking
     */
    Solid = 5
}
/**
 * @internal
 */
export declare function cursorBlinkingStyleFromString(cursorBlinkingStyle: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'): TextEditorCursorBlinkingStyle;
/**
 * The style in which the editor's cursor should be rendered.
 */
export declare enum TextEditorCursorStyle {
    /**
     * As a vertical line (sitting between two characters).
     */
    Line = 1,
    /**
     * As a block (sitting on top of a character).
     */
    Block = 2,
    /**
     * As a horizontal line (sitting under a character).
     */
    Underline = 3,
    /**
     * As a thin vertical line (sitting between two characters).
     */
    LineThin = 4,
    /**
     * As an outlined block (sitting on top of a character).
     */
    BlockOutline = 5,
    /**
     * As a thin horizontal line (sitting under a character).
     */
    UnderlineThin = 6
}
/**
 * @internal
 */
export declare function cursorStyleToString(cursorStyle: TextEditorCursorStyle): 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
/**
 * @internal
 */
export declare function cursorStyleFromString(cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin'): TextEditorCursorStyle;
/**
 * Configuration options for editor find widget
 */
export interface IEditorFindOptions {
    /**
    * Controls whether the cursor should move to find matches while typing.
    */
    cursorMoveOnType?: boolean;
    /**
     * Controls if we seed search string in the Find Widget with editor selection.
     */
    seedSearchStringFromSelection?: 'never' | 'always' | 'selection';
    /**
     * Controls if Find in Selection flag is turned on in the editor.
     */
    autoFindInSelection?: 'never' | 'always' | 'multiline';
    addExtraSpaceOnTop?: boolean;
    /**
     * @internal
     * Controls if the Find Widget should read or modify the shared find clipboard on macOS
     */
    globalFindClipboard?: boolean;
    /**
     * Controls whether the search result and diff result automatically restarts from the beginning (or the end) when no further matches can be found
     */
    loop?: boolean;
}
/**
 * @internal
 */
export type EditorFindOptions = Readonly<Required<IEditorFindOptions>>;
/**
 * @internal
 */
export declare class EditorFontLigatures extends BaseEditorOption<EditorOption.fontLigatures, boolean | string, string> {
    static OFF: string;
    static ON: string;
    constructor();
    validate(input: any): string;
}
/**
 * @internal
 */
export declare class EditorFontVariations extends BaseEditorOption<EditorOption.fontVariations, boolean | string, string> {
    static OFF: string;
    static TRANSLATE: string;
    constructor();
    validate(input: any): string;
    compute(env: IEnvironmentalOptions, options: IComputedEditorOptions, value: string): string;
}
export type GoToLocationValues = 'peek' | 'gotoAndPeek' | 'goto';
/**
 * Configuration options for go to location
 */
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
/**
 * @internal
 */
export type GoToLocationOptions = Readonly<Required<IGotoLocationOptions>>;
/**
 * Configuration options for editor hover
 */
export interface IEditorHoverOptions {
    /**
     * Enable the hover.
     * Defaults to true.
     */
    enabled?: boolean;
    /**
     * Delay for showing the hover.
     * Defaults to 300.
     */
    delay?: number;
    /**
     * Is the hover sticky such that it can be clicked and its contents selected?
     * Defaults to true.
     */
    sticky?: boolean;
    /**
     * Controls how long the hover is visible after you hovered out of it.
     * Require sticky setting to be true.
     */
    hidingDelay?: number;
    /**
     * Should the hover be shown above the line if possible?
     * Defaults to false.
     */
    above?: boolean;
}
/**
 * @internal
 */
export type EditorHoverOptions = Readonly<Required<IEditorHoverOptions>>;
/**
 * A description for the overview ruler position.
 */
export interface OverviewRulerPosition {
    /**
     * Width of the overview ruler
     */
    readonly width: number;
    /**
     * Height of the overview ruler
     */
    readonly height: number;
    /**
     * Top position for the overview ruler
     */
    readonly top: number;
    /**
     * Right position for the overview ruler
     */
    readonly right: number;
}
export declare const enum RenderMinimap {
    None = 0,
    Text = 1,
    Blocks = 2
}
/**
 * The internal layout details of the editor.
 */
export interface EditorLayoutInfo {
    /**
     * Full editor width.
     */
    readonly width: number;
    /**
     * Full editor height.
     */
    readonly height: number;
    /**
     * Left position for the glyph margin.
     */
    readonly glyphMarginLeft: number;
    /**
     * The width of the glyph margin.
     */
    readonly glyphMarginWidth: number;
    /**
     * The number of decoration lanes to render in the glyph margin.
     */
    readonly glyphMarginDecorationLaneCount: number;
    /**
     * Left position for the line numbers.
     */
    readonly lineNumbersLeft: number;
    /**
     * The width of the line numbers.
     */
    readonly lineNumbersWidth: number;
    /**
     * Left position for the line decorations.
     */
    readonly decorationsLeft: number;
    /**
     * The width of the line decorations.
     */
    readonly decorationsWidth: number;
    /**
     * Left position for the content (actual text)
     */
    readonly contentLeft: number;
    /**
     * The width of the content (actual text)
     */
    readonly contentWidth: number;
    /**
     * Layout information for the minimap
     */
    readonly minimap: EditorMinimapLayoutInfo;
    /**
     * The number of columns (of typical characters) fitting on a viewport line.
     */
    readonly viewportColumn: number;
    readonly isWordWrapMinified: boolean;
    readonly isViewportWrapping: boolean;
    readonly wrappingColumn: number;
    /**
     * The width of the vertical scrollbar.
     */
    readonly verticalScrollbarWidth: number;
    /**
     * The height of the horizontal scrollbar.
     */
    readonly horizontalScrollbarHeight: number;
    /**
     * The position of the overview ruler.
     */
    readonly overviewRuler: OverviewRulerPosition;
}
/**
 * The internal layout details of the editor.
 */
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
/**
 * @internal
 */
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
/**
 * @internal
 */
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
/**
 * @internal
 */
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
/**
 * @internal
 */
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
/**
 * Configuration options for editor lightbulb
 */
export interface IEditorLightbulbOptions {
    /**
     * Enable the lightbulb code action.
     * The three possible values are `off`, `on` and `onCode` and the default is `onCode`.
     * `off` disables the code action menu.
     * `on` shows the code action menu on code and on empty lines.
     * `onCode` shows the code action menu on code only.
     */
    enabled?: ShowLightbulbIconMode;
}
/**
 * @internal
 */
export type EditorLightbulbOptions = Readonly<Required<IEditorLightbulbOptions>>;
export interface IEditorStickyScrollOptions {
    /**
     * Enable the sticky scroll
     */
    enabled?: boolean;
    /**
     * Maximum number of sticky lines to show
     */
    maxLineCount?: number;
    /**
     * Model to choose for sticky scroll by default
     */
    defaultModel?: 'outlineModel' | 'foldingProviderModel' | 'indentationModel';
    /**
     * Define whether to scroll sticky scroll with editor horizontal scrollbae
     */
    scrollWithEditor?: boolean;
}
/**
 * @internal
 */
export type EditorStickyScrollOptions = Readonly<Required<IEditorStickyScrollOptions>>;
/**
 * Configuration options for editor inlayHints
 */
export interface IEditorInlayHintsOptions {
    /**
     * Enable the inline hints.
     * Defaults to true.
     */
    enabled?: 'on' | 'off' | 'offUnlessPressed' | 'onUnlessPressed';
    /**
     * Font size of inline hints.
     * Default to 90% of the editor font size.
     */
    fontSize?: number;
    /**
     * Font family of inline hints.
     * Defaults to editor font family.
     */
    fontFamily?: string;
    /**
     * Enables the padding around the inlay hint.
     * Defaults to false.
     */
    padding?: boolean;
    /**
     * Maximum length for inlay hints per line
     * Set to 0 to have an unlimited length.
     */
    maximumLength?: number;
}
/**
 * @internal
 */
export type EditorInlayHintsOptions = Readonly<Required<IEditorInlayHintsOptions>>;
/**
 * Configuration options for editor minimap
 */
export interface IEditorMinimapOptions {
    /**
     * Enable the rendering of the minimap.
     * Defaults to true.
     */
    enabled?: boolean;
    /**
     * Control the rendering of minimap.
     */
    autohide?: boolean;
    /**
     * Control the side of the minimap in editor.
     * Defaults to 'right'.
     */
    side?: 'right' | 'left';
    /**
     * Control the minimap rendering mode.
     * Defaults to 'actual'.
     */
    size?: 'proportional' | 'fill' | 'fit';
    /**
     * Control the rendering of the minimap slider.
     * Defaults to 'mouseover'.
     */
    showSlider?: 'always' | 'mouseover';
    /**
     * Render the actual text on a line (as opposed to color blocks).
     * Defaults to true.
     */
    renderCharacters?: boolean;
    /**
     * Limit the width of the minimap to render at most a certain number of columns.
     * Defaults to 120.
     */
    maxColumn?: number;
    /**
     * Relative size of the font in the minimap. Defaults to 1.
     */
    scale?: number;
    /**
     * Whether to show named regions as section headers. Defaults to true.
     */
    showRegionSectionHeaders?: boolean;
    /**
     * Whether to show MARK: comments as section headers. Defaults to true.
     */
    showMarkSectionHeaders?: boolean;
    /**
     * Font size of section headers. Defaults to 9.
     */
    sectionHeaderFontSize?: number;
    /**
     * Spacing between the section header characters (in CSS px). Defaults to 1.
     */
    sectionHeaderLetterSpacing?: number;
}
/**
 * @internal
 */
export type EditorMinimapOptions = Readonly<Required<IEditorMinimapOptions>>;
/**
 * Configuration options for editor padding
 */
export interface IEditorPaddingOptions {
    /**
     * Spacing between top edge of editor and first line.
     */
    top?: number;
    /**
     * Spacing between bottom edge of editor and last line.
     */
    bottom?: number;
}
/**
 * @internal
 */
export type InternalEditorPaddingOptions = Readonly<Required<IEditorPaddingOptions>>;
/**
 * Configuration options for parameter hints
 */
export interface IEditorParameterHintOptions {
    /**
     * Enable parameter hints.
     * Defaults to true.
     */
    enabled?: boolean;
    /**
     * Enable cycling of parameter hints.
     * Defaults to false.
     */
    cycle?: boolean;
}
/**
 * @internal
 */
export type InternalParameterHintOptions = Readonly<Required<IEditorParameterHintOptions>>;
export type QuickSuggestionsValue = 'on' | 'inline' | 'off';
/**
 * Configuration options for quick suggestions
 */
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
/**
 * @internal
 */
export declare function filterValidationDecorations(options: IComputedEditorOptions): boolean;
export interface IRulerOption {
    readonly column: number;
    readonly color: string | null;
}
/**
 * Configuration options for editor scrollbars
 */
export interface IEditorScrollbarOptions {
    /**
     * The size of arrows (if displayed).
     * Defaults to 11.
     * **NOTE**: This option cannot be updated using `updateOptions()`
     */
    arrowSize?: number;
    /**
     * Render vertical scrollbar.
     * Defaults to 'auto'.
     */
    vertical?: 'auto' | 'visible' | 'hidden';
    /**
     * Render horizontal scrollbar.
     * Defaults to 'auto'.
     */
    horizontal?: 'auto' | 'visible' | 'hidden';
    /**
     * Cast horizontal and vertical shadows when the content is scrolled.
     * Defaults to true.
     * **NOTE**: This option cannot be updated using `updateOptions()`
     */
    useShadows?: boolean;
    /**
     * Render arrows at the top and bottom of the vertical scrollbar.
     * Defaults to false.
     * **NOTE**: This option cannot be updated using `updateOptions()`
     */
    verticalHasArrows?: boolean;
    /**
     * Render arrows at the left and right of the horizontal scrollbar.
     * Defaults to false.
     * **NOTE**: This option cannot be updated using `updateOptions()`
     */
    horizontalHasArrows?: boolean;
    /**
     * Listen to mouse wheel events and react to them by scrolling.
     * Defaults to true.
     */
    handleMouseWheel?: boolean;
    /**
     * Always consume mouse wheel events (always call preventDefault() and stopPropagation() on the browser events).
     * Defaults to true.
     * **NOTE**: This option cannot be updated using `updateOptions()`
     */
    alwaysConsumeMouseWheel?: boolean;
    /**
     * Height in pixels for the horizontal scrollbar.
     * Defaults to 10 (px).
     */
    horizontalScrollbarSize?: number;
    /**
     * Width in pixels for the vertical scrollbar.
     * Defaults to 10 (px).
     */
    verticalScrollbarSize?: number;
    /**
     * Width in pixels for the vertical slider.
     * Defaults to `verticalScrollbarSize`.
     * **NOTE**: This option cannot be updated using `updateOptions()`
     */
    verticalSliderSize?: number;
    /**
     * Height in pixels for the horizontal slider.
     * Defaults to `horizontalScrollbarSize`.
     * **NOTE**: This option cannot be updated using `updateOptions()`
     */
    horizontalSliderSize?: number;
    /**
     * Scroll gutter clicks move by page vs jump to position.
     * Defaults to false.
     */
    scrollByPage?: boolean;
    /**
     * When set, the horizontal scrollbar will not increase content height.
     * Defaults to false.
     */
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
/**
 * @internal
*/
export declare const inUntrustedWorkspace: InUntrustedWorkspace;
/**
 * Configuration options for unicode highlighting.
 */
export interface IUnicodeHighlightOptions {
    /**
     * Controls whether all non-basic ASCII characters are highlighted. Only characters between U+0020 and U+007E, tab, line-feed and carriage-return are considered basic ASCII.
     */
    nonBasicASCII?: boolean | InUntrustedWorkspace;
    /**
     * Controls whether characters that just reserve space or have no width at all are highlighted.
     */
    invisibleCharacters?: boolean;
    /**
     * Controls whether characters are highlighted that can be confused with basic ASCII characters, except those that are common in the current user locale.
     */
    ambiguousCharacters?: boolean;
    /**
     * Controls whether characters in comments should also be subject to unicode highlighting.
     */
    includeComments?: boolean | InUntrustedWorkspace;
    /**
     * Controls whether characters in strings should also be subject to unicode highlighting.
     */
    includeStrings?: boolean | InUntrustedWorkspace;
    /**
     * Defines allowed characters that are not being highlighted.
     */
    allowedCharacters?: Record<string, true>;
    /**
     * Unicode characters that are common in allowed locales are not being highlighted.
     */
    allowedLocales?: Record<string | '_os' | '_vscode', true>;
}
/**
 * @internal
 */
export type InternalUnicodeHighlightOptions = Required<Readonly<IUnicodeHighlightOptions>>;
/**
 * @internal
 */
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
    /**
     * Enable or disable the rendering of automatic inline completions.
    */
    enabled?: boolean;
    /**
     * Configures the mode.
     * Use `prefix` to only show ghost text if the text to replace is a prefix of the suggestion text.
     * Use `subword` to only show ghost text if the replace text is a subword of the suggestion text.
     * Use `subwordSmart` to only show ghost text if the replace text is a subword of the suggestion text, but the subword must start after the cursor position.
     * Defaults to `prefix`.
    */
    mode?: 'prefix' | 'subword' | 'subwordSmart';
    showToolbar?: 'always' | 'onHover' | 'never';
    syntaxHighlightingEnabled?: boolean;
    suppressSuggestions?: boolean;
    /**
     * Does not clear active inline suggestions when the editor loses focus.
     */
    keepOnBlur?: boolean;
    /**
     * Font family for inline suggestions.
     */
    fontFamily?: string | 'default';
}
/**
 * @internal
 */
export type InternalInlineSuggestOptions = Readonly<Required<IInlineSuggestOptions>>;
export interface IInlineEditOptions {
    /**
     * Enable or disable the rendering of automatic inline edit.
    */
    enabled?: boolean;
    showToolbar?: 'always' | 'onHover' | 'never';
    /**
     * Font family for inline suggestions.
     */
    fontFamily?: string | 'default';
    /**
     * Does not clear active inline suggestions when the editor loses focus.
     */
    keepOnBlur?: boolean;
}
/**
 * @internal
 */
export type InternalInlineEditOptions = Readonly<Required<IInlineEditOptions>>;
export interface IBracketPairColorizationOptions {
    /**
     * Enable or disable bracket pair colorization.
    */
    enabled?: boolean;
    /**
     * Use independent color pool per bracket type.
    */
    independentColorPoolPerBracketType?: boolean;
}
/**
 * @internal
 */
export type InternalBracketPairColorizationOptions = Readonly<Required<IBracketPairColorizationOptions>>;
export interface IGuidesOptions {
    /**
     * Enable rendering of bracket pair guides.
     * Defaults to false.
    */
    bracketPairs?: boolean | 'active';
    /**
     * Enable rendering of vertical bracket pair guides.
     * Defaults to 'active'.
     */
    bracketPairsHorizontal?: boolean | 'active';
    /**
     * Enable highlighting of the active bracket pair.
     * Defaults to true.
    */
    highlightActiveBracketPair?: boolean;
    /**
     * Enable rendering of indent guides.
     * Defaults to true.
     */
    indentation?: boolean;
    /**
     * Enable highlighting of the active indent guide.
     * Defaults to true.
     */
    highlightActiveIndentation?: boolean | 'always';
}
/**
 * @internal
 */
export type InternalGuidesOptions = Readonly<Required<IGuidesOptions>>;
/**
 * Configuration options for editor suggest widget
 */
export interface ISuggestOptions {
    /**
     * Overwrite word ends on accept. Default to false.
     */
    insertMode?: 'insert' | 'replace';
    /**
     * Enable graceful matching. Defaults to true.
     */
    filterGraceful?: boolean;
    /**
     * Prevent quick suggestions when a snippet is active. Defaults to true.
     */
    snippetsPreventQuickSuggestions?: boolean;
    /**
     * Favors words that appear close to the cursor.
     */
    localityBonus?: boolean;
    /**
     * Enable using global storage for remembering suggestions.
     */
    shareSuggestSelections?: boolean;
    /**
     * Select suggestions when triggered via quick suggest or trigger characters
     */
    selectionMode?: 'always' | 'never' | 'whenTriggerCharacter' | 'whenQuickSuggestion';
    /**
     * Enable or disable icons in suggestions. Defaults to true.
     */
    showIcons?: boolean;
    /**
     * Enable or disable the suggest status bar.
     */
    showStatusBar?: boolean;
    /**
     * Enable or disable the rendering of the suggestion preview.
     */
    preview?: boolean;
    /**
     * Configures the mode of the preview.
    */
    previewMode?: 'prefix' | 'subword' | 'subwordSmart';
    /**
     * Show details inline with the label. Defaults to true.
     */
    showInlineDetails?: boolean;
    /**
     * Show method-suggestions.
     */
    showMethods?: boolean;
    /**
     * Show function-suggestions.
     */
    showFunctions?: boolean;
    /**
     * Show constructor-suggestions.
     */
    showConstructors?: boolean;
    /**
     * Show deprecated-suggestions.
     */
    showDeprecated?: boolean;
    /**
     * Controls whether suggestions allow matches in the middle of the word instead of only at the beginning
     */
    matchOnWordStartOnly?: boolean;
    /**
     * Show field-suggestions.
     */
    showFields?: boolean;
    /**
     * Show variable-suggestions.
     */
    showVariables?: boolean;
    /**
     * Show class-suggestions.
     */
    showClasses?: boolean;
    /**
     * Show struct-suggestions.
     */
    showStructs?: boolean;
    /**
     * Show interface-suggestions.
     */
    showInterfaces?: boolean;
    /**
     * Show module-suggestions.
     */
    showModules?: boolean;
    /**
     * Show property-suggestions.
     */
    showProperties?: boolean;
    /**
     * Show event-suggestions.
     */
    showEvents?: boolean;
    /**
     * Show operator-suggestions.
     */
    showOperators?: boolean;
    /**
     * Show unit-suggestions.
     */
    showUnits?: boolean;
    /**
     * Show value-suggestions.
     */
    showValues?: boolean;
    /**
     * Show constant-suggestions.
     */
    showConstants?: boolean;
    /**
     * Show enum-suggestions.
     */
    showEnums?: boolean;
    /**
     * Show enumMember-suggestions.
     */
    showEnumMembers?: boolean;
    /**
     * Show keyword-suggestions.
     */
    showKeywords?: boolean;
    /**
     * Show text-suggestions.
     */
    showWords?: boolean;
    /**
     * Show color-suggestions.
     */
    showColors?: boolean;
    /**
     * Show file-suggestions.
     */
    showFiles?: boolean;
    /**
     * Show reference-suggestions.
     */
    showReferences?: boolean;
    /**
     * Show folder-suggestions.
     */
    showFolders?: boolean;
    /**
     * Show typeParameter-suggestions.
     */
    showTypeParameters?: boolean;
    /**
     * Show issue-suggestions.
     */
    showIssues?: boolean;
    /**
     * Show user-suggestions.
     */
    showUsers?: boolean;
    /**
     * Show snippet-suggestions.
     */
    showSnippets?: boolean;
}
/**
 * @internal
 */
export type InternalSuggestOptions = Readonly<Required<ISuggestOptions>>;
export interface ISmartSelectOptions {
    selectLeadingAndTrailingWhitespace?: boolean;
    selectSubwords?: boolean;
}
/**
 * @internal
 */
export type SmartSelectOptions = Readonly<Required<ISmartSelectOptions>>;
/**
 * Describes how to indent wrapped lines.
 */
export declare const enum WrappingIndent {
    /**
     * No indentation => wrapped lines begin at column 1.
     */
    None = 0,
    /**
     * Same => wrapped lines get the same indentation as the parent.
     */
    Same = 1,
    /**
     * Indent => wrapped lines get +1 indentation toward the parent.
     */
    Indent = 2,
    /**
     * DeepIndent => wrapped lines get +2 indentation toward the parent.
     */
    DeepIndent = 3
}
export interface EditorWrappingInfo {
    readonly isDominatedByLongLines: boolean;
    readonly isWordWrapMinified: boolean;
    readonly isViewportWrapping: boolean;
    readonly wrappingColumn: number;
}
/**
 * Configuration options for editor drop into behavior
 */
export interface IDropIntoEditorOptions {
    /**
     * Enable dropping into editor.
     * Defaults to true.
     */
    enabled?: boolean;
    /**
     * Controls if a widget is shown after a drop.
     * Defaults to 'afterDrop'.
     */
    showDropSelector?: 'afterDrop' | 'never';
}
/**
 * @internal
 */
export type EditorDropIntoEditorOptions = Readonly<Required<IDropIntoEditorOptions>>;
/**
 * Configuration options for editor pasting as into behavior
 */
export interface IPasteAsOptions {
    /**
     * Enable paste as functionality in editors.
     * Defaults to true.
     */
    enabled?: boolean;
    /**
     * Controls if a widget is shown after a drop.
     * Defaults to 'afterPaste'.
     */
    showPasteSelector?: 'afterPaste' | 'never';
}
/**
 * @internal
 */
export type EditorPasteAsOptions = Readonly<Required<IPasteAsOptions>>;
/**
 * @internal
 */
export declare const EDITOR_FONT_DEFAULTS: {
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
};
/**
 * @internal
 */
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
    occurrencesHighlightDelay = 84,
    overviewRulerBorder = 85,
    overviewRulerLanes = 86,
    padding = 87,
    pasteAs = 88,
    parameterHints = 89,
    peekWidgetDefaultFocus = 90,
    placeholder = 91,
    definitionLinkOpensInPeek = 92,
    quickSuggestions = 93,
    quickSuggestionsDelay = 94,
    readOnly = 95,
    readOnlyMessage = 96,
    renameOnType = 97,
    renderControlCharacters = 98,
    renderFinalNewline = 99,
    renderLineHighlight = 100,
    renderLineHighlightOnlyWhenFocus = 101,
    renderValidationDecorations = 102,
    renderWhitespace = 103,
    revealHorizontalRightPadding = 104,
    roundedSelection = 105,
    rulers = 106,
    scrollbar = 107,
    scrollBeyondLastColumn = 108,
    scrollBeyondLastLine = 109,
    scrollPredominantAxis = 110,
    selectionClipboard = 111,
    selectionHighlight = 112,
    selectOnLineNumbers = 113,
    showFoldingControls = 114,
    showUnused = 115,
    snippetSuggestions = 116,
    smartSelect = 117,
    smoothScrolling = 118,
    stickyScroll = 119,
    stickyTabStops = 120,
    stopRenderingLineAfter = 121,
    suggest = 122,
    suggestFontSize = 123,
    suggestLineHeight = 124,
    suggestOnTriggerCharacters = 125,
    suggestSelection = 126,
    tabCompletion = 127,
    tabIndex = 128,
    unicodeHighlighting = 129,
    unusualLineTerminators = 130,
    useShadowDOM = 131,
    useTabStops = 132,
    wordBreak = 133,
    wordSegmenterLocales = 134,
    wordSeparators = 135,
    wordWrap = 136,
    wordWrapBreakAfterCharacters = 137,
    wordWrapBreakBeforeCharacters = 138,
    wordWrapColumn = 139,
    wordWrapOverride1 = 140,
    wordWrapOverride2 = 141,
    wrappingIndent = 142,
    wrappingStrategy = 143,
    showDeprecated = 144,
    inlayHints = 145,
    editorClassName = 146,
    pixelRatio = 147,
    tabFocusMode = 148,
    layoutInfo = 149,
    wrappingInfo = 150,
    defaultColorDecorators = 151,
    colorDecoratorsActivatedOn = 152,
    inlineCompletionsAccessibilityVerbose = 153
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
    occurrencesHighlightDelay: IEditorOption<EditorOption.occurrencesHighlightDelay, number>;
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
