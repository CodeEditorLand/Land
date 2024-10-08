import './snippetSession.css';
import { IActiveCodeEditor } from '../../../browser/editorBrowser.js';
import { IPosition } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { TextChange } from '../../../common/core/textChange.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { IIdentifiedSingleEditOperation, ITextModel } from '../../../common/model.js';
import { OvertypingCapturer } from '../../suggest/browser/suggestOvertypingCapturer.js';
import { Choice, Marker, TextmateSnippet } from './snippetParser.js';
export declare class OneSnippet {
    private readonly _editor;
    private readonly _snippet;
    private readonly _snippetLineLeadingWhitespace;
    private _placeholderDecorations?;
    private _placeholderGroups;
    private _offset;
    _placeholderGroupsIdx: number;
    _nestingLevel: number;
    private static readonly _decor;
    constructor(_editor: IActiveCodeEditor, _snippet: TextmateSnippet, _snippetLineLeadingWhitespace: string);
    initialize(textChange: TextChange): void;
    dispose(): void;
    private _initDecorations;
    move(fwd: boolean | undefined): Selection[];
    private _hasPlaceholderBeenCollapsed;
    get isAtFirstPlaceholder(): boolean;
    get isAtLastPlaceholder(): boolean;
    get hasPlaceholder(): boolean;
    /**
     * A snippet is trivial when it has no placeholder or only a final placeholder at
     * its very end
     */
    get isTrivialSnippet(): boolean;
    computePossibleSelections(): Map<number, Range[]>;
    get activeChoice(): {
        choice: Choice;
        range: Range;
    } | undefined;
    get hasChoice(): boolean;
    merge(others: OneSnippet[]): void;
    getEnclosingRange(): Range | undefined;
}
export interface ISnippetSessionInsertOptions {
    overwriteBefore: number;
    overwriteAfter: number;
    adjustWhitespace: boolean;
    clipboardText: string | undefined;
    overtypingCapturer: OvertypingCapturer | undefined;
}
export interface ISnippetEdit {
    range: Range;
    template: string;
}
export declare class SnippetSession {
    private readonly _editor;
    private readonly _template;
    private readonly _options;
    private readonly _languageConfigurationService;
    static adjustWhitespace(model: ITextModel, position: IPosition, adjustIndentation: boolean, snippet: TextmateSnippet, filter?: Set<Marker>): string;
    static adjustSelection(model: ITextModel, selection: Selection, overwriteBefore: number, overwriteAfter: number): Selection;
    static createEditsAndSnippetsFromSelections(editor: IActiveCodeEditor, template: string, overwriteBefore: number, overwriteAfter: number, enforceFinalTabstop: boolean, adjustWhitespace: boolean, clipboardText: string | undefined, overtypingCapturer: OvertypingCapturer | undefined, languageConfigurationService: ILanguageConfigurationService): {
        edits: IIdentifiedSingleEditOperation[];
        snippets: OneSnippet[];
    };
    static createEditsAndSnippetsFromEdits(editor: IActiveCodeEditor, snippetEdits: ISnippetEdit[], enforceFinalTabstop: boolean, adjustWhitespace: boolean, clipboardText: string | undefined, overtypingCapturer: OvertypingCapturer | undefined, languageConfigurationService: ILanguageConfigurationService): {
        edits: IIdentifiedSingleEditOperation[];
        snippets: OneSnippet[];
    };
    private readonly _templateMerges;
    private _snippets;
    constructor(_editor: IActiveCodeEditor, _template: string | ISnippetEdit[], _options: ISnippetSessionInsertOptions | undefined, _languageConfigurationService: ILanguageConfigurationService);
    dispose(): void;
    _logInfo(): string;
    insert(): void;
    merge(template: string, options?: ISnippetSessionInsertOptions): void;
    next(): void;
    prev(): void;
    private _move;
    get isAtFirstPlaceholder(): boolean;
    get isAtLastPlaceholder(): boolean;
    get hasPlaceholder(): boolean;
    get hasChoice(): boolean;
    get activeChoice(): {
        choice: Choice;
        range: Range;
    } | undefined;
    isSelectionWithinPlaceholders(): boolean;
    getEnclosingRange(): Range | undefined;
}
