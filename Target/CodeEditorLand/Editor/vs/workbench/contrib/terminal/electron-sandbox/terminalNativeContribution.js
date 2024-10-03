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
import { ipcRenderer } from '../../../../base/parts/sandbox/electron-sandbox/globals.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { registerRemoteContributions } from './terminalRemote.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITerminalService } from '../browser/terminal.js';
import { disposableWindowInterval, getActiveWindow } from '../../../../base/browser/dom.js';
let TerminalNativeContribution = class TerminalNativeContribution extends Disposable {
    constructor(_fileService, _terminalService, remoteAgentService, nativeHostService) {
        super();
        this._fileService = _fileService;
        this._terminalService = _terminalService;
        ipcRenderer.on('vscode:openFiles', (_, request) => { this._onOpenFileRequest(request); });
        this._register(nativeHostService.onDidResumeOS(() => this._onOsResume()));
        this._terminalService.setNativeDelegate({
            getWindowCount: () => nativeHostService.getWindowCount()
        });
        const connection = remoteAgentService.getConnection();
        if (connection && connection.remoteAuthority) {
            registerRemoteContributions();
        }
    }
    _onOsResume() {
        for (const instance of this._terminalService.instances) {
            instance.xterm?.forceRedraw();
        }
    }
    async _onOpenFileRequest(request) {
        if (request.termProgram === 'vscode' && request.filesToWait) {
            const waitMarkerFileUri = URI.revive(request.filesToWait.waitMarkerFileUri);
            await this._whenFileDeleted(waitMarkerFileUri);
            this._terminalService.activeInstance?.focus();
        }
    }
    _whenFileDeleted(path) {
        return new Promise(resolve => {
            let running = false;
            const interval = disposableWindowInterval(getActiveWindow(), async () => {
                if (!running) {
                    running = true;
                    const exists = await this._fileService.exists(path);
                    running = false;
                    if (!exists) {
                        interval.dispose();
                        resolve(undefined);
                    }
                }
            }, 1000);
        });
    }
};
TerminalNativeContribution = __decorate([
    __param(0, IFileService),
    __param(1, ITerminalService),
    __param(2, IRemoteAgentService),
    __param(3, INativeHostService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TerminalNativeContribution);
export { TerminalNativeContribution };
