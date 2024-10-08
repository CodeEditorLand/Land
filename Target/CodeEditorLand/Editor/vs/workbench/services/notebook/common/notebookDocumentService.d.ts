import { URI } from '../../../../base/common/uri.js';
export declare const INotebookDocumentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookDocumentService>;
export interface INotebookDocument {
    readonly uri: URI;
    getCellIndex(cellUri: URI): number | undefined;
}
export declare function parse(cell: URI): {
    notebook: URI;
    handle: number;
} | undefined;
export declare function generate(notebook: URI, handle: number): URI;
export declare function parseMetadataUri(metadata: URI): URI | undefined;
export declare function generateMetadataUri(notebook: URI): URI;
export interface INotebookDocumentService {
    readonly _serviceBrand: undefined;
    getNotebook(uri: URI): INotebookDocument | undefined;
    addNotebookDocument(document: INotebookDocument): void;
    removeNotebookDocument(document: INotebookDocument): void;
}
export declare class NotebookDocumentWorkbenchService implements INotebookDocumentService {
    readonly _serviceBrand: undefined;
    private readonly _documents;
    getNotebook(uri: URI): INotebookDocument | undefined;
    addNotebookDocument(document: INotebookDocument): void;
    removeNotebookDocument(document: INotebookDocument): void;
}
