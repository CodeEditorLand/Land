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
import { localize } from '../../nls.js';
import { Extensions as ConfigurationExtensions } from '../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { Emitter } from '../../base/common/event.js';
import { IRemoteAgentService } from '../services/remote/common/remoteAgentService.js';
import { isWindows } from '../../base/common/platform.js';
import { equals } from '../../base/common/objects.js';
import { DeferredPromise } from '../../base/common/async.js';
import { IUserDataProfilesService } from '../../platform/userDataProfile/common/userDataProfile.js';
export const applicationConfigurationNodeBase = Object.freeze({
    'id': 'application',
    'order': 100,
    'title': localize('applicationConfigurationTitle', "Application"),
    'type': 'object'
});
export const workbenchConfigurationNodeBase = Object.freeze({
    'id': 'workbench',
    'order': 7,
    'title': localize('workbenchConfigurationTitle', "Workbench"),
    'type': 'object',
});
export const securityConfigurationNodeBase = Object.freeze({
    'id': 'security',
    'scope': 1 /* ConfigurationScope.APPLICATION */,
    'title': localize('securityConfigurationTitle', "Security"),
    'type': 'object',
    'order': 7
});
export const problemsConfigurationNodeBase = Object.freeze({
    'id': 'problems',
    'title': localize('problemsConfigurationTitle', "Problems"),
    'type': 'object',
    'order': 101
});
export const windowConfigurationNodeBase = Object.freeze({
    'id': 'window',
    'order': 8,
    'title': localize('windowConfigurationTitle', "Window"),
    'type': 'object',
});
export const Extensions = {
    ConfigurationMigration: 'base.contributions.configuration.migration'
};
class ConfigurationMigrationRegistry {
    constructor() {
        this.migrations = [];
        this._onDidRegisterConfigurationMigrations = new Emitter();
        this.onDidRegisterConfigurationMigration = this._onDidRegisterConfigurationMigrations.event;
    }
    registerConfigurationMigrations(configurationMigrations) {
        this.migrations.push(...configurationMigrations);
    }
}
const configurationMigrationRegistry = new ConfigurationMigrationRegistry();
Registry.add(Extensions.ConfigurationMigration, configurationMigrationRegistry);
let ConfigurationMigrationWorkbenchContribution = class ConfigurationMigrationWorkbenchContribution extends Disposable {
    static { this.ID = 'workbench.contrib.configurationMigration'; }
    constructor(configurationService, workspaceService) {
        super();
        this.configurationService = configurationService;
        this.workspaceService = workspaceService;
        this._register(this.workspaceService.onDidChangeWorkspaceFolders(async (e) => {
            for (const folder of e.added) {
                await this.migrateConfigurationsForFolder(folder, configurationMigrationRegistry.migrations);
            }
        }));
        this.migrateConfigurations(configurationMigrationRegistry.migrations);
        this._register(configurationMigrationRegistry.onDidRegisterConfigurationMigration(migration => this.migrateConfigurations(migration)));
    }
    async migrateConfigurations(migrations) {
        await this.migrateConfigurationsForFolder(undefined, migrations);
        for (const folder of this.workspaceService.getWorkspace().folders) {
            await this.migrateConfigurationsForFolder(folder, migrations);
        }
    }
    async migrateConfigurationsForFolder(folder, migrations) {
        await Promise.all([migrations.map(migration => this.migrateConfigurationsForFolderAndOverride(migration, folder?.uri))]);
    }
    async migrateConfigurationsForFolderAndOverride(migration, resource) {
        const inspectData = this.configurationService.inspect(migration.key, { resource });
        const targetPairs = this.workspaceService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? [
            ['user', 2 /* ConfigurationTarget.USER */],
            ['userLocal', 3 /* ConfigurationTarget.USER_LOCAL */],
            ['userRemote', 4 /* ConfigurationTarget.USER_REMOTE */],
            ['workspace', 5 /* ConfigurationTarget.WORKSPACE */],
            ['workspaceFolder', 6 /* ConfigurationTarget.WORKSPACE_FOLDER */],
        ] : [
            ['user', 2 /* ConfigurationTarget.USER */],
            ['userLocal', 3 /* ConfigurationTarget.USER_LOCAL */],
            ['userRemote', 4 /* ConfigurationTarget.USER_REMOTE */],
            ['workspace', 5 /* ConfigurationTarget.WORKSPACE */],
        ];
        for (const [dataKey, target] of targetPairs) {
            const inspectValue = inspectData[dataKey];
            if (!inspectValue) {
                continue;
            }
            const migrationValues = [];
            if (inspectValue.value !== undefined) {
                const keyValuePairs = await this.runMigration(migration, dataKey, inspectValue.value, resource, undefined);
                for (const keyValuePair of keyValuePairs ?? []) {
                    migrationValues.push([keyValuePair, []]);
                }
            }
            for (const { identifiers, value } of inspectValue.overrides ?? []) {
                if (value !== undefined) {
                    const keyValuePairs = await this.runMigration(migration, dataKey, value, resource, identifiers);
                    for (const keyValuePair of keyValuePairs ?? []) {
                        migrationValues.push([keyValuePair, identifiers]);
                    }
                }
            }
            if (migrationValues.length) {
                // apply migrations
                await Promise.allSettled(migrationValues.map(async ([[key, value], overrideIdentifiers]) => this.configurationService.updateValue(key, value.value, { resource, overrideIdentifiers }, target)));
            }
        }
    }
    async runMigration(migration, dataKey, value, resource, overrideIdentifiers) {
        const valueAccessor = (key) => {
            const inspectData = this.configurationService.inspect(key, { resource });
            const inspectValue = inspectData[dataKey];
            if (!inspectValue) {
                return undefined;
            }
            if (!overrideIdentifiers) {
                return inspectValue.value;
            }
            return inspectValue.overrides?.find(({ identifiers }) => equals(identifiers, overrideIdentifiers))?.value;
        };
        const result = await migration.migrateFn(value, valueAccessor);
        return Array.isArray(result) ? result : [[migration.key, result]];
    }
};
ConfigurationMigrationWorkbenchContribution = __decorate([
    __param(0, IConfigurationService),
    __param(1, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object])
], ConfigurationMigrationWorkbenchContribution);
export { ConfigurationMigrationWorkbenchContribution };
let DynamicWorkbenchSecurityConfiguration = class DynamicWorkbenchSecurityConfiguration extends Disposable {
    static { this.ID = 'workbench.contrib.dynamicWorkbenchSecurityConfiguration'; }
    constructor(remoteAgentService) {
        super();
        this.remoteAgentService = remoteAgentService;
        this._ready = new DeferredPromise();
        this.ready = this._ready.p;
        this.create();
    }
    async create() {
        try {
            await this.doCreate();
        }
        finally {
            this._ready.complete();
        }
    }
    async doCreate() {
        if (!isWindows) {
            const remoteEnvironment = await this.remoteAgentService.getEnvironment();
            if (remoteEnvironment?.os !== 1 /* OperatingSystem.Windows */) {
                return;
            }
        }
        // Windows: UNC allow list security configuration
        const registry = Registry.as(ConfigurationExtensions.Configuration);
        registry.registerConfiguration({
            ...securityConfigurationNodeBase,
            'properties': {
                'security.allowedUNCHosts': {
                    'type': 'array',
                    'items': {
                        'type': 'string',
                        'pattern': '^[^\\\\]+$',
                        'patternErrorMessage': localize('security.allowedUNCHosts.patternErrorMessage', 'UNC host names must not contain backslashes.')
                    },
                    'default': [],
                    'markdownDescription': localize('security.allowedUNCHosts', 'A set of UNC host names (without leading or trailing backslash, for example `192.168.0.1` or `my-server`) to allow without user confirmation. If a UNC host is being accessed that is not allowed via this setting or has not been acknowledged via user confirmation, an error will occur and the operation stopped. A restart is required when changing this setting. Find out more about this setting at https://aka.ms/vscode-windows-unc.'),
                    'scope': 2 /* ConfigurationScope.MACHINE */
                },
                'security.restrictUNCAccess': {
                    'type': 'boolean',
                    'default': true,
                    'markdownDescription': localize('security.restrictUNCAccess', 'If enabled, only allows access to UNC host names that are allowed by the `#security.allowedUNCHosts#` setting or after user confirmation. Find out more about this setting at https://aka.ms/vscode-windows-unc.'),
                    'scope': 2 /* ConfigurationScope.MACHINE */
                }
            }
        });
    }
};
DynamicWorkbenchSecurityConfiguration = __decorate([
    __param(0, IRemoteAgentService),
    __metadata("design:paramtypes", [Object])
], DynamicWorkbenchSecurityConfiguration);
export { DynamicWorkbenchSecurityConfiguration };
export const CONFIG_NEW_WINDOW_PROFILE = 'window.newWindowProfile';
let DynamicWindowConfiguration = class DynamicWindowConfiguration extends Disposable {
    static { this.ID = 'workbench.contrib.dynamicWindowConfiguration'; }
    constructor(userDataProfilesService, configurationService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.configurationService = configurationService;
        this.registerNewWindowProfileConfiguration();
        this._register(this.userDataProfilesService.onDidChangeProfiles((e) => this.registerNewWindowProfileConfiguration()));
        this.setNewWindowProfile();
        this.checkAndResetNewWindowProfileConfig();
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.source !== 7 /* ConfigurationTarget.DEFAULT */ && e.affectsConfiguration(CONFIG_NEW_WINDOW_PROFILE)) {
                this.setNewWindowProfile();
            }
        }));
        this._register(this.userDataProfilesService.onDidChangeProfiles(() => this.checkAndResetNewWindowProfileConfig()));
    }
    registerNewWindowProfileConfiguration() {
        const registry = Registry.as(ConfigurationExtensions.Configuration);
        const configurationNode = {
            ...windowConfigurationNodeBase,
            'properties': {
                [CONFIG_NEW_WINDOW_PROFILE]: {
                    'type': ['string', 'null'],
                    'default': null,
                    'enum': [...this.userDataProfilesService.profiles.map(profile => profile.name), null],
                    'enumItemLabels': [...this.userDataProfilesService.profiles.map(p => ''), localize('active window', "Active Window")],
                    'description': localize('newWindowProfile', "Specifies the profile to use when opening a new window. If a profile name is provided, the new window will use that profile. If no profile name is provided, the new window will use the profile of the active window or the Default profile if no active window exists."),
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                }
            }
        };
        if (this.configurationNode) {
            registry.updateConfigurations({ add: [configurationNode], remove: [this.configurationNode] });
        }
        else {
            registry.registerConfiguration(configurationNode);
        }
        this.configurationNode = configurationNode;
    }
    setNewWindowProfile() {
        const newWindowProfileName = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
        this.newWindowProfile = newWindowProfileName ? this.userDataProfilesService.profiles.find(profile => profile.name === newWindowProfileName) : undefined;
    }
    checkAndResetNewWindowProfileConfig() {
        const newWindowProfileName = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
        if (!newWindowProfileName) {
            return;
        }
        const profile = this.newWindowProfile ? this.userDataProfilesService.profiles.find(profile => profile.id === this.newWindowProfile.id) : undefined;
        if (newWindowProfileName === profile?.name) {
            return;
        }
        this.configurationService.updateValue(CONFIG_NEW_WINDOW_PROFILE, profile?.name);
    }
};
DynamicWindowConfiguration = __decorate([
    __param(0, IUserDataProfilesService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], DynamicWindowConfiguration);
export { DynamicWindowConfiguration };
