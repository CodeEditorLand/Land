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
import { Schemas } from '../../../../base/common/network.js';
import { env } from '../../../../base/common/process.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { OS } from '../../../../base/common/platform.js';
import { ITerminalLogService } from '../../../../platform/terminal/common/terminal.js';
import { ITerminalProfileService } from '../common/terminal.js';
import * as path from '../../../../base/common/path.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { getIconRegistry } from '../../../../platform/theme/common/iconRegistry.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { debounce } from '../../../../base/common/decorators.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { deepClone } from '../../../../base/common/objects.js';
import { isUriComponents } from '../../../../platform/terminal/common/terminalProfiles.js';
import { ITerminalInstanceService } from './terminal.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
const generatedProfileName = 'Generated';
export class BaseTerminalProfileResolverService extends Disposable {
    get defaultProfileName() { return this._defaultProfileName; }
    constructor(_context, _configurationService, _configurationResolverService, _historyService, _logService, _terminalProfileService, _workspaceContextService, _remoteAgentService) {
        super();
        this._context = _context;
        this._configurationService = _configurationService;
        this._configurationResolverService = _configurationResolverService;
        this._historyService = _historyService;
        this._logService = _logService;
        this._terminalProfileService = _terminalProfileService;
        this._workspaceContextService = _workspaceContextService;
        this._remoteAgentService = _remoteAgentService;
        this._iconRegistry = getIconRegistry();
        if (this._remoteAgentService.getConnection()) {
            this._remoteAgentService.getEnvironment().then(env => this._primaryBackendOs = env?.os || OS);
        }
        else {
            this._primaryBackendOs = OS;
        }
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.defaultProfile.windows") ||
                e.affectsConfiguration("terminal.integrated.defaultProfile.osx") ||
                e.affectsConfiguration("terminal.integrated.defaultProfile.linux")) {
                this._refreshDefaultProfileName();
            }
        }));
        this._register(this._terminalProfileService.onDidChangeAvailableProfiles(() => this._refreshDefaultProfileName()));
    }
    async _refreshDefaultProfileName() {
        if (this._primaryBackendOs) {
            this._defaultProfileName = (await this.getDefaultProfile({
                remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority,
                os: this._primaryBackendOs
            }))?.profileName;
        }
    }
    resolveIcon(shellLaunchConfig, os) {
        if (shellLaunchConfig.icon) {
            shellLaunchConfig.icon = this._getCustomIcon(shellLaunchConfig.icon) || this.getDefaultIcon();
            return;
        }
        if (shellLaunchConfig.customPtyImplementation) {
            shellLaunchConfig.icon = this.getDefaultIcon();
            return;
        }
        if (shellLaunchConfig.executable) {
            return;
        }
        const defaultProfile = this._getUnresolvedRealDefaultProfile(os);
        if (defaultProfile) {
            shellLaunchConfig.icon = defaultProfile.icon;
        }
        if (!shellLaunchConfig.icon) {
            shellLaunchConfig.icon = this.getDefaultIcon();
        }
    }
    getDefaultIcon(resource) {
        return this._iconRegistry.getIcon(this._configurationService.getValue("terminal.integrated.tabs.defaultIcon", { resource })) || Codicon.terminal;
    }
    async resolveShellLaunchConfig(shellLaunchConfig, options) {
        let resolvedProfile;
        if (shellLaunchConfig.executable) {
            resolvedProfile = await this._resolveProfile({
                path: shellLaunchConfig.executable,
                args: shellLaunchConfig.args,
                profileName: generatedProfileName,
                isDefault: false
            }, options);
        }
        else {
            resolvedProfile = await this.getDefaultProfile(options);
        }
        shellLaunchConfig.executable = resolvedProfile.path;
        shellLaunchConfig.args = resolvedProfile.args;
        if (resolvedProfile.env) {
            if (shellLaunchConfig.env) {
                shellLaunchConfig.env = { ...shellLaunchConfig.env, ...resolvedProfile.env };
            }
            else {
                shellLaunchConfig.env = resolvedProfile.env;
            }
        }
        const resource = shellLaunchConfig === undefined || typeof shellLaunchConfig.cwd === 'string' ? undefined : shellLaunchConfig.cwd;
        shellLaunchConfig.icon = this._getCustomIcon(shellLaunchConfig.icon)
            || this._getCustomIcon(resolvedProfile.icon)
            || this.getDefaultIcon(resource);
        if (resolvedProfile.overrideName) {
            shellLaunchConfig.name = resolvedProfile.profileName;
        }
        shellLaunchConfig.color = shellLaunchConfig.color
            || resolvedProfile.color
            || this._configurationService.getValue("terminal.integrated.tabs.defaultColor", { resource });
        if (shellLaunchConfig.useShellEnvironment === undefined) {
            shellLaunchConfig.useShellEnvironment = this._configurationService.getValue("terminal.integrated.inheritEnv");
        }
    }
    async getDefaultShell(options) {
        return (await this.getDefaultProfile(options)).path;
    }
    async getDefaultShellArgs(options) {
        return (await this.getDefaultProfile(options)).args || [];
    }
    async getDefaultProfile(options) {
        return this._resolveProfile(await this._getUnresolvedDefaultProfile(options), options);
    }
    getEnvironment(remoteAuthority) {
        return this._context.getEnvironment(remoteAuthority);
    }
    _getCustomIcon(icon) {
        if (!icon) {
            return undefined;
        }
        if (typeof icon === 'string') {
            return ThemeIcon.fromId(icon);
        }
        if (ThemeIcon.isThemeIcon(icon)) {
            return icon;
        }
        if (URI.isUri(icon) || isUriComponents(icon)) {
            return URI.revive(icon);
        }
        if (typeof icon === 'object' && 'light' in icon && 'dark' in icon) {
            const castedIcon = icon;
            if ((URI.isUri(castedIcon.light) || isUriComponents(castedIcon.light)) && (URI.isUri(castedIcon.dark) || isUriComponents(castedIcon.dark))) {
                return { light: URI.revive(castedIcon.light), dark: URI.revive(castedIcon.dark) };
            }
        }
        return undefined;
    }
    async _getUnresolvedDefaultProfile(options) {
        if (options.allowAutomationShell) {
            const automationShellProfile = this._getUnresolvedAutomationShellProfile(options);
            if (automationShellProfile) {
                return automationShellProfile;
            }
        }
        await this._terminalProfileService.profilesReady;
        const defaultProfile = this._getUnresolvedRealDefaultProfile(options.os);
        if (defaultProfile) {
            return this._setIconForAutomation(options, defaultProfile);
        }
        return this._setIconForAutomation(options, await this._getUnresolvedFallbackDefaultProfile(options));
    }
    _setIconForAutomation(options, profile) {
        if (options.allowAutomationShell) {
            const profileClone = deepClone(profile);
            profileClone.icon = Codicon.tools;
            return profileClone;
        }
        return profile;
    }
    _getUnresolvedRealDefaultProfile(os) {
        return this._terminalProfileService.getDefaultProfile(os);
    }
    async _getUnresolvedFallbackDefaultProfile(options) {
        const executable = await this._context.getDefaultSystemShell(options.remoteAuthority, options.os);
        if (options.os === OS) {
            let existingProfile = this._terminalProfileService.availableProfiles.find(e => path.parse(e.path).name === path.parse(executable).name);
            if (existingProfile) {
                if (options.allowAutomationShell) {
                    existingProfile = deepClone(existingProfile);
                    existingProfile.icon = Codicon.tools;
                }
                return existingProfile;
            }
        }
        let args;
        if (options.os === 2 && path.parse(executable).name.match(/(zsh|bash)/)) {
            args = ['--login'];
        }
        else {
            args = [];
        }
        const icon = this._guessProfileIcon(executable);
        return {
            profileName: generatedProfileName,
            path: executable,
            args,
            icon,
            isDefault: false
        };
    }
    _getUnresolvedAutomationShellProfile(options) {
        const automationProfile = this._configurationService.getValue(`terminal.integrated.automationProfile.${this._getOsKey(options.os)}`);
        if (this._isValidAutomationProfile(automationProfile, options.os)) {
            automationProfile.icon = this._getCustomIcon(automationProfile.icon) || Codicon.tools;
            return automationProfile;
        }
        return undefined;
    }
    async _resolveProfile(profile, options) {
        const env = await this._context.getEnvironment(options.remoteAuthority);
        if (options.os === 1) {
            const isWoW64 = !!env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
            const windir = env.windir;
            if (!isWoW64 && windir) {
                const sysnativePath = path.join(windir, 'Sysnative').replace(/\//g, '\\').toLowerCase();
                if (profile.path && profile.path.toLowerCase().indexOf(sysnativePath) === 0) {
                    profile.path = path.join(windir, 'System32', profile.path.substr(sysnativePath.length + 1));
                }
            }
            if (profile.path) {
                profile.path = profile.path.replace(/\//g, '\\');
            }
        }
        const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(options.remoteAuthority ? Schemas.vscodeRemote : Schemas.file);
        const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
        profile.path = await this._resolveVariables(profile.path, env, lastActiveWorkspace);
        if (profile.args) {
            if (typeof profile.args === 'string') {
                profile.args = await this._resolveVariables(profile.args, env, lastActiveWorkspace);
            }
            else {
                profile.args = await Promise.all(profile.args.map(arg => this._resolveVariables(arg, env, lastActiveWorkspace)));
            }
        }
        return profile;
    }
    async _resolveVariables(value, env, lastActiveWorkspace) {
        try {
            value = await this._configurationResolverService.resolveWithEnvironment(env, lastActiveWorkspace, value);
        }
        catch (e) {
            this._logService.error(`Could not resolve shell`, e);
        }
        return value;
    }
    _getOsKey(os) {
        switch (os) {
            case 3: return 'linux';
            case 2: return 'osx';
            case 1: return 'windows';
        }
    }
    _guessProfileIcon(shell) {
        const file = path.parse(shell).name;
        switch (file) {
            case 'bash':
                return Codicon.terminalBash;
            case 'pwsh':
            case 'powershell':
                return Codicon.terminalPowershell;
            case 'tmux':
                return Codicon.terminalTmux;
            case 'cmd':
                return Codicon.terminalCmd;
            default:
                return undefined;
        }
    }
    _isValidAutomationProfile(profile, os) {
        if (profile === null || profile === undefined || typeof profile !== 'object') {
            return false;
        }
        if ('path' in profile && typeof profile.path === 'string') {
            return true;
        }
        return false;
    }
}
__decorate([
    debounce(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BaseTerminalProfileResolverService.prototype, "_refreshDefaultProfileName", null);
let BrowserTerminalProfileResolverService = class BrowserTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService, configurationService, historyService, logService, terminalInstanceService, terminalProfileService, workspaceContextService, remoteAgentService) {
        super({
            getDefaultSystemShell: async (remoteAuthority, os) => {
                const backend = await terminalInstanceService.getBackend(remoteAuthority);
                if (!remoteAuthority || !backend) {
                    return os === 1 ? 'pwsh' : 'bash';
                }
                return backend.getDefaultSystemShell(os);
            },
            getEnvironment: async (remoteAuthority) => {
                const backend = await terminalInstanceService.getBackend(remoteAuthority);
                if (!remoteAuthority || !backend) {
                    return env;
                }
                return backend.getEnvironment();
            }
        }, configurationService, configurationResolverService, historyService, logService, terminalProfileService, workspaceContextService, remoteAgentService);
    }
};
BrowserTerminalProfileResolverService = __decorate([
    __param(0, IConfigurationResolverService),
    __param(1, IConfigurationService),
    __param(2, IHistoryService),
    __param(3, ITerminalLogService),
    __param(4, ITerminalInstanceService),
    __param(5, ITerminalProfileService),
    __param(6, IWorkspaceContextService),
    __param(7, IRemoteAgentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], BrowserTerminalProfileResolverService);
export { BrowserTerminalProfileResolverService };
