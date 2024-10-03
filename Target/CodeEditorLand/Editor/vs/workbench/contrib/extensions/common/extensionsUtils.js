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
import { localize } from '../../../../nls.js';
import { Event } from '../../../../base/common/event.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IExtensionRecommendationsService } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { Severity, INotificationService } from '../../../../platform/notification/common/notification.js';
let KeymapExtensions = class KeymapExtensions extends Disposable {
    constructor(instantiationService, extensionEnablementService, tipsService, lifecycleService, notificationService) {
        super();
        this.instantiationService = instantiationService;
        this.extensionEnablementService = extensionEnablementService;
        this.tipsService = tipsService;
        this.notificationService = notificationService;
        this._register(lifecycleService.onDidShutdown(() => this.dispose()));
        this._register(instantiationService.invokeFunction(onExtensionChanged)((identifiers => {
            Promise.all(identifiers.map(identifier => this.checkForOtherKeymaps(identifier)))
                .then(undefined, onUnexpectedError);
        })));
    }
    checkForOtherKeymaps(extensionIdentifier) {
        return this.instantiationService.invokeFunction(getInstalledExtensions).then(extensions => {
            const keymaps = extensions.filter(extension => isKeymapExtension(this.tipsService, extension));
            const extension = keymaps.find(extension => areSameExtensions(extension.identifier, extensionIdentifier));
            if (extension && extension.globallyEnabled) {
                const otherKeymaps = keymaps.filter(extension => !areSameExtensions(extension.identifier, extensionIdentifier) && extension.globallyEnabled);
                if (otherKeymaps.length) {
                    return this.promptForDisablingOtherKeymaps(extension, otherKeymaps);
                }
            }
            return undefined;
        });
    }
    promptForDisablingOtherKeymaps(newKeymap, oldKeymaps) {
        const onPrompt = (confirmed) => {
            if (confirmed) {
                this.extensionEnablementService.setEnablement(oldKeymaps.map(keymap => keymap.local), 7);
            }
        };
        this.notificationService.prompt(Severity.Info, localize('disableOtherKeymapsConfirmation', "Disable other keymaps ({0}) to avoid conflicts between keybindings?", oldKeymaps.map(k => `'${k.local.manifest.displayName}'`).join(', ')), [{
                label: localize('yes', "Yes"),
                run: () => onPrompt(true)
            }, {
                label: localize('no', "No"),
                run: () => onPrompt(false)
            }]);
    }
};
KeymapExtensions = __decorate([
    __param(0, IInstantiationService),
    __param(1, IWorkbenchExtensionEnablementService),
    __param(2, IExtensionRecommendationsService),
    __param(3, ILifecycleService),
    __param(4, INotificationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], KeymapExtensions);
export { KeymapExtensions };
function onExtensionChanged(accessor) {
    const extensionService = accessor.get(IExtensionManagementService);
    const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
    const onDidInstallExtensions = Event.chain(extensionService.onDidInstallExtensions, $ => $.filter(e => e.some(({ operation }) => operation === 2))
        .map(e => e.map(({ identifier }) => identifier)));
    return Event.debounce(Event.any(Event.any(onDidInstallExtensions, Event.map(extensionService.onDidUninstallExtension, e => [e.identifier])), Event.map(extensionEnablementService.onEnablementChanged, extensions => extensions.map(e => e.identifier))), (result, identifiers) => {
        result = result || [];
        for (const identifier of identifiers) {
            if (result.some(l => !areSameExtensions(l, identifier))) {
                result.push(identifier);
            }
        }
        return result;
    });
}
export async function getInstalledExtensions(accessor) {
    const extensionService = accessor.get(IExtensionManagementService);
    const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
    const extensions = await extensionService.getInstalled();
    return extensions.map(extension => {
        return {
            identifier: extension.identifier,
            local: extension,
            globallyEnabled: extensionEnablementService.isEnabled(extension)
        };
    });
}
function isKeymapExtension(tipsService, extension) {
    const cats = extension.local.manifest.categories;
    return cats && cats.indexOf('Keymaps') !== -1 || tipsService.getKeymapRecommendations().some(extensionId => areSameExtensions({ id: extensionId }, extension.local.identifier));
}
