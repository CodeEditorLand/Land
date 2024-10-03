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
import { Event } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IAuthenticationUsageService } from '../../../../services/authentication/browser/authenticationUsageService.js';
import { IAuthenticationExtensionsService, IAuthenticationService } from '../../../../services/authentication/common/authentication.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
export class ManageAccountPreferencesForExtensionAction extends Action2 {
    constructor() {
        super({
            id: '_manageAccountPreferencesForExtension',
            title: localize2('manageAccountPreferenceForExtension', "Manage Extension Account Preferences"),
            category: localize2('accounts', "Accounts"),
            f1: false
        });
    }
    run(accessor, extensionId, providerId) {
        return accessor.get(IInstantiationService).createInstance(ManageAccountPreferenceForExtensionActionImpl).run(extensionId, providerId);
    }
}
let ManageAccountPreferenceForExtensionActionImpl = class ManageAccountPreferenceForExtensionActionImpl {
    constructor(_authenticationService, _quickInputService, _authenticationUsageService, _authenticationExtensionsService, _extensionService) {
        this._authenticationService = _authenticationService;
        this._quickInputService = _quickInputService;
        this._authenticationUsageService = _authenticationUsageService;
        this._authenticationExtensionsService = _authenticationExtensionsService;
        this._extensionService = _extensionService;
    }
    async run(extensionId, providerId) {
        if (!extensionId) {
            return;
        }
        const extension = await this._extensionService.getExtension(extensionId);
        if (!extension) {
            throw new Error(`No extension with id ${extensionId}`);
        }
        const providerIds = new Array();
        const providerIdToAccounts = new Map();
        if (providerId) {
            providerIds.push(providerId);
            providerIdToAccounts.set(providerId, await this._authenticationService.getAccounts(providerId));
        }
        else {
            for (const providerId of this._authenticationService.getProviderIds()) {
                const accounts = await this._authenticationService.getAccounts(providerId);
                for (const account of accounts) {
                    const usage = this._authenticationUsageService.readAccountUsages(providerId, account.label).find(u => u.extensionId === extensionId.toLowerCase());
                    if (usage) {
                        providerIds.push(providerId);
                        providerIdToAccounts.set(providerId, accounts);
                        break;
                    }
                }
            }
        }
        let chosenProviderId = providerIds[0];
        if (providerIds.length > 1) {
            const result = await this._quickInputService.pick(providerIds.map(providerId => ({
                label: this._authenticationService.getProvider(providerId).label,
                id: providerId,
            })), {
                placeHolder: localize('selectProvider', "Select an authentication provider to manage account preferences for"),
                title: localize('pickAProviderTitle', "Manage Extension Account Preferences")
            });
            chosenProviderId = result?.id;
        }
        if (!chosenProviderId) {
            return;
        }
        const currentAccountNamePreference = this._authenticationExtensionsService.getAccountPreference(extensionId, chosenProviderId);
        const items = this._getItems(providerIdToAccounts.get(chosenProviderId), chosenProviderId, currentAccountNamePreference);
        const disposables = new DisposableStore();
        const picker = this._createQuickPick(disposables, extensionId, extension.displayName ?? extension.name);
        if (items.length === 0) {
            disposables.add(this._handleNoAccounts(picker));
            return;
        }
        picker.items = items;
        picker.show();
    }
    _createQuickPick(disposableStore, extensionId, extensionLabel) {
        const picker = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
        disposableStore.add(picker.onDidHide(() => {
            disposableStore.dispose();
        }));
        picker.placeholder = localize('placeholder', "Manage '{0}' account preferences...", extensionLabel);
        picker.title = localize('title', "'{0}' Account Preferences For This Workspace", extensionLabel);
        picker.sortByLabel = false;
        disposableStore.add(picker.onDidAccept(() => {
            this._accept(extensionId, picker.selectedItems);
            picker.hide();
        }));
        return picker;
    }
    _getItems(accounts, providerId, currentAccountNamePreference) {
        return accounts.map(a => currentAccountNamePreference === a.label
            ? {
                label: a.label,
                account: a,
                providerId,
                description: localize('currentAccount', "Current account"),
                picked: true
            }
            : {
                label: a.label,
                account: a,
                providerId,
            });
    }
    _handleNoAccounts(picker) {
        picker.validationMessage = localize('noAccounts', "No accounts are currently used by this extension.");
        picker.buttons = [this._quickInputService.backButton];
        picker.show();
        return Event.filter(picker.onDidTriggerButton, (e) => e === this._quickInputService.backButton)(() => this.run());
    }
    _accept(extensionId, selectedItems) {
        for (const item of selectedItems) {
            const account = item.account;
            const providerId = item.providerId;
            const currentAccountName = this._authenticationExtensionsService.getAccountPreference(extensionId, providerId);
            if (currentAccountName === account.label) {
                continue;
            }
            this._authenticationExtensionsService.updateAccountPreference(extensionId, providerId, account);
        }
    }
};
ManageAccountPreferenceForExtensionActionImpl = __decorate([
    __param(0, IAuthenticationService),
    __param(1, IQuickInputService),
    __param(2, IAuthenticationUsageService),
    __param(3, IAuthenticationExtensionsService),
    __param(4, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ManageAccountPreferenceForExtensionActionImpl);
