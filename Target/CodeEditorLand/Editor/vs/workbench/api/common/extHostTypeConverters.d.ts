import type * as vscode from 'vscode';
import { IDataTransferItem } from '../../../base/common/dataTransfer.js';
import * as htmlContent from '../../../base/common/htmlContent.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
import { RenderLineNumbersType } from '../../../editor/common/config/editorOptions.js';
import { IPosition } from '../../../editor/common/core/position.js';
import * as editorRange from '../../../editor/common/core/range.js';
import { ISelection } from '../../../editor/common/core/selection.js';
import { IContentDecorationRenderOptions, IDecorationOptions, IDecorationRenderOptions, IThemeDecorationRenderOptions } from '../../../editor/common/editorCommon.js';
import * as encodedTokenAttributes from '../../../editor/common/encodedTokenAttributes.js';
import * as languageSelector from '../../../editor/common/languageSelector.js';
import * as languages from '../../../editor/common/languages.js';
import { EndOfLineSequence, TrackedRangeStickiness } from '../../../editor/common/model.js';
import { ITextEditorOptions } from '../../../platform/editor/common/editor.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IMarkerData, IRelatedInformation, MarkerSeverity, MarkerTag } from '../../../platform/markers/common/markers.js';
import { ProgressLocation as MainProgressLocation } from '../../../platform/progress/common/progress.js';
import { SaveReason } from '../../common/editor.js';
import { IViewBadge } from '../../common/views.js';
import { ChatAgentLocation, IChatAgentRequest, IChatAgentResult } from '../../contrib/chat/common/chatAgents.js';
import { IChatRequestVariableEntry } from '../../contrib/chat/common/chatModel.js';
import { IChatAgentDetection, IChatAgentMarkdownContentWithVulnerability, IChatCodeCitation, IChatCommandButton, IChatConfirmation, IChatContentInlineReference, IChatContentReference, IChatFollowup, IChatMarkdownContent, IChatMoveMessage, IChatProgressMessage, IChatResponseCodeblockUriPart, IChatTaskDto, IChatTaskResult, IChatTextEdit, IChatTreeData, IChatUserActionEvent, IChatWarningMessage } from '../../contrib/chat/common/chatService.js';
import { IToolData } from '../../contrib/chat/common/languageModelToolsService.js';
import * as chatProvider from '../../contrib/chat/common/languageModels.js';
import { IDebugVisualizationTreeItem } from '../../contrib/debug/common/debug.js';
import * as notebooks from '../../contrib/notebook/common/notebookCommon.js';
import { ICellRange } from '../../contrib/notebook/common/notebookRange.js';
import * as search from '../../contrib/search/common/search.js';
import { CoverageDetails, IFileCoverage, ISerializedTestResults, ITestErrorMessage, ITestItem, ITestTag } from '../../contrib/testing/common/testTypes.js';
import { EditorGroupColumn } from '../../services/editor/common/editorGroupColumn.js';
import { Dto } from '../../services/extensions/common/proxyIdentifier.js';
import * as extHostProtocol from './extHost.protocol.js';
import { CommandsConverter } from './extHostCommands.js';
import * as types from './extHostTypes.js';
export declare namespace Command {
    interface ICommandsConverter {
        fromInternal(command: extHostProtocol.ICommandDto): vscode.Command | undefined;
        toInternal(command: vscode.Command | undefined, disposables: DisposableStore): extHostProtocol.ICommandDto | undefined;
    }
}
export interface PositionLike {
    line: number;
    character: number;
}
export interface RangeLike {
    start: PositionLike;
    end: PositionLike;
}
export interface SelectionLike extends RangeLike {
    anchor: PositionLike;
    active: PositionLike;
}
export declare namespace Selection {
    function to(selection: ISelection): types.Selection;
    function from(selection: SelectionLike): ISelection;
}
export declare namespace Range {
    function from(range: undefined): undefined;
    function from(range: RangeLike): editorRange.IRange;
    function from(range: RangeLike | undefined): editorRange.IRange | undefined;
    function to(range: undefined): types.Range;
    function to(range: editorRange.IRange): types.Range;
    function to(range: editorRange.IRange | undefined): types.Range | undefined;
}
export declare namespace Location {
    function from(location: vscode.Location): Dto<languages.Location>;
    function to(location: Dto<languages.Location>): vscode.Location;
}
export declare namespace TokenType {
    function to(type: encodedTokenAttributes.StandardTokenType): types.StandardTokenType;
}
export declare namespace Position {
    function to(position: IPosition): types.Position;
    function from(position: types.Position | vscode.Position): IPosition;
}
export declare namespace DocumentSelector {
    function from(value: vscode.DocumentSelector, uriTransformer?: IURITransformer, extension?: IExtensionDescription): extHostProtocol.IDocumentFilterDto[];
}
export declare namespace DiagnosticTag {
    function from(value: vscode.DiagnosticTag): MarkerTag | undefined;
    function to(value: MarkerTag): vscode.DiagnosticTag | undefined;
}
export declare namespace Diagnostic {
    function from(value: vscode.Diagnostic): IMarkerData;
    function to(value: IMarkerData): vscode.Diagnostic;
}
export declare namespace DiagnosticRelatedInformation {
    function from(value: vscode.DiagnosticRelatedInformation): IRelatedInformation;
    function to(value: IRelatedInformation): types.DiagnosticRelatedInformation;
}
export declare namespace DiagnosticSeverity {
    function from(value: number): MarkerSeverity;
    function to(value: MarkerSeverity): types.DiagnosticSeverity;
}
export declare namespace ViewColumn {
    function from(column?: vscode.ViewColumn): EditorGroupColumn;
    function to(position: EditorGroupColumn): vscode.ViewColumn;
}
export declare function isDecorationOptionsArr(something: vscode.Range[] | vscode.DecorationOptions[]): something is vscode.DecorationOptions[];
export declare namespace MarkdownString {
    function fromMany(markup: (vscode.MarkdownString | vscode.MarkedString)[]): htmlContent.IMarkdownString[];
    function from(markup: vscode.MarkdownString | vscode.MarkedString): htmlContent.IMarkdownString;
    function to(value: htmlContent.IMarkdownString): vscode.MarkdownString;
    function fromStrict(value: string | vscode.MarkdownString | undefined | null): undefined | string | htmlContent.IMarkdownString;
}
export declare function fromRangeOrRangeWithMessage(ranges: vscode.Range[] | vscode.DecorationOptions[]): IDecorationOptions[];
export declare function pathOrURIToURI(value: string | URI): URI;
export declare namespace ThemableDecorationAttachmentRenderOptions {
    function from(options: vscode.ThemableDecorationAttachmentRenderOptions): IContentDecorationRenderOptions;
}
export declare namespace ThemableDecorationRenderOptions {
    function from(options: vscode.ThemableDecorationRenderOptions): IThemeDecorationRenderOptions;
}
export declare namespace DecorationRangeBehavior {
    function from(value: types.DecorationRangeBehavior): TrackedRangeStickiness;
}
export declare namespace DecorationRenderOptions {
    function from(options: vscode.DecorationRenderOptions): IDecorationRenderOptions;
}
export declare namespace TextEdit {
    function from(edit: vscode.TextEdit): languages.TextEdit;
    function to(edit: languages.TextEdit): types.TextEdit;
}
export declare namespace WorkspaceEdit {
    interface IVersionInformationProvider {
        getTextDocumentVersion(uri: URI): number | undefined;
        getNotebookDocumentVersion(uri: URI): number | undefined;
    }
    function from(value: vscode.WorkspaceEdit, versionInfo?: IVersionInformationProvider): extHostProtocol.IWorkspaceEditDto;
    function to(value: extHostProtocol.IWorkspaceEditDto): types.WorkspaceEdit;
}
export declare namespace SymbolKind {
    function from(kind: vscode.SymbolKind): languages.SymbolKind;
    function to(kind: languages.SymbolKind): vscode.SymbolKind;
}
export declare namespace SymbolTag {
    function from(kind: types.SymbolTag): languages.SymbolTag;
    function to(kind: languages.SymbolTag): types.SymbolTag;
}
export declare namespace WorkspaceSymbol {
    function from(info: vscode.SymbolInformation): search.IWorkspaceSymbol;
    function to(info: search.IWorkspaceSymbol): types.SymbolInformation;
}
export declare namespace DocumentSymbol {
    function from(info: vscode.DocumentSymbol): languages.DocumentSymbol;
    function to(info: languages.DocumentSymbol): vscode.DocumentSymbol;
}
export declare namespace CallHierarchyItem {
    function to(item: extHostProtocol.ICallHierarchyItemDto): types.CallHierarchyItem;
    function from(item: vscode.CallHierarchyItem, sessionId?: string, itemId?: string): extHostProtocol.ICallHierarchyItemDto;
}
export declare namespace CallHierarchyIncomingCall {
    function to(item: extHostProtocol.IIncomingCallDto): types.CallHierarchyIncomingCall;
}
export declare namespace CallHierarchyOutgoingCall {
    function to(item: extHostProtocol.IOutgoingCallDto): types.CallHierarchyOutgoingCall;
}
export declare namespace location {
    function from(value: vscode.Location): languages.Location;
    function to(value: extHostProtocol.ILocationDto): types.Location;
}
export declare namespace DefinitionLink {
    function from(value: vscode.Location | vscode.DefinitionLink): languages.LocationLink;
    function to(value: extHostProtocol.ILocationLinkDto): vscode.LocationLink;
}
export declare namespace Hover {
    function from(hover: vscode.VerboseHover): languages.Hover;
    function to(info: languages.Hover): types.VerboseHover;
}
export declare namespace EvaluatableExpression {
    function from(expression: vscode.EvaluatableExpression): languages.EvaluatableExpression;
    function to(info: languages.EvaluatableExpression): types.EvaluatableExpression;
}
export declare namespace InlineValue {
    function from(inlineValue: vscode.InlineValue): languages.InlineValue;
    function to(inlineValue: languages.InlineValue): vscode.InlineValue;
}
export declare namespace InlineValueContext {
    function from(inlineValueContext: vscode.InlineValueContext): extHostProtocol.IInlineValueContextDto;
    function to(inlineValueContext: extHostProtocol.IInlineValueContextDto): types.InlineValueContext;
}
export declare namespace DocumentHighlight {
    function from(documentHighlight: vscode.DocumentHighlight): languages.DocumentHighlight;
    function to(occurrence: languages.DocumentHighlight): types.DocumentHighlight;
}
export declare namespace MultiDocumentHighlight {
    function from(multiDocumentHighlight: vscode.MultiDocumentHighlight): languages.MultiDocumentHighlight;
    function to(multiDocumentHighlight: languages.MultiDocumentHighlight): types.MultiDocumentHighlight;
}
export declare namespace CompletionTriggerKind {
    function to(kind: languages.CompletionTriggerKind): types.CompletionTriggerKind;
}
export declare namespace CompletionContext {
    function to(context: languages.CompletionContext): types.CompletionContext;
}
export declare namespace CompletionItemTag {
    function from(kind: types.CompletionItemTag): languages.CompletionItemTag;
    function to(kind: languages.CompletionItemTag): types.CompletionItemTag;
}
export declare namespace CompletionItemKind {
    function from(kind: types.CompletionItemKind): languages.CompletionItemKind;
    function to(kind: languages.CompletionItemKind): types.CompletionItemKind;
}
export declare namespace CompletionItem {
    function to(suggestion: languages.CompletionItem, converter?: Command.ICommandsConverter): types.CompletionItem;
}
export declare namespace ParameterInformation {
    function from(info: types.ParameterInformation): languages.ParameterInformation;
    function to(info: languages.ParameterInformation): types.ParameterInformation;
}
export declare namespace SignatureInformation {
    function from(info: types.SignatureInformation): languages.SignatureInformation;
    function to(info: languages.SignatureInformation): types.SignatureInformation;
}
export declare namespace SignatureHelp {
    function from(help: types.SignatureHelp): languages.SignatureHelp;
    function to(help: languages.SignatureHelp): types.SignatureHelp;
}
export declare namespace InlayHint {
    function to(converter: Command.ICommandsConverter, hint: languages.InlayHint): vscode.InlayHint;
}
export declare namespace InlayHintLabelPart {
    function to(converter: Command.ICommandsConverter, part: languages.InlayHintLabelPart): types.InlayHintLabelPart;
}
export declare namespace InlayHintKind {
    function from(kind: vscode.InlayHintKind): languages.InlayHintKind;
    function to(kind: languages.InlayHintKind): vscode.InlayHintKind;
}
export declare namespace DocumentLink {
    function from(link: vscode.DocumentLink): languages.ILink;
    function to(link: languages.ILink): vscode.DocumentLink;
}
export declare namespace ColorPresentation {
    function to(colorPresentation: languages.IColorPresentation): types.ColorPresentation;
    function from(colorPresentation: vscode.ColorPresentation): languages.IColorPresentation;
}
export declare namespace Color {
    function to(c: [number, number, number, number]): types.Color;
    function from(color: types.Color): [number, number, number, number];
}
export declare namespace SelectionRange {
    function from(obj: vscode.SelectionRange): languages.SelectionRange;
    function to(obj: languages.SelectionRange): vscode.SelectionRange;
}
export declare namespace TextDocumentSaveReason {
    function to(reason: SaveReason): vscode.TextDocumentSaveReason;
}
export declare namespace TextEditorLineNumbersStyle {
    function from(style: vscode.TextEditorLineNumbersStyle): RenderLineNumbersType;
    function to(style: RenderLineNumbersType): vscode.TextEditorLineNumbersStyle;
}
export declare namespace EndOfLine {
    function from(eol: vscode.EndOfLine): EndOfLineSequence | undefined;
    function to(eol: EndOfLineSequence): vscode.EndOfLine | undefined;
}
export declare namespace ProgressLocation {
    function from(loc: vscode.ProgressLocation | {
        viewId: string;
    }): MainProgressLocation | string;
}
export declare namespace FoldingRange {
    function from(r: vscode.FoldingRange): languages.FoldingRange;
    function to(r: languages.FoldingRange): vscode.FoldingRange;
}
export declare namespace FoldingRangeKind {
    function from(kind: vscode.FoldingRangeKind | undefined): languages.FoldingRangeKind | undefined;
    function to(kind: languages.FoldingRangeKind | undefined): vscode.FoldingRangeKind | undefined;
}
export interface TextEditorOpenOptions extends vscode.TextDocumentShowOptions {
    background?: boolean;
    override?: boolean;
}
export declare namespace TextEditorOpenOptions {
    function from(options?: TextEditorOpenOptions): ITextEditorOptions | undefined;
}
export declare namespace GlobPattern {
    function from(pattern: vscode.GlobPattern): string | extHostProtocol.IRelativePatternDto;
    function from(pattern: undefined): undefined;
    function from(pattern: null): null;
    function from(pattern: vscode.GlobPattern | undefined | null): string | extHostProtocol.IRelativePatternDto | undefined | null;
    function to(pattern: string | extHostProtocol.IRelativePatternDto): vscode.GlobPattern;
}
export declare namespace LanguageSelector {
    function from(selector: undefined): undefined;
    function from(selector: vscode.DocumentSelector): languageSelector.LanguageSelector;
    function from(selector: vscode.DocumentSelector | undefined): languageSelector.LanguageSelector | undefined;
}
export declare namespace MappedEditsContext {
    function is(v: unknown): v is vscode.MappedEditsContext;
    function from(extContext: vscode.MappedEditsContext): Dto<languages.MappedEditsContext>;
}
export declare namespace DocumentContextItem {
    function is(item: unknown): item is vscode.DocumentContextItem;
    function from(item: vscode.DocumentContextItem): Dto<languages.DocumentContextItem>;
    function to(item: Dto<languages.DocumentContextItem>): vscode.DocumentContextItem;
}
export declare namespace NotebookRange {
    function from(range: vscode.NotebookRange): ICellRange;
    function to(range: ICellRange): types.NotebookRange;
}
export declare namespace NotebookCellExecutionSummary {
    function to(data: notebooks.NotebookCellInternalMetadata): vscode.NotebookCellExecutionSummary;
    function from(data: vscode.NotebookCellExecutionSummary): Partial<notebooks.NotebookCellInternalMetadata>;
}
export declare namespace NotebookCellExecutionState {
    function to(state: notebooks.NotebookCellExecutionState): vscode.NotebookCellExecutionState | undefined;
}
export declare namespace NotebookCellKind {
    function from(data: vscode.NotebookCellKind): notebooks.CellKind;
    function to(data: notebooks.CellKind): vscode.NotebookCellKind;
}
export declare namespace NotebookData {
    function from(data: vscode.NotebookData): extHostProtocol.NotebookDataDto;
    function to(data: extHostProtocol.NotebookDataDto): vscode.NotebookData;
}
export declare namespace NotebookCellData {
    function from(data: vscode.NotebookCellData): extHostProtocol.NotebookCellDataDto;
    function to(data: extHostProtocol.NotebookCellDataDto): vscode.NotebookCellData;
}
export declare namespace NotebookCellOutputItem {
    function from(item: types.NotebookCellOutputItem): extHostProtocol.NotebookOutputItemDto;
    function to(item: extHostProtocol.NotebookOutputItemDto): types.NotebookCellOutputItem;
}
export declare namespace NotebookCellOutput {
    function from(output: vscode.NotebookCellOutput): extHostProtocol.NotebookOutputDto;
    function to(output: extHostProtocol.NotebookOutputDto): vscode.NotebookCellOutput;
}
export declare namespace NotebookExclusiveDocumentPattern {
    function from(pattern: {
        include: vscode.GlobPattern | undefined;
        exclude: vscode.GlobPattern | undefined;
    }): {
        include: string | extHostProtocol.IRelativePatternDto | undefined;
        exclude: string | extHostProtocol.IRelativePatternDto | undefined;
    };
    function from(pattern: vscode.GlobPattern): string | extHostProtocol.IRelativePatternDto;
    function from(pattern: undefined): undefined;
    function from(pattern: {
        include: vscode.GlobPattern | undefined | null;
        exclude: vscode.GlobPattern | undefined;
    } | vscode.GlobPattern | undefined): string | extHostProtocol.IRelativePatternDto | {
        include: string | extHostProtocol.IRelativePatternDto | undefined;
        exclude: string | extHostProtocol.IRelativePatternDto | undefined;
    } | undefined;
    function to(pattern: string | extHostProtocol.IRelativePatternDto | {
        include: string | extHostProtocol.IRelativePatternDto;
        exclude: string | extHostProtocol.IRelativePatternDto;
    }): {
        include: vscode.GlobPattern;
        exclude: vscode.GlobPattern;
    } | vscode.GlobPattern;
}
export declare namespace NotebookStatusBarItem {
    function from(item: vscode.NotebookCellStatusBarItem, commandsConverter: Command.ICommandsConverter, disposables: DisposableStore): notebooks.INotebookCellStatusBarItem;
}
export declare namespace NotebookKernelSourceAction {
    function from(item: vscode.NotebookKernelSourceAction, commandsConverter: Command.ICommandsConverter, disposables: DisposableStore): notebooks.INotebookKernelSourceAction;
}
export declare namespace NotebookDocumentContentOptions {
    function from(options: vscode.NotebookDocumentContentOptions | undefined): notebooks.TransientOptions;
}
export declare namespace NotebookRendererScript {
    function from(preload: vscode.NotebookRendererScript): {
        uri: UriComponents;
        provides: readonly string[];
    };
    function to(preload: {
        uri: UriComponents;
        provides: readonly string[];
    }): vscode.NotebookRendererScript;
}
export declare namespace TestMessage {
    function from(message: vscode.TestMessage): ITestErrorMessage.Serialized;
    function to(item: ITestErrorMessage.Serialized): vscode.TestMessage;
}
export declare namespace TestTag {
    const namespace: (ctrlId: string, tagId: string) => string;
    const denamespace: (namespaced: string) => {
        ctrlId: string;
        tagId: string;
    };
}
export declare namespace TestItem {
    type Raw = vscode.TestItem;
    function from(item: vscode.TestItem): ITestItem;
    function toPlain(item: ITestItem.Serialized): vscode.TestItem;
}
export declare namespace TestTag {
    function from(tag: vscode.TestTag): ITestTag;
    function to(tag: ITestTag): vscode.TestTag;
}
export declare namespace TestResults {
    function to(serialized: ISerializedTestResults): vscode.TestRunResult;
}
export declare namespace TestCoverage {
    function to(serialized: CoverageDetails.Serialized): vscode.FileCoverageDetail;
    function fromDetails(coverage: vscode.FileCoverageDetail): CoverageDetails.Serialized;
    function fromFile(controllerId: string, id: string, coverage: vscode.FileCoverage): IFileCoverage.Serialized;
}
export declare namespace CodeActionTriggerKind {
    function to(value: languages.CodeActionTriggerType): types.CodeActionTriggerKind;
}
export declare namespace TypeHierarchyItem {
    function to(item: extHostProtocol.ITypeHierarchyItemDto): types.TypeHierarchyItem;
    function from(item: vscode.TypeHierarchyItem, sessionId?: string, itemId?: string): extHostProtocol.ITypeHierarchyItemDto;
}
export declare namespace ViewBadge {
    function from(badge: vscode.ViewBadge | undefined): IViewBadge | undefined;
}
export declare namespace DataTransferItem {
    function to(mime: string, item: extHostProtocol.DataTransferItemDTO, resolveFileData: (id: string) => Promise<Uint8Array>): types.DataTransferItem;
    function from(mime: string, item: vscode.DataTransferItem | IDataTransferItem): Promise<extHostProtocol.DataTransferItemDTO>;
}
export declare namespace DataTransfer {
    function toDataTransfer(value: extHostProtocol.DataTransferDTO, resolveFileData: (itemId: string) => Promise<Uint8Array>): types.DataTransfer;
    function from(dataTransfer: Iterable<readonly [string, vscode.DataTransferItem | IDataTransferItem]>): Promise<extHostProtocol.DataTransferDTO>;
}
export declare namespace ChatFollowup {
    function from(followup: vscode.ChatFollowup, request: IChatAgentRequest | undefined): IChatFollowup;
    function to(followup: IChatFollowup): vscode.ChatFollowup;
}
export declare namespace LanguageModelChatMessageRole {
    function to(role: chatProvider.ChatMessageRole): vscode.LanguageModelChatMessageRole;
    function from(role: vscode.LanguageModelChatMessageRole): chatProvider.ChatMessageRole;
}
export declare namespace LanguageModelChatMessage {
    function to(message: chatProvider.IChatMessage): vscode.LanguageModelChatMessage;
    function from(message: vscode.LanguageModelChatMessage): chatProvider.IChatMessage;
}
export declare namespace ChatResponseMarkdownPart {
    function from(part: vscode.ChatResponseMarkdownPart): Dto<IChatMarkdownContent>;
    function to(part: Dto<IChatMarkdownContent>): vscode.ChatResponseMarkdownPart;
}
export declare namespace ChatResponseCodeblockUriPart {
    function from(part: vscode.ChatResponseCodeblockUriPart): Dto<IChatResponseCodeblockUriPart>;
    function to(part: Dto<IChatResponseCodeblockUriPart>): vscode.ChatResponseCodeblockUriPart;
}
export declare namespace ChatResponseMarkdownWithVulnerabilitiesPart {
    function from(part: vscode.ChatResponseMarkdownWithVulnerabilitiesPart): Dto<IChatAgentMarkdownContentWithVulnerability>;
    function to(part: Dto<IChatAgentMarkdownContentWithVulnerability>): vscode.ChatResponseMarkdownWithVulnerabilitiesPart;
}
export declare namespace ChatResponseDetectedParticipantPart {
    function from(part: vscode.ChatResponseDetectedParticipantPart): Dto<IChatAgentDetection>;
    function to(part: Dto<IChatAgentDetection>): vscode.ChatResponseDetectedParticipantPart;
}
export declare namespace ChatResponseConfirmationPart {
    function from(part: vscode.ChatResponseConfirmationPart): Dto<IChatConfirmation>;
}
export declare namespace ChatResponseFilesPart {
    function from(part: vscode.ChatResponseFileTreePart): IChatTreeData;
    function to(part: Dto<IChatTreeData>): vscode.ChatResponseFileTreePart;
}
export declare namespace ChatResponseAnchorPart {
    function from(part: vscode.ChatResponseAnchorPart): Dto<IChatContentInlineReference>;
    function to(part: Dto<IChatContentInlineReference>): vscode.ChatResponseAnchorPart;
}
export declare namespace ChatResponseProgressPart {
    function from(part: vscode.ChatResponseProgressPart): Dto<IChatProgressMessage>;
    function to(part: Dto<IChatProgressMessage>): vscode.ChatResponseProgressPart;
}
export declare namespace ChatResponseWarningPart {
    function from(part: vscode.ChatResponseWarningPart): Dto<IChatWarningMessage>;
    function to(part: Dto<IChatWarningMessage>): vscode.ChatResponseWarningPart;
}
export declare namespace ChatResponseMovePart {
    function from(part: vscode.ChatResponseMovePart): Dto<IChatMoveMessage>;
    function to(part: Dto<IChatMoveMessage>): vscode.ChatResponseMovePart;
}
export declare namespace ChatTask {
    function from(part: vscode.ChatResponseProgressPart2): IChatTaskDto;
}
export declare namespace ChatTaskResult {
    function from(part: string | void): Dto<IChatTaskResult>;
}
export declare namespace ChatResponseCommandButtonPart {
    function from(part: vscode.ChatResponseCommandButtonPart, commandsConverter: CommandsConverter, commandDisposables: DisposableStore): Dto<IChatCommandButton>;
    function to(part: Dto<IChatCommandButton>, commandsConverter: CommandsConverter): vscode.ChatResponseCommandButtonPart;
}
export declare namespace ChatResponseTextEditPart {
    function from(part: vscode.ChatResponseTextEditPart): Dto<IChatTextEdit>;
    function to(part: Dto<IChatTextEdit>): vscode.ChatResponseTextEditPart;
}
export declare namespace ChatResponseReferencePart {
    function from(part: types.ChatResponseReferencePart): Dto<IChatContentReference>;
    function to(part: Dto<IChatContentReference>): vscode.ChatResponseReferencePart;
}
export declare namespace ChatResponseCodeCitationPart {
    function from(part: vscode.ChatResponseCodeCitationPart): Dto<IChatCodeCitation>;
}
export declare namespace ChatResponsePart {
    function from(part: vscode.ChatResponsePart | vscode.ChatResponseTextEditPart | vscode.ChatResponseMarkdownWithVulnerabilitiesPart | vscode.ChatResponseDetectedParticipantPart | vscode.ChatResponseWarningPart | vscode.ChatResponseConfirmationPart | vscode.ChatResponseReferencePart2 | vscode.ChatResponseMovePart, commandsConverter: CommandsConverter, commandDisposables: DisposableStore): extHostProtocol.IChatProgressDto;
    function to(part: extHostProtocol.IChatProgressDto, commandsConverter: CommandsConverter): vscode.ChatResponsePart | undefined;
    function toContent(part: extHostProtocol.IChatContentProgressDto, commandsConverter: CommandsConverter): vscode.ChatResponseMarkdownPart | vscode.ChatResponseFileTreePart | vscode.ChatResponseAnchorPart | vscode.ChatResponseCommandButtonPart | undefined;
}
export declare namespace ChatAgentRequest {
    function to(request: IChatAgentRequest, location2: vscode.ChatRequestEditorData | vscode.ChatRequestNotebookData | undefined): vscode.ChatRequest;
}
export declare namespace ChatLocation {
    function to(loc: ChatAgentLocation): types.ChatLocation;
    function from(loc: types.ChatLocation): ChatAgentLocation;
}
export declare namespace ChatPromptReference {
    function to(variable: IChatRequestVariableEntry): vscode.ChatPromptReference;
}
export declare namespace ChatLanguageModelToolReference {
    function to(variable: IChatRequestVariableEntry): vscode.ChatLanguageModelToolReference;
}
export declare namespace ChatAgentCompletionItem {
    function from(item: vscode.ChatCompletionItem, commandsConverter: CommandsConverter, disposables: DisposableStore): extHostProtocol.IChatAgentCompletionItem;
}
export declare namespace ChatAgentResult {
    function to(result: IChatAgentResult): vscode.ChatResult;
    function from(result: vscode.ChatResult): Dto<IChatAgentResult>;
}
export declare namespace ChatAgentUserActionEvent {
    function to(result: IChatAgentResult, event: IChatUserActionEvent, commandsConverter: CommandsConverter): vscode.ChatUserActionEvent | undefined;
}
export declare namespace TerminalQuickFix {
    function from(quickFix: vscode.TerminalQuickFixTerminalCommand | vscode.TerminalQuickFixOpener | vscode.Command, converter: Command.ICommandsConverter, disposables: DisposableStore): extHostProtocol.ITerminalQuickFixTerminalCommandDto | extHostProtocol.ITerminalQuickFixOpenerDto | extHostProtocol.ICommandDto | undefined;
}
export declare namespace PartialAcceptInfo {
    function to(info: languages.PartialAcceptInfo): types.PartialAcceptInfo;
}
export declare namespace PartialAcceptTriggerKind {
    function to(kind: languages.PartialAcceptTriggerKind): types.PartialAcceptTriggerKind;
}
export declare namespace DebugTreeItem {
    function from(item: vscode.DebugTreeItem, id: number): IDebugVisualizationTreeItem;
}
export declare namespace LanguageModelToolDescription {
    function to(item: IToolData): vscode.LanguageModelToolDescription;
}
