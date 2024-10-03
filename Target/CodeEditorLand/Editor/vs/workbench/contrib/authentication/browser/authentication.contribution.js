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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isFalsyOrWhitespace } from '../../../../base/common/strings.js';
import { localize } from '../../../../nls.js';
import { MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { SignOutOfAccountAction } from './actions/signOutOfAccountAction.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { Extensions } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { ExtensionsRegistry } from '../../../services/extensions/common/extensionsRegistry.js';
import { ManageTrustedExtensionsForAccountAction } from './actions/manageTrustedExtensionsForAccountAction.js';
import { ManageAccountPreferencesForExtensionAction } from './actions/manageAccountPreferencesForExtensionAction.js';
import { IAuthenticationUsageService } from '../../../services/authentication/browser/authenticationUsageService.js';
const codeExchangeProxyCommand = CommandsRegistry.registerCommand('workbench.getCodeExchangeProxyEndpoints', function (accessor, _) {
    const environmentService = accessor.get(IBrowserWorkbenchEnvironmentService);
    return environmentService.options?.codeExchangeProxyEndpoints;
});
const authenticationDefinitionSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            description: localize('authentication.id', 'The id of the authentication provider.')
        },
        label: {
            type: 'string',
            description: localize('authentication.label', 'The human readable name of the authentication provider.'),
        }
    }
};
const authenticationExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'authentication',
    jsonSchema: {
        description: localize({ key: 'authenticationExtensionPoint', comment: [`'Contributes' means adds here`] }, 'Contributes authentication'),
        type: 'array',
        items: authenticationDefinitionSchema
    },
    activationEventsGenerator: (authenticationProviders, result) => {
        for (const authenticationProvider of authenticationProviders) {
            if (authenticationProvider.id) {
                result.push(`onAuthenticationRequest:${authenticationProvider.id}`);
            }
        }
    }
});
class AuthenticationDataRenderer extends Disposable {
    constructor() {
        super(...arguments);
        this.type = 'table';
    }
    shouldRender(manifest) {
        return !!manifest.contributes?.authentication;
    }
    render(manifest) {
        const authentication = manifest.contributes?.authentication || [];
        if (!authentication.length) {
            return { data: { headers: [], rows: [] }, dispose: () => { } };
        }
        const headers = [
            localize('authenticationlabel', "Label"),
            localize('authenticationid', "ID"),
        ];
        const rows = authentication
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(auth => {
            return [
                auth.label,
                auth.id,
            ];
        });
        return {
            data: {
                headers,
                rows
            },
            dispose: () => { }
        };
    }
}
const extensionFeature = Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
    id: 'authentication',
    label: localize('authentication', "Authentication"),
    access: {
        canToggle: false
    },
    renderer: new SyncDescriptor(AuthenticationDataRenderer),
});
let AuthenticationContribution = class AuthenticationContribution extends Disposable {
    static { this.ID = 'workbench.contrib.authentication'; }
    constructor(_authenticationService) {
        super();
        this._authenticationService = _authenticationService;
        this._placeholderMenuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
            command: {
                id: 'noAuthenticationProviders',
                title: localize('authentication.Placeholder', "No accounts requested yet..."),
                precondition: ContextKeyExpr.false()
            },
        });
        this._register(codeExchangeProxyCommand);
        this._register(extensionFeature);
        if (_authenticationService.getProviderIds().length) {
            this._clearPlaceholderMenuItem();
        }
        this._registerHandlers();
        this._registerAuthenticationExtentionPointHandler();
        this._registerActions();
    }
    _registerAuthenticationExtentionPointHandler() {
        authenticationExtPoint.setHandler((extensions, { added, removed }) => {
            added.forEach(point => {
                for (const provider of point.value) {
                    if (isFalsyOrWhitespace(provider.id)) {
                        point.collector.error(localize('authentication.missingId', 'An authentication contribution must specify an id.'));
                        continue;
                    }
                    if (isFalsyOrWhitespace(provider.label)) {
                        point.collector.error(localize('authentication.missingLabel', 'An authentication contribution must specify a label.'));
                        continue;
                    }
                    if (!this._authenticationService.declaredProviders.some(p => p.id === provider.id)) {
                        this._authenticationService.registerDeclaredAuthenticationProvider(provider);
                    }
                    else {
                        point.collector.error(localize('authentication.idConflict', "This authentication id '{0}' has already been registered", provider.id));
                    }
                }
            });
            const removedExtPoints = removed.flatMap(r => r.value);
            removedExtPoints.forEach(point => {
                const provider = this._authenticationService.declaredProviders.find(provider => provider.id === point.id);
                if (provider) {
                    this._authenticationService.unregisterDeclaredAuthenticationProvider(provider.id);
                }
            });
        });
    }
    _registerHandlers() {
        this._register(this._authenticationService.onDidRegisterAuthenticationProvider(_e => {
            this._clearPlaceholderMenuItem();
        }));
        this._register(this._authenticationService.onDidUnregisterAuthenticationProvider(_e => {
            if (!this._authenticationService.getProviderIds().length) {
                this._placeholderMenuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
                    command: {
                        id: 'noAuthenticationProviders',
                        title: localize('loading', "Loading..."),
                        precondition: ContextKeyExpr.false()
                    }
                });
            }
        }));
    }
    _registerActions() {
        this._register(registerAction2(SignOutOfAccountAction));
        this._register(registerAction2(ManageTrustedExtensionsForAccountAction));
        this._register(registerAction2(ManageAccountPreferencesForExtensionAction));
    }
    _clearPlaceholderMenuItem() {
        this._placeholderMenuItem?.dispose();
        this._placeholderMenuItem = undefined;
    }
};
AuthenticationContribution = __decorate([
    __param(0, IAuthenticationService),
    __metadata("design:paramtypes", [Object])
], AuthenticationContribution);
let AuthenticationUsageContribution = class AuthenticationUsageContribution {
    static { this.ID = 'workbench.contrib.authenticationUsage'; }
    constructor(_authenticationUsageService) {
        this._authenticationUsageService = _authenticationUsageService;
        this._initializeExtensionUsageCache();
    }
    async _initializeExtensionUsageCache() {
        await this._authenticationUsageService.initializeExtensionUsageCache();
    }
};
AuthenticationUsageContribution = __decorate([
    __param(0, IAuthenticationUsageService),
    __metadata("design:paramtypes", [Object])
], AuthenticationUsageContribution);
registerWorkbenchContribution2(AuthenticationContribution.ID, AuthenticationContribution, 3);
registerWorkbenchContribution2(AuthenticationUsageContribution.ID, AuthenticationUsageContribution, 4);
