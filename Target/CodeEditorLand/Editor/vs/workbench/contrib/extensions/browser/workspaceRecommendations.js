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
import { EXTENSION_IDENTIFIER_PATTERN } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { distinct, equals } from '../../../../base/common/arrays.js';
import { ExtensionRecommendations } from './extensionRecommendations.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { IWorkspaceExtensionsConfigService } from '../../../services/extensionRecommendations/common/workspaceExtensionsConfig.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { IWorkbenchExtensionManagementService } from '../../../services/extensionManagement/common/extensionManagement.js';
const WORKSPACE_EXTENSIONS_FOLDER = '.vscode/extensions';
let WorkspaceRecommendations = class WorkspaceRecommendations extends ExtensionRecommendations {
    get recommendations() { return this._recommendations; }
    get ignoredRecommendations() { return this._ignoredRecommendations; }
    constructor(workspaceExtensionsConfigService, contextService, uriIdentityService, fileService, workbenchExtensionManagementService, notificationService) {
        super();
        this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
        this.contextService = contextService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.workbenchExtensionManagementService = workbenchExtensionManagementService;
        this.notificationService = notificationService;
        this._recommendations = [];
        this._onDidChangeRecommendations = this._register(new Emitter());
        this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
        this._ignoredRecommendations = [];
        this.workspaceExtensions = [];
        this.onDidChangeWorkspaceExtensionsScheduler = this._register(new RunOnceScheduler(() => this.onDidChangeWorkspaceExtensionsFolders(), 1000));
    }
    async doActivate() {
        this.workspaceExtensions = await this.fetchWorkspaceExtensions();
        await this.fetch();
        this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(() => this.onDidChangeExtensionsConfigs()));
        for (const folder of this.contextService.getWorkspace().folders) {
            this._register(this.fileService.watch(this.uriIdentityService.extUri.joinPath(folder.uri, WORKSPACE_EXTENSIONS_FOLDER)));
        }
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.onDidChangeWorkspaceExtensionsScheduler.schedule()));
        this._register(this.fileService.onDidFilesChange(e => {
            if (this.contextService.getWorkspace().folders.some(folder => e.affects(this.uriIdentityService.extUri.joinPath(folder.uri, WORKSPACE_EXTENSIONS_FOLDER), 1 /* FileChangeType.ADDED */, 2 /* FileChangeType.DELETED */))) {
                this.onDidChangeWorkspaceExtensionsScheduler.schedule();
            }
        }));
    }
    async onDidChangeWorkspaceExtensionsFolders() {
        const existing = this.workspaceExtensions;
        this.workspaceExtensions = await this.fetchWorkspaceExtensions();
        if (!equals(existing, this.workspaceExtensions, (a, b) => this.uriIdentityService.extUri.isEqual(a, b))) {
            this.onDidChangeExtensionsConfigs();
        }
    }
    async fetchWorkspaceExtensions() {
        const workspaceExtensions = [];
        for (const workspaceFolder of this.contextService.getWorkspace().folders) {
            const extensionsLocaiton = this.uriIdentityService.extUri.joinPath(workspaceFolder.uri, WORKSPACE_EXTENSIONS_FOLDER);
            try {
                const stat = await this.fileService.resolve(extensionsLocaiton);
                for (const extension of stat.children ?? []) {
                    if (!extension.isDirectory) {
                        continue;
                    }
                    workspaceExtensions.push(extension.resource);
                }
            }
            catch (error) {
                // ignore
            }
        }
        if (workspaceExtensions.length) {
            const resourceExtensions = await this.workbenchExtensionManagementService.getExtensions(workspaceExtensions);
            return resourceExtensions.map(extension => extension.location);
        }
        return [];
    }
    /**
     * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
     */
    async fetch() {
        const extensionsConfigs = await this.workspaceExtensionsConfigService.getExtensionsConfigs();
        const { invalidRecommendations, message } = await this.validateExtensions(extensionsConfigs);
        if (invalidRecommendations.length) {
            this.notificationService.warn(`The ${invalidRecommendations.length} extension(s) below, in workspace recommendations have issues:\n${message}`);
        }
        this._recommendations = [];
        this._ignoredRecommendations = [];
        for (const extensionsConfig of extensionsConfigs) {
            if (extensionsConfig.unwantedRecommendations) {
                for (const unwantedRecommendation of extensionsConfig.unwantedRecommendations) {
                    if (invalidRecommendations.indexOf(unwantedRecommendation) === -1) {
                        this._ignoredRecommendations.push(unwantedRecommendation);
                    }
                }
            }
            if (extensionsConfig.recommendations) {
                for (const extensionId of extensionsConfig.recommendations) {
                    if (invalidRecommendations.indexOf(extensionId) === -1) {
                        this._recommendations.push({
                            extension: extensionId,
                            reason: {
                                reasonId: 0 /* ExtensionRecommendationReason.Workspace */,
                                reasonText: localize('workspaceRecommendation', "This extension is recommended by users of the current workspace.")
                            }
                        });
                    }
                }
            }
        }
        for (const extension of this.workspaceExtensions) {
            this._recommendations.push({
                extension,
                reason: {
                    reasonId: 0 /* ExtensionRecommendationReason.Workspace */,
                    reasonText: localize('workspaceRecommendation', "This extension is recommended by users of the current workspace.")
                }
            });
        }
    }
    async validateExtensions(contents) {
        const validExtensions = [];
        const invalidExtensions = [];
        let message = '';
        const allRecommendations = distinct(contents.flatMap(({ recommendations }) => recommendations || []));
        const regEx = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
        for (const extensionId of allRecommendations) {
            if (regEx.test(extensionId)) {
                validExtensions.push(extensionId);
            }
            else {
                invalidExtensions.push(extensionId);
                message += `${extensionId} (bad format) Expected: <provider>.<name>\n`;
            }
        }
        return { validRecommendations: validExtensions, invalidRecommendations: invalidExtensions, message };
    }
    async onDidChangeExtensionsConfigs() {
        await this.fetch();
        this._onDidChangeRecommendations.fire();
    }
};
WorkspaceRecommendations = __decorate([
    __param(0, IWorkspaceExtensionsConfigService),
    __param(1, IWorkspaceContextService),
    __param(2, IUriIdentityService),
    __param(3, IFileService),
    __param(4, IWorkbenchExtensionManagementService),
    __param(5, INotificationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], WorkspaceRecommendations);
export { WorkspaceRecommendations };
