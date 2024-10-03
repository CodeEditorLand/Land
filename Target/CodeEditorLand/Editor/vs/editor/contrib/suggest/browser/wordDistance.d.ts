import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IPosition } from '../../../common/core/position.js';
import { CompletionItem } from '../../../common/languages.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
export declare abstract class WordDistance {
    static readonly None: {
        distance(): number;
    };
    static create(service: IEditorWorkerService, editor: ICodeEditor): Promise<WordDistance>;
    abstract distance(anchor: IPosition, suggestion: CompletionItem): number;
}
