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
import { IRemoteAgentService, remoteConnectionLatencyMeasurer } from '../../../services/remote/common/remoteAgentService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { localize } from '../../../../nls.js';
import { isWeb } from '../../../../base/common/platform.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { getRemoteName } from '../../../../platform/remote/common/remoteHosts.js';
import { IBannerService } from '../../../services/banner/browser/bannerService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { Codicon } from '../../../../base/common/codicons.js';
import Severity from '../../../../base/common/severity.js';
const REMOTE_UNSUPPORTED_CONNECTION_CHOICE_KEY = 'remote.unsupportedConnectionChoice';
const BANNER_REMOTE_UNSUPPORTED_CONNECTION_DISMISSED_KEY = 'workbench.banner.remote.unsupportedConnection.dismissed';
let InitialRemoteConnectionHealthContribution = class InitialRemoteConnectionHealthContribution {
    constructor(_remoteAgentService, _environmentService, _telemetryService, bannerService, dialogService, openerService, hostService, storageService, productService) {
        this._remoteAgentService = _remoteAgentService;
        this._environmentService = _environmentService;
        this._telemetryService = _telemetryService;
        this.bannerService = bannerService;
        this.dialogService = dialogService;
        this.openerService = openerService;
        this.hostService = hostService;
        this.storageService = storageService;
        this.productService = productService;
        if (this._environmentService.remoteAuthority) {
            this._checkInitialRemoteConnectionHealth();
        }
    }
    async _confirmConnection() {
        const { result, checkboxChecked } = await this.dialogService.prompt({
            type: Severity.Warning,
            message: localize('unsupportedGlibcWarning', "You are about to connect to an OS version that is unsupported by {0}.", this.productService.nameLong),
            buttons: [
                {
                    label: localize({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow"),
                    run: () => 1 /* ConnectionChoice.Allow */
                },
                {
                    label: localize({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
                    run: async () => { await this.openerService.open('https://aka.ms/vscode-remote/faq/old-linux'); return 2 /* ConnectionChoice.LearnMore */; }
                }
            ],
            cancelButton: {
                run: () => 0 /* ConnectionChoice.Cancel */
            },
            checkbox: {
                label: localize('remember', "Do not show again"),
            }
        });
        if (result === 2 /* ConnectionChoice.LearnMore */) {
            return await this._confirmConnection();
        }
        const allowed = result === 1 /* ConnectionChoice.Allow */;
        if (allowed && checkboxChecked) {
            this.storageService.store(`${REMOTE_UNSUPPORTED_CONNECTION_CHOICE_KEY}.${this._environmentService.remoteAuthority}`, allowed, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        return allowed;
    }
    async _checkInitialRemoteConnectionHealth() {
        try {
            const environment = await this._remoteAgentService.getRawEnvironment();
            if (environment && environment.isUnsupportedGlibc) {
                let allowed = this.storageService.getBoolean(`${REMOTE_UNSUPPORTED_CONNECTION_CHOICE_KEY}.${this._environmentService.remoteAuthority}`, 0 /* StorageScope.PROFILE */);
                if (allowed === undefined) {
                    allowed = await this._confirmConnection();
                }
                if (allowed) {
                    const bannerDismissedVersion = this.storageService.get(`${BANNER_REMOTE_UNSUPPORTED_CONNECTION_DISMISSED_KEY}`, 0 /* StorageScope.PROFILE */) ?? '';
                    // Ignore patch versions and dismiss the banner if the major and minor versions match.
                    const shouldShowBanner = bannerDismissedVersion.slice(0, bannerDismissedVersion.lastIndexOf('.')) !== this.productService.version.slice(0, this.productService.version.lastIndexOf('.'));
                    if (shouldShowBanner) {
                        const actions = [
                            {
                                label: localize('unsupportedGlibcBannerLearnMore', "Learn More"),
                                href: 'https://aka.ms/vscode-remote/faq/old-linux'
                            }
                        ];
                        this.bannerService.show({
                            id: 'unsupportedGlibcWarning.banner',
                            message: localize('unsupportedGlibcWarning.banner', "You are connected to an OS version that is unsupported by {0}.", this.productService.nameLong),
                            actions,
                            icon: Codicon.warning,
                            closeLabel: `Do not show again in v${this.productService.version}`,
                            onClose: () => {
                                this.storageService.store(`${BANNER_REMOTE_UNSUPPORTED_CONNECTION_DISMISSED_KEY}`, this.productService.version, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                            }
                        });
                    }
                }
                else {
                    this.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: null });
                    return;
                }
            }
            this._telemetryService.publicLog2('remoteConnectionSuccess', {
                web: isWeb,
                connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                remoteName: getRemoteName(this._environmentService.remoteAuthority)
            });
            await this._measureExtHostLatency();
        }
        catch (err) {
            this._telemetryService.publicLog2('remoteConnectionFailure', {
                web: isWeb,
                connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                remoteName: getRemoteName(this._environmentService.remoteAuthority),
                message: err ? err.message : ''
            });
        }
    }
    async _measureExtHostLatency() {
        const measurement = await remoteConnectionLatencyMeasurer.measure(this._remoteAgentService);
        if (measurement === undefined) {
            return;
        }
        this._telemetryService.publicLog2('remoteConnectionLatency', {
            web: isWeb,
            remoteName: getRemoteName(this._environmentService.remoteAuthority),
            latencyMs: measurement.current
        });
    }
};
InitialRemoteConnectionHealthContribution = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, ITelemetryService),
    __param(3, IBannerService),
    __param(4, IDialogService),
    __param(5, IOpenerService),
    __param(6, IHostService),
    __param(7, IStorageService),
    __param(8, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], InitialRemoteConnectionHealthContribution);
export { InitialRemoteConnectionHealthContribution };
