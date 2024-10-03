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
import { PickerQuickAccessProvider, TriggerAction } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { localize } from '../../../../nls.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IDebugService } from '../common/debug.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { matchesFuzzy } from '../../../../base/common/filters.js';
import { ADD_CONFIGURATION_ID, DEBUG_QUICK_ACCESS_PREFIX } from './debugCommands.js';
import { debugConfigure, debugRemoveConfig } from './debugIcons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
let StartDebugQuickAccessProvider = class StartDebugQuickAccessProvider extends PickerQuickAccessProvider {
    constructor(debugService, contextService, commandService, notificationService) {
        super(DEBUG_QUICK_ACCESS_PREFIX, {
            noResultsPick: {
                label: localize('noDebugResults', "No matching launch configurations")
            }
        });
        this.debugService = debugService;
        this.contextService = contextService;
        this.commandService = commandService;
        this.notificationService = notificationService;
    }
    async _getPicks(filter) {
        const picks = [];
        if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
            return [];
        }
        picks.push({ type: 'separator', label: 'launch.json' });
        const configManager = this.debugService.getConfigurationManager();
        let lastGroup;
        for (const config of configManager.getAllConfigurations()) {
            const highlights = matchesFuzzy(filter, config.name, true);
            if (highlights) {
                if (lastGroup !== config.presentation?.group) {
                    picks.push({ type: 'separator' });
                    lastGroup = config.presentation?.group;
                }
                picks.push({
                    label: config.name,
                    description: this.contextService.getWorkbenchState() === 3 ? config.launch.name : '',
                    highlights: { label: highlights },
                    buttons: [{
                            iconClass: ThemeIcon.asClassName(debugConfigure),
                            tooltip: localize('customizeLaunchConfig', "Configure Launch Configuration")
                        }],
                    trigger: () => {
                        config.launch.openConfigFile({ preserveFocus: false });
                        return TriggerAction.CLOSE_PICKER;
                    },
                    accept: async () => {
                        await configManager.selectConfiguration(config.launch, config.name);
                        try {
                            await this.debugService.startDebugging(config.launch, undefined, { startedByUser: true });
                        }
                        catch (error) {
                            this.notificationService.error(error);
                        }
                    }
                });
            }
        }
        const dynamicProviders = await configManager.getDynamicProviders();
        if (dynamicProviders.length > 0) {
            picks.push({
                type: 'separator', label: localize({
                    key: 'contributed',
                    comment: ['contributed is lower case because it looks better like that in UI. Nothing preceeds it. It is a name of the grouping of debug configurations.']
                }, "contributed")
            });
        }
        configManager.getRecentDynamicConfigurations().forEach(({ name, type }) => {
            const highlights = matchesFuzzy(filter, name, true);
            if (highlights) {
                picks.push({
                    label: name,
                    highlights: { label: highlights },
                    buttons: [{
                            iconClass: ThemeIcon.asClassName(debugRemoveConfig),
                            tooltip: localize('removeLaunchConfig', "Remove Launch Configuration")
                        }],
                    trigger: () => {
                        configManager.removeRecentDynamicConfigurations(name, type);
                        return TriggerAction.CLOSE_PICKER;
                    },
                    accept: async () => {
                        await configManager.selectConfiguration(undefined, name, undefined, { type });
                        try {
                            const { launch, getConfig } = configManager.selectedConfiguration;
                            const config = await getConfig();
                            await this.debugService.startDebugging(launch, config, { startedByUser: true });
                        }
                        catch (error) {
                            this.notificationService.error(error);
                        }
                    }
                });
            }
        });
        dynamicProviders.forEach(provider => {
            picks.push({
                label: `$(folder) ${provider.label}...`,
                ariaLabel: localize({ key: 'providerAriaLabel', comment: ['Placeholder stands for the provider label. For example "NodeJS".'] }, "{0} contributed configurations", provider.label),
                accept: async () => {
                    const pick = await provider.pick();
                    if (pick) {
                        await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
                        this.debugService.startDebugging(pick.launch, pick.config, { startedByUser: true });
                    }
                }
            });
        });
        const visibleLaunches = configManager.getLaunches().filter(launch => !launch.hidden);
        if (visibleLaunches.length > 0) {
            picks.push({ type: 'separator', label: localize('configure', "configure") });
        }
        for (const launch of visibleLaunches) {
            const label = this.contextService.getWorkbenchState() === 3 ?
                localize("addConfigTo", "Add Config ({0})...", launch.name) :
                localize('addConfiguration', "Add Configuration...");
            picks.push({
                label,
                description: this.contextService.getWorkbenchState() === 3 ? launch.name : '',
                highlights: { label: matchesFuzzy(filter, label, true) ?? undefined },
                accept: () => this.commandService.executeCommand(ADD_CONFIGURATION_ID, launch.uri.toString())
            });
        }
        return picks;
    }
};
StartDebugQuickAccessProvider = __decorate([
    __param(0, IDebugService),
    __param(1, IWorkspaceContextService),
    __param(2, ICommandService),
    __param(3, INotificationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], StartDebugQuickAccessProvider);
export { StartDebugQuickAccessProvider };
