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
import { Schemas } from '../../../base/common/network.js';
import { isWeb } from '../../../base/common/platform.js';
import { isString } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { localize } from '../../../nls.js';
import { CommandsRegistry, ICommandService } from '../../../platform/commands/common/commands.js';
import { IExtensionGalleryService, IExtensionManagementService } from '../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionManagementCLI } from '../../../platform/extensionManagement/common/extensionManagementCLI.js';
import { getExtensionId } from '../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../platform/instantiation/common/serviceCollection.js';
import { ILabelService } from '../../../platform/label/common/label.js';
import { AbstractMessageLogger } from '../../../platform/log/common/log.js';
import { IOpenerService } from '../../../platform/opener/common/opener.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
import { IExtensionManagementServerService } from '../../services/extensionManagement/common/extensionManagement.js';
import { IExtensionManifestPropertiesService } from '../../services/extensions/common/extensionManifestPropertiesService.js';
// this class contains the commands that the CLI server is reying on
CommandsRegistry.registerCommand('_remoteCLI.openExternal', function (accessor, uri) {
    const openerService = accessor.get(IOpenerService);
    return openerService.open(isString(uri) ? uri : URI.revive(uri), { openExternal: true, allowTunneling: true });
});
CommandsRegistry.registerCommand('_remoteCLI.windowOpen', function (accessor, toOpen, options) {
    const commandService = accessor.get(ICommandService);
    if (!toOpen.length) {
        return commandService.executeCommand('_files.newWindow', options);
    }
    return commandService.executeCommand('_files.windowOpen', toOpen, options);
});
CommandsRegistry.registerCommand('_remoteCLI.getSystemStatus', function (accessor) {
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand('_issues.getSystemStatus');
});
CommandsRegistry.registerCommand('_remoteCLI.manageExtensions', async function (accessor, args) {
    const instantiationService = accessor.get(IInstantiationService);
    const extensionManagementServerService = accessor.get(IExtensionManagementServerService);
    const remoteExtensionManagementService = extensionManagementServerService.remoteExtensionManagementServer?.extensionManagementService;
    if (!remoteExtensionManagementService) {
        return;
    }
    const lines = [];
    const logger = new class extends AbstractMessageLogger {
        log(level, message) {
            lines.push(message);
        }
    }();
    const childInstantiationService = instantiationService.createChild(new ServiceCollection([IExtensionManagementService, remoteExtensionManagementService]));
    try {
        const cliService = childInstantiationService.createInstance(RemoteExtensionManagementCLI, logger);
        if (args.list) {
            await cliService.listExtensions(!!args.list.showVersions, args.list.category, undefined);
        }
        else {
            const revive = (inputs) => inputs.map(input => isString(input) ? input : URI.revive(input));
            if (Array.isArray(args.install) && args.install.length) {
                try {
                    await cliService.installExtensions(revive(args.install), [], { isMachineScoped: true }, !!args.force);
                }
                catch (e) {
                    lines.push(e.message);
                }
            }
            if (Array.isArray(args.uninstall) && args.uninstall.length) {
                try {
                    await cliService.uninstallExtensions(revive(args.uninstall), !!args.force, undefined);
                }
                catch (e) {
                    lines.push(e.message);
                }
            }
        }
        return lines.join('\n');
    }
    finally {
        childInstantiationService.dispose();
    }
});
let RemoteExtensionManagementCLI = class RemoteExtensionManagementCLI extends ExtensionManagementCLI {
    constructor(logger, extensionManagementService, extensionGalleryService, labelService, envService, _extensionManifestPropertiesService) {
        super(logger, extensionManagementService, extensionGalleryService);
        this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
        const remoteAuthority = envService.remoteAuthority;
        this._location = remoteAuthority ? labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority) : undefined;
    }
    get location() {
        return this._location;
    }
    validateExtensionKind(manifest) {
        if (!this._extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)
            // Web extensions installed on remote can be run in web worker extension host
            && !(isWeb && this._extensionManifestPropertiesService.canExecuteOnWeb(manifest))) {
            this.logger.info(localize('cannot be installed', "Cannot install the '{0}' extension because it is declared to not run in this setup.", getExtensionId(manifest.publisher, manifest.name)));
            return false;
        }
        return true;
    }
};
RemoteExtensionManagementCLI = __decorate([
    __param(1, IExtensionManagementService),
    __param(2, IExtensionGalleryService),
    __param(3, ILabelService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, IExtensionManifestPropertiesService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], RemoteExtensionManagementCLI);
