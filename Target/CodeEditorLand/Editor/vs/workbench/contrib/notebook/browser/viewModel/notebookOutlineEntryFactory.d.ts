import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IOutlineModelService } from '../../../../../editor/contrib/documentSymbols/browser/outlineModel.js';
import { ICellViewModel } from '../notebookBrowser.js';
import { OutlineEntry } from './OutlineEntry.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
export declare const enum NotebookOutlineConstants {
    NonHeaderOutlineLevel = 7
}
export declare const INotebookOutlineEntryFactory: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookOutlineEntryFactory>;
export interface INotebookOutlineEntryFactory {
    readonly _serviceBrand: undefined;
    getOutlineEntries(cell: ICellViewModel, index: number): OutlineEntry[];
    cacheSymbols(cell: ICellViewModel, cancelToken: CancellationToken): Promise<void>;
}
export declare class NotebookOutlineEntryFactory implements INotebookOutlineEntryFactory {
    private readonly executionStateService;
    private readonly outlineModelService;
    private readonly textModelService;
    readonly _serviceBrand: undefined;
    private cellOutlineEntryCache;
    private readonly cachedMarkdownOutlineEntries;
    constructor(executionStateService: INotebookExecutionStateService, outlineModelService: IOutlineModelService, textModelService: ITextModelService);
    getOutlineEntries(cell: ICellViewModel, index: number): OutlineEntry[];
    cacheSymbols(cell: ICellViewModel, cancelToken: CancellationToken): Promise<void>;
}
