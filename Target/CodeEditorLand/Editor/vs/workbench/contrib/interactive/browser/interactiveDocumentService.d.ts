import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
export declare const IInteractiveDocumentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInteractiveDocumentService>;
export interface IInteractiveDocumentService {
    readonly _serviceBrand: undefined;
    onWillAddInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
        languageId: string;
    }>;
    onWillRemoveInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
    }>;
    willCreateInteractiveDocument(notebookUri: URI, inputUri: URI, languageId: string): void;
    willRemoveInteractiveDocument(notebookUri: URI, inputUri: URI): void;
}
export declare class InteractiveDocumentService extends Disposable implements IInteractiveDocumentService {
    readonly _serviceBrand: undefined;
    private readonly _onWillAddInteractiveDocument;
    onWillAddInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
        languageId: string;
    }>;
    private readonly _onWillRemoveInteractiveDocument;
    onWillRemoveInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
    }>;
    constructor();
    willCreateInteractiveDocument(notebookUri: URI, inputUri: URI, languageId: string): void;
    willRemoveInteractiveDocument(notebookUri: URI, inputUri: URI): void;
}
