import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { Position } from '../../../../common/core/position.js';
import { Range } from '../../../../common/core/range.js';
import { SingleTextEdit } from '../../../../common/core/textEdit.js';
import { CompletionItemKind, SelectedSuggestionInfo } from '../../../../common/languages.js';
import { ITextModel } from '../../../../common/model.js';
import { CompletionItem } from '../../../suggest/browser/suggest.js';
import { SuggestController } from '../../../suggest/browser/suggestController.js';
export declare class SuggestWidgetAdaptor extends Disposable {
    private readonly editor;
    private readonly suggestControllerPreselector;
    private readonly onWillAccept;
    private isSuggestWidgetVisible;
    private isShiftKeyPressed;
    private _isActive;
    private _currentSuggestItemInfo;
    get selectedItem(): SuggestItemInfo | undefined;
    private _onDidSelectedItemChange;
    readonly onDidSelectedItemChange: Event<void>;
    constructor(editor: ICodeEditor, suggestControllerPreselector: () => SingleTextEdit | undefined, onWillAccept: (item: SuggestItemInfo) => void);
    private update;
    private getSuggestItemInfo;
    stopForceRenderingAbove(): void;
    forceRenderingAbove(): void;
}
export declare class SuggestItemInfo {
    readonly range: Range;
    readonly insertText: string;
    readonly completionItemKind: CompletionItemKind;
    readonly isSnippetText: boolean;
    static fromSuggestion(suggestController: SuggestController, model: ITextModel, position: Position, item: CompletionItem, toggleMode: boolean): SuggestItemInfo;
    private constructor();
    equals(other: SuggestItemInfo): boolean;
    toSelectedSuggestionInfo(): SelectedSuggestionInfo;
    toSingleTextEdit(): SingleTextEdit;
}
