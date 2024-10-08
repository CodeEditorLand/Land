import { INotebookDocumentMetadataTextModel, INotebookTextModel, NotebookDocumentMetadata, TransientDocumentMetadata } from '../notebookCommon.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITextBuffer } from '../../../../../editor/common/model.js';
export declare function getFormattedNotebookMetadataJSON(transientMetadata: TransientDocumentMetadata | undefined, metadata: NotebookDocumentMetadata): string;
export declare class NotebookDocumentMetadataTextModel extends Disposable implements INotebookDocumentMetadataTextModel {
    readonly notebookModel: INotebookTextModel;
    readonly uri: URI;
    get metadata(): NotebookDocumentMetadata;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../../workbench.web.main.internal.js").Event<void>;
    private _textBufferHash;
    private _textBuffer?;
    get textBuffer(): ITextBuffer;
    constructor(notebookModel: INotebookTextModel);
    getHash(): string;
    getValue(): string;
    private getFullModelRange;
}
