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
var FilesConfigurationService_1;
import { localize } from '../../../../nls.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { RawContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { AutoSaveConfiguration, HotExitConfiguration, FILES_READONLY_INCLUDE_CONFIG, FILES_READONLY_EXCLUDE_CONFIG, IFileService, hasReadonlyCapability } from '../../../../platform/files/common/files.js';
import { equals } from '../../../../base/common/objects.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ResourceGlobMatcher } from '../../../common/resources.js';
import { GlobalIdleValue } from '../../../../base/common/async.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { LRUCache, ResourceMap } from '../../../../base/common/map.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IMarkerService, MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
export const AutoSaveAfterShortDelayContext = new RawContextKey('autoSaveAfterShortDelayContext', false, true);
export const IFilesConfigurationService = createDecorator('filesConfigurationService');
let FilesConfigurationService = class FilesConfigurationService extends Disposable {
    static { FilesConfigurationService_1 = this; }
    static { this.DEFAULT_AUTO_SAVE_MODE = isWeb ? AutoSaveConfiguration.AFTER_DELAY : AutoSaveConfiguration.OFF; }
    static { this.DEFAULT_AUTO_SAVE_DELAY = 1000; }
    static { this.READONLY_MESSAGES = {
        providerReadonly: { value: localize('providerReadonly', "Editor is read-only because the file system of the file is read-only."), isTrusted: true },
        sessionReadonly: { value: localize({ key: 'sessionReadonly', comment: ['Please do not translate the word "command", it is part of our internal syntax which must not change', '{Locked="](command:{0})"}'] }, "Editor is read-only because the file was set read-only in this session. [Click here](command:{0}) to set writeable.", 'workbench.action.files.setActiveEditorWriteableInSession'), isTrusted: true },
        configuredReadonly: { value: localize({ key: 'configuredReadonly', comment: ['Please do not translate the word "command", it is part of our internal syntax which must not change', '{Locked="](command:{0})"}'] }, "Editor is read-only because the file was set read-only via settings. [Click here](command:{0}) to configure or [toggle for this session](command:{1}).", `workbench.action.openSettings?${encodeURIComponent('["files.readonly"]')}`, 'workbench.action.files.toggleActiveEditorReadonlyInSession'), isTrusted: true },
        fileLocked: { value: localize({ key: 'fileLocked', comment: ['Please do not translate the word "command", it is part of our internal syntax which must not change', '{Locked="](command:{0})"}'] }, "Editor is read-only because of file permissions. [Click here](command:{0}) to set writeable anyway.", 'workbench.action.files.setActiveEditorWriteableInSession'), isTrusted: true },
        fileReadonly: { value: localize('fileReadonly', "Editor is read-only because the file is read-only."), isTrusted: true }
    }; }
    constructor(contextKeyService, configurationService, contextService, environmentService, uriIdentityService, fileService, markerService, textResourceConfigurationService) {
        super();
        this.contextKeyService = contextKeyService;
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.environmentService = environmentService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.markerService = markerService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this._onDidChangeAutoSaveConfiguration = this._register(new Emitter());
        this.onDidChangeAutoSaveConfiguration = this._onDidChangeAutoSaveConfiguration.event;
        this._onDidChangeAutoSaveDisabled = this._register(new Emitter());
        this.onDidChangeAutoSaveDisabled = this._onDidChangeAutoSaveDisabled.event;
        this._onDidChangeFilesAssociation = this._register(new Emitter());
        this.onDidChangeFilesAssociation = this._onDidChangeFilesAssociation.event;
        this._onDidChangeReadonly = this._register(new Emitter());
        this.onDidChangeReadonly = this._onDidChangeReadonly.event;
        this.autoSaveConfigurationCache = new LRUCache(1000);
        this.autoSaveDisabledOverrides = new ResourceMap();
        this.autoSaveAfterShortDelayContext = AutoSaveAfterShortDelayContext.bindTo(this.contextKeyService);
        this.readonlyIncludeMatcher = this._register(new GlobalIdleValue(() => this.createReadonlyMatcher(FILES_READONLY_INCLUDE_CONFIG)));
        this.readonlyExcludeMatcher = this._register(new GlobalIdleValue(() => this.createReadonlyMatcher(FILES_READONLY_EXCLUDE_CONFIG)));
        this.sessionReadonlyOverrides = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
        const configuration = configurationService.getValue();
        this.currentGlobalAutoSaveConfiguration = this.computeAutoSaveConfiguration(undefined, configuration.files);
        this.currentFilesAssociationConfiguration = configuration?.files?.associations;
        this.currentHotExitConfiguration = configuration?.files?.hotExit || HotExitConfiguration.ON_EXIT;
        this.onFilesConfigurationChange(configuration, false);
        this.registerListeners();
    }
    createReadonlyMatcher(config) {
        const matcher = this._register(new ResourceGlobMatcher(resource => this.configurationService.getValue(config, { resource }), event => event.affectsConfiguration(config), this.contextService, this.configurationService));
        this._register(matcher.onExpressionChange(() => this._onDidChangeReadonly.fire()));
        return matcher;
    }
    isReadonly(resource, stat) {
        const provider = this.fileService.getProvider(resource.scheme);
        if (provider && hasReadonlyCapability(provider)) {
            return provider.readOnlyMessage ?? FilesConfigurationService_1.READONLY_MESSAGES.providerReadonly;
        }
        const sessionReadonlyOverride = this.sessionReadonlyOverrides.get(resource);
        if (typeof sessionReadonlyOverride === 'boolean') {
            return sessionReadonlyOverride === true ? FilesConfigurationService_1.READONLY_MESSAGES.sessionReadonly : false;
        }
        if (this.uriIdentityService.extUri.isEqualOrParent(resource, this.environmentService.userRoamingDataHome) ||
            this.uriIdentityService.extUri.isEqual(resource, this.contextService.getWorkspace().configuration ?? undefined)) {
            return false;
        }
        if (this.readonlyIncludeMatcher.value.matches(resource)) {
            return !this.readonlyExcludeMatcher.value.matches(resource) ? FilesConfigurationService_1.READONLY_MESSAGES.configuredReadonly : false;
        }
        if (this.configuredReadonlyFromPermissions && stat?.locked) {
            return FilesConfigurationService_1.READONLY_MESSAGES.fileLocked;
        }
        if (stat?.readonly) {
            return FilesConfigurationService_1.READONLY_MESSAGES.fileReadonly;
        }
        return false;
    }
    async updateReadonly(resource, readonly) {
        if (readonly === 'toggle') {
            let stat = undefined;
            try {
                stat = await this.fileService.resolve(resource, { resolveMetadata: true });
            }
            catch (error) {
            }
            readonly = !this.isReadonly(resource, stat);
        }
        if (readonly === 'reset') {
            this.sessionReadonlyOverrides.delete(resource);
        }
        else {
            this.sessionReadonlyOverrides.set(resource, readonly);
        }
        this._onDidChangeReadonly.fire();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('files')) {
                this.onFilesConfigurationChange(this.configurationService.getValue(), true);
            }
        }));
    }
    onFilesConfigurationChange(configuration, fromEvent) {
        this.currentGlobalAutoSaveConfiguration = this.computeAutoSaveConfiguration(undefined, configuration.files);
        this.autoSaveConfigurationCache.clear();
        this.autoSaveAfterShortDelayContext.set(this.getAutoSaveMode(undefined).mode === 1);
        if (fromEvent) {
            this._onDidChangeAutoSaveConfiguration.fire();
        }
        const filesAssociation = configuration?.files?.associations;
        if (!equals(this.currentFilesAssociationConfiguration, filesAssociation)) {
            this.currentFilesAssociationConfiguration = filesAssociation;
            if (fromEvent) {
                this._onDidChangeFilesAssociation.fire();
            }
        }
        const hotExitMode = configuration?.files?.hotExit;
        if (hotExitMode === HotExitConfiguration.OFF || hotExitMode === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
            this.currentHotExitConfiguration = hotExitMode;
        }
        else {
            this.currentHotExitConfiguration = HotExitConfiguration.ON_EXIT;
        }
        const readonlyFromPermissions = Boolean(configuration?.files?.readonlyFromPermissions);
        if (readonlyFromPermissions !== Boolean(this.configuredReadonlyFromPermissions)) {
            this.configuredReadonlyFromPermissions = readonlyFromPermissions;
            if (fromEvent) {
                this._onDidChangeReadonly.fire();
            }
        }
    }
    getAutoSaveConfiguration(resourceOrEditor) {
        const resource = this.toResource(resourceOrEditor);
        if (resource) {
            let resourceAutoSaveConfiguration = this.autoSaveConfigurationCache.get(resource);
            if (!resourceAutoSaveConfiguration) {
                resourceAutoSaveConfiguration = this.computeAutoSaveConfiguration(resource, this.textResourceConfigurationService.getValue(resource, 'files'));
                this.autoSaveConfigurationCache.set(resource, resourceAutoSaveConfiguration);
            }
            return resourceAutoSaveConfiguration;
        }
        return this.currentGlobalAutoSaveConfiguration;
    }
    computeAutoSaveConfiguration(resource, filesConfiguration) {
        let autoSave;
        let autoSaveDelay;
        let autoSaveWorkspaceFilesOnly;
        let autoSaveWhenNoErrors;
        let isOutOfWorkspace;
        let isShortAutoSaveDelay;
        switch (filesConfiguration?.autoSave ?? FilesConfigurationService_1.DEFAULT_AUTO_SAVE_MODE) {
            case AutoSaveConfiguration.AFTER_DELAY: {
                autoSave = 'afterDelay';
                autoSaveDelay = typeof filesConfiguration?.autoSaveDelay === 'number' && filesConfiguration.autoSaveDelay >= 0 ? filesConfiguration.autoSaveDelay : FilesConfigurationService_1.DEFAULT_AUTO_SAVE_DELAY;
                isShortAutoSaveDelay = autoSaveDelay <= FilesConfigurationService_1.DEFAULT_AUTO_SAVE_DELAY;
                break;
            }
            case AutoSaveConfiguration.ON_FOCUS_CHANGE:
                autoSave = 'onFocusChange';
                break;
            case AutoSaveConfiguration.ON_WINDOW_CHANGE:
                autoSave = 'onWindowChange';
                break;
        }
        if (filesConfiguration?.autoSaveWorkspaceFilesOnly === true) {
            autoSaveWorkspaceFilesOnly = true;
            if (resource && !this.contextService.isInsideWorkspace(resource)) {
                isOutOfWorkspace = true;
                isShortAutoSaveDelay = undefined;
            }
        }
        if (filesConfiguration?.autoSaveWhenNoErrors === true) {
            autoSaveWhenNoErrors = true;
            isShortAutoSaveDelay = undefined;
        }
        return {
            autoSave,
            autoSaveDelay,
            autoSaveWorkspaceFilesOnly,
            autoSaveWhenNoErrors,
            isOutOfWorkspace,
            isShortAutoSaveDelay
        };
    }
    toResource(resourceOrEditor) {
        if (resourceOrEditor instanceof EditorInput) {
            return EditorResourceAccessor.getOriginalUri(resourceOrEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
        }
        return resourceOrEditor;
    }
    hasShortAutoSaveDelay(resourceOrEditor) {
        const resource = this.toResource(resourceOrEditor);
        if (this.getAutoSaveConfiguration(resource).isShortAutoSaveDelay) {
            return !resource || !this.autoSaveDisabledOverrides.has(resource);
        }
        return false;
    }
    getAutoSaveMode(resourceOrEditor, saveReason) {
        const resource = this.toResource(resourceOrEditor);
        if (resource && this.autoSaveDisabledOverrides.has(resource)) {
            return { mode: 0, reason: 4 };
        }
        const autoSaveConfiguration = this.getAutoSaveConfiguration(resource);
        if (typeof autoSaveConfiguration.autoSave === 'undefined') {
            return { mode: 0, reason: 1 };
        }
        if (typeof saveReason === 'number') {
            if ((autoSaveConfiguration.autoSave === 'afterDelay' && saveReason !== 2) ||
                (autoSaveConfiguration.autoSave === 'onFocusChange' && saveReason !== 3 && saveReason !== 4) ||
                (autoSaveConfiguration.autoSave === 'onWindowChange' && saveReason !== 4)) {
                return { mode: 0, reason: 1 };
            }
        }
        if (resource) {
            if (autoSaveConfiguration.autoSaveWorkspaceFilesOnly && autoSaveConfiguration.isOutOfWorkspace) {
                return { mode: 0, reason: 2 };
            }
            if (autoSaveConfiguration.autoSaveWhenNoErrors && this.markerService.read({ resource, take: 1, severities: MarkerSeverity.Error }).length > 0) {
                return { mode: 0, reason: 3 };
            }
        }
        switch (autoSaveConfiguration.autoSave) {
            case 'afterDelay':
                if (typeof autoSaveConfiguration.autoSaveDelay === 'number' && autoSaveConfiguration.autoSaveDelay <= FilesConfigurationService_1.DEFAULT_AUTO_SAVE_DELAY) {
                    return { mode: autoSaveConfiguration.autoSaveWhenNoErrors ? 2 : 1 };
                }
                return { mode: 2 };
            case 'onFocusChange':
                return { mode: 3 };
            case 'onWindowChange':
                return { mode: 4 };
        }
    }
    async toggleAutoSave() {
        const currentSetting = this.configurationService.getValue('files.autoSave');
        let newAutoSaveValue;
        if ([AutoSaveConfiguration.AFTER_DELAY, AutoSaveConfiguration.ON_FOCUS_CHANGE, AutoSaveConfiguration.ON_WINDOW_CHANGE].some(setting => setting === currentSetting)) {
            newAutoSaveValue = AutoSaveConfiguration.OFF;
        }
        else {
            newAutoSaveValue = AutoSaveConfiguration.AFTER_DELAY;
        }
        return this.configurationService.updateValue('files.autoSave', newAutoSaveValue);
    }
    disableAutoSave(resourceOrEditor) {
        const resource = this.toResource(resourceOrEditor);
        if (!resource) {
            return Disposable.None;
        }
        const counter = this.autoSaveDisabledOverrides.get(resource) ?? 0;
        this.autoSaveDisabledOverrides.set(resource, counter + 1);
        if (counter === 0) {
            this._onDidChangeAutoSaveDisabled.fire(resource);
        }
        return toDisposable(() => {
            const counter = this.autoSaveDisabledOverrides.get(resource) ?? 0;
            if (counter <= 1) {
                this.autoSaveDisabledOverrides.delete(resource);
                this._onDidChangeAutoSaveDisabled.fire(resource);
            }
            else {
                this.autoSaveDisabledOverrides.set(resource, counter - 1);
            }
        });
    }
    get isHotExitEnabled() {
        if (this.contextService.getWorkspace().transient) {
            return false;
        }
        return this.currentHotExitConfiguration !== HotExitConfiguration.OFF;
    }
    get hotExitConfiguration() {
        return this.currentHotExitConfiguration;
    }
    preventSaveConflicts(resource, language) {
        return this.configurationService.getValue('files.saveConflictResolution', { resource, overrideIdentifier: language }) !== 'overwriteFileOnDisk';
    }
};
FilesConfigurationService = FilesConfigurationService_1 = __decorate([
    __param(0, IContextKeyService),
    __param(1, IConfigurationService),
    __param(2, IWorkspaceContextService),
    __param(3, IEnvironmentService),
    __param(4, IUriIdentityService),
    __param(5, IFileService),
    __param(6, IMarkerService),
    __param(7, ITextResourceConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], FilesConfigurationService);
export { FilesConfigurationService };
registerSingleton(IFilesConfigurationService, FilesConfigurationService, 0);
