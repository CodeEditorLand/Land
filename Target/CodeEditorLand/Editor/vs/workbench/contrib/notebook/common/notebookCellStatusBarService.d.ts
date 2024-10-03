import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from './notebookCommon.js';
export declare const INotebookCellStatusBarService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookCellStatusBarService>;
export interface INotebookCellStatusBarService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeProviders: Event<void>;
    readonly onDidChangeItems: Event<void>;
    registerCellStatusBarItemProvider(provider: INotebookCellStatusBarItemProvider): IDisposable;
    getStatusBarItemsForCell(docUri: URI, cellIndex: number, viewType: string, token: CancellationToken): Promise<INotebookCellStatusBarItemList[]>;
}
