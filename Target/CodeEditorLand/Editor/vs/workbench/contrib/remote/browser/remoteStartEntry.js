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
var RemoteStartEntry_1;
import * as nls from '../../../../nls.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export const showStartEntryInWeb = new RawContextKey('showRemoteStartEntryInWeb', false);
let RemoteStartEntry = class RemoteStartEntry extends Disposable {
    static { RemoteStartEntry_1 = this; }
    static { this.REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID = 'workbench.action.remote.showWebStartEntryActions'; }
    constructor(commandService, productService, extensionManagementService, extensionEnablementService, telemetryService, contextKeyService) {
        super();
        this.commandService = commandService;
        this.productService = productService;
        this.extensionManagementService = extensionManagementService;
        this.extensionEnablementService = extensionEnablementService;
        this.telemetryService = telemetryService;
        this.contextKeyService = contextKeyService;
        const remoteExtensionTips = this.productService.remoteExtensionTips?.['tunnel'];
        this.startCommand = remoteExtensionTips?.startEntry?.startCommand ?? '';
        this.remoteExtensionId = remoteExtensionTips?.extensionId ?? '';
        this._init();
        this.registerActions();
        this.registerListeners();
    }
    registerActions() {
        const category = nls.localize2('remote.category', "Remote");
        // Show Remote Start Action
        const startEntry = this;
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: RemoteStartEntry_1.REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID,
                    category,
                    title: nls.localize2('remote.showWebStartEntryActions', "Show Remote Start Entry for web"),
                    f1: false
                });
            }
            async run() {
                await startEntry.showWebRemoteStartActions();
            }
        }));
    }
    registerListeners() {
        this._register(this.extensionEnablementService.onEnablementChanged(async (result) => {
            for (const ext of result) {
                if (ExtensionIdentifier.equals(this.remoteExtensionId, ext.identifier.id)) {
                    if (this.extensionEnablementService.isEnabled(ext)) {
                        showStartEntryInWeb.bindTo(this.contextKeyService).set(true);
                    }
                    else {
                        showStartEntryInWeb.bindTo(this.contextKeyService).set(false);
                    }
                }
            }
        }));
    }
    async _init() {
        // Check if installed and enabled
        const installed = (await this.extensionManagementService.getInstalled()).find(value => ExtensionIdentifier.equals(value.identifier.id, this.remoteExtensionId));
        if (installed) {
            if (this.extensionEnablementService.isEnabled(installed)) {
                showStartEntryInWeb.bindTo(this.contextKeyService).set(true);
            }
        }
    }
    async showWebRemoteStartActions() {
        this.commandService.executeCommand(this.startCommand);
        this.telemetryService.publicLog2('workbenchActionExecuted', {
            id: this.startCommand,
            from: 'remote start entry'
        });
    }
};
RemoteStartEntry = RemoteStartEntry_1 = __decorate([
    __param(0, ICommandService),
    __param(1, IProductService),
    __param(2, IExtensionManagementService),
    __param(3, IWorkbenchExtensionEnablementService),
    __param(4, ITelemetryService),
    __param(5, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], RemoteStartEntry);
export { RemoteStartEntry };
