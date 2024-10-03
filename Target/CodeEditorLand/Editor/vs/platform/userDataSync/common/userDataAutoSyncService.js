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
import { createCancelablePromise, disposableTimeout, ThrottledDelayer, timeout } from '../../../base/common/async.js';
import { toLocalISOString } from '../../../base/common/date.js';
import { toErrorMessage } from '../../../base/common/errorMessage.js';
import { isCancellationError } from '../../../base/common/errors.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable, MutableDisposable, toDisposable } from '../../../base/common/lifecycle.js';
import { isWeb } from '../../../base/common/platform.js';
import { isEqual } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { localize } from '../../../nls.js';
import { IProductService } from '../../product/common/productService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, UserDataAutoSyncError, UserDataSyncError } from './userDataSync.js';
import { IUserDataSyncAccountService } from './userDataSyncAccount.js';
import { IUserDataSyncMachinesService } from './userDataSyncMachines.js';
const disableMachineEventuallyKey = 'sync.disableMachineEventually';
const sessionIdKey = 'sync.sessionId';
const storeUrlKey = 'sync.storeUrl';
const productQualityKey = 'sync.productQuality';
let UserDataAutoSyncService = class UserDataAutoSyncService extends Disposable {
    get syncUrl() {
        const value = this.storageService.get(storeUrlKey, -1);
        return value ? URI.parse(value) : undefined;
    }
    set syncUrl(syncUrl) {
        if (syncUrl) {
            this.storageService.store(storeUrlKey, syncUrl.toString(), -1, 1);
        }
        else {
            this.storageService.remove(storeUrlKey, -1);
        }
    }
    get productQuality() {
        return this.storageService.get(productQualityKey, -1);
    }
    set productQuality(productQuality) {
        if (productQuality) {
            this.storageService.store(productQualityKey, productQuality, -1, 1);
        }
        else {
            this.storageService.remove(productQualityKey, -1);
        }
    }
    constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, userDataSyncAccountService, telemetryService, userDataSyncMachinesService, storageService) {
        super();
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.userDataSyncService = userDataSyncService;
        this.logService = logService;
        this.userDataSyncAccountService = userDataSyncAccountService;
        this.telemetryService = telemetryService;
        this.userDataSyncMachinesService = userDataSyncMachinesService;
        this.storageService = storageService;
        this.autoSync = this._register(new MutableDisposable());
        this.successiveFailures = 0;
        this.lastSyncTriggerTime = undefined;
        this.suspendUntilRestart = false;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this.sources = [];
        this.syncTriggerDelayer = this._register(new ThrottledDelayer(this.getSyncTriggerDelayTime()));
        this.lastSyncUrl = this.syncUrl;
        this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
        this.previousProductQuality = this.productQuality;
        this.productQuality = productService.quality;
        if (this.syncUrl) {
            this.logService.info('Using settings sync service', this.syncUrl.toString());
            this._register(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => {
                if (!isEqual(this.syncUrl, userDataSyncStoreManagementService.userDataSyncStore?.url)) {
                    this.lastSyncUrl = this.syncUrl;
                    this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
                    if (this.syncUrl) {
                        this.logService.info('Using settings sync service', this.syncUrl.toString());
                    }
                }
            }));
            if (this.userDataSyncEnablementService.isEnabled()) {
                this.logService.info('Auto Sync is enabled.');
            }
            else {
                this.logService.info('Auto Sync is disabled.');
            }
            this.updateAutoSync();
            if (this.hasToDisableMachineEventually()) {
                this.disableMachineEventually();
            }
            this._register(userDataSyncAccountService.onDidChangeAccount(() => this.updateAutoSync()));
            this._register(userDataSyncStoreService.onDidChangeDonotMakeRequestsUntil(() => this.updateAutoSync()));
            this._register(userDataSyncService.onDidChangeLocal(source => this.triggerSync([source], false, false)));
            this._register(Event.filter(this.userDataSyncEnablementService.onDidChangeResourceEnablement, ([, enabled]) => enabled)(() => this.triggerSync(['resourceEnablement'], false, false)));
            this._register(this.userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.triggerSync(['userDataSyncStoreChanged'], false, false)));
        }
    }
    updateAutoSync() {
        const { enabled, message } = this.isAutoSyncEnabled();
        if (enabled) {
            if (this.autoSync.value === undefined) {
                this.autoSync.value = new AutoSync(this.lastSyncUrl, 1000 * 60 * 5, this.userDataSyncStoreManagementService, this.userDataSyncStoreService, this.userDataSyncService, this.userDataSyncMachinesService, this.logService, this.telemetryService, this.storageService);
                this.autoSync.value.register(this.autoSync.value.onDidStartSync(() => this.lastSyncTriggerTime = new Date().getTime()));
                this.autoSync.value.register(this.autoSync.value.onDidFinishSync(e => this.onDidFinishSync(e)));
                if (this.startAutoSync()) {
                    this.autoSync.value.start();
                }
            }
        }
        else {
            this.syncTriggerDelayer.cancel();
            if (this.autoSync.value !== undefined) {
                if (message) {
                    this.logService.info(message);
                }
                this.autoSync.clear();
            }
            else if (message && this.userDataSyncEnablementService.isEnabled()) {
                this.logService.info(message);
            }
        }
    }
    startAutoSync() { return true; }
    isAutoSyncEnabled() {
        if (!this.userDataSyncEnablementService.isEnabled()) {
            return { enabled: false, message: 'Auto Sync: Disabled.' };
        }
        if (!this.userDataSyncAccountService.account) {
            return { enabled: false, message: 'Auto Sync: Suspended until auth token is available.' };
        }
        if (this.userDataSyncStoreService.donotMakeRequestsUntil) {
            return { enabled: false, message: `Auto Sync: Suspended until ${toLocalISOString(this.userDataSyncStoreService.donotMakeRequestsUntil)} because server is not accepting requests until then.` };
        }
        if (this.suspendUntilRestart) {
            return { enabled: false, message: 'Auto Sync: Suspended until restart.' };
        }
        return { enabled: true };
    }
    async turnOn() {
        this.stopDisableMachineEventually();
        this.lastSyncUrl = this.syncUrl;
        this.updateEnablement(true);
    }
    async turnOff(everywhere, softTurnOffOnError, donotRemoveMachine) {
        try {
            if (this.userDataSyncAccountService.account && !donotRemoveMachine) {
                await this.userDataSyncMachinesService.removeCurrentMachine();
            }
            this.updateEnablement(false);
            this.storageService.remove(sessionIdKey, -1);
            if (everywhere) {
                this.telemetryService.publicLog2('sync/turnOffEveryWhere');
                await this.userDataSyncService.reset();
            }
            else {
                await this.userDataSyncService.resetLocal();
            }
        }
        catch (error) {
            this.logService.error(error);
            if (softTurnOffOnError) {
                this.updateEnablement(false);
            }
            else {
                throw error;
            }
        }
    }
    updateEnablement(enabled) {
        if (this.userDataSyncEnablementService.isEnabled() !== enabled) {
            this.userDataSyncEnablementService.setEnablement(enabled);
            this.updateAutoSync();
        }
    }
    hasProductQualityChanged() {
        return !!this.previousProductQuality && !!this.productQuality && this.previousProductQuality !== this.productQuality;
    }
    async onDidFinishSync(error) {
        if (!error) {
            this.successiveFailures = 0;
            return;
        }
        const userDataSyncError = UserDataSyncError.toUserDataSyncError(error);
        if (userDataSyncError instanceof UserDataAutoSyncError) {
            this.telemetryService.publicLog2(`autosync/error`, { code: userDataSyncError.code, service: this.userDataSyncStoreManagementService.userDataSyncStore.url.toString() });
        }
        if (userDataSyncError.code === "SessionExpired") {
            await this.turnOff(false, true);
            this.logService.info('Auto Sync: Turned off sync because current session is expired');
        }
        else if (userDataSyncError.code === "TurnedOff") {
            await this.turnOff(false, true);
            this.logService.info('Auto Sync: Turned off sync because sync is turned off in the cloud');
        }
        else if (userDataSyncError.code === "LocalTooManyRequests") {
            this.suspendUntilRestart = true;
            this.logService.info('Auto Sync: Suspended sync because of making too many requests to server');
            this.updateAutoSync();
        }
        else if (userDataSyncError.code === "RemoteTooManyRequests") {
            await this.turnOff(false, true, true);
            this.disableMachineEventually();
            this.logService.info('Auto Sync: Turned off sync because of making too many requests to server');
        }
        else if (userDataSyncError.code === "MethodNotFound") {
            await this.turnOff(false, true);
            this.logService.info('Auto Sync: Turned off sync because current client is making requests to server that are not supported');
        }
        else if (userDataSyncError.code === "UpgradeRequired" || userDataSyncError.code === "Gone") {
            await this.turnOff(false, true, true);
            this.disableMachineEventually();
            this.logService.info('Auto Sync: Turned off sync because current client is not compatible with server. Requires client upgrade.');
        }
        else if (userDataSyncError.code === "IncompatibleLocalContent") {
            await this.turnOff(false, true);
            this.logService.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with newer version than of client. Requires client upgrade.`);
        }
        else if (userDataSyncError.code === "IncompatibleRemoteContent") {
            await this.turnOff(false, true);
            this.logService.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with older version than of client. Requires server reset.`);
        }
        else if (userDataSyncError.code === "ServiceChanged" || userDataSyncError.code === "DefaultServiceChanged") {
            if (isWeb && userDataSyncError.code === "DefaultServiceChanged" && !this.hasProductQualityChanged()) {
                await this.turnOff(false, true);
                this.logService.info('Auto Sync: Turned off sync because default sync service is changed.');
            }
            else {
                await this.turnOff(false, true, true);
                await this.turnOn();
                this.logService.info('Auto Sync: Sync Service changed. Turned off auto sync, reset local state and turned on auto sync.');
            }
        }
        else {
            this.logService.error(userDataSyncError);
            this.successiveFailures++;
        }
        this._onError.fire(userDataSyncError);
    }
    async disableMachineEventually() {
        this.storageService.store(disableMachineEventuallyKey, true, -1, 1);
        await timeout(1000 * 60 * 10);
        if (!this.hasToDisableMachineEventually()) {
            return;
        }
        this.stopDisableMachineEventually();
        if (!this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account) {
            await this.userDataSyncMachinesService.removeCurrentMachine();
        }
    }
    hasToDisableMachineEventually() {
        return this.storageService.getBoolean(disableMachineEventuallyKey, -1, false);
    }
    stopDisableMachineEventually() {
        this.storageService.remove(disableMachineEventuallyKey, -1);
    }
    async triggerSync(sources, skipIfSyncedRecently, disableCache) {
        if (this.autoSync.value === undefined) {
            return this.syncTriggerDelayer.cancel();
        }
        if (skipIfSyncedRecently && this.lastSyncTriggerTime
            && Math.round((new Date().getTime() - this.lastSyncTriggerTime) / 1000) < 10) {
            this.logService.debug('Auto Sync: Skipped. Limited to once per 10 seconds.');
            return;
        }
        this.sources.push(...sources);
        return this.syncTriggerDelayer.trigger(async () => {
            this.logService.trace('activity sources', ...this.sources);
            const providerId = this.userDataSyncAccountService.account?.authenticationProviderId || '';
            this.telemetryService.publicLog2('sync/triggered', { sources: this.sources, providerId });
            this.sources = [];
            if (this.autoSync.value) {
                await this.autoSync.value.sync('Activity', disableCache);
            }
        }, this.successiveFailures
            ? this.getSyncTriggerDelayTime() * 1 * Math.min(Math.pow(2, this.successiveFailures), 60)
            : this.getSyncTriggerDelayTime());
    }
    getSyncTriggerDelayTime() {
        return 2000;
    }
};
UserDataAutoSyncService = __decorate([
    __param(0, IProductService),
    __param(1, IUserDataSyncStoreManagementService),
    __param(2, IUserDataSyncStoreService),
    __param(3, IUserDataSyncEnablementService),
    __param(4, IUserDataSyncService),
    __param(5, IUserDataSyncLogService),
    __param(6, IUserDataSyncAccountService),
    __param(7, ITelemetryService),
    __param(8, IUserDataSyncMachinesService),
    __param(9, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserDataAutoSyncService);
export { UserDataAutoSyncService };
class AutoSync extends Disposable {
    static { this.INTERVAL_SYNCING = 'Interval'; }
    constructor(lastSyncUrl, interval, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncService, userDataSyncMachinesService, logService, telemetryService, storageService) {
        super();
        this.lastSyncUrl = lastSyncUrl;
        this.interval = interval;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.userDataSyncService = userDataSyncService;
        this.userDataSyncMachinesService = userDataSyncMachinesService;
        this.logService = logService;
        this.telemetryService = telemetryService;
        this.storageService = storageService;
        this.intervalHandler = this._register(new MutableDisposable());
        this._onDidStartSync = this._register(new Emitter());
        this.onDidStartSync = this._onDidStartSync.event;
        this._onDidFinishSync = this._register(new Emitter());
        this.onDidFinishSync = this._onDidFinishSync.event;
        this.manifest = null;
    }
    start() {
        this._register(this.onDidFinishSync(() => this.waitUntilNextIntervalAndSync()));
        this._register(toDisposable(() => {
            if (this.syncPromise) {
                this.syncPromise.cancel();
                this.logService.info('Auto sync: Cancelled sync that is in progress');
                this.syncPromise = undefined;
            }
            this.syncTask?.stop();
            this.logService.info('Auto Sync: Stopped');
        }));
        this.sync(AutoSync.INTERVAL_SYNCING, false);
    }
    waitUntilNextIntervalAndSync() {
        this.intervalHandler.value = disposableTimeout(() => {
            this.sync(AutoSync.INTERVAL_SYNCING, false);
            this.intervalHandler.value = undefined;
        }, this.interval);
    }
    sync(reason, disableCache) {
        const syncPromise = createCancelablePromise(async (token) => {
            if (this.syncPromise) {
                try {
                    this.logService.debug('Auto Sync: Waiting until sync is finished.');
                    await this.syncPromise;
                }
                catch (error) {
                    if (isCancellationError(error)) {
                        return;
                    }
                }
            }
            return this.doSync(reason, disableCache, token);
        });
        this.syncPromise = syncPromise;
        this.syncPromise.finally(() => this.syncPromise = undefined);
        return this.syncPromise;
    }
    hasSyncServiceChanged() {
        return this.lastSyncUrl !== undefined && !isEqual(this.lastSyncUrl, this.userDataSyncStoreManagementService.userDataSyncStore?.url);
    }
    async hasDefaultServiceChanged() {
        const previous = await this.userDataSyncStoreManagementService.getPreviousUserDataSyncStore();
        const current = this.userDataSyncStoreManagementService.userDataSyncStore;
        return !!current && !!previous &&
            (!isEqual(current.defaultUrl, previous.defaultUrl) ||
                !isEqual(current.insidersUrl, previous.insidersUrl) ||
                !isEqual(current.stableUrl, previous.stableUrl));
    }
    async doSync(reason, disableCache, token) {
        this.logService.info(`Auto Sync: Triggered by ${reason}`);
        this._onDidStartSync.fire();
        let error;
        try {
            await this.createAndRunSyncTask(disableCache, token);
        }
        catch (e) {
            this.logService.error(e);
            error = e;
            if (UserDataSyncError.toUserDataSyncError(e).code === "MethodNotFound") {
                try {
                    this.logService.info('Auto Sync: Client is making invalid requests. Cleaning up data...');
                    await this.userDataSyncService.cleanUpRemoteData();
                    this.logService.info('Auto Sync: Retrying sync...');
                    await this.createAndRunSyncTask(disableCache, token);
                    error = undefined;
                }
                catch (e1) {
                    this.logService.error(e1);
                    error = e1;
                }
            }
        }
        this._onDidFinishSync.fire(error);
    }
    async createAndRunSyncTask(disableCache, token) {
        this.syncTask = await this.userDataSyncService.createSyncTask(this.manifest, disableCache);
        if (token.isCancellationRequested) {
            return;
        }
        this.manifest = this.syncTask.manifest;
        if (this.manifest === null && await this.userDataSyncService.hasPreviouslySynced()) {
            if (this.hasSyncServiceChanged()) {
                if (await this.hasDefaultServiceChanged()) {
                    throw new UserDataAutoSyncError(localize('default service changed', "Cannot sync because default service has changed"), "DefaultServiceChanged");
                }
                else {
                    throw new UserDataAutoSyncError(localize('service changed', "Cannot sync because sync service has changed"), "ServiceChanged");
                }
            }
            else {
                throw new UserDataAutoSyncError(localize('turned off', "Cannot sync because syncing is turned off in the cloud"), "TurnedOff");
            }
        }
        const sessionId = this.storageService.get(sessionIdKey, -1);
        if (sessionId && this.manifest && sessionId !== this.manifest.session) {
            if (this.hasSyncServiceChanged()) {
                if (await this.hasDefaultServiceChanged()) {
                    throw new UserDataAutoSyncError(localize('default service changed', "Cannot sync because default service has changed"), "DefaultServiceChanged");
                }
                else {
                    throw new UserDataAutoSyncError(localize('service changed', "Cannot sync because sync service has changed"), "ServiceChanged");
                }
            }
            else {
                throw new UserDataAutoSyncError(localize('session expired', "Cannot sync because current session is expired"), "SessionExpired");
            }
        }
        const machines = await this.userDataSyncMachinesService.getMachines(this.manifest || undefined);
        if (token.isCancellationRequested) {
            return;
        }
        const currentMachine = machines.find(machine => machine.isCurrent);
        if (currentMachine?.disabled) {
            throw new UserDataAutoSyncError(localize('turned off machine', "Cannot sync because syncing is turned off on this machine from another machine."), "TurnedOff");
        }
        const startTime = new Date().getTime();
        await this.syncTask.run();
        this.telemetryService.publicLog2('settingsSync:sync', { duration: new Date().getTime() - startTime });
        if (this.manifest === null) {
            try {
                this.manifest = await this.userDataSyncStoreService.manifest(null);
            }
            catch (error) {
                throw new UserDataAutoSyncError(toErrorMessage(error), error instanceof UserDataSyncError ? error.code : "Unknown");
            }
        }
        if (this.manifest && this.manifest.session !== sessionId) {
            this.storageService.store(sessionIdKey, this.manifest.session, -1, 1);
        }
        if (token.isCancellationRequested) {
            return;
        }
        if (!currentMachine) {
            await this.userDataSyncMachinesService.addCurrentMachine(this.manifest || undefined);
        }
    }
    register(t) {
        return super._register(t);
    }
}
