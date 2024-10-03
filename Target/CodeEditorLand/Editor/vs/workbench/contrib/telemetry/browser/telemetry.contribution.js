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
var TelemetryContribution_1;
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { language } from '../../../../base/common/platform.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import ErrorTelemetry from '../../../../platform/telemetry/browser/errorTelemetry.js';
import { TelemetryTrustedValue } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { ConfigurationTargetToString, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { extname, basename, isEqual, isEqualOrParent } from '../../../../base/common/resources.js';
import { Event } from '../../../../base/common/event.js';
import { Schemas } from '../../../../base/common/network.js';
import { getMimeTypes } from '../../../../editor/common/services/languagesAssociations.js';
import { hash } from '../../../../base/common/hash.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { isBoolean, isNumber, isString } from '../../../../base/common/types.js';
import { AutoRestartConfigurationKey, AutoUpdateConfigurationKey } from '../../extensions/common/extensions.js';
import { KEYWORD_ACTIVIATION_SETTING_ID } from '../../chat/common/chatService.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
let TelemetryContribution = class TelemetryContribution extends Disposable {
    static { TelemetryContribution_1 = this; }
    static { this.ALLOWLIST_JSON = ['package.json', 'package-lock.json', 'tsconfig.json', 'jsconfig.json', 'bower.json', '.eslintrc.json', 'tslint.json', 'composer.json']; }
    static { this.ALLOWLIST_WORKSPACE_JSON = ['settings.json', 'extensions.json', 'tasks.json', 'launch.json']; }
    constructor(telemetryService, contextService, lifecycleService, editorService, keybindingsService, themeService, environmentService, userDataProfileService, paneCompositeService, textFileService) {
        super();
        this.telemetryService = telemetryService;
        this.contextService = contextService;
        this.userDataProfileService = userDataProfileService;
        const { filesToOpenOrCreate, filesToDiff, filesToMerge } = environmentService;
        const activeViewlet = paneCompositeService.getActivePaneComposite(0);
        telemetryService.publicLog2('workspaceLoad', {
            windowSize: { innerHeight: mainWindow.innerHeight, innerWidth: mainWindow.innerWidth, outerHeight: mainWindow.outerHeight, outerWidth: mainWindow.outerWidth },
            emptyWorkbench: contextService.getWorkbenchState() === 1,
            'workbench.filesToOpenOrCreate': filesToOpenOrCreate && filesToOpenOrCreate.length || 0,
            'workbench.filesToDiff': filesToDiff && filesToDiff.length || 0,
            'workbench.filesToMerge': filesToMerge && filesToMerge.length || 0,
            customKeybindingsCount: keybindingsService.customKeybindingsCount(),
            theme: themeService.getColorTheme().id,
            language,
            pinnedViewlets: paneCompositeService.getPinnedPaneCompositeIds(0),
            restoredViewlet: activeViewlet ? activeViewlet.getId() : undefined,
            restoredEditors: editorService.visibleEditors.length,
            startupKind: lifecycleService.startupKind
        });
        this._register(new ErrorTelemetry(telemetryService));
        this._register(textFileService.files.onDidResolve(e => this.onTextFileModelResolved(e)));
        this._register(textFileService.files.onDidSave(e => this.onTextFileModelSaved(e)));
        this._register(lifecycleService.onDidShutdown(() => this.dispose()));
    }
    onTextFileModelResolved(e) {
        const settingsType = this.getTypeIfSettings(e.model.resource);
        if (settingsType) {
            this.telemetryService.publicLog2('settingsRead', { settingsType });
        }
        else {
            this.telemetryService.publicLog2('fileGet', this.getTelemetryData(e.model.resource, e.reason));
        }
    }
    onTextFileModelSaved(e) {
        const settingsType = this.getTypeIfSettings(e.model.resource);
        if (settingsType) {
            this.telemetryService.publicLog2('settingsWritten', { settingsType });
        }
        else {
            this.telemetryService.publicLog2('filePUT', this.getTelemetryData(e.model.resource, e.reason));
        }
    }
    getTypeIfSettings(resource) {
        if (extname(resource) !== '.json') {
            return '';
        }
        if (isEqual(resource, this.userDataProfileService.currentProfile.settingsResource)) {
            return 'global-settings';
        }
        if (isEqual(resource, this.userDataProfileService.currentProfile.keybindingsResource)) {
            return 'keybindings';
        }
        if (isEqualOrParent(resource, this.userDataProfileService.currentProfile.snippetsHome)) {
            return 'snippets';
        }
        const folders = this.contextService.getWorkspace().folders;
        for (const folder of folders) {
            if (isEqualOrParent(resource, folder.toResource('.vscode'))) {
                const filename = basename(resource);
                if (TelemetryContribution_1.ALLOWLIST_WORKSPACE_JSON.indexOf(filename) > -1) {
                    return `.vscode/${filename}`;
                }
            }
        }
        return '';
    }
    getTelemetryData(resource, reason) {
        let ext = extname(resource);
        const queryStringLocation = ext.indexOf('?');
        ext = queryStringLocation !== -1 ? ext.substr(0, queryStringLocation) : ext;
        const fileName = basename(resource);
        const path = resource.scheme === Schemas.file ? resource.fsPath : resource.path;
        const telemetryData = {
            mimeType: new TelemetryTrustedValue(getMimeTypes(resource).join(', ')),
            ext,
            path: hash(path),
            reason,
            allowlistedjson: undefined
        };
        if (ext === '.json' && TelemetryContribution_1.ALLOWLIST_JSON.indexOf(fileName) > -1) {
            telemetryData['allowlistedjson'] = fileName;
        }
        return telemetryData;
    }
};
TelemetryContribution = TelemetryContribution_1 = __decorate([
    __param(0, ITelemetryService),
    __param(1, IWorkspaceContextService),
    __param(2, ILifecycleService),
    __param(3, IEditorService),
    __param(4, IKeybindingService),
    __param(5, IWorkbenchThemeService),
    __param(6, IWorkbenchEnvironmentService),
    __param(7, IUserDataProfileService),
    __param(8, IPaneCompositePartService),
    __param(9, ITextFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TelemetryContribution);
export { TelemetryContribution };
let ConfigurationTelemetryContribution = class ConfigurationTelemetryContribution extends Disposable {
    constructor(configurationService, userDataProfilesService, telemetryService) {
        super();
        this.configurationService = configurationService;
        this.userDataProfilesService = userDataProfilesService;
        this.telemetryService = telemetryService;
        this.configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
        const debouncedConfigService = Event.debounce(configurationService.onDidChangeConfiguration, (last, cur) => {
            const newAffectedKeys = last ? new Set([...last.affectedKeys, ...cur.affectedKeys]) : cur.affectedKeys;
            return { ...cur, affectedKeys: newAffectedKeys };
        }, 1000, true);
        this._register(debouncedConfigService(event => {
            if (event.source !== 7) {
                telemetryService.publicLog2('updateConfiguration', {
                    configurationSource: ConfigurationTargetToString(event.source),
                    configurationKeys: Array.from(event.affectedKeys)
                });
            }
        }));
        const { user, workspace } = configurationService.keys();
        for (const setting of user) {
            this.reportTelemetry(setting, 3);
        }
        for (const setting of workspace) {
            this.reportTelemetry(setting, 5);
        }
    }
    getValueToReport(key, target) {
        const inpsectData = this.configurationService.inspect(key);
        const value = target === 3 ? inpsectData.user?.value : inpsectData.workspace?.value;
        if (isNumber(value) || isBoolean(value)) {
            return value.toString();
        }
        const schema = this.configurationRegistry.getConfigurationProperties()[key];
        if (isString(value)) {
            if (schema?.enum?.includes(value)) {
                return value;
            }
            return undefined;
        }
        if (Array.isArray(value)) {
            if (value.every(v => isNumber(v) || isBoolean(v) || (isString(v) && schema?.enum?.includes(v)))) {
                return JSON.stringify(value);
            }
        }
        return undefined;
    }
    reportTelemetry(key, target) {
        const source = ConfigurationTargetToString(target);
        switch (key) {
            case "workbench.activityBar.location":
                this.telemetryService.publicLog2('workbench.activityBar.location', { settingValue: this.getValueToReport(key, target), source });
                return;
            case AutoUpdateConfigurationKey:
                this.telemetryService.publicLog2('extensions.autoUpdate', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'files.autoSave':
                this.telemetryService.publicLog2('files.autoSave', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'editor.stickyScroll.enabled':
                this.telemetryService.publicLog2('editor.stickyScroll.enabled', { settingValue: this.getValueToReport(key, target), source });
                return;
            case KEYWORD_ACTIVIATION_SETTING_ID:
                this.telemetryService.publicLog2('accessibility.voice.keywordActivation', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'window.zoomLevel':
                this.telemetryService.publicLog2('window.zoomLevel', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'window.zoomPerWindow':
                this.telemetryService.publicLog2('window.zoomPerWindow', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'window.titleBarStyle':
                this.telemetryService.publicLog2('window.titleBarStyle', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'window.customTitleBarVisibility':
                this.telemetryService.publicLog2('window.customTitleBarVisibility', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'window.nativeTabs':
                this.telemetryService.publicLog2('window.nativeTabs', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'extensions.verifySignature':
                this.telemetryService.publicLog2('extensions.verifySignature', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'window.systemColorTheme':
                this.telemetryService.publicLog2('window.systemColorTheme', { settingValue: this.getValueToReport(key, target), source });
                return;
            case 'window.newWindowProfile':
                {
                    const valueToReport = this.getValueToReport(key, target);
                    const settingValue = valueToReport === null ? 'null'
                        : valueToReport === this.userDataProfilesService.defaultProfile.name
                            ? 'default'
                            : 'custom';
                    this.telemetryService.publicLog2('window.newWindowProfile', { settingValue, source });
                    return;
                }
            case AutoRestartConfigurationKey:
                this.telemetryService.publicLog2('extensions.autoRestart', { settingValue: this.getValueToReport(key, target), source });
                return;
        }
    }
};
ConfigurationTelemetryContribution = __decorate([
    __param(0, IConfigurationService),
    __param(1, IUserDataProfilesService),
    __param(2, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ConfigurationTelemetryContribution);
const workbenchContributionRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionRegistry.registerWorkbenchContribution(TelemetryContribution, 3);
workbenchContributionRegistry.registerWorkbenchContribution(ConfigurationTelemetryContribution, 4);
