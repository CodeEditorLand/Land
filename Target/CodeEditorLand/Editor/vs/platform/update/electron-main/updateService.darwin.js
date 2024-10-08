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
import * as electron from 'electron';
import { memoize } from '../../../base/common/decorators.js';
import { Event } from '../../../base/common/event.js';
import { hash } from '../../../base/common/hash.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { State } from '../common/update.js';
import { AbstractUpdateService, createUpdateURL } from './abstractUpdateService.js';
let DarwinUpdateService = class DarwinUpdateService extends AbstractUpdateService {
    get onRawError() { return Event.fromNodeEventEmitter(electron.autoUpdater, 'error', (_, message) => message); }
    get onRawUpdateNotAvailable() { return Event.fromNodeEventEmitter(electron.autoUpdater, 'update-not-available'); }
    get onRawUpdateAvailable() { return Event.fromNodeEventEmitter(electron.autoUpdater, 'update-available'); }
    get onRawUpdateDownloaded() { return Event.fromNodeEventEmitter(electron.autoUpdater, 'update-downloaded', (_, releaseNotes, version, timestamp) => ({ version, productVersion: version, timestamp })); }
    constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, productService) {
        super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
        this.telemetryService = telemetryService;
        this.disposables = new DisposableStore();
        lifecycleMainService.setRelaunchHandler(this);
    }
    handleRelaunch(options) {
        if (options?.addArgs || options?.removeArgs) {
            return false; // we cannot apply an update and restart with different args
        }
        if (this.state.type !== "ready" /* StateType.Ready */) {
            return false; // we only handle the relaunch when we have a pending update
        }
        this.logService.trace('update#handleRelaunch(): running raw#quitAndInstall()');
        this.doQuitAndInstall();
        return true;
    }
    async initialize() {
        await super.initialize();
        this.onRawError(this.onError, this, this.disposables);
        this.onRawUpdateAvailable(this.onUpdateAvailable, this, this.disposables);
        this.onRawUpdateDownloaded(this.onUpdateDownloaded, this, this.disposables);
        this.onRawUpdateNotAvailable(this.onUpdateNotAvailable, this, this.disposables);
    }
    onError(err) {
        this.telemetryService.publicLog2('update:error', { messageHash: String(hash(String(err))) });
        this.logService.error('UpdateService error:', err);
        // only show message when explicitly checking for updates
        const message = (this.state.type === "checking for updates" /* StateType.CheckingForUpdates */ && this.state.explicit) ? err : undefined;
        this.setState(State.Idle(1 /* UpdateType.Archive */, message));
    }
    buildUpdateFeedUrl(quality) {
        let assetID;
        if (!this.productService.darwinUniversalAssetId) {
            assetID = process.arch === 'x64' ? 'darwin' : 'darwin-arm64';
        }
        else {
            assetID = this.productService.darwinUniversalAssetId;
        }
        const url = createUpdateURL(assetID, quality, this.productService);
        try {
            electron.autoUpdater.setFeedURL({ url });
        }
        catch (e) {
            // application is very likely not signed
            this.logService.error('Failed to set update feed URL', e);
            return undefined;
        }
        return url;
    }
    doCheckForUpdates(context) {
        this.setState(State.CheckingForUpdates(context));
        electron.autoUpdater.checkForUpdates();
    }
    onUpdateAvailable() {
        if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
            return;
        }
        this.setState(State.Downloading);
    }
    onUpdateDownloaded(update) {
        if (this.state.type !== "downloading" /* StateType.Downloading */) {
            return;
        }
        this.setState(State.Downloaded(update));
        this.telemetryService.publicLog2('update:downloaded', { version: update.version });
        this.setState(State.Ready(update));
    }
    onUpdateNotAvailable() {
        if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
            return;
        }
        this.telemetryService.publicLog2('update:notAvailable', { explicit: this.state.explicit });
        this.setState(State.Idle(1 /* UpdateType.Archive */));
    }
    doQuitAndInstall() {
        this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
        electron.autoUpdater.quitAndInstall();
    }
    dispose() {
        this.disposables.dispose();
    }
};
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [])
], DarwinUpdateService.prototype, "onRawError", null);
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [])
], DarwinUpdateService.prototype, "onRawUpdateNotAvailable", null);
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [])
], DarwinUpdateService.prototype, "onRawUpdateAvailable", null);
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [])
], DarwinUpdateService.prototype, "onRawUpdateDownloaded", null);
DarwinUpdateService = __decorate([
    __param(0, ILifecycleMainService),
    __param(1, IConfigurationService),
    __param(2, ITelemetryService),
    __param(3, IEnvironmentMainService),
    __param(4, IRequestService),
    __param(5, ILogService),
    __param(6, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], DarwinUpdateService);
export { DarwinUpdateService };
