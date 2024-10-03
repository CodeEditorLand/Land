import { ConsoleLogger } from '../../../../platform/log/common/log.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { windowLogId } from '../common/logConstants.js';
import { LogService } from '../../../../platform/log/common/logService.js';
export class NativeLogService extends LogService {
    constructor(loggerService, environmentService) {
        const disposables = new DisposableStore();
        const fileLogger = disposables.add(loggerService.createLogger(environmentService.logFile, { id: windowLogId, name: localize('rendererLog', "Window") }));
        let consoleLogger;
        if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
            consoleLogger = loggerService.createConsoleMainLogger();
        }
        else {
            consoleLogger = new ConsoleLogger(fileLogger.getLevel());
        }
        super(fileLogger, [consoleLogger]);
        this._register(disposables);
    }
}
