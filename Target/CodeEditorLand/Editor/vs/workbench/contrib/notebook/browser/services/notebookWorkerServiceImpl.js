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
import { Disposable, DisposableStore, dispose, toDisposable } from '../../../../../base/common/lifecycle.js';
import { createWebWorker } from '../../../../../base/browser/defaultWorkerFactory.js';
import { CellUri, NotebookCellsChangeType } from '../../common/notebookCommon.js';
import { INotebookService } from '../../common/notebookService.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { TextModel } from '../../../../../editor/common/model/textModel.js';
import { Schemas } from '../../../../../base/common/network.js';
import { isEqual } from '../../../../../base/common/resources.js';
let NotebookEditorWorkerServiceImpl = class NotebookEditorWorkerServiceImpl extends Disposable {
    constructor(notebookService, modelService) {
        super();
        this._workerManager = this._register(new WorkerManager(notebookService, modelService));
    }
    canComputeDiff(original, modified) {
        throw new Error('Method not implemented.');
    }
    computeDiff(original, modified) {
        return this._workerManager.withWorker().then(client => {
            return client.computeDiff(original, modified);
        });
    }
    canPromptRecommendation(model) {
        return this._workerManager.withWorker().then(client => {
            return client.canPromptRecommendation(model);
        });
    }
};
NotebookEditorWorkerServiceImpl = __decorate([
    __param(0, INotebookService),
    __param(1, IModelService),
    __metadata("design:paramtypes", [Object, Object])
], NotebookEditorWorkerServiceImpl);
export { NotebookEditorWorkerServiceImpl };
class WorkerManager extends Disposable {
    // private _lastWorkerUsedTime: number;
    constructor(_notebookService, _modelService) {
        super();
        this._notebookService = _notebookService;
        this._modelService = _modelService;
        this._editorWorkerClient = null;
        // this._lastWorkerUsedTime = (new Date()).getTime();
    }
    withWorker() {
        // this._lastWorkerUsedTime = (new Date()).getTime();
        if (!this._editorWorkerClient) {
            this._editorWorkerClient = new NotebookWorkerClient(this._notebookService, this._modelService);
        }
        return Promise.resolve(this._editorWorkerClient);
    }
}
class NotebookEditorModelManager extends Disposable {
    constructor(_proxy, _notebookService, _modelService) {
        super();
        this._proxy = _proxy;
        this._notebookService = _notebookService;
        this._modelService = _modelService;
        this._syncedModels = Object.create(null);
        this._syncedModelsLastUsedTime = Object.create(null);
    }
    ensureSyncedResources(resources) {
        for (const resource of resources) {
            const resourceStr = resource.toString();
            if (!this._syncedModels[resourceStr]) {
                this._beginModelSync(resource);
            }
            if (this._syncedModels[resourceStr]) {
                this._syncedModelsLastUsedTime[resourceStr] = (new Date()).getTime();
            }
        }
    }
    _beginModelSync(resource) {
        const model = this._notebookService.listNotebookDocuments().find(document => document.uri.toString() === resource.toString());
        if (!model) {
            return;
        }
        const modelUrl = resource.toString();
        this._proxy.$acceptNewModel(model.uri.toString(), model.metadata, model.transientOptions.transientDocumentMetadata, model.cells.map(cell => ({
            handle: cell.handle,
            url: cell.uri.toString(),
            source: cell.textBuffer.getLinesContent(),
            eol: cell.textBuffer.getEOL(),
            versionId: cell.textModel?.getVersionId() ?? 0,
            language: cell.language,
            mime: cell.mime,
            cellKind: cell.cellKind,
            outputs: cell.outputs.map(op => ({ outputId: op.outputId, outputs: op.outputs })),
            metadata: cell.metadata,
            internalMetadata: cell.internalMetadata,
        })));
        const toDispose = new DisposableStore();
        const cellToDto = (cell) => {
            return {
                handle: cell.handle,
                url: cell.uri.toString(),
                source: cell.textBuffer.getLinesContent(),
                eol: cell.textBuffer.getEOL(),
                versionId: 0,
                language: cell.language,
                cellKind: cell.cellKind,
                outputs: cell.outputs.map(op => ({ outputId: op.outputId, outputs: op.outputs })),
                metadata: cell.metadata,
                internalMetadata: cell.internalMetadata,
            };
        };
        const cellHandlers = new Set();
        const addCellContentChangeHandler = (cell) => {
            cellHandlers.add(cell);
            toDispose.add(cell.onDidChangeContent((e) => {
                if (typeof e === 'object' && e.type === 'model') {
                    this._proxy.$acceptCellModelChanged(modelUrl, cell.handle, e.event);
                }
            }));
        };
        model.cells.forEach(cell => addCellContentChangeHandler(cell));
        // Possible some of the models have not yet been loaded.
        // If all have been loaded, for all cells, then no need to listen to model add events.
        if (model.cells.length !== cellHandlers.size) {
            toDispose.add(this._modelService.onModelAdded((textModel) => {
                if (textModel.uri.scheme !== Schemas.vscodeNotebookCell || !(textModel instanceof TextModel)) {
                    return;
                }
                const cellUri = CellUri.parse(textModel.uri);
                if (!cellUri || !isEqual(cellUri.notebook, model.uri)) {
                    return;
                }
                const cell = model.cells.find(cell => cell.handle === cellUri.handle);
                if (cell) {
                    addCellContentChangeHandler(cell);
                }
            }));
        }
        toDispose.add(model.onDidChangeContent((event) => {
            const dto = [];
            event.rawEvents
                .forEach(e => {
                switch (e.kind) {
                    case NotebookCellsChangeType.ModelChange:
                    case NotebookCellsChangeType.Initialize: {
                        dto.push({
                            kind: e.kind,
                            changes: e.changes.map(diff => [diff[0], diff[1], diff[2].map(cell => cellToDto(cell))])
                        });
                        for (const change of e.changes) {
                            for (const cell of change[2]) {
                                addCellContentChangeHandler(cell);
                            }
                        }
                        break;
                    }
                    case NotebookCellsChangeType.Move: {
                        dto.push({
                            kind: NotebookCellsChangeType.Move,
                            index: e.index,
                            length: e.length,
                            newIdx: e.newIdx,
                            cells: e.cells.map(cell => cellToDto(cell))
                        });
                        break;
                    }
                    case NotebookCellsChangeType.ChangeCellContent:
                        // Changes to cell content are handled by the cell model change listener.
                        break;
                    case NotebookCellsChangeType.ChangeDocumentMetadata:
                        dto.push({
                            kind: e.kind,
                            metadata: e.metadata
                        });
                    default:
                        dto.push(e);
                }
            });
            this._proxy.$acceptModelChanged(modelUrl.toString(), {
                rawEvents: dto,
                versionId: event.versionId
            });
        }));
        toDispose.add(model.onWillDispose(() => {
            this._stopModelSync(modelUrl);
        }));
        toDispose.add(toDisposable(() => {
            this._proxy.$acceptRemovedModel(modelUrl);
        }));
        this._syncedModels[modelUrl] = toDispose;
    }
    _stopModelSync(modelUrl) {
        const toDispose = this._syncedModels[modelUrl];
        delete this._syncedModels[modelUrl];
        delete this._syncedModelsLastUsedTime[modelUrl];
        dispose(toDispose);
    }
}
class NotebookWorkerClient extends Disposable {
    constructor(_notebookService, _modelService) {
        super();
        this._notebookService = _notebookService;
        this._modelService = _modelService;
        this._worker = null;
        this._modelManager = null;
    }
    computeDiff(original, modified) {
        const proxy = this._ensureSyncedResources([original, modified]);
        return proxy.$computeDiff(original.toString(), modified.toString());
    }
    canPromptRecommendation(modelUri) {
        const proxy = this._ensureSyncedResources([modelUri]);
        return proxy.$canPromptRecommendation(modelUri.toString());
    }
    _getOrCreateModelManager(proxy) {
        if (!this._modelManager) {
            this._modelManager = this._register(new NotebookEditorModelManager(proxy, this._notebookService, this._modelService));
        }
        return this._modelManager;
    }
    _ensureSyncedResources(resources) {
        const proxy = this._getOrCreateWorker().proxy;
        this._getOrCreateModelManager(proxy).ensureSyncedResources(resources);
        return proxy;
    }
    _getOrCreateWorker() {
        if (!this._worker) {
            try {
                this._worker = this._register(createWebWorker('vs/workbench/contrib/notebook/common/services/notebookSimpleWorker', 'NotebookEditorWorker'));
            }
            catch (err) {
                // logOnceWebWorkerWarning(err);
                // this._worker = new SynchronousWorkerClient(new EditorSimpleWorker(new EditorWorkerHost(this), null));
                throw (err);
            }
        }
        return this._worker;
    }
}
