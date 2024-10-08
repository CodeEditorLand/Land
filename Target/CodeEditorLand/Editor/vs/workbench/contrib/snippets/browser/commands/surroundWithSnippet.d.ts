import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { Position } from '../../../../../editor/common/core/position.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { SnippetEditorAction } from './abstractSnippetsActions.js';
import { Snippet } from '../snippetsFile.js';
import { ISnippetsService } from '../snippets.js';
export declare function getSurroundableSnippets(snippetsService: ISnippetsService, model: ITextModel, position: Position, includeDisabledSnippets: boolean): Promise<Snippet[]>;
export declare class SurroundWithSnippetEditorAction extends SnippetEditorAction {
    static readonly options: {
        id: string;
        title: import("../../../../../nls.js").ILocalizedString;
    };
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
