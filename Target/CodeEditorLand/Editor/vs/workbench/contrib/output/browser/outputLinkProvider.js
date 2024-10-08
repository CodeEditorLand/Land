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
var OutputLinkProvider_1;
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { OUTPUT_MODE_ID, LOG_MODE_ID } from '../../../services/output/common/output.js';
import { dispose, Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { createWebWorker } from '../../../../base/browser/defaultWorkerFactory.js';
import { WorkerTextModelSyncClient } from '../../../../editor/common/services/textModelSync/textModelSync.impl.js';
let OutputLinkProvider = class OutputLinkProvider extends Disposable {
    static { OutputLinkProvider_1 = this; }
    static { this.DISPOSE_WORKER_TIME = 3 * 60 * 1000; } // dispose worker after 3 minutes of inactivity
    constructor(contextService, modelService, languageFeaturesService) {
        super();
        this.contextService = contextService;
        this.modelService = modelService;
        this.languageFeaturesService = languageFeaturesService;
        this.disposeWorkerScheduler = new RunOnceScheduler(() => this.disposeWorker(), OutputLinkProvider_1.DISPOSE_WORKER_TIME);
        this.registerListeners();
        this.updateLinkProviderWorker();
    }
    registerListeners() {
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.updateLinkProviderWorker()));
    }
    updateLinkProviderWorker() {
        // Setup link provider depending on folders being opened or not
        const folders = this.contextService.getWorkspace().folders;
        if (folders.length > 0) {
            if (!this.linkProviderRegistration) {
                this.linkProviderRegistration = this.languageFeaturesService.linkProvider.register([{ language: OUTPUT_MODE_ID, scheme: '*' }, { language: LOG_MODE_ID, scheme: '*' }], {
                    provideLinks: async (model) => {
                        const links = await this.provideLinks(model.uri);
                        return links && { links };
                    }
                });
            }
        }
        else {
            dispose(this.linkProviderRegistration);
            this.linkProviderRegistration = undefined;
        }
        // Dispose worker to recreate with folders on next provideLinks request
        this.disposeWorker();
        this.disposeWorkerScheduler.cancel();
    }
    getOrCreateWorker() {
        this.disposeWorkerScheduler.schedule();
        if (!this.worker) {
            this.worker = new OutputLinkWorkerClient(this.contextService, this.modelService);
        }
        return this.worker;
    }
    async provideLinks(modelUri) {
        return this.getOrCreateWorker().provideLinks(modelUri);
    }
    disposeWorker() {
        if (this.worker) {
            this.worker.dispose();
            this.worker = undefined;
        }
    }
};
OutputLinkProvider = OutputLinkProvider_1 = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IModelService),
    __param(2, ILanguageFeaturesService),
    __metadata("design:paramtypes", [Object, Object, Object])
], OutputLinkProvider);
export { OutputLinkProvider };
let OutputLinkWorkerClient = class OutputLinkWorkerClient extends Disposable {
    constructor(contextService, modelService) {
        super();
        this.contextService = contextService;
        this._workerClient = this._register(createWebWorker('vs/workbench/contrib/output/common/outputLinkComputer', 'OutputLinkDetectionWorker'));
        this._workerTextModelSyncClient = WorkerTextModelSyncClient.create(this._workerClient, modelService);
        this._initializeBarrier = this._ensureWorkspaceFolders();
    }
    async _ensureWorkspaceFolders() {
        await this._workerClient.proxy.$setWorkspaceFolders(this.contextService.getWorkspace().folders.map(folder => folder.uri.toString()));
    }
    async provideLinks(modelUri) {
        await this._initializeBarrier;
        await this._workerTextModelSyncClient.ensureSyncedResources([modelUri]);
        return this._workerClient.proxy.$computeLinks(modelUri.toString());
    }
};
OutputLinkWorkerClient = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IModelService),
    __metadata("design:paramtypes", [Object, Object])
], OutputLinkWorkerClient);
