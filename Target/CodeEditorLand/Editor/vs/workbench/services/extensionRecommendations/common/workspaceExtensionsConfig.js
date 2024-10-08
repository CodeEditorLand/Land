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
import { distinct } from '../../../../base/common/arrays.js';
import { Emitter } from '../../../../base/common/event.js';
import { parse } from '../../../../base/common/json.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { getIconClasses } from '../../../../editor/common/services/getIconClasses.js';
import { FileKind, IFileService } from '../../../../platform/files/common/files.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { isWorkspace, IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { localize } from '../../../../nls.js';
import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
import { ResourceMap } from '../../../../base/common/map.js';
export const EXTENSIONS_CONFIG = '.vscode/extensions.json';
export const IWorkspaceExtensionsConfigService = createDecorator('IWorkspaceExtensionsConfigService');
let WorkspaceExtensionsConfigService = class WorkspaceExtensionsConfigService extends Disposable {
    constructor(workspaceContextService, fileService, quickInputService, modelService, languageService, jsonEditingService) {
        super();
        this.workspaceContextService = workspaceContextService;
        this.fileService = fileService;
        this.quickInputService = quickInputService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.jsonEditingService = jsonEditingService;
        this._onDidChangeExtensionsConfigs = this._register(new Emitter());
        this.onDidChangeExtensionsConfigs = this._onDidChangeExtensionsConfigs.event;
        this._register(workspaceContextService.onDidChangeWorkspaceFolders(e => this._onDidChangeExtensionsConfigs.fire()));
        this._register(fileService.onDidFilesChange(e => {
            const workspace = workspaceContextService.getWorkspace();
            if ((workspace.configuration && e.affects(workspace.configuration))
                || workspace.folders.some(folder => e.affects(folder.toResource(EXTENSIONS_CONFIG)))) {
                this._onDidChangeExtensionsConfigs.fire();
            }
        }));
    }
    async getExtensionsConfigs() {
        const workspace = this.workspaceContextService.getWorkspace();
        const result = [];
        const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
        if (workspaceExtensionsConfigContent) {
            result.push(workspaceExtensionsConfigContent);
        }
        result.push(...await Promise.all(workspace.folders.map(workspaceFolder => this.resolveWorkspaceFolderExtensionConfig(workspaceFolder))));
        return result;
    }
    async getRecommendations() {
        const configs = await this.getExtensionsConfigs();
        return distinct(configs.flatMap(c => c.recommendations ? c.recommendations.map(c => c.toLowerCase()) : []));
    }
    async getUnwantedRecommendations() {
        const configs = await this.getExtensionsConfigs();
        return distinct(configs.flatMap(c => c.unwantedRecommendations ? c.unwantedRecommendations.map(c => c.toLowerCase()) : []));
    }
    async toggleRecommendation(extensionId) {
        extensionId = extensionId.toLowerCase();
        const workspace = this.workspaceContextService.getWorkspace();
        const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
        const workspaceFolderExtensionsConfigContents = new ResourceMap();
        await Promise.all(workspace.folders.map(async (workspaceFolder) => {
            const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
            workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
        }));
        const isWorkspaceRecommended = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.recommendations?.some(r => r.toLowerCase() === extensionId);
        const recommendedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.recommendations?.some(r => r.toLowerCase() === extensionId));
        const isRecommended = isWorkspaceRecommended || recommendedWorksapceFolders.length > 0;
        const workspaceOrFolders = isRecommended
            ? await this.pickWorkspaceOrFolders(recommendedWorksapceFolders, isWorkspaceRecommended ? workspace : undefined, localize('select for remove', "Remove extension recommendation from"))
            : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : undefined, localize('select for add', "Add extension recommendation to"));
        for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
            if (isWorkspace(workspaceOrWorkspaceFolder)) {
                await this.addOrRemoveWorkspaceRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isRecommended);
            }
            else {
                await this.addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isRecommended);
            }
        }
    }
    async toggleUnwantedRecommendation(extensionId) {
        const workspace = this.workspaceContextService.getWorkspace();
        const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
        const workspaceFolderExtensionsConfigContents = new ResourceMap();
        await Promise.all(workspace.folders.map(async (workspaceFolder) => {
            const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
            workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
        }));
        const isWorkspaceUnwanted = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.unwantedRecommendations?.some(r => r === extensionId);
        const unWantedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.unwantedRecommendations?.some(r => r === extensionId));
        const isUnwanted = isWorkspaceUnwanted || unWantedWorksapceFolders.length > 0;
        const workspaceOrFolders = isUnwanted
            ? await this.pickWorkspaceOrFolders(unWantedWorksapceFolders, isWorkspaceUnwanted ? workspace : undefined, localize('select for remove', "Remove extension recommendation from"))
            : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : undefined, localize('select for add', "Add extension recommendation to"));
        for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
            if (isWorkspace(workspaceOrWorkspaceFolder)) {
                await this.addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isUnwanted);
            }
            else {
                await this.addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isUnwanted);
            }
        }
    }
    async addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
        const values = [];
        if (add) {
            if (Array.isArray(extensionsConfigContent.recommendations)) {
                values.push({ path: ['recommendations', -1], value: extensionId });
            }
            else {
                values.push({ path: ['recommendations'], value: [extensionId] });
            }
            const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(['unwantedRecommendations'], extensionsConfigContent.unwantedRecommendations, extensionId);
            if (unwantedRecommendationEdit) {
                values.push(unwantedRecommendationEdit);
            }
        }
        else if (extensionsConfigContent.recommendations) {
            const recommendationEdit = this.getEditToRemoveValueFromArray(['recommendations'], extensionsConfigContent.recommendations, extensionId);
            if (recommendationEdit) {
                values.push(recommendationEdit);
            }
        }
        if (values.length) {
            return this.jsonEditingService.write(workspaceFolder.toResource(EXTENSIONS_CONFIG), values, true);
        }
    }
    async addOrRemoveWorkspaceRecommendation(extensionId, workspace, extensionsConfigContent, add) {
        const values = [];
        if (extensionsConfigContent) {
            if (add) {
                const path = ['extensions', 'recommendations'];
                if (Array.isArray(extensionsConfigContent.recommendations)) {
                    values.push({ path: [...path, -1], value: extensionId });
                }
                else {
                    values.push({ path, value: [extensionId] });
                }
                const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(['extensions', 'unwantedRecommendations'], extensionsConfigContent.unwantedRecommendations, extensionId);
                if (unwantedRecommendationEdit) {
                    values.push(unwantedRecommendationEdit);
                }
            }
            else if (extensionsConfigContent.recommendations) {
                const recommendationEdit = this.getEditToRemoveValueFromArray(['extensions', 'recommendations'], extensionsConfigContent.recommendations, extensionId);
                if (recommendationEdit) {
                    values.push(recommendationEdit);
                }
            }
        }
        else if (add) {
            values.push({ path: ['extensions'], value: { recommendations: [extensionId] } });
        }
        if (values.length) {
            return this.jsonEditingService.write(workspace.configuration, values, true);
        }
    }
    async addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
        const values = [];
        if (add) {
            const path = ['unwantedRecommendations'];
            if (Array.isArray(extensionsConfigContent.unwantedRecommendations)) {
                values.push({ path: [...path, -1], value: extensionId });
            }
            else {
                values.push({ path, value: [extensionId] });
            }
            const recommendationEdit = this.getEditToRemoveValueFromArray(['recommendations'], extensionsConfigContent.recommendations, extensionId);
            if (recommendationEdit) {
                values.push(recommendationEdit);
            }
        }
        else if (extensionsConfigContent.unwantedRecommendations) {
            const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(['unwantedRecommendations'], extensionsConfigContent.unwantedRecommendations, extensionId);
            if (unwantedRecommendationEdit) {
                values.push(unwantedRecommendationEdit);
            }
        }
        if (values.length) {
            return this.jsonEditingService.write(workspaceFolder.toResource(EXTENSIONS_CONFIG), values, true);
        }
    }
    async addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspace, extensionsConfigContent, add) {
        const values = [];
        if (extensionsConfigContent) {
            if (add) {
                const path = ['extensions', 'unwantedRecommendations'];
                if (Array.isArray(extensionsConfigContent.recommendations)) {
                    values.push({ path: [...path, -1], value: extensionId });
                }
                else {
                    values.push({ path, value: [extensionId] });
                }
                const recommendationEdit = this.getEditToRemoveValueFromArray(['extensions', 'recommendations'], extensionsConfigContent.recommendations, extensionId);
                if (recommendationEdit) {
                    values.push(recommendationEdit);
                }
            }
            else if (extensionsConfigContent.unwantedRecommendations) {
                const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(['extensions', 'unwantedRecommendations'], extensionsConfigContent.unwantedRecommendations, extensionId);
                if (unwantedRecommendationEdit) {
                    values.push(unwantedRecommendationEdit);
                }
            }
        }
        else if (add) {
            values.push({ path: ['extensions'], value: { unwantedRecommendations: [extensionId] } });
        }
        if (values.length) {
            return this.jsonEditingService.write(workspace.configuration, values, true);
        }
    }
    async pickWorkspaceOrFolders(workspaceFolders, workspace, placeHolder) {
        const workspaceOrFolders = workspace ? [...workspaceFolders, workspace] : [...workspaceFolders];
        if (workspaceOrFolders.length === 1) {
            return workspaceOrFolders;
        }
        const folderPicks = workspaceFolders.map(workspaceFolder => {
            return {
                label: workspaceFolder.name,
                description: localize('workspace folder', "Workspace Folder"),
                workspaceOrFolder: workspaceFolder,
                iconClasses: getIconClasses(this.modelService, this.languageService, workspaceFolder.uri, FileKind.ROOT_FOLDER)
            };
        });
        if (workspace) {
            folderPicks.push({ type: 'separator' });
            folderPicks.push({
                label: localize('workspace', "Workspace"),
                workspaceOrFolder: workspace,
            });
        }
        const result = await this.quickInputService.pick(folderPicks, { placeHolder, canPickMany: true }) || [];
        return result.map(r => r.workspaceOrFolder);
    }
    async resolveWorkspaceExtensionConfig(workspaceConfigurationResource) {
        try {
            const content = await this.fileService.readFile(workspaceConfigurationResource);
            const extensionsConfigContent = parse(content.value.toString())['extensions'];
            return extensionsConfigContent ? this.parseExtensionConfig(extensionsConfigContent) : undefined;
        }
        catch (e) { /* Ignore */ }
        return undefined;
    }
    async resolveWorkspaceFolderExtensionConfig(workspaceFolder) {
        try {
            const content = await this.fileService.readFile(workspaceFolder.toResource(EXTENSIONS_CONFIG));
            const extensionsConfigContent = parse(content.value.toString());
            return this.parseExtensionConfig(extensionsConfigContent);
        }
        catch (e) { /* ignore */ }
        return {};
    }
    parseExtensionConfig(extensionsConfigContent) {
        return {
            recommendations: distinct((extensionsConfigContent.recommendations || []).map(e => e.toLowerCase())),
            unwantedRecommendations: distinct((extensionsConfigContent.unwantedRecommendations || []).map(e => e.toLowerCase()))
        };
    }
    getEditToRemoveValueFromArray(path, array, value) {
        const index = array?.indexOf(value);
        if (index !== undefined && index !== -1) {
            return { path: [...path, index], value: undefined };
        }
        return undefined;
    }
};
WorkspaceExtensionsConfigService = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IFileService),
    __param(2, IQuickInputService),
    __param(3, IModelService),
    __param(4, ILanguageService),
    __param(5, IJSONEditingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], WorkspaceExtensionsConfigService);
export { WorkspaceExtensionsConfigService };
registerSingleton(IWorkspaceExtensionsConfigService, WorkspaceExtensionsConfigService, 1 /* InstantiationType.Delayed */);
