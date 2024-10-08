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
import { Lazy } from '../../../base/common/lazy.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import * as path from '../../../base/common/path.js';
import * as process from '../../../base/common/process.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { IExtHostEditorTabs } from './extHostEditorTabs.js';
import { IExtHostExtensionService } from './extHostExtensionService.js';
import { CustomEditorTabInput, NotebookDiffEditorTabInput, NotebookEditorTabInput, TextDiffTabInput, TextTabInput } from './extHostTypes.js';
import { IExtHostWorkspace } from './extHostWorkspace.js';
import { AbstractVariableResolverService } from '../../services/configurationResolver/common/variableResolver.js';
import { IExtHostConfiguration } from './extHostConfiguration.js';
export const IExtHostVariableResolverProvider = createDecorator('IExtHostVariableResolverProvider');
class ExtHostVariableResolverService extends AbstractVariableResolverService {
    constructor(extensionService, workspaceService, editorService, editorTabs, configProvider, context, homeDir) {
        function getActiveUri() {
            if (editorService) {
                const activeEditor = editorService.activeEditor();
                if (activeEditor) {
                    return activeEditor.document.uri;
                }
                const activeTab = editorTabs.tabGroups.all.find(group => group.isActive)?.activeTab;
                if (activeTab !== undefined) {
                    // Resolve a resource from the tab
                    if (activeTab.input instanceof TextDiffTabInput || activeTab.input instanceof NotebookDiffEditorTabInput) {
                        return activeTab.input.modified;
                    }
                    else if (activeTab.input instanceof TextTabInput || activeTab.input instanceof NotebookEditorTabInput || activeTab.input instanceof CustomEditorTabInput) {
                        return activeTab.input.uri;
                    }
                }
            }
            return undefined;
        }
        super({
            getFolderUri: (folderName) => {
                const found = context.folders.filter(f => f.name === folderName);
                if (found && found.length > 0) {
                    return found[0].uri;
                }
                return undefined;
            },
            getWorkspaceFolderCount: () => {
                return context.folders.length;
            },
            getConfigurationValue: (folderUri, section) => {
                return configProvider.getConfiguration(undefined, folderUri).get(section);
            },
            getAppRoot: () => {
                return process.cwd();
            },
            getExecPath: () => {
                return process.env['VSCODE_EXEC_PATH'];
            },
            getFilePath: () => {
                const activeUri = getActiveUri();
                if (activeUri) {
                    return path.normalize(activeUri.fsPath);
                }
                return undefined;
            },
            getWorkspaceFolderPathForFile: () => {
                if (workspaceService) {
                    const activeUri = getActiveUri();
                    if (activeUri) {
                        const ws = workspaceService.getWorkspaceFolder(activeUri);
                        if (ws) {
                            return path.normalize(ws.uri.fsPath);
                        }
                    }
                }
                return undefined;
            },
            getSelectedText: () => {
                if (editorService) {
                    const activeEditor = editorService.activeEditor();
                    if (activeEditor && !activeEditor.selection.isEmpty) {
                        return activeEditor.document.getText(activeEditor.selection);
                    }
                }
                return undefined;
            },
            getLineNumber: () => {
                if (editorService) {
                    const activeEditor = editorService.activeEditor();
                    if (activeEditor) {
                        return String(activeEditor.selection.end.line + 1);
                    }
                }
                return undefined;
            },
            getExtension: (id) => {
                return extensionService.getExtension(id);
            },
        }, undefined, homeDir ? Promise.resolve(homeDir) : undefined, Promise.resolve(process.env));
    }
}
let ExtHostVariableResolverProviderService = class ExtHostVariableResolverProviderService extends Disposable {
    constructor(extensionService, workspaceService, editorService, configurationService, editorTabs) {
        super();
        this.extensionService = extensionService;
        this.workspaceService = workspaceService;
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.editorTabs = editorTabs;
        this._resolver = new Lazy(async () => {
            const configProvider = await this.configurationService.getConfigProvider();
            const folders = await this.workspaceService.getWorkspaceFolders2() || [];
            const dynamic = { folders };
            this._register(this.workspaceService.onDidChangeWorkspace(async (e) => {
                dynamic.folders = await this.workspaceService.getWorkspaceFolders2() || [];
            }));
            return new ExtHostVariableResolverService(this.extensionService, this.workspaceService, this.editorService, this.editorTabs, configProvider, dynamic, this.homeDir());
        });
    }
    getResolver() {
        return this._resolver.value;
    }
    homeDir() {
        return undefined;
    }
};
ExtHostVariableResolverProviderService = __decorate([
    __param(0, IExtHostExtensionService),
    __param(1, IExtHostWorkspace),
    __param(2, IExtHostDocumentsAndEditors),
    __param(3, IExtHostConfiguration),
    __param(4, IExtHostEditorTabs),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ExtHostVariableResolverProviderService);
export { ExtHostVariableResolverProviderService };
