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
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { FileAccess, Schemas } from '../../../base/common/network.js';
import { Client } from '../../../base/parts/ipc/node/ipc.cp.js';
import { IEnvironmentService, INativeEnvironmentService } from '../../environment/common/environment.js';
import { parsePtyHostDebugPort } from '../../environment/node/environmentService.js';
let NodePtyHostStarter = class NodePtyHostStarter extends Disposable {
    constructor(_reconnectConstants, _environmentService) {
        super();
        this._reconnectConstants = _reconnectConstants;
        this._environmentService = _environmentService;
    }
    start() {
        const opts = {
            serverName: 'Pty Host',
            args: ['--type=ptyHost', '--logsPath', this._environmentService.logsHome.with({ scheme: Schemas.file }).fsPath],
            env: {
                VSCODE_ESM_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
                VSCODE_PIPE_LOGGING: 'true',
                VSCODE_VERBOSE_LOGGING: 'true',
                VSCODE_RECONNECT_GRACE_TIME: this._reconnectConstants.graceTime,
                VSCODE_RECONNECT_SHORT_GRACE_TIME: this._reconnectConstants.shortGraceTime,
                VSCODE_RECONNECT_SCROLLBACK: this._reconnectConstants.scrollback
            }
        };
        const ptyHostDebug = parsePtyHostDebugPort(this._environmentService.args, this._environmentService.isBuilt);
        if (ptyHostDebug) {
            if (ptyHostDebug.break && ptyHostDebug.port) {
                opts.debugBrk = ptyHostDebug.port;
            }
            else if (!ptyHostDebug.break && ptyHostDebug.port) {
                opts.debug = ptyHostDebug.port;
            }
        }
        const client = new Client(FileAccess.asFileUri('bootstrap-fork').fsPath, opts);
        const store = new DisposableStore();
        store.add(client);
        return {
            client,
            store,
            onDidProcessExit: client.onDidProcessExit
        };
    }
};
NodePtyHostStarter = __decorate([
    __param(1, IEnvironmentService),
    __metadata("design:paramtypes", [Object, Object])
], NodePtyHostStarter);
export { NodePtyHostStarter };
