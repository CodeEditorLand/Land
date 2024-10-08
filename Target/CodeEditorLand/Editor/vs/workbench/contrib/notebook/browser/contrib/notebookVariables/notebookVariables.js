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
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import * as nls from '../../../../../../nls.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { SyncDescriptor } from '../../../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { Extensions, IViewDescriptorService } from '../../../../../common/views.js';
import { VIEWLET_ID as debugContainerId } from '../../../../debug/common/debug.js';
import { NOTEBOOK_VARIABLE_VIEW_ENABLED } from './notebookVariableContextKeys.js';
import { NotebookVariablesView } from './notebookVariablesView.js';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import { variablesViewIcon } from '../../notebookIcons.js';
import { NotebookSetting } from '../../../common/notebookCommon.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { INotebookKernelService } from '../../../common/notebookKernelService.js';
import { INotebookService } from '../../../common/notebookService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
let NotebookVariables = class NotebookVariables extends Disposable {
    constructor(contextKeyService, configurationService, editorService, notebookExecutionStateService, notebookKernelService, notebookDocumentService, viewDescriptorService) {
        super();
        this.configurationService = configurationService;
        this.editorService = editorService;
        this.notebookExecutionStateService = notebookExecutionStateService;
        this.notebookKernelService = notebookKernelService;
        this.notebookDocumentService = notebookDocumentService;
        this.viewDescriptorService = viewDescriptorService;
        this.listeners = [];
        this.initialized = false;
        this.viewEnabled = NOTEBOOK_VARIABLE_VIEW_ENABLED.bindTo(contextKeyService);
        this.listeners.push(this.editorService.onDidActiveEditorChange(() => this.handleInitEvent()));
        this.listeners.push(this.notebookExecutionStateService.onDidChangeExecution((e) => this.handleInitEvent(e.notebook)));
        this.configListener = configurationService.onDidChangeConfiguration((e) => this.handleConfigChange(e));
    }
    handleConfigChange(e) {
        if (e.affectsConfiguration(NotebookSetting.notebookVariablesView)) {
            this.handleInitEvent();
        }
    }
    handleInitEvent(notebook) {
        const enabled = this.editorService.activeEditorPane?.getId() === 'workbench.editor.repl' ||
            this.configurationService.getValue(NotebookSetting.notebookVariablesView) ||
            // old setting key
            this.configurationService.getValue('notebook.experimental.variablesView');
        if (enabled && (!!notebook || this.editorService.activeEditorPane?.getId() === 'workbench.editor.notebook')) {
            if (this.hasVariableProvider(notebook) && !this.initialized && this.initializeView()) {
                this.viewEnabled.set(true);
                this.initialized = true;
                this.listeners.forEach(listener => listener.dispose());
            }
        }
    }
    hasVariableProvider(notebookUri) {
        const notebook = notebookUri ?
            this.notebookDocumentService.getNotebookTextModel(notebookUri) :
            getNotebookEditorFromEditorPane(this.editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
        return notebook && this.notebookKernelService.getMatchingKernel(notebook).selected?.hasVariableProvider;
    }
    initializeView() {
        const debugViewContainer = this.viewDescriptorService.getViewContainerById(debugContainerId);
        if (debugViewContainer) {
            const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
            const viewDescriptor = {
                id: 'workbench.notebook.variables', name: nls.localize2('notebookVariables', "Notebook Variables"),
                containerIcon: variablesViewIcon, ctorDescriptor: new SyncDescriptor(NotebookVariablesView),
                order: 50, weight: 5, canToggleVisibility: true, canMoveView: true, collapsed: false, when: NOTEBOOK_VARIABLE_VIEW_ENABLED
            };
            viewsRegistry.registerViews([viewDescriptor], debugViewContainer);
            return true;
        }
        return false;
    }
    dispose() {
        super.dispose();
        this.listeners.forEach(listener => listener.dispose());
        this.configListener.dispose();
    }
};
NotebookVariables = __decorate([
    __param(0, IContextKeyService),
    __param(1, IConfigurationService),
    __param(2, IEditorService),
    __param(3, INotebookExecutionStateService),
    __param(4, INotebookKernelService),
    __param(5, INotebookService),
    __param(6, IViewDescriptorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], NotebookVariables);
export { NotebookVariables };
