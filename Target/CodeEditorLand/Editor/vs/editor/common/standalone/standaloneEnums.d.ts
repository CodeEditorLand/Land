export declare enum AccessibilitySupport {
    Unknown = 0,
    Disabled = 1,
    Enabled = 2
}
export declare enum CodeActionTriggerType {
    Invoke = 1,
    Auto = 2
}
export declare enum CompletionItemInsertTextRule {
    None = 0,
    KeepWhitespace = 1,
    InsertAsSnippet = 4
}
export declare enum CompletionItemKind {
    Method = 0,
    Function = 1,
    Constructor = 2,
    Field = 3,
    Variable = 4,
    Class = 5,
    Struct = 6,
    Interface = 7,
    Module = 8,
    Property = 9,
    Event = 10,
    Operator = 11,
    Unit = 12,
    Value = 13,
    Constant = 14,
    Enum = 15,
    EnumMember = 16,
    Keyword = 17,
    Text = 18,
    Color = 19,
    File = 20,
    Reference = 21,
    Customcolor = 22,
    Folder = 23,
    TypeParameter = 24,
    User = 25,
    Issue = 26,
    Snippet = 27
}
export declare enum CompletionItemTag {
    Deprecated = 1
}
export declare enum CompletionTriggerKind {
    Invoke = 0,
    TriggerCharacter = 1,
    TriggerForIncompleteCompletions = 2
}
export declare enum ContentWidgetPositionPreference {
    EXACT = 0,
    ABOVE = 1,
    BELOW = 2
}
export declare enum CursorChangeReason {
    NotSet = 0,
    ContentFlush = 1,
    RecoverFromMarkers = 2,
    Explicit = 3,
    Paste = 4,
    Undo = 5,
    Redo = 6
}
export declare enum DefaultEndOfLine {
    LF = 1,
    CRLF = 2
}
export declare enum DocumentHighlightKind {
    Text = 0,
    Read = 1,
    Write = 2
}
export declare enum EditorAutoIndentStrategy {
    None = 0,
    Keep = 1,
    Brackets = 2,
    Advanced = 3,
    Full = 4
}
export declare enum EditorOption {
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
export declare enum EndOfLinePreference {
    TextDefined = 0,
    LF = 1,
    CRLF = 2
}
export declare enum EndOfLineSequence {
    LF = 0,
    CRLF = 1
}
export declare enum GlyphMarginLane {
    Left = 1,
    Center = 2,
    Right = 3
}
export declare enum HoverVerbosityAction {
    Increase = 0,
    Decrease = 1
}
export declare enum IndentAction {
    None = 0,
    Indent = 1,
    IndentOutdent = 2,
    Outdent = 3
}
export declare enum InjectedTextCursorStops {
    Both = 0,
    Right = 1,
    Left = 2,
    None = 3
}
export declare enum InlayHintKind {
    Type = 1,
    Parameter = 2
}
export declare enum InlineCompletionTriggerKind {
    Automatic = 0,
    Explicit = 1
}
export declare enum InlineEditTriggerKind {
    Invoke = 0,
    Automatic = 1
}
export declare enum KeyCode {
    DependsOnKbLayout = -1,
    Unknown = 0,
    Backspace = 1,
    Tab = 2,
    Enter = 3,
    Shift = 4,
    Ctrl = 5,
    Alt = 6,
    PauseBreak = 7,
    CapsLock = 8,
    Escape = 9,
    Space = 10,
    PageUp = 11,
    PageDown = 12,
    End = 13,
    Home = 14,
    LeftArrow = 15,
    UpArrow = 16,
    RightArrow = 17,
    DownArrow = 18,
    Insert = 19,
    Delete = 20,
    Digit0 = 21,
    Digit1 = 22,
    Digit2 = 23,
    Digit3 = 24,
    Digit4 = 25,
    Digit5 = 26,
    Digit6 = 27,
    Digit7 = 28,
    Digit8 = 29,
    Digit9 = 30,
    KeyA = 31,
    KeyB = 32,
    KeyC = 33,
    KeyD = 34,
    KeyE = 35,
    KeyF = 36,
    KeyG = 37,
    KeyH = 38,
    KeyI = 39,
    KeyJ = 40,
    KeyK = 41,
    KeyL = 42,
    KeyM = 43,
    KeyN = 44,
    KeyO = 45,
    KeyP = 46,
    KeyQ = 47,
    KeyR = 48,
    KeyS = 49,
    KeyT = 50,
    KeyU = 51,
    KeyV = 52,
    KeyW = 53,
    KeyX = 54,
    KeyY = 55,
    KeyZ = 56,
    Meta = 57,
    ContextMenu = 58,
    F1 = 59,
    F2 = 60,
    F3 = 61,
    F4 = 62,
    F5 = 63,
    F6 = 64,
    F7 = 65,
    F8 = 66,
    F9 = 67,
    F10 = 68,
    F11 = 69,
    F12 = 70,
    F13 = 71,
    F14 = 72,
    F15 = 73,
    F16 = 74,
    F17 = 75,
    F18 = 76,
    F19 = 77,
    F20 = 78,
    F21 = 79,
    F22 = 80,
    F23 = 81,
    F24 = 82,
    NumLock = 83,
    ScrollLock = 84,
    Semicolon = 85,
    Equal = 86,
    Comma = 87,
    Minus = 88,
    Period = 89,
    Slash = 90,
    Backquote = 91,
    BracketLeft = 92,
    Backslash = 93,
    BracketRight = 94,
    Quote = 95,
    OEM_8 = 96,
    IntlBackslash = 97,
    Numpad0 = 98,
    Numpad1 = 99,
    Numpad2 = 100,
    Numpad3 = 101,
    Numpad4 = 102,
    Numpad5 = 103,
    Numpad6 = 104,
    Numpad7 = 105,
    Numpad8 = 106,
    Numpad9 = 107,
    NumpadMultiply = 108,
    NumpadAdd = 109,
    NUMPAD_SEPARATOR = 110,
    NumpadSubtract = 111,
    NumpadDecimal = 112,
    NumpadDivide = 113,
    KEY_IN_COMPOSITION = 114,
    ABNT_C1 = 115,
    ABNT_C2 = 116,
    AudioVolumeMute = 117,
    AudioVolumeUp = 118,
    AudioVolumeDown = 119,
    BrowserSearch = 120,
    BrowserHome = 121,
    BrowserBack = 122,
    BrowserForward = 123,
    MediaTrackNext = 124,
    MediaTrackPrevious = 125,
    MediaStop = 126,
    MediaPlayPause = 127,
    LaunchMediaPlayer = 128,
    LaunchMail = 129,
    LaunchApp2 = 130,
    Clear = 131,
    MAX_VALUE = 132
}
export declare enum MarkerSeverity {
    Hint = 1,
    Info = 2,
    Warning = 4,
    Error = 8
}
export declare enum MarkerTag {
    Unnecessary = 1,
    Deprecated = 2
}
export declare enum MinimapPosition {
    Inline = 1,
    Gutter = 2
}
export declare enum MinimapSectionHeaderStyle {
    Normal = 1,
    Underlined = 2
}
export declare enum MouseTargetType {
    UNKNOWN = 0,
    TEXTAREA = 1,
    GUTTER_GLYPH_MARGIN = 2,
    GUTTER_LINE_NUMBERS = 3,
    GUTTER_LINE_DECORATIONS = 4,
    GUTTER_VIEW_ZONE = 5,
    CONTENT_TEXT = 6,
    CONTENT_EMPTY = 7,
    CONTENT_VIEW_ZONE = 8,
    CONTENT_WIDGET = 9,
    OVERVIEW_RULER = 10,
    SCROLLBAR = 11,
    OVERLAY_WIDGET = 12,
    OUTSIDE_EDITOR = 13
}
export declare enum NewSymbolNameTag {
    AIGenerated = 1
}
export declare enum NewSymbolNameTriggerKind {
    Invoke = 0,
    Automatic = 1
}
export declare enum OverlayWidgetPositionPreference {
    TOP_RIGHT_CORNER = 0,
    BOTTOM_RIGHT_CORNER = 1,
    TOP_CENTER = 2
}
export declare enum OverviewRulerLane {
    Left = 1,
    Center = 2,
    Right = 4,
    Full = 7
}
export declare enum PartialAcceptTriggerKind {
    Word = 0,
    Line = 1,
    Suggest = 2
}
export declare enum PositionAffinity {
    Left = 0,
    Right = 1,
    None = 2,
    LeftOfInjectedText = 3,
    RightOfInjectedText = 4
}
export declare enum RenderLineNumbersType {
    Off = 0,
    On = 1,
    Relative = 2,
    Interval = 3,
    Custom = 4
}
export declare enum RenderMinimap {
    None = 0,
    Text = 1,
    Blocks = 2
}
export declare enum ScrollType {
    Smooth = 0,
    Immediate = 1
}
export declare enum ScrollbarVisibility {
    Auto = 1,
    Hidden = 2,
    Visible = 3
}
export declare enum SelectionDirection {
    LTR = 0,
    RTL = 1
}
export declare enum ShowLightbulbIconMode {
    Off = "off",
    OnCode = "onCode",
    On = "on"
}
export declare enum SignatureHelpTriggerKind {
    Invoke = 1,
    TriggerCharacter = 2,
    ContentChange = 3
}
export declare enum SymbolKind {
    File = 0,
    Module = 1,
    Namespace = 2,
    Package = 3,
    Class = 4,
    Method = 5,
    Property = 6,
    Field = 7,
    Constructor = 8,
    Enum = 9,
    Interface = 10,
    Function = 11,
    Variable = 12,
    Constant = 13,
    String = 14,
    Number = 15,
    Boolean = 16,
    Array = 17,
    Object = 18,
    Key = 19,
    Null = 20,
    EnumMember = 21,
    Struct = 22,
    Event = 23,
    Operator = 24,
    TypeParameter = 25
}
export declare enum SymbolTag {
    Deprecated = 1
}
export declare enum TextEditorCursorBlinkingStyle {
    Hidden = 0,
    Blink = 1,
    Smooth = 2,
    Phase = 3,
    Expand = 4,
    Solid = 5
}
export declare enum TextEditorCursorStyle {
    Line = 1,
    Block = 2,
    Underline = 3,
    LineThin = 4,
    BlockOutline = 5,
    UnderlineThin = 6
}
export declare enum TrackedRangeStickiness {
    AlwaysGrowsWhenTypingAtEdges = 0,
    NeverGrowsWhenTypingAtEdges = 1,
    GrowsOnlyWhenTypingBefore = 2,
    GrowsOnlyWhenTypingAfter = 3
}
export declare enum WrappingIndent {
    None = 0,
    Same = 1,
    Indent = 2,
    DeepIndent = 3
}
