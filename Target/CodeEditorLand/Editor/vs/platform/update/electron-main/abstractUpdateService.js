/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { timeout } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { State } from '../common/update.js';
export function createUpdateURL(platform, quality, productService) {
    return `${productService.updateUrl}/api/update/${platform}/${quality}/${productService.commit}`;
}
let AbstractUpdateService = class AbstractUpdateService {
    get state() {
        return this._state;
    }
    setState(state) {
        this.logService.info('update#setState', state.type);
        this._state = state;
        this._onStateChange.fire(state);
    }
    constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService) {
        this.lifecycleMainService = lifecycleMainService;
        this.configurationService = configurationService;
        this.environmentMainService = environmentMainService;
        this.requestService = requestService;
        this.logService = logService;
        this.productService = productService;
        this._state = State.Uninitialized;
        this._onStateChange = new Emitter();
        this.onStateChange = this._onStateChange.event;
        lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */)
            .finally(() => this.initialize());
    }
    /**
     * This must be called before any other call. This is a performance
     * optimization, to avoid using extra CPU cycles before first window open.
     * https://github.com/microsoft/vscode/issues/89784
     */
    async initialize() {
        if (!this.environmentMainService.isBuilt) {
            this.setState(State.Disabled(0 /* DisablementReason.NotBuilt */));
            return; // updates are never enabled when running out of sources
        }
        if (this.environmentMainService.disableUpdates) {
            this.setState(State.Disabled(1 /* DisablementReason.DisabledByEnvironment */));
            this.logService.info('update#ctor - updates are disabled by the environment');
            return;
        }
        if (!this.productService.updateUrl || !this.productService.commit) {
            this.setState(State.Disabled(3 /* DisablementReason.MissingConfiguration */));
            this.logService.info('update#ctor - updates are disabled as there is no update URL');
            return;
        }
        const updateMode = this.configurationService.getValue('update.mode');
        const quality = this.getProductQuality(updateMode);
        if (!quality) {
            this.setState(State.Disabled(2 /* DisablementReason.ManuallyDisabled */));
            this.logService.info('update#ctor - updates are disabled by user preference');
            return;
        }
        this.url = this.buildUpdateFeedUrl(quality);
        if (!this.url) {
            this.setState(State.Disabled(4 /* DisablementReason.InvalidConfiguration */));
            this.logService.info('update#ctor - updates are disabled as the update URL is badly formed');
            return;
        }
        // hidden setting
        if (this.configurationService.getValue('_update.prss')) {
            const url = new URL(this.url);
            url.searchParams.set('prss', 'true');
            this.url = url.toString();
        }
        this.setState(State.Idle(this.getUpdateType()));
        if (updateMode === 'manual') {
            this.logService.info('update#ctor - manual checks only; automatic updates are disabled by user preference');
            return;
        }
        if (updateMode === 'start') {
            this.logService.info('update#ctor - startup checks only; automatic updates are disabled by user preference');
            // Check for updates only once after 30 seconds
            setTimeout(() => this.checkForUpdates(false), 30 * 1000);
        }
        else {
            // Start checking for updates after 30 seconds
            this.scheduleCheckForUpdates(30 * 1000).then(undefined, err => this.logService.error(err));
        }
    }
    getProductQuality(updateMode) {
        return updateMode === 'none' ? undefined : this.productService.quality;
    }
    scheduleCheckForUpdates(delay = 60 * 60 * 1000) {
        return timeout(delay)
            .then(() => this.checkForUpdates(false))
            .then(() => {
            // Check again after 1 hour
            return this.scheduleCheckForUpdates(60 * 60 * 1000);
        });
    }
    async checkForUpdates(explicit) {
        this.logService.trace('update#checkForUpdates, state = ', this.state.type);
        if (this.state.type !== "idle" /* StateType.Idle */) {
            return;
        }
        this.doCheckForUpdates(explicit);
    }
    async downloadUpdate() {
        this.logService.trace('update#downloadUpdate, state = ', this.state.type);
        if (this.state.type !== "available for download" /* StateType.AvailableForDownload */) {
            return;
        }
        await this.doDownloadUpdate(this.state);
    }
    async doDownloadUpdate(state) {
        // noop
    }
    async applyUpdate() {
        this.logService.trace('update#applyUpdate, state = ', this.state.type);
        if (this.state.type !== "downloaded" /* StateType.Downloaded */) {
            return;
        }
        await this.doApplyUpdate();
    }
    async doApplyUpdate() {
        // noop
    }
    quitAndInstall() {
        this.logService.trace('update#quitAndInstall, state = ', this.state.type);
        if (this.state.type !== "ready" /* StateType.Ready */) {
            return Promise.resolve(undefined);
        }
        this.logService.trace('update#quitAndInstall(): before lifecycle quit()');
        this.lifecycleMainService.quit(true /* will restart */).then(vetod => {
            this.logService.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${vetod}`);
            if (vetod) {
                return;
            }
            this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            this.doQuitAndInstall();
        });
        return Promise.resolve(undefined);
    }
    async isLatestVersion() {
        if (!this.url) {
            return undefined;
        }
        const mode = this.configurationService.getValue('update.mode');
        if (mode === 'none') {
            return false;
        }
        try {
            const context = await this.requestService.request({ url: this.url }, CancellationToken.None);
            // The update server replies with 204 (No Content) when no
            // update is available - that's all we want to know.
            return context.res.statusCode === 204;
        }
        catch (error) {
            this.logService.error('update#isLatestVersion(): failed to check for updates');
            this.logService.error(error);
            return undefined;
        }
    }
    async _applySpecificUpdate(packagePath) {
        // noop
    }
    getUpdateType() {
        return 1 /* UpdateType.Archive */;
    }
    doQuitAndInstall() {
        // noop
    }
};
AbstractUpdateService = __decorate([
    __param(0, ILifecycleMainService),
    __param(1, IConfigurationService),
    __param(2, IEnvironmentMainService),
    __param(3, IRequestService),
    __param(4, ILogService),
    __param(5, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], AbstractUpdateService);
export { AbstractUpdateService };
