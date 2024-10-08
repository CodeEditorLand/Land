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
var ExtensionUrlBootstrapHandler_1;
import { localize, localize2 } from '../../../../nls.js';
import { combinedDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IURLService } from '../../../../platform/url/common/url.js';
import { IHostService } from '../../host/browser/host.js';
import { IExtensionService } from '../common/extensions.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IsWebContext } from '../../../../platform/contextkey/common/contextkeys.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { disposableWindowInterval } from '../../../../base/browser/dom.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;
const URL_TO_HANDLE = 'extensionUrlHandler.urlToHandle';
const USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY = 'extensions.confirmedUriHandlerExtensionIds';
const USER_TRUSTED_EXTENSIONS_STORAGE_KEY = 'extensionUrlHandler.confirmedExtensions';
function isExtensionId(value) {
    return /^[a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*$/i.test(value);
}
class UserTrustedExtensionIdStorage {
    get extensions() {
        const userTrustedExtensionIdsJson = this.storageService.get(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, 0 /* StorageScope.PROFILE */, '[]');
        try {
            return JSON.parse(userTrustedExtensionIdsJson);
        }
        catch {
            return [];
        }
    }
    constructor(storageService) {
        this.storageService = storageService;
    }
    has(id) {
        return this.extensions.indexOf(id) > -1;
    }
    add(id) {
        this.set([...this.extensions, id]);
    }
    set(ids) {
        this.storageService.store(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, JSON.stringify(ids), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
}
export const IExtensionUrlHandler = createDecorator('extensionUrlHandler');
/**
 * This class handles URLs which are directed towards extensions.
 * If a URL is directed towards an inactive extension, it buffers it,
 * activates the extension and re-opens the URL once the extension registers
 * a URL handler. If the extension never registers a URL handler, the urls
 * will eventually be garbage collected.
 *
 * It also makes sure the user confirms opening URLs directed towards extensions.
 */
let ExtensionUrlHandler = class ExtensionUrlHandler {
    constructor(urlService, extensionService, dialogService, commandService, hostService, storageService, configurationService, telemetryService, notificationService, productService, workbenchEnvironmentService) {
        this.extensionService = extensionService;
        this.dialogService = dialogService;
        this.commandService = commandService;
        this.hostService = hostService;
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.telemetryService = telemetryService;
        this.notificationService = notificationService;
        this.productService = productService;
        this.workbenchEnvironmentService = workbenchEnvironmentService;
        this.extensionHandlers = new Map();
        this.uriBuffer = new Map();
        this.userTrustedExtensionsStorage = new UserTrustedExtensionIdStorage(storageService);
        const interval = disposableWindowInterval(mainWindow, () => this.garbageCollect(), THIRTY_SECONDS);
        const urlToHandleValue = this.storageService.get(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
        if (urlToHandleValue) {
            this.storageService.remove(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
            this.handleURL(URI.revive(JSON.parse(urlToHandleValue)), { trusted: true });
        }
        this.disposable = combinedDisposable(urlService.registerHandler(this), interval);
        const cache = ExtensionUrlBootstrapHandler.cache;
        setTimeout(() => cache.forEach(([uri, option]) => this.handleURL(uri, option)));
    }
    async handleURL(uri, options) {
        if (!isExtensionId(uri.authority)) {
            return false;
        }
        const extensionId = uri.authority;
        this.telemetryService.publicLog2('uri_invoked/start', { extensionId });
        const initialHandler = this.extensionHandlers.get(ExtensionIdentifier.toKey(extensionId));
        let extensionDisplayName;
        if (!initialHandler) {
            // The extension is not yet activated, so let's check if it is installed and enabled
            const extension = await this.extensionService.getExtension(extensionId);
            if (!extension) {
                await this.handleUnhandledURL(uri, extensionId, options);
                return true;
            }
            else {
                extensionDisplayName = extension.displayName ?? '';
            }
        }
        else {
            extensionDisplayName = initialHandler.extensionDisplayName;
        }
        const trusted = options?.trusted
            || this.productService.trustedExtensionProtocolHandlers?.includes(extensionId)
            || this.didUserTrustExtension(ExtensionIdentifier.toKey(extensionId));
        if (!trusted) {
            let uriString = uri.toString(false);
            if (uriString.length > 40) {
                uriString = `${uriString.substring(0, 30)}...${uriString.substring(uriString.length - 5)}`;
            }
            const result = await this.dialogService.confirm({
                message: localize('confirmUrl', "Allow '{0}' extension to open this URI?", extensionDisplayName),
                checkbox: {
                    label: localize('rememberConfirmUrl', "Do not ask me again for this extension"),
                },
                detail: uriString,
                primaryButton: localize({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open")
            });
            if (!result.confirmed) {
                this.telemetryService.publicLog2('uri_invoked/cancel', { extensionId });
                return true;
            }
            if (result.checkboxChecked) {
                this.userTrustedExtensionsStorage.add(ExtensionIdentifier.toKey(extensionId));
            }
        }
        const handler = this.extensionHandlers.get(ExtensionIdentifier.toKey(extensionId));
        if (handler) {
            if (!initialHandler) {
                // forward it directly
                return await this.handleURLByExtension(extensionId, handler, uri, options);
            }
            // let the ExtensionUrlHandler instance handle this
            return false;
        }
        // collect URI for eventual extension activation
        const timestamp = new Date().getTime();
        let uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId));
        if (!uris) {
            uris = [];
            this.uriBuffer.set(ExtensionIdentifier.toKey(extensionId), uris);
        }
        uris.push({ timestamp, uri });
        // activate the extension using ActivationKind.Immediate because URI handling might be part
        // of resolving authorities (via authentication extensions)
        await this.extensionService.activateByEvent(`onUri:${ExtensionIdentifier.toKey(extensionId)}`, 1 /* ActivationKind.Immediate */);
        return true;
    }
    registerExtensionHandler(extensionId, handler) {
        this.extensionHandlers.set(ExtensionIdentifier.toKey(extensionId), handler);
        const uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId)) || [];
        for (const { uri } of uris) {
            this.handleURLByExtension(extensionId, handler, uri);
        }
        this.uriBuffer.delete(ExtensionIdentifier.toKey(extensionId));
    }
    unregisterExtensionHandler(extensionId) {
        this.extensionHandlers.delete(ExtensionIdentifier.toKey(extensionId));
    }
    async handleURLByExtension(extensionId, handler, uri, options) {
        this.telemetryService.publicLog2('uri_invoked/end', { extensionId: ExtensionIdentifier.toKey(extensionId) });
        return await handler.handleURL(uri, options);
    }
    async handleUnhandledURL(uri, extensionId, options) {
        this.telemetryService.publicLog2('uri_invoked/install_extension/start', { extensionId });
        try {
            await this.commandService.executeCommand('workbench.extensions.installExtension', extensionId, {
                justification: {
                    reason: `${localize('installDetail', "This extension wants to open a URI:")}\n${uri.toString()}`,
                    action: localize('openUri', "Open URI")
                },
                enable: true
            });
            this.telemetryService.publicLog2('uri_invoked/install_extension/accept', { extensionId });
        }
        catch (error) {
            if (isCancellationError(error)) {
                this.telemetryService.publicLog2('uri_invoked/install_extension/cancel', { extensionId });
            }
            else {
                this.telemetryService.publicLog2('uri_invoked/install_extension/error', { extensionId });
                this.notificationService.error(error);
            }
            return;
        }
        const extension = await this.extensionService.getExtension(extensionId);
        if (extension) {
            await this.handleURL(uri, { ...options, trusted: true });
        }
        /* Extension cannot be added and require window reload */
        else {
            this.telemetryService.publicLog2('uri_invoked/install_extension/reload', { extensionId, isRemote: !!this.workbenchEnvironmentService.remoteAuthority });
            const result = await this.dialogService.confirm({
                message: localize('reloadAndHandle', "Extension '{0}' is not loaded. Would you like to reload the window to load the extension and open the URL?", extensionId),
                primaryButton: localize({ key: 'reloadAndOpen', comment: ['&& denotes a mnemonic'] }, "&&Reload Window and Open")
            });
            if (!result.confirmed) {
                return;
            }
            this.storageService.store(URL_TO_HANDLE, JSON.stringify(uri.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            await this.hostService.reload();
        }
    }
    // forget about all uris buffered more than 5 minutes ago
    garbageCollect() {
        const now = new Date().getTime();
        const uriBuffer = new Map();
        this.uriBuffer.forEach((uris, extensionId) => {
            uris = uris.filter(({ timestamp }) => now - timestamp < FIVE_MINUTES);
            if (uris.length > 0) {
                uriBuffer.set(extensionId, uris);
            }
        });
        this.uriBuffer = uriBuffer;
    }
    didUserTrustExtension(id) {
        if (this.userTrustedExtensionsStorage.has(id)) {
            return true;
        }
        return this.getConfirmedTrustedExtensionIdsFromConfiguration().indexOf(id) > -1;
    }
    getConfirmedTrustedExtensionIdsFromConfiguration() {
        const trustedExtensionIds = this.configurationService.getValue(USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY);
        if (!Array.isArray(trustedExtensionIds)) {
            return [];
        }
        return trustedExtensionIds;
    }
    dispose() {
        this.disposable.dispose();
        this.extensionHandlers.clear();
        this.uriBuffer.clear();
    }
};
ExtensionUrlHandler = __decorate([
    __param(0, IURLService),
    __param(1, IExtensionService),
    __param(2, IDialogService),
    __param(3, ICommandService),
    __param(4, IHostService),
    __param(5, IStorageService),
    __param(6, IConfigurationService),
    __param(7, ITelemetryService),
    __param(8, INotificationService),
    __param(9, IProductService),
    __param(10, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExtensionUrlHandler);
registerSingleton(IExtensionUrlHandler, ExtensionUrlHandler, 0 /* InstantiationType.Eager */);
/**
 * This class handles URLs before `ExtensionUrlHandler` is instantiated.
 * More info: https://github.com/microsoft/vscode/issues/73101
 */
let ExtensionUrlBootstrapHandler = class ExtensionUrlBootstrapHandler {
    static { ExtensionUrlBootstrapHandler_1 = this; }
    static { this.ID = 'workbench.contrib.extensionUrlBootstrapHandler'; }
    static { this._cache = []; }
    static get cache() {
        ExtensionUrlBootstrapHandler_1.disposable.dispose();
        const result = ExtensionUrlBootstrapHandler_1._cache;
        ExtensionUrlBootstrapHandler_1._cache = [];
        return result;
    }
    constructor(urlService) {
        ExtensionUrlBootstrapHandler_1.disposable = urlService.registerHandler(this);
    }
    async handleURL(uri, options) {
        if (!isExtensionId(uri.authority)) {
            return false;
        }
        ExtensionUrlBootstrapHandler_1._cache.push([uri, options]);
        return true;
    }
};
ExtensionUrlBootstrapHandler = ExtensionUrlBootstrapHandler_1 = __decorate([
    __param(0, IURLService),
    __metadata("design:paramtypes", [Object])
], ExtensionUrlBootstrapHandler);
registerWorkbenchContribution2(ExtensionUrlBootstrapHandler.ID, ExtensionUrlBootstrapHandler, 2 /* WorkbenchPhase.BlockRestore */);
class ManageAuthorizedExtensionURIsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.extensions.action.manageAuthorizedExtensionURIs',
            title: localize2('manage', 'Manage Authorized Extension URIs...'),
            category: localize2('extensions', 'Extensions'),
            menu: {
                id: MenuId.CommandPalette,
                when: IsWebContext.toNegated()
            }
        });
    }
    async run(accessor) {
        const storageService = accessor.get(IStorageService);
        const quickInputService = accessor.get(IQuickInputService);
        const storage = new UserTrustedExtensionIdStorage(storageService);
        const items = storage.extensions.map((label) => ({ label, picked: true }));
        if (items.length === 0) {
            await quickInputService.pick([{ label: localize('no', 'There are currently no authorized extension URIs.') }]);
            return;
        }
        const result = await quickInputService.pick(items, { canPickMany: true });
        if (!result) {
            return;
        }
        storage.set(result.map(item => item.label));
    }
}
registerAction2(ManageAuthorizedExtensionURIsAction);
