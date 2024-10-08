import { Disposable } from '../../../../../base/common/lifecycle.js';
import { INotebookLoggingService } from '../../common/notebookLoggingService.js';
import { ILoggerService } from '../../../../../platform/log/common/log.js';
export declare class NotebookLoggingService extends Disposable implements INotebookLoggingService {
    _serviceBrand: undefined;
    static ID: string;
    private readonly _logger;
    constructor(loggerService: ILoggerService);
    debug(category: string, output: string): void;
    info(category: string, output: string): void;
    warn(category: string, output: string): void;
    error(category: string, output: string): void;
}
