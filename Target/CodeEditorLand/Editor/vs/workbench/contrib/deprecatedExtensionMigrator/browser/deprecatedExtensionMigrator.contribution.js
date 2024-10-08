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
import { Action } from '../../../../base/common/actions.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { isDefined } from '../../../../base/common/types.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
let DeprecatedExtensionMigratorContribution = class DeprecatedExtensionMigratorContribution {
    constructor(configurationService, extensionsWorkbenchService, storageService, notificationService, openerService) {
        this.configurationService = configurationService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.storageKey = 'deprecatedExtensionMigrator.state';
        this.init().catch(onUnexpectedError);
    }
    async init() {
        const bracketPairColorizerId = 'coenraads.bracket-pair-colorizer';
        await this.extensionsWorkbenchService.queryLocal();
        const extension = this.extensionsWorkbenchService.installed.find(e => e.identifier.id === bracketPairColorizerId);
        if (!extension ||
            ((extension.enablementState !== 9 /* EnablementState.EnabledGlobally */) &&
                (extension.enablementState !== 10 /* EnablementState.EnabledWorkspace */))) {
            return;
        }
        const state = await this.getState();
        const disablementLogEntry = state.disablementLog.some(d => d.extensionId === bracketPairColorizerId);
        if (disablementLogEntry) {
            return;
        }
        state.disablementLog.push({ extensionId: bracketPairColorizerId, disablementDateTime: new Date().getTime() });
        await this.setState(state);
        await this.extensionsWorkbenchService.setEnablement(extension, 7 /* EnablementState.DisabledGlobally */);
        const nativeBracketPairColorizationEnabledKey = 'editor.bracketPairColorization.enabled';
        const bracketPairColorizationEnabled = !!this.configurationService.inspect(nativeBracketPairColorizationEnabledKey).user;
        this.notificationService.notify({
            message: localize('bracketPairColorizer.notification', "The extension 'Bracket pair Colorizer' got disabled because it was deprecated."),
            severity: Severity.Info,
            actions: {
                primary: [
                    new Action('', localize('bracketPairColorizer.notification.action.uninstall', "Uninstall Extension"), undefined, undefined, () => {
                        this.extensionsWorkbenchService.uninstall(extension);
                    }),
                ],
                secondary: [
                    !bracketPairColorizationEnabled ? new Action('', localize('bracketPairColorizer.notification.action.enableNative', "Enable Native Bracket Pair Colorization"), undefined, undefined, () => {
                        this.configurationService.updateValue(nativeBracketPairColorizationEnabledKey, true, 2 /* ConfigurationTarget.USER */);
                    }) : undefined,
                    new Action('', localize('bracketPairColorizer.notification.action.showMoreInfo', "More Info"), undefined, undefined, () => {
                        this.openerService.open('https://github.com/microsoft/vscode/issues/155179');
                    }),
                ].filter(isDefined),
            }
        });
    }
    async getState() {
        const jsonStr = await this.storageService.get(this.storageKey, -1 /* StorageScope.APPLICATION */, '');
        if (jsonStr === '') {
            return { disablementLog: [] };
        }
        return JSON.parse(jsonStr);
    }
    async setState(state) {
        const json = JSON.stringify(state);
        await this.storageService.store(this.storageKey, json, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
    }
};
DeprecatedExtensionMigratorContribution = __decorate([
    __param(0, IConfigurationService),
    __param(1, IExtensionsWorkbenchService),
    __param(2, IStorageService),
    __param(3, INotificationService),
    __param(4, IOpenerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], DeprecatedExtensionMigratorContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(DeprecatedExtensionMigratorContribution, 3 /* LifecyclePhase.Restored */);
