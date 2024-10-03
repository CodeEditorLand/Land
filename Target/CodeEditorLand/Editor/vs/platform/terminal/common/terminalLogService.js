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
import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { localize } from '../../../nls.js';
import { ILoggerService, LogLevel } from '../../log/common/log.js';
import { IWorkspaceContextService } from '../../workspace/common/workspace.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { joinPath } from '../../../base/common/resources.js';
let TerminalLogService = class TerminalLogService extends Disposable {
    get onDidChangeLogLevel() { return this._logger.onDidChangeLogLevel; }
    constructor(_loggerService, workspaceContextService, environmentService) {
        super();
        this._loggerService = _loggerService;
        this._logger = this._loggerService.createLogger(joinPath(environmentService.logsHome, 'terminal.log'), { id: 'terminal', name: localize('terminalLoggerName', 'Terminal') });
        this._register(Event.runAndSubscribe(workspaceContextService.onDidChangeWorkspaceFolders, () => {
            this._workspaceId = workspaceContextService.getWorkspace().id.substring(0, 7);
        }));
    }
    getLevel() { return this._logger.getLevel(); }
    setLevel(level) { this._logger.setLevel(level); }
    flush() { this._logger.flush(); }
    trace(message, ...args) { this._logger.trace(this._formatMessage(message), args); }
    debug(message, ...args) { this._logger.debug(this._formatMessage(message), args); }
    info(message, ...args) { this._logger.info(this._formatMessage(message), args); }
    warn(message, ...args) { this._logger.warn(this._formatMessage(message), args); }
    error(message, ...args) {
        if (message instanceof Error) {
            this._logger.error(this._formatMessage(''), message, args);
            return;
        }
        this._logger.error(this._formatMessage(message), args);
    }
    _formatMessage(message) {
        if (this._logger.getLevel() === LogLevel.Trace) {
            return `[${this._workspaceId}] ${message}`;
        }
        return message;
    }
};
TerminalLogService = __decorate([
    __param(0, ILoggerService),
    __param(1, IWorkspaceContextService),
    __param(2, IEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalLogService);
export { TerminalLogService };
