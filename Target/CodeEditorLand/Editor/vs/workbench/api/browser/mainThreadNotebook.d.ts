import { ILogService } from '../../../platform/log/common/log.js';
import { INotebookCellStatusBarService } from '../../contrib/notebook/common/notebookCellStatusBarService.js';
import { INotebookContributionData, NotebookExtensionDescription, TransientOptions } from '../../contrib/notebook/common/notebookCommon.js';
import { INotebookService } from '../../contrib/notebook/common/notebookService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadNotebookShape } from '../common/extHost.protocol.js';
export declare class MainThreadNotebooks implements MainThreadNotebookShape {
    private readonly _notebookService;
    private readonly _cellStatusBarService;
    private readonly _logService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _notebookSerializer;
    private readonly _notebookCellStatusBarRegistrations;
    constructor(extHostContext: IExtHostContext, _notebookService: INotebookService, _cellStatusBarService: INotebookCellStatusBarService, _logService: ILogService);
    dispose(): void;
    $registerNotebookSerializer(handle: number, extension: NotebookExtensionDescription, viewType: string, options: TransientOptions, data: INotebookContributionData | undefined): void;
    $unregisterNotebookSerializer(handle: number): void;
    $emitCellStatusBarEvent(eventHandle: number): void;
    $registerNotebookCellStatusBarItemProvider(handle: number, eventHandle: number | undefined, viewType: string): Promise<void>;
    $unregisterNotebookCellStatusBarItemProvider(handle: number, eventHandle: number | undefined): Promise<void>;
}
