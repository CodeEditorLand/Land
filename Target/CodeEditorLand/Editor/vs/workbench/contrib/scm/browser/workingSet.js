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
import { Disposable, DisposableMap, DisposableStore } from '../../../../base/common/lifecycle.js';
import { autorun, autorunWithStore, derived } from '../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { observableConfigValue } from '../../../../platform/observable/common/platformObservableUtils.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { getProviderKey } from './util.js';
import { ISCMService } from '../common/scm.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
let SCMWorkingSetController = class SCMWorkingSetController extends Disposable {
    static { this.ID = 'workbench.contrib.scmWorkingSets'; }
    constructor(configurationService, editorGroupsService, scmService, storageService, layoutService) {
        super();
        this.configurationService = configurationService;
        this.editorGroupsService = editorGroupsService;
        this.scmService = scmService;
        this.storageService = storageService;
        this.layoutService = layoutService;
        this._enabledConfig = observableConfigValue('scm.workingSets.enabled', false, this.configurationService);
        this._repositoryDisposables = new DisposableMap();
        this._store.add(autorunWithStore((reader, store) => {
            if (!this._enabledConfig.read(reader)) {
                this.storageService.remove('scm.workingSets', 1 /* StorageScope.WORKSPACE */);
                this._repositoryDisposables.clearAndDisposeAll();
                return;
            }
            this._workingSets = this._loadWorkingSets();
            this.scmService.onDidAddRepository(this._onDidAddRepository, this, store);
            this.scmService.onDidRemoveRepository(this._onDidRemoveRepository, this, store);
            for (const repository of this.scmService.repositories) {
                this._onDidAddRepository(repository);
            }
        }));
    }
    _onDidAddRepository(repository) {
        const disposables = new DisposableStore();
        const historyItemRefId = derived(reader => {
            const historyProvider = repository.provider.historyProvider.read(reader);
            const historyItemRef = historyProvider?.historyItemRef.read(reader);
            return historyItemRef?.id;
        });
        disposables.add(autorun(async (reader) => {
            const historyItemRefIdValue = historyItemRefId.read(reader);
            if (!historyItemRefIdValue) {
                return;
            }
            const providerKey = getProviderKey(repository.provider);
            const repositoryWorkingSets = this._workingSets.get(providerKey);
            if (!repositoryWorkingSets) {
                this._workingSets.set(providerKey, { currentHistoryItemGroupId: historyItemRefIdValue, editorWorkingSets: new Map() });
                return;
            }
            // Editors for the current working set are automatically restored
            if (repositoryWorkingSets.currentHistoryItemGroupId === historyItemRefIdValue) {
                return;
            }
            // Save the working set
            this._saveWorkingSet(providerKey, historyItemRefIdValue, repositoryWorkingSets);
            // Restore the working set
            await this._restoreWorkingSet(providerKey, historyItemRefIdValue);
        }));
        this._repositoryDisposables.set(repository, disposables);
    }
    _onDidRemoveRepository(repository) {
        this._repositoryDisposables.deleteAndDispose(repository);
    }
    _loadWorkingSets() {
        const workingSets = new Map();
        const workingSetsRaw = this.storageService.get('scm.workingSets', 1 /* StorageScope.WORKSPACE */);
        if (!workingSetsRaw) {
            return workingSets;
        }
        for (const serializedWorkingSet of JSON.parse(workingSetsRaw)) {
            workingSets.set(serializedWorkingSet.providerKey, {
                currentHistoryItemGroupId: serializedWorkingSet.currentHistoryItemGroupId,
                editorWorkingSets: new Map(serializedWorkingSet.editorWorkingSets)
            });
        }
        return workingSets;
    }
    _saveWorkingSet(providerKey, currentHistoryItemGroupId, repositoryWorkingSets) {
        const previousHistoryItemGroupId = repositoryWorkingSets.currentHistoryItemGroupId;
        const editorWorkingSets = repositoryWorkingSets.editorWorkingSets;
        const editorWorkingSet = this.editorGroupsService.saveWorkingSet(previousHistoryItemGroupId);
        this._workingSets.set(providerKey, { currentHistoryItemGroupId, editorWorkingSets: editorWorkingSets.set(previousHistoryItemGroupId, editorWorkingSet) });
        // Save to storage
        const workingSets = [];
        for (const [providerKey, { currentHistoryItemGroupId, editorWorkingSets }] of this._workingSets) {
            workingSets.push({ providerKey, currentHistoryItemGroupId, editorWorkingSets: [...editorWorkingSets] });
        }
        this.storageService.store('scm.workingSets', JSON.stringify(workingSets), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    async _restoreWorkingSet(providerKey, currentHistoryItemGroupId) {
        const workingSets = this._workingSets.get(providerKey);
        if (!workingSets) {
            return;
        }
        let editorWorkingSetId = workingSets.editorWorkingSets.get(currentHistoryItemGroupId);
        if (!editorWorkingSetId && this.configurationService.getValue('scm.workingSets.default') === 'empty') {
            editorWorkingSetId = 'empty';
        }
        if (editorWorkingSetId) {
            // Applying a working set can be the result of a user action that has been
            // initiated from the terminal (ex: switching branches). As such, we want
            // to preserve the focus in the terminal. This does not cover the scenario
            // in which the terminal is in the editor part.
            const preserveFocus = this.layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */);
            await this.editorGroupsService.applyWorkingSet(editorWorkingSetId, { preserveFocus });
        }
    }
    dispose() {
        this._repositoryDisposables.dispose();
        super.dispose();
    }
};
SCMWorkingSetController = __decorate([
    __param(0, IConfigurationService),
    __param(1, IEditorGroupsService),
    __param(2, ISCMService),
    __param(3, IStorageService),
    __param(4, IWorkbenchLayoutService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], SCMWorkingSetController);
export { SCMWorkingSetController };
