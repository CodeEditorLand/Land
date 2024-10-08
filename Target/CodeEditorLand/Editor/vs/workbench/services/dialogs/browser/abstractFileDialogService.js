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
import * as nls from '../../../../nls.js';
import { isWorkspaceToOpen, isFileToOpen } from '../../../../platform/window/common/window.js';
import { IDialogService, getFileNamesMessage } from '../../../../platform/dialogs/common/dialogs.js';
import { isSavedWorkspace, isTemporaryWorkspace, IWorkspaceContextService, WORKSPACE_EXTENSION } from '../../../../platform/workspace/common/workspace.js';
import { IHistoryService } from '../../history/common/history.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import * as resources from '../../../../base/common/resources.js';
import { isAbsolute as localPathIsAbsolute, normalize as localPathNormalize } from '../../../../base/common/path.js';
import { IInstantiationService, } from '../../../../platform/instantiation/common/instantiation.js';
import { SimpleFileDialog } from './simpleFileDialog.js';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IHostService } from '../../host/browser/host.js';
import Severity from '../../../../base/common/severity.js';
import { coalesce, distinct } from '../../../../base/common/arrays.js';
import { trim } from '../../../../base/common/strings.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IPathService } from '../../path/common/pathService.js';
import { Schemas } from '../../../../base/common/network.js';
import { PLAINTEXT_EXTENSION } from '../../../../editor/common/languages/modesRegistry.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { EditorOpenSource } from '../../../../platform/editor/common/editor.js';
import { ILogService } from '../../../../platform/log/common/log.js';
let AbstractFileDialogService = class AbstractFileDialogService {
    constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
        this.hostService = hostService;
        this.contextService = contextService;
        this.historyService = historyService;
        this.environmentService = environmentService;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.fileService = fileService;
        this.openerService = openerService;
        this.dialogService = dialogService;
        this.languageService = languageService;
        this.workspacesService = workspacesService;
        this.labelService = labelService;
        this.pathService = pathService;
        this.commandService = commandService;
        this.editorService = editorService;
        this.codeEditorService = codeEditorService;
        this.logService = logService;
    }
    async defaultFilePath(schemeFilter = this.getSchemeFilterForWindow(), authorityFilter = this.getAuthorityFilterForWindow()) {
        // Check for last active file first...
        let candidate = this.historyService.getLastActiveFile(schemeFilter, authorityFilter);
        // ...then for last active file root
        if (!candidate) {
            candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter, authorityFilter);
        }
        else {
            candidate = resources.dirname(candidate);
        }
        if (!candidate) {
            candidate = await this.preferredHome(schemeFilter);
        }
        return candidate;
    }
    async defaultFolderPath(schemeFilter = this.getSchemeFilterForWindow(), authorityFilter = this.getAuthorityFilterForWindow()) {
        // Check for last active file root first...
        let candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter, authorityFilter);
        // ...then for last active file
        if (!candidate) {
            candidate = this.historyService.getLastActiveFile(schemeFilter, authorityFilter);
        }
        if (!candidate) {
            return this.preferredHome(schemeFilter);
        }
        return resources.dirname(candidate);
    }
    async preferredHome(schemeFilter = this.getSchemeFilterForWindow()) {
        const preferLocal = schemeFilter === Schemas.file;
        const preferredHomeConfig = this.configurationService.inspect('files.dialog.defaultPath');
        const preferredHomeCandidate = preferLocal ? preferredHomeConfig.userLocalValue : preferredHomeConfig.userRemoteValue;
        if (preferredHomeCandidate) {
            const isPreferredHomeCandidateAbsolute = preferLocal ? localPathIsAbsolute(preferredHomeCandidate) : (await this.pathService.path).isAbsolute(preferredHomeCandidate);
            if (isPreferredHomeCandidateAbsolute) {
                const preferredHomeNormalized = preferLocal ? localPathNormalize(preferredHomeCandidate) : (await this.pathService.path).normalize(preferredHomeCandidate);
                const preferredHome = resources.toLocalResource(await this.pathService.fileURI(preferredHomeNormalized), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
                if (await this.fileService.exists(preferredHome)) {
                    return preferredHome;
                }
            }
        }
        return this.pathService.userHome({ preferLocal });
    }
    async defaultWorkspacePath(schemeFilter = this.getSchemeFilterForWindow()) {
        let defaultWorkspacePath;
        // Check for current workspace config file first...
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            const configuration = this.contextService.getWorkspace().configuration;
            if (configuration?.scheme === schemeFilter && isSavedWorkspace(configuration, this.environmentService) && !isTemporaryWorkspace(configuration)) {
                defaultWorkspacePath = resources.dirname(configuration);
            }
        }
        // ...then fallback to default file path
        if (!defaultWorkspacePath) {
            defaultWorkspacePath = await this.defaultFilePath(schemeFilter);
        }
        return defaultWorkspacePath;
    }
    async showSaveConfirm(fileNamesOrResources) {
        if (this.skipDialogs()) {
            this.logService.trace('FileDialogService: refused to show save confirmation dialog in tests.');
            // no veto when we are in extension dev testing mode because we cannot assume we run interactive
            return 1 /* ConfirmResult.DONT_SAVE */;
        }
        return this.doShowSaveConfirm(fileNamesOrResources);
    }
    skipDialogs() {
        if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionTestsLocationURI) {
            return true; // integration tests
        }
        return !!this.environmentService.enableSmokeTestDriver; // smoke tests
    }
    async doShowSaveConfirm(fileNamesOrResources) {
        if (fileNamesOrResources.length === 0) {
            return 1 /* ConfirmResult.DONT_SAVE */;
        }
        let message;
        let detail = nls.localize('saveChangesDetail', "Your changes will be lost if you don't save them.");
        if (fileNamesOrResources.length === 1) {
            message = nls.localize('saveChangesMessage', "Do you want to save the changes you made to {0}?", typeof fileNamesOrResources[0] === 'string' ? fileNamesOrResources[0] : resources.basename(fileNamesOrResources[0]));
        }
        else {
            message = nls.localize('saveChangesMessages', "Do you want to save the changes to the following {0} files?", fileNamesOrResources.length);
            detail = getFileNamesMessage(fileNamesOrResources) + '\n' + detail;
        }
        const { result } = await this.dialogService.prompt({
            type: Severity.Warning,
            message,
            detail,
            buttons: [
                {
                    label: fileNamesOrResources.length > 1 ?
                        nls.localize({ key: 'saveAll', comment: ['&& denotes a mnemonic'] }, "&&Save All") :
                        nls.localize({ key: 'save', comment: ['&& denotes a mnemonic'] }, "&&Save"),
                    run: () => 0 /* ConfirmResult.SAVE */
                },
                {
                    label: nls.localize({ key: 'dontSave', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save"),
                    run: () => 1 /* ConfirmResult.DONT_SAVE */
                }
            ],
            cancelButton: {
                run: () => 2 /* ConfirmResult.CANCEL */
            }
        });
        return result;
    }
    addFileSchemaIfNeeded(schema, _isFolder) {
        return schema === Schemas.untitled ? [Schemas.file] : (schema !== Schemas.file ? [schema, Schemas.file] : [schema]);
    }
    async pickFileFolderAndOpenSimplified(schema, options, preferNewWindow) {
        const title = nls.localize('openFileOrFolder.title', 'Open File or Folder');
        const availableFileSystems = this.addFileSchemaIfNeeded(schema);
        const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
        if (uri) {
            const stat = await this.fileService.stat(uri);
            const toOpen = stat.isDirectory ? { folderUri: uri } : { fileUri: uri };
            if (!isWorkspaceToOpen(toOpen) && isFileToOpen(toOpen)) {
                this.addFileToRecentlyOpened(toOpen.fileUri);
            }
            if (stat.isDirectory || options.forceNewWindow || preferNewWindow) {
                await this.hostService.openWindow([toOpen], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
            else {
                await this.editorService.openEditors([{ resource: uri, options: { source: EditorOpenSource.USER, pinned: true } }], undefined, { validateTrust: true });
            }
        }
    }
    async pickFileAndOpenSimplified(schema, options, preferNewWindow) {
        const title = nls.localize('openFile.title', 'Open File');
        const availableFileSystems = this.addFileSchemaIfNeeded(schema);
        const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
        if (uri) {
            this.addFileToRecentlyOpened(uri);
            if (options.forceNewWindow || preferNewWindow) {
                await this.hostService.openWindow([{ fileUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
            else {
                await this.editorService.openEditors([{ resource: uri, options: { source: EditorOpenSource.USER, pinned: true } }], undefined, { validateTrust: true });
            }
        }
    }
    addFileToRecentlyOpened(uri) {
        this.workspacesService.addRecentlyOpened([{ fileUri: uri, label: this.labelService.getUriLabel(uri) }]);
    }
    async pickFolderAndOpenSimplified(schema, options) {
        const title = nls.localize('openFolder.title', 'Open Folder');
        const availableFileSystems = this.addFileSchemaIfNeeded(schema, true);
        const uri = await this.pickResource({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
        if (uri) {
            return this.hostService.openWindow([{ folderUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
        }
    }
    async pickWorkspaceAndOpenSimplified(schema, options) {
        const title = nls.localize('openWorkspace.title', 'Open Workspace from File');
        const filters = [{ name: nls.localize('filterName.workspace', 'Workspace'), extensions: [WORKSPACE_EXTENSION] }];
        const availableFileSystems = this.addFileSchemaIfNeeded(schema, true);
        const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, filters, availableFileSystems });
        if (uri) {
            return this.hostService.openWindow([{ workspaceUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
        }
    }
    async pickFileToSaveSimplified(schema, options) {
        if (!options.availableFileSystems) {
            options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
        }
        options.title = nls.localize('saveFileAs.title', 'Save As');
        const uri = await this.saveRemoteResource(options);
        if (uri) {
            this.addFileToRecentlyOpened(uri);
        }
        return uri;
    }
    async showSaveDialogSimplified(schema, options) {
        if (!options.availableFileSystems) {
            options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
        }
        return this.saveRemoteResource(options);
    }
    async showOpenDialogSimplified(schema, options) {
        if (!options.availableFileSystems) {
            options.availableFileSystems = this.addFileSchemaIfNeeded(schema, options.canSelectFolders);
        }
        const uri = await this.pickResource(options);
        return uri ? [uri] : undefined;
    }
    getSimpleFileDialog() {
        return this.instantiationService.createInstance(SimpleFileDialog);
    }
    pickResource(options) {
        return this.getSimpleFileDialog().showOpenDialog(options);
    }
    saveRemoteResource(options) {
        return this.getSimpleFileDialog().showSaveDialog(options);
    }
    getSchemeFilterForWindow(defaultUriScheme) {
        return defaultUriScheme ?? this.pathService.defaultUriScheme;
    }
    getAuthorityFilterForWindow() {
        return this.environmentService.remoteAuthority;
    }
    getFileSystemSchema(options) {
        return options.availableFileSystems && options.availableFileSystems[0] || this.getSchemeFilterForWindow(options.defaultUri?.scheme);
    }
    getWorkspaceAvailableFileSystems(options) {
        if (options.availableFileSystems && (options.availableFileSystems.length > 0)) {
            return options.availableFileSystems;
        }
        const availableFileSystems = [Schemas.file];
        if (this.environmentService.remoteAuthority) {
            availableFileSystems.unshift(Schemas.vscodeRemote);
        }
        return availableFileSystems;
    }
    getPickFileToSaveDialogOptions(defaultUri, availableFileSystems) {
        const options = {
            defaultUri,
            title: nls.localize('saveAsTitle', "Save As"),
            availableFileSystems
        };
        // Build the file filter by using our known languages
        const ext = defaultUri ? resources.extname(defaultUri) : undefined;
        let matchingFilter;
        const registeredLanguageNames = this.languageService.getSortedRegisteredLanguageNames();
        const registeredLanguageFilters = coalesce(registeredLanguageNames.map(({ languageName, languageId }) => {
            const extensions = this.languageService.getExtensions(languageId);
            if (!extensions.length) {
                return null;
            }
            const filter = { name: languageName, extensions: distinct(extensions).slice(0, 10).map(e => trim(e, '.')) };
            // https://github.com/microsoft/vscode/issues/115860
            const extOrPlaintext = ext || PLAINTEXT_EXTENSION;
            if (!matchingFilter && extensions.includes(extOrPlaintext)) {
                matchingFilter = filter;
                // The selected extension must be in the set of extensions that are in the filter list that is sent to the save dialog.
                // If it isn't, add it manually. https://github.com/microsoft/vscode/issues/147657
                const trimmedExt = trim(extOrPlaintext, '.');
                if (!filter.extensions.includes(trimmedExt)) {
                    filter.extensions.unshift(trimmedExt);
                }
                return null; // first matching filter will be added to the top
            }
            return filter;
        }));
        // We have no matching filter, e.g. because the language
        // is unknown. We still add the extension to the list of
        // filters though so that it can be picked
        // (https://github.com/microsoft/vscode/issues/96283)
        if (!matchingFilter && ext) {
            matchingFilter = { name: trim(ext, '.').toUpperCase(), extensions: [trim(ext, '.')] };
        }
        // Order of filters is
        // - All Files (we MUST do this to fix macOS issue https://github.com/microsoft/vscode/issues/102713)
        // - File Extension Match (if any)
        // - All Languages
        // - No Extension
        options.filters = coalesce([
            { name: nls.localize('allFiles', "All Files"), extensions: ['*'] },
            matchingFilter,
            ...registeredLanguageFilters,
            { name: nls.localize('noExt', "No Extension"), extensions: [''] }
        ]);
        return options;
    }
};
AbstractFileDialogService = __decorate([
    __param(0, IHostService),
    __param(1, IWorkspaceContextService),
    __param(2, IHistoryService),
    __param(3, IWorkbenchEnvironmentService),
    __param(4, IInstantiationService),
    __param(5, IConfigurationService),
    __param(6, IFileService),
    __param(7, IOpenerService),
    __param(8, IDialogService),
    __param(9, ILanguageService),
    __param(10, IWorkspacesService),
    __param(11, ILabelService),
    __param(12, IPathService),
    __param(13, ICommandService),
    __param(14, IEditorService),
    __param(15, ICodeEditorService),
    __param(16, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractFileDialogService);
export { AbstractFileDialogService };
