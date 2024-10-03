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
import { spawn } from 'child_process';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { timeout } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { memoize } from '../../../base/common/decorators.js';
import { hash } from '../../../base/common/hash.js';
import * as path from '../../../base/common/path.js';
import { URI } from '../../../base/common/uri.js';
import { checksum } from '../../../base/node/crypto.js';
import * as pfs from '../../../base/node/pfs.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { IFileService } from '../../files/common/files.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { INativeHostMainService } from '../../native/electron-main/nativeHostMainService.js';
import { IProductService } from '../../product/common/productService.js';
import { asJson, IRequestService } from '../../request/common/request.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { State } from '../common/update.js';
import { AbstractUpdateService, createUpdateURL } from './abstractUpdateService.js';
async function pollUntil(fn, millis = 1000) {
    while (!fn()) {
        await timeout(millis);
    }
}
let _updateType = undefined;
function getUpdateType() {
    if (typeof _updateType === 'undefined') {
        _updateType = fs.existsSync(path.join(path.dirname(process.execPath), 'unins000.exe'))
            ? 0
            : 1;
    }
    return _updateType;
}
let Win32UpdateService = class Win32UpdateService extends AbstractUpdateService {
    get cachePath() {
        const result = path.join(tmpdir(), `vscode-${this.productService.quality}-${this.productService.target}-${process.arch}`);
        return fs.promises.mkdir(result, { recursive: true }).then(() => result);
    }
    constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, fileService, nativeHostMainService, productService) {
        super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
        this.telemetryService = telemetryService;
        this.fileService = fileService;
        this.nativeHostMainService = nativeHostMainService;
        lifecycleMainService.setRelaunchHandler(this);
    }
    handleRelaunch(options) {
        if (options?.addArgs || options?.removeArgs) {
            return false;
        }
        if (this.state.type !== "ready" || !this.availableUpdate) {
            return false;
        }
        this.logService.trace('update#handleRelaunch(): running raw#quitAndInstall()');
        this.doQuitAndInstall();
        return true;
    }
    async initialize() {
        if (this.productService.target === 'user' && await this.nativeHostMainService.isAdmin(undefined)) {
            this.setState(State.Disabled(5));
            this.logService.info('update#ctor - updates are disabled due to running as Admin in user setup');
            return;
        }
        await super.initialize();
    }
    buildUpdateFeedUrl(quality) {
        let platform = `win32-${process.arch}`;
        if (getUpdateType() === 1) {
            platform += '-archive';
        }
        else if (this.productService.target === 'user') {
            platform += '-user';
        }
        return createUpdateURL(platform, quality, this.productService);
    }
    doCheckForUpdates(context) {
        if (!this.url) {
            return;
        }
        this.setState(State.CheckingForUpdates(context));
        this.requestService.request({ url: this.url }, CancellationToken.None)
            .then(asJson)
            .then(update => {
            const updateType = getUpdateType();
            if (!update || !update.url || !update.version || !update.productVersion) {
                this.telemetryService.publicLog2('update:notAvailable', { explicit: !!context });
                this.setState(State.Idle(updateType));
                return Promise.resolve(null);
            }
            if (updateType === 1) {
                this.setState(State.AvailableForDownload(update));
                return Promise.resolve(null);
            }
            this.setState(State.Downloading);
            return this.cleanup(update.version).then(() => {
                return this.getUpdatePackagePath(update.version).then(updatePackagePath => {
                    return pfs.Promises.exists(updatePackagePath).then(exists => {
                        if (exists) {
                            return Promise.resolve(updatePackagePath);
                        }
                        const downloadPath = `${updatePackagePath}.tmp`;
                        return this.requestService.request({ url: update.url }, CancellationToken.None)
                            .then(context => this.fileService.writeFile(URI.file(downloadPath), context.stream))
                            .then(update.sha256hash ? () => checksum(downloadPath, update.sha256hash) : () => undefined)
                            .then(() => pfs.Promises.rename(downloadPath, updatePackagePath, false))
                            .then(() => updatePackagePath);
                    });
                }).then(packagePath => {
                    this.availableUpdate = { packagePath };
                    this.setState(State.Downloaded(update));
                    const fastUpdatesEnabled = this.configurationService.getValue('update.enableWindowsBackgroundUpdates');
                    if (fastUpdatesEnabled) {
                        if (this.productService.target === 'user') {
                            this.doApplyUpdate();
                        }
                    }
                    else {
                        this.setState(State.Ready(update));
                    }
                });
            });
        })
            .then(undefined, err => {
            this.telemetryService.publicLog2('update:error', { messageHash: String(hash(String(err))) });
            this.logService.error(err);
            const message = !!context ? (err.message || err) : undefined;
            this.setState(State.Idle(getUpdateType(), message));
        });
    }
    async doDownloadUpdate(state) {
        if (state.update.url) {
            this.nativeHostMainService.openExternal(undefined, state.update.url);
        }
        this.setState(State.Idle(getUpdateType()));
    }
    async getUpdatePackagePath(version) {
        const cachePath = await this.cachePath;
        return path.join(cachePath, `CodeSetup-${this.productService.quality}-${version}.exe`);
    }
    async cleanup(exceptVersion = null) {
        const filter = exceptVersion ? (one) => !(new RegExp(`${this.productService.quality}-${exceptVersion}\\.exe$`).test(one)) : () => true;
        const cachePath = await this.cachePath;
        const versions = await pfs.Promises.readdir(cachePath);
        const promises = versions.filter(filter).map(async (one) => {
            try {
                await fs.promises.unlink(path.join(cachePath, one));
            }
            catch (err) {
            }
        });
        await Promise.all(promises);
    }
    async doApplyUpdate() {
        if (this.state.type !== "downloaded") {
            return Promise.resolve(undefined);
        }
        if (!this.availableUpdate) {
            return Promise.resolve(undefined);
        }
        const update = this.state.update;
        this.setState(State.Updating(update));
        const cachePath = await this.cachePath;
        this.availableUpdate.updateFilePath = path.join(cachePath, `CodeSetup-${this.productService.quality}-${update.version}.flag`);
        await pfs.Promises.writeFile(this.availableUpdate.updateFilePath, 'flag');
        const child = spawn(this.availableUpdate.packagePath, ['/verysilent', '/log', `/update="${this.availableUpdate.updateFilePath}"`, '/nocloseapplications', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore'],
            windowsVerbatimArguments: true
        });
        child.once('exit', () => {
            this.availableUpdate = undefined;
            this.setState(State.Idle(getUpdateType()));
        });
        const readyMutexName = `${this.productService.win32MutexName}-ready`;
        const mutex = await import('@vscode/windows-mutex');
        pollUntil(() => mutex.isActive(readyMutexName))
            .then(() => this.setState(State.Ready(update)));
    }
    doQuitAndInstall() {
        if (this.state.type !== "ready" || !this.availableUpdate) {
            return;
        }
        this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
        if (this.availableUpdate.updateFilePath) {
            fs.unlinkSync(this.availableUpdate.updateFilePath);
        }
        else {
            spawn(this.availableUpdate.packagePath, ['/silent', '/log', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                detached: true,
                stdio: ['ignore', 'ignore', 'ignore']
            });
        }
    }
    getUpdateType() {
        return getUpdateType();
    }
    async _applySpecificUpdate(packagePath) {
        if (this.state.type !== "idle") {
            return;
        }
        const fastUpdatesEnabled = this.configurationService.getValue('update.enableWindowsBackgroundUpdates');
        const update = { version: 'unknown', productVersion: 'unknown' };
        this.setState(State.Downloading);
        this.availableUpdate = { packagePath };
        this.setState(State.Downloaded(update));
        if (fastUpdatesEnabled) {
            if (this.productService.target === 'user') {
                this.doApplyUpdate();
            }
        }
        else {
            this.setState(State.Ready(update));
        }
    }
};
__decorate([
    memoize,
    __metadata("design:type", Promise),
    __metadata("design:paramtypes", [])
], Win32UpdateService.prototype, "cachePath", null);
Win32UpdateService = __decorate([
    __param(0, ILifecycleMainService),
    __param(1, IConfigurationService),
    __param(2, ITelemetryService),
    __param(3, IEnvironmentMainService),
    __param(4, IRequestService),
    __param(5, ILogService),
    __param(6, IFileService),
    __param(7, INativeHostMainService),
    __param(8, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], Win32UpdateService);
export { Win32UpdateService };
