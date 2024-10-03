import { type IReference } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import type { INotebookEditor } from '../notebookBrowser.js';
import { NotebookCellOutlineDataSource } from './notebookOutlineDataSource.js';
export declare const INotebookCellOutlineDataSourceFactory: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookCellOutlineDataSourceFactory>;
export interface INotebookCellOutlineDataSourceFactory {
    getOrCreate(editor: INotebookEditor): IReference<NotebookCellOutlineDataSource>;
}
export declare class NotebookCellOutlineDataSourceFactory implements INotebookCellOutlineDataSourceFactory {
    private readonly _data;
    constructor(instantiationService: IInstantiationService);
    getOrCreate(editor: INotebookEditor): IReference<NotebookCellOutlineDataSource>;
}
