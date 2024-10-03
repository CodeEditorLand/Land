var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { join } from '../../../../base/common/path.js';
import { basename, dirname } from '../../../../base/common/resources.js';
import { Promises } from '../../../../base/node/pfs.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILogService } from '../../../../platform/log/common/log.js';
let LogsDataCleaner = class LogsDataCleaner extends Disposable {
    constructor(environmentService, logService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        const scheduler = this._register(new RunOnceScheduler(() => {
            this.cleanUpOldLogs();
        }, 10 * 1000));
        scheduler.schedule();
    }
    async cleanUpOldLogs() {
        this.logService.trace('[logs cleanup]: Starting to clean up old logs.');
        try {
            const currentLog = basename(this.environmentService.logsHome);
            const logsRoot = dirname(this.environmentService.logsHome.with({ scheme: Schemas.file })).fsPath;
            const logFiles = await Promises.readdir(logsRoot);
            const allSessions = logFiles.filter(logFile => /^\d{8}T\d{6}$/.test(logFile));
            const oldSessions = allSessions.sort().filter(session => session !== currentLog);
            const sessionsToDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
            if (sessionsToDelete.length > 0) {
                this.logService.trace(`[logs cleanup]: Removing log folders '${sessionsToDelete.join(', ')}'`);
                await Promise.all(sessionsToDelete.map(sessionToDelete => Promises.rm(join(logsRoot, sessionToDelete))));
            }
        }
        catch (error) {
            onUnexpectedError(error);
        }
    }
};
LogsDataCleaner = __decorate([
    __param(0, IEnvironmentService),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], LogsDataCleaner);
export { LogsDataCleaner };
