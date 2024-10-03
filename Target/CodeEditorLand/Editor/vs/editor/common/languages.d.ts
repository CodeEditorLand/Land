import { VSBuffer } from '../../base/common/buffer.js';
import { CancellationToken } from '../../base/common/cancellation.js';
import { Color } from '../../base/common/color.js';
import { IReadonlyVSDataTransfer } from '../../base/common/dataTransfer.js';
import { Event } from '../../base/common/event.js';
import { HierarchicalKind } from '../../base/common/hierarchicalKind.js';
import { IMarkdownString } from '../../base/common/htmlContent.js';
import { IDisposable } from '../../base/common/lifecycle.js';
import { ThemeIcon } from '../../base/common/themables.js';
import { URI, UriComponents } from '../../base/common/uri.js';
import { ISingleEditOperation } from './core/editOperation.js';
import { IPosition, Position } from './core/position.js';
import { IRange, Range } from './core/range.js';
import { Selection } from './core/selection.js';
import { LanguageId } from './encodedTokenAttributes.js';
import { LanguageSelector } from './languageSelector.js';
import * as model from './model.js';
import { ContiguousMultilineTokens } from './tokens/contiguousMultilineTokens.js';
import { ExtensionIdentifier } from '../../platform/extensions/common/extensions.js';
import { IMarkerData } from '../../platform/markers/common/markers.js';
import { IModelTokensChangedEvent } from './textModelEvents.js';
import type { Parser } from '@vscode/tree-sitter-wasm';
export interface ILanguageIdCodec {
    encodeLanguageId(languageId: string): LanguageId;
    decodeLanguageId(languageId: LanguageId): string;
}
export declare class Token {
    readonly offset: number;
    readonly type: string;
    readonly language: string;
    _tokenBrand: void;
    constructor(offset: number, type: string, language: string);
    toString(): string;
}
export declare class TokenizationResult {
    readonly tokens: Token[];
    readonly endState: IState;
    _tokenizationResultBrand: void;
    constructor(tokens: Token[], endState: IState);
}
export declare class EncodedTokenizationResult {
    readonly tokens: Uint32Array;
    readonly endState: IState;
    _encodedTokenizationResultBrand: void;
    constructor(tokens: Uint32Array, endState: IState);
}
export interface ITreeSitterTokenizationSupport {
    tokenizeEncoded(lineNumber: number, textModel: model.ITextModel): Uint32Array | undefined;
    captureAtPosition(lineNumber: number, column: number, textModel: model.ITextModel): Parser.QueryCapture[];
    captureAtPositionTree(lineNumber: number, column: number, tree: Parser.Tree): Parser.QueryCapture[];
    onDidChangeTokens: Event<{
        textModel: model.ITextModel;
        changes: IModelTokensChangedEvent;
    }>;
}
export interface ITokenizationSupport {
    readonly backgroundTokenizerShouldOnlyVerifyTokens?: boolean;
    getInitialState(): IState;
    tokenize(line: string, hasEOL: boolean, state: IState): TokenizationResult;
    tokenizeEncoded(line: string, hasEOL: boolean, state: IState): EncodedTokenizationResult;
    createBackgroundTokenizer?(textModel: model.ITextModel, store: IBackgroundTokenizationStore): IBackgroundTokenizer | undefined;
}
export interface IBackgroundTokenizer extends IDisposable {
    requestTokens(startLineNumber: number, endLineNumberExclusive: number): void;
    reportMismatchingTokens?(lineNumber: number): void;
}
export interface IBackgroundTokenizationStore {
    setTokens(tokens: ContiguousMultilineTokens[]): void;
    setEndState(lineNumber: number, state: IState): void;
    backgroundTokenizationFinished(): void;
}
export interface IState {
    clone(): IState;
    equals(other: IState): boolean;
}
export type ProviderResult<T> = T | undefined | null | Thenable<T | undefined | null>;
export interface Hover {
    contents: IMarkdownString[];
    range?: IRange;
    canIncreaseVerbosity?: boolean;
    canDecreaseVerbosity?: boolean;
}
export interface HoverProvider<THover = Hover> {
    provideHover(model: model.ITextModel, position: Position, token: CancellationToken, context?: HoverContext<THover>): ProviderResult<THover>;
}
export interface HoverContext<THover = Hover> {
    verbosityRequest?: HoverVerbosityRequest<THover>;
}
export interface HoverVerbosityRequest<THover = Hover> {
    verbosityDelta: number;
    previousHover: THover;
}
export declare enum HoverVerbosityAction {
    Increase = 0,
    Decrease = 1
}
export interface EvaluatableExpression {
    range: IRange;
    expression?: string;
}
export interface EvaluatableExpressionProvider {
    provideEvaluatableExpression(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<EvaluatableExpression>;
}
export interface InlineValueContext {
    frameId: number;
    stoppedLocation: Range;
}
export interface InlineValueText {
    type: 'text';
    range: IRange;
    text: string;
}
export interface InlineValueVariableLookup {
    type: 'variable';
    range: IRange;
    variableName?: string;
    caseSensitiveLookup: boolean;
}
export interface InlineValueExpression {
    type: 'expression';
    range: IRange;
    expression?: string;
}
export type InlineValue = InlineValueText | InlineValueVariableLookup | InlineValueExpression;
export interface InlineValuesProvider {
    onDidChangeInlineValues?: Event<void> | undefined;
    provideInlineValues(model: model.ITextModel, viewPort: Range, context: InlineValueContext, token: CancellationToken): ProviderResult<InlineValue[]>;
}
export declare const enum CompletionItemKind {
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
export declare namespace CompletionItemKinds {
    function toIcon(kind: CompletionItemKind): ThemeIcon;
    function fromString(value: string): CompletionItemKind;
    function fromString(value: string, strict: true): CompletionItemKind | undefined;
}
export interface CompletionItemLabel {
    label: string;
    detail?: string;
    description?: string;
}
export declare const enum CompletionItemTag {
    Deprecated = 1
}
export declare const enum CompletionItemInsertTextRule {
    None = 0,
    KeepWhitespace = 1,
    InsertAsSnippet = 4
}
export interface CompletionItemRanges {
    insert: IRange;
    replace: IRange;
}
export interface CompletionItem {
    label: string | CompletionItemLabel;
    kind: CompletionItemKind;
    tags?: ReadonlyArray<CompletionItemTag>;
    detail?: string;
    documentation?: string | IMarkdownString;
    sortText?: string;
    filterText?: string;
    preselect?: boolean;
    insertText: string;
    insertTextRules?: CompletionItemInsertTextRule;
    range: IRange | CompletionItemRanges;
    commitCharacters?: string[];
    additionalTextEdits?: ISingleEditOperation[];
    command?: Command;
    extensionId?: ExtensionIdentifier;
    _id?: [number, number];
}
export interface CompletionList {
    suggestions: CompletionItem[];
    incomplete?: boolean;
    dispose?(): void;
    duration?: number;
}
export interface PartialAcceptInfo {
    kind: PartialAcceptTriggerKind;
}
export declare const enum PartialAcceptTriggerKind {
    Word = 0,
    Line = 1,
    Suggest = 2
}
export declare const enum CompletionTriggerKind {
    Invoke = 0,
    TriggerCharacter = 1,
    TriggerForIncompleteCompletions = 2
}
export interface CompletionContext {
    triggerKind: CompletionTriggerKind;
    triggerCharacter?: string;
}
export interface CompletionItemProvider {
    _debugDisplayName: string;
    triggerCharacters?: string[];
    provideCompletionItems(model: model.ITextModel, position: Position, context: CompletionContext, token: CancellationToken): ProviderResult<CompletionList>;
    resolveCompletionItem?(item: CompletionItem, token: CancellationToken): ProviderResult<CompletionItem>;
}
export declare enum InlineCompletionTriggerKind {
    Automatic = 0,
    Explicit = 1
}
export interface InlineCompletionContext {
    readonly triggerKind: InlineCompletionTriggerKind;
    readonly selectedSuggestionInfo: SelectedSuggestionInfo | undefined;
    readonly userPrompt?: string | undefined;
}
export declare class SelectedSuggestionInfo {
    readonly range: IRange;
    readonly text: string;
    readonly completionKind: CompletionItemKind;
    readonly isSnippetText: boolean;
    constructor(range: IRange, text: string, completionKind: CompletionItemKind, isSnippetText: boolean);
    equals(other: SelectedSuggestionInfo): boolean;
}
export interface InlineCompletion {
    readonly insertText: string | {
        snippet: string;
    };
    readonly filterText?: string;
    readonly additionalTextEdits?: ISingleEditOperation[];
    readonly range?: IRange;
    readonly command?: Command;
    readonly completeBracketPairs?: boolean;
    readonly isInlineEdit?: boolean;
}
export interface InlineCompletions<TItem extends InlineCompletion = InlineCompletion> {
    readonly items: readonly TItem[];
    readonly commands?: Command[];
    readonly suppressSuggestions?: boolean | undefined;
    readonly enableForwardStability?: boolean | undefined;
}
export type InlineCompletionProviderGroupId = string;
export interface InlineCompletionsProvider<T extends InlineCompletions = InlineCompletions> {
    provideInlineCompletions(model: model.ITextModel, position: Position, context: InlineCompletionContext, token: CancellationToken): ProviderResult<T>;
    provideInlineEditsForRange?(model: model.ITextModel, range: Range, context: InlineCompletionContext, token: CancellationToken): ProviderResult<T>;
    handleItemDidShow?(completions: T, item: T['items'][number], updatedInsertText: string): void;
    handlePartialAccept?(completions: T, item: T['items'][number], acceptedCharacters: number, info: PartialAcceptInfo): void;
    freeInlineCompletions(completions: T): void;
    groupId?: InlineCompletionProviderGroupId;
    yieldsToGroupIds?: InlineCompletionProviderGroupId[];
    toString?(): string;
}
export interface CodeAction {
    title: string;
    command?: Command;
    edit?: WorkspaceEdit;
    diagnostics?: IMarkerData[];
    kind?: string;
    isPreferred?: boolean;
    isAI?: boolean;
    disabled?: string;
    ranges?: IRange[];
}
export declare const enum CodeActionTriggerType {
    Invoke = 1,
    Auto = 2
}
export interface CodeActionContext {
    only?: string;
    trigger: CodeActionTriggerType;
}
export interface CodeActionList extends IDisposable {
    readonly actions: ReadonlyArray<CodeAction>;
}
export interface CodeActionProvider {
    displayName?: string;
    extensionId?: string;
    provideCodeActions(model: model.ITextModel, range: Range | Selection, context: CodeActionContext, token: CancellationToken): ProviderResult<CodeActionList>;
    resolveCodeAction?(codeAction: CodeAction, token: CancellationToken): ProviderResult<CodeAction>;
    readonly providedCodeActionKinds?: ReadonlyArray<string>;
    readonly documentation?: ReadonlyArray<{
        readonly kind: string;
        readonly command: Command;
    }>;
    _getAdditionalMenuItems?(context: CodeActionContext, actions: readonly CodeAction[]): Command[];
}
export interface DocumentPasteEdit {
    readonly title: string;
    readonly kind: HierarchicalKind;
    readonly handledMimeType?: string;
    readonly yieldTo?: readonly DropYieldTo[];
    insertText: string | {
        readonly snippet: string;
    };
    additionalEdit?: WorkspaceEdit;
}
export declare enum DocumentPasteTriggerKind {
    Automatic = 0,
    PasteAs = 1
}
export interface DocumentPasteContext {
    readonly only?: HierarchicalKind;
    readonly triggerKind: DocumentPasteTriggerKind;
}
export interface DocumentPasteEditsSession {
    edits: readonly DocumentPasteEdit[];
    dispose(): void;
}
export interface DocumentPasteEditProvider {
    readonly id?: string;
    readonly copyMimeTypes?: readonly string[];
    readonly pasteMimeTypes?: readonly string[];
    readonly providedPasteEditKinds?: readonly HierarchicalKind[];
    prepareDocumentPaste?(model: model.ITextModel, ranges: readonly IRange[], dataTransfer: IReadonlyVSDataTransfer, token: CancellationToken): Promise<undefined | IReadonlyVSDataTransfer>;
    provideDocumentPasteEdits?(model: model.ITextModel, ranges: readonly IRange[], dataTransfer: IReadonlyVSDataTransfer, context: DocumentPasteContext, token: CancellationToken): Promise<DocumentPasteEditsSession | undefined>;
    resolveDocumentPasteEdit?(edit: DocumentPasteEdit, token: CancellationToken): Promise<DocumentPasteEdit>;
}
export interface ParameterInformation {
    label: string | [number, number];
    documentation?: string | IMarkdownString;
}
export interface SignatureInformation {
    label: string;
    documentation?: string | IMarkdownString;
    parameters: ParameterInformation[];
    activeParameter?: number;
}
export interface SignatureHelp {
    signatures: SignatureInformation[];
    activeSignature: number;
    activeParameter: number;
}
export interface SignatureHelpResult extends IDisposable {
    value: SignatureHelp;
}
export declare enum SignatureHelpTriggerKind {
    Invoke = 1,
    TriggerCharacter = 2,
    ContentChange = 3
}
export interface SignatureHelpContext {
    readonly triggerKind: SignatureHelpTriggerKind;
    readonly triggerCharacter?: string;
    readonly isRetrigger: boolean;
    readonly activeSignatureHelp?: SignatureHelp;
}
export interface SignatureHelpProvider {
    readonly signatureHelpTriggerCharacters?: ReadonlyArray<string>;
    readonly signatureHelpRetriggerCharacters?: ReadonlyArray<string>;
    provideSignatureHelp(model: model.ITextModel, position: Position, token: CancellationToken, context: SignatureHelpContext): ProviderResult<SignatureHelpResult>;
}
export declare enum DocumentHighlightKind {
    Text = 0,
    Read = 1,
    Write = 2
}
export interface DocumentHighlight {
    range: IRange;
    kind?: DocumentHighlightKind;
}
export interface MultiDocumentHighlight {
    uri: URI;
    highlights: DocumentHighlight[];
}
export interface DocumentHighlightProvider {
    provideDocumentHighlights(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<DocumentHighlight[]>;
}
export interface MultiDocumentHighlightProvider {
    readonly selector: LanguageSelector;
    provideMultiDocumentHighlights(primaryModel: model.ITextModel, position: Position, otherModels: model.ITextModel[], token: CancellationToken): ProviderResult<Map<URI, DocumentHighlight[]>>;
}
export interface LinkedEditingRangeProvider {
    provideLinkedEditingRanges(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<LinkedEditingRanges>;
}
export interface LinkedEditingRanges {
    ranges: IRange[];
    wordPattern?: RegExp;
}
export interface ReferenceContext {
    includeDeclaration: boolean;
}
export interface ReferenceProvider {
    provideReferences(model: model.ITextModel, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]>;
}
export interface Location {
    uri: URI;
    range: IRange;
}
export interface LocationLink {
    originSelectionRange?: IRange;
    uri: URI;
    range: IRange;
    targetSelectionRange?: IRange;
}
export declare function isLocationLink(thing: any): thing is LocationLink;
export declare function isLocation(thing: any): thing is Location;
export type Definition = Location | Location[] | LocationLink[];
export interface DefinitionProvider {
    provideDefinition(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<Definition | LocationLink[]>;
}
export interface DeclarationProvider {
    provideDeclaration(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<Definition | LocationLink[]>;
}
export interface ImplementationProvider {
    provideImplementation(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<Definition | LocationLink[]>;
}
export interface TypeDefinitionProvider {
    provideTypeDefinition(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<Definition | LocationLink[]>;
}
export declare const enum SymbolKind {
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
export declare const symbolKindNames: {
    [symbol: number]: string;
};
export declare function getAriaLabelForSymbol(symbolName: string, kind: SymbolKind): string;
export declare const enum SymbolTag {
    Deprecated = 1
}
export declare namespace SymbolKinds {
    function toIcon(kind: SymbolKind): ThemeIcon;
}
export interface DocumentSymbol {
    name: string;
    detail: string;
    kind: SymbolKind;
    tags: ReadonlyArray<SymbolTag>;
    containerName?: string;
    range: IRange;
    selectionRange: IRange;
    children?: DocumentSymbol[];
}
export interface DocumentSymbolProvider {
    displayName?: string;
    provideDocumentSymbols(model: model.ITextModel, token: CancellationToken): ProviderResult<DocumentSymbol[]>;
}
export interface TextEdit {
    range: IRange;
    text: string;
    eol?: model.EndOfLineSequence;
}
export declare abstract class TextEdit {
    static asEditOperation(edit: TextEdit): ISingleEditOperation;
}
export interface FormattingOptions {
    tabSize: number;
    insertSpaces: boolean;
}
export interface DocumentFormattingEditProvider {
    readonly extensionId?: ExtensionIdentifier;
    readonly displayName?: string;
    provideDocumentFormattingEdits(model: model.ITextModel, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
}
export interface DocumentRangeFormattingEditProvider {
    readonly extensionId?: ExtensionIdentifier;
    readonly displayName?: string;
    provideDocumentRangeFormattingEdits(model: model.ITextModel, range: Range, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
    provideDocumentRangesFormattingEdits?(model: model.ITextModel, ranges: Range[], options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
}
export interface OnTypeFormattingEditProvider {
    readonly extensionId?: ExtensionIdentifier;
    autoFormatTriggerCharacters: string[];
    provideOnTypeFormattingEdits(model: model.ITextModel, position: Position, ch: string, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
}
export interface IInplaceReplaceSupportResult {
    value: string;
    range: IRange;
}
export interface ILink {
    range: IRange;
    url?: URI | string;
    tooltip?: string;
}
export interface ILinksList {
    links: ILink[];
    dispose?(): void;
}
export interface LinkProvider {
    provideLinks(model: model.ITextModel, token: CancellationToken): ProviderResult<ILinksList>;
    resolveLink?: (link: ILink, token: CancellationToken) => ProviderResult<ILink>;
}
export interface IColor {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;
}
export interface IColorPresentation {
    label: string;
    textEdit?: TextEdit;
    additionalTextEdits?: TextEdit[];
}
export interface IColorInformation {
    range: IRange;
    color: IColor;
}
export interface DocumentColorProvider {
    provideDocumentColors(model: model.ITextModel, token: CancellationToken): ProviderResult<IColorInformation[]>;
    provideColorPresentations(model: model.ITextModel, colorInfo: IColorInformation, token: CancellationToken): ProviderResult<IColorPresentation[]>;
}
export interface SelectionRange {
    range: IRange;
}
export interface SelectionRangeProvider {
    provideSelectionRanges(model: model.ITextModel, positions: Position[], token: CancellationToken): ProviderResult<SelectionRange[][]>;
}
export interface FoldingContext {
}
export interface FoldingRangeProvider {
    readonly id?: string;
    onDidChange?: Event<this>;
    provideFoldingRanges(model: model.ITextModel, context: FoldingContext, token: CancellationToken): ProviderResult<FoldingRange[]>;
}
export interface FoldingRange {
    start: number;
    end: number;
    kind?: FoldingRangeKind;
}
export declare class FoldingRangeKind {
    value: string;
    static readonly Comment: FoldingRangeKind;
    static readonly Imports: FoldingRangeKind;
    static readonly Region: FoldingRangeKind;
    static fromValue(value: string): FoldingRangeKind;
    constructor(value: string);
}
export interface WorkspaceEditMetadata {
    needsConfirmation: boolean;
    label: string;
    description?: string;
    iconPath?: ThemeIcon | URI | {
        light: URI;
        dark: URI;
    };
}
export interface WorkspaceFileEditOptions {
    overwrite?: boolean;
    ignoreIfNotExists?: boolean;
    ignoreIfExists?: boolean;
    recursive?: boolean;
    copy?: boolean;
    folder?: boolean;
    skipTrashBin?: boolean;
    maxSize?: number;
    contents?: Promise<VSBuffer>;
}
export interface IWorkspaceFileEdit {
    oldResource?: URI;
    newResource?: URI;
    options?: WorkspaceFileEditOptions;
    metadata?: WorkspaceEditMetadata;
}
export interface IWorkspaceTextEdit {
    resource: URI;
    textEdit: TextEdit & {
        insertAsSnippet?: boolean;
    };
    versionId: number | undefined;
    metadata?: WorkspaceEditMetadata;
}
export interface WorkspaceEdit {
    edits: Array<IWorkspaceTextEdit | IWorkspaceFileEdit>;
}
export interface Rejection {
    rejectReason?: string;
}
export interface RenameLocation {
    range: IRange;
    text: string;
}
export interface RenameProvider {
    provideRenameEdits(model: model.ITextModel, position: Position, newName: string, token: CancellationToken): ProviderResult<WorkspaceEdit & Rejection>;
    resolveRenameLocation?(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<RenameLocation & Rejection>;
}
export declare enum NewSymbolNameTag {
    AIGenerated = 1
}
export declare enum NewSymbolNameTriggerKind {
    Invoke = 0,
    Automatic = 1
}
export interface NewSymbolName {
    readonly newSymbolName: string;
    readonly tags?: readonly NewSymbolNameTag[];
}
export interface NewSymbolNamesProvider {
    supportsAutomaticNewSymbolNamesTriggerKind?: Promise<boolean | undefined>;
    provideNewSymbolNames(model: model.ITextModel, range: IRange, triggerKind: NewSymbolNameTriggerKind, token: CancellationToken): ProviderResult<NewSymbolName[]>;
}
export interface Command {
    id: string;
    title: string;
    tooltip?: string;
    arguments?: any[];
}
export declare namespace Command {
    function is(obj: any): obj is Command;
}
export interface CommentThreadTemplate {
    controllerHandle: number;
    label: string;
    acceptInputCommand?: Command;
    additionalCommands?: Command[];
    deleteCommand?: Command;
}
export interface CommentInfo<T = IRange> {
    extensionId?: string;
    threads: CommentThread<T>[];
    pendingCommentThreads?: PendingCommentThread[];
    commentingRanges: CommentingRanges;
}
export interface CommentingRangeResourceHint {
    schemes: readonly string[];
}
export declare enum CommentThreadCollapsibleState {
    Collapsed = 0,
    Expanded = 1
}
export declare enum CommentThreadState {
    Unresolved = 0,
    Resolved = 1
}
export declare enum CommentThreadApplicability {
    Current = 0,
    Outdated = 1
}
export interface CommentWidget {
    commentThread: CommentThread;
    comment?: Comment;
    input: string;
    onDidChangeInput: Event<string>;
}
export interface CommentInput {
    value: string;
    uri: URI;
}
export interface CommentThreadRevealOptions {
    preserveFocus: boolean;
    focusReply: boolean;
}
export interface CommentThread<T = IRange> {
    isDocumentCommentThread(): this is CommentThread<IRange>;
    commentThreadHandle: number;
    controllerHandle: number;
    extensionId?: string;
    threadId: string;
    resource: string | null;
    range: T | undefined;
    label: string | undefined;
    contextValue: string | undefined;
    comments: ReadonlyArray<Comment> | undefined;
    onDidChangeComments: Event<readonly Comment[] | undefined>;
    collapsibleState?: CommentThreadCollapsibleState;
    initialCollapsibleState?: CommentThreadCollapsibleState;
    onDidChangeInitialCollapsibleState: Event<CommentThreadCollapsibleState | undefined>;
    state?: CommentThreadState;
    applicability?: CommentThreadApplicability;
    canReply: boolean;
    input?: CommentInput;
    onDidChangeInput: Event<CommentInput | undefined>;
    onDidChangeLabel: Event<string | undefined>;
    onDidChangeCollapsibleState: Event<CommentThreadCollapsibleState | undefined>;
    onDidChangeState: Event<CommentThreadState | undefined>;
    onDidChangeCanReply: Event<boolean>;
    isDisposed: boolean;
    isTemplate: boolean;
}
export interface AddedCommentThread<T = IRange> extends CommentThread<T> {
    editorId?: string;
}
export interface CommentingRanges {
    readonly resource: URI;
    ranges: IRange[];
    fileComments: boolean;
}
export interface CommentAuthorInformation {
    name: string;
    iconPath?: UriComponents;
}
export interface CommentReaction {
    readonly label?: string;
    readonly iconPath?: UriComponents;
    readonly count?: number;
    readonly hasReacted?: boolean;
    readonly canEdit?: boolean;
    readonly reactors?: readonly string[];
}
export interface CommentOptions {
    prompt?: string;
    placeHolder?: string;
}
export declare enum CommentMode {
    Editing = 0,
    Preview = 1
}
export declare enum CommentState {
    Published = 0,
    Draft = 1
}
export interface Comment {
    readonly uniqueIdInThread: number;
    readonly body: string | IMarkdownString;
    readonly userName: string;
    readonly userIconPath?: UriComponents;
    readonly contextValue?: string;
    readonly commentReactions?: CommentReaction[];
    readonly label?: string;
    readonly mode?: CommentMode;
    readonly timestamp?: string;
}
export interface PendingCommentThread {
    body: string;
    range: IRange | undefined;
    uri: URI;
    uniqueOwner: string;
    isReply: boolean;
}
export interface CommentThreadChangedEvent<T> {
    readonly pending: PendingCommentThread[];
    readonly added: AddedCommentThread<T>[];
    readonly removed: CommentThread<T>[];
    readonly changed: CommentThread<T>[];
}
export interface CodeLens {
    range: IRange;
    id?: string;
    command?: Command;
}
export interface CodeLensList {
    lenses: CodeLens[];
    dispose(): void;
}
export interface CodeLensProvider {
    onDidChange?: Event<this>;
    provideCodeLenses(model: model.ITextModel, token: CancellationToken): ProviderResult<CodeLensList>;
    resolveCodeLens?(model: model.ITextModel, codeLens: CodeLens, token: CancellationToken): ProviderResult<CodeLens>;
}
export declare enum InlayHintKind {
    Type = 1,
    Parameter = 2
}
export interface InlayHintLabelPart {
    label: string;
    tooltip?: string | IMarkdownString;
    command?: Command;
    location?: Location;
}
export interface InlayHint {
    label: string | InlayHintLabelPart[];
    tooltip?: string | IMarkdownString;
    textEdits?: TextEdit[];
    position: IPosition;
    kind?: InlayHintKind;
    paddingLeft?: boolean;
    paddingRight?: boolean;
}
export interface InlayHintList {
    hints: InlayHint[];
    dispose(): void;
}
export interface InlayHintsProvider {
    displayName?: string;
    onDidChangeInlayHints?: Event<void>;
    provideInlayHints(model: model.ITextModel, range: Range, token: CancellationToken): ProviderResult<InlayHintList>;
    resolveInlayHint?(hint: InlayHint, token: CancellationToken): ProviderResult<InlayHint>;
}
export interface SemanticTokensLegend {
    readonly tokenTypes: string[];
    readonly tokenModifiers: string[];
}
export interface SemanticTokens {
    readonly resultId?: string;
    readonly data: Uint32Array;
}
export interface SemanticTokensEdit {
    readonly start: number;
    readonly deleteCount: number;
    readonly data?: Uint32Array;
}
export interface SemanticTokensEdits {
    readonly resultId?: string;
    readonly edits: SemanticTokensEdit[];
}
export interface DocumentSemanticTokensProvider {
    onDidChange?: Event<void>;
    getLegend(): SemanticTokensLegend;
    provideDocumentSemanticTokens(model: model.ITextModel, lastResultId: string | null, token: CancellationToken): ProviderResult<SemanticTokens | SemanticTokensEdits>;
    releaseDocumentSemanticTokens(resultId: string | undefined): void;
}
export interface DocumentRangeSemanticTokensProvider {
    getLegend(): SemanticTokensLegend;
    provideDocumentRangeSemanticTokens(model: model.ITextModel, range: Range, token: CancellationToken): ProviderResult<SemanticTokens>;
}
export interface ITokenizationSupportChangedEvent {
    changedLanguages: string[];
    changedColorMap: boolean;
}
export interface ILazyTokenizationSupport<TSupport> {
    get tokenizationSupport(): Promise<TSupport | null>;
}
export declare class LazyTokenizationSupport<TSupport = ITokenizationSupport> implements IDisposable, ILazyTokenizationSupport<TSupport> {
    private readonly createSupport;
    private _tokenizationSupport;
    constructor(createSupport: () => Promise<TSupport & IDisposable | null>);
    dispose(): void;
    get tokenizationSupport(): Promise<TSupport | null>;
}
export interface ITokenizationRegistry<TSupport> {
    onDidChange: Event<ITokenizationSupportChangedEvent>;
    handleChange(languageIds: string[]): void;
    register(languageId: string, support: TSupport): IDisposable;
    registerFactory(languageId: string, factory: ILazyTokenizationSupport<TSupport>): IDisposable;
    getOrCreate(languageId: string): Promise<TSupport | null>;
    get(languageId: string): TSupport | null;
    isResolved(languageId: string): boolean;
    setColorMap(colorMap: Color[]): void;
    getColorMap(): Color[] | null;
    getDefaultBackground(): Color | null;
}
export declare const TokenizationRegistry: ITokenizationRegistry<ITokenizationSupport>;
export declare const TreeSitterTokenizationRegistry: ITokenizationRegistry<ITreeSitterTokenizationSupport>;
export declare enum ExternalUriOpenerPriority {
    None = 0,
    Option = 1,
    Default = 2,
    Preferred = 3
}
export type DropYieldTo = {
    readonly kind: HierarchicalKind;
} | {
    readonly mimeType: string;
};
export interface DocumentDropEdit {
    readonly title: string;
    readonly kind: HierarchicalKind | undefined;
    readonly handledMimeType?: string;
    readonly yieldTo?: readonly DropYieldTo[];
    insertText: string | {
        readonly snippet: string;
    };
    additionalEdit?: WorkspaceEdit;
}
export interface DocumentDropEditsSession {
    edits: readonly DocumentDropEdit[];
    dispose(): void;
}
export interface DocumentDropEditProvider {
    readonly id?: string;
    readonly dropMimeTypes?: readonly string[];
    provideDocumentDropEdits(model: model.ITextModel, position: IPosition, dataTransfer: IReadonlyVSDataTransfer, token: CancellationToken): ProviderResult<DocumentDropEditsSession>;
    resolveDocumentDropEdit?(edit: DocumentDropEdit, token: CancellationToken): Promise<DocumentDropEdit>;
}
export interface DocumentContextItem {
    readonly uri: URI;
    readonly version: number;
    readonly ranges: IRange[];
}
export interface MappedEditsContext {
    readonly documents: DocumentContextItem[][];
    readonly conversation?: (ConversationRequest | ConversationResponse)[];
}
export interface ConversationRequest {
    readonly type: 'request';
    readonly message: string;
}
export interface ConversationResponse {
    readonly type: 'response';
    readonly message: string;
    readonly references?: DocumentContextItem[];
}
export interface MappedEditsProvider {
    readonly displayName: string;
    provideMappedEdits(document: model.ITextModel, codeBlocks: string[], context: MappedEditsContext, token: CancellationToken): Promise<WorkspaceEdit | null>;
}
export interface IInlineEdit {
    text: string;
    range: IRange;
    accepted?: Command;
    rejected?: Command;
}
export interface IInlineEditContext {
    triggerKind: InlineEditTriggerKind;
}
export declare enum InlineEditTriggerKind {
    Invoke = 0,
    Automatic = 1
}
export interface InlineEditProvider<T extends IInlineEdit = IInlineEdit> {
    provideInlineEdit(model: model.ITextModel, context: IInlineEditContext, token: CancellationToken): ProviderResult<T>;
    freeInlineEdit(edit: T): void;
}
