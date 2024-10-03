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
import { VSBuffer } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { DisposableStore, dispose } from '../../../base/common/lifecycle.js';
import { StopWatch } from '../../../base/common/stopwatch.js';
import { assertType } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { CommandsRegistry } from '../../../platform/commands/common/commands.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { NotebookDto } from './mainThreadNotebookDto.js';
import { INotebookCellStatusBarService } from '../../contrib/notebook/common/notebookCellStatusBarService.js';
import { INotebookService, SimpleNotebookProviderInfo } from '../../contrib/notebook/common/notebookService.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { revive } from '../../../base/common/marshalling.js';
import { coalesce } from '../../../base/common/arrays.js';
let MainThreadNotebooks = class MainThreadNotebooks {
    constructor(extHostContext, _notebookService, _cellStatusBarService, _logService) {
        this._notebookService = _notebookService;
        this._cellStatusBarService = _cellStatusBarService;
        this._logService = _logService;
        this._disposables = new DisposableStore();
        this._notebookSerializer = new Map();
        this._notebookCellStatusBarRegistrations = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebook);
    }
    dispose() {
        this._disposables.dispose();
        dispose(this._notebookSerializer.values());
    }
    $registerNotebookSerializer(handle, extension, viewType, options, data) {
        const disposables = new DisposableStore();
        disposables.add(this._notebookService.registerNotebookSerializer(viewType, extension, {
            options,
            dataToNotebook: async (data) => {
                const sw = new StopWatch();
                let result;
                if (data.byteLength === 0 && viewType === 'interactive') {
                    result = NotebookDto.fromNotebookDataDto({ cells: [], metadata: {} });
                }
                else {
                    const dto = await this._proxy.$dataToNotebook(handle, data, CancellationToken.None);
                    result = NotebookDto.fromNotebookDataDto(dto.value);
                }
                this._logService.trace(`[NotebookSerializer] dataToNotebook DONE after ${sw.elapsed()}ms`, {
                    viewType,
                    extensionId: extension.id.value,
                });
                return result;
            },
            notebookToData: (data) => {
                const sw = new StopWatch();
                const result = this._proxy.$notebookToData(handle, new SerializableObjectWithBuffers(NotebookDto.toNotebookDataDto(data)), CancellationToken.None);
                this._logService.trace(`[NotebookSerializer] notebookToData DONE after ${sw.elapsed()}`, {
                    viewType,
                    extensionId: extension.id.value,
                });
                return result;
            },
            save: async (uri, versionId, options, token) => {
                const stat = await this._proxy.$saveNotebook(handle, uri, versionId, options, token);
                return {
                    ...stat,
                    children: undefined,
                    resource: uri
                };
            },
            searchInNotebooks: async (textQuery, token, allPriorityInfo) => {
                const contributedType = this._notebookService.getContributedNotebookType(viewType);
                if (!contributedType) {
                    return { results: [], limitHit: false };
                }
                const fileNames = contributedType.selectors;
                const includes = fileNames.map((selector) => {
                    const globPattern = selector.include || selector;
                    return globPattern.toString();
                });
                if (!includes.length) {
                    return {
                        results: [], limitHit: false
                    };
                }
                const thisPriorityInfo = coalesce([{ isFromSettings: false, filenamePatterns: includes }, ...allPriorityInfo.get(viewType) ?? []]);
                const otherEditorsPriorityInfo = Array.from(allPriorityInfo.keys())
                    .flatMap(key => {
                    if (key !== viewType) {
                        return allPriorityInfo.get(key) ?? [];
                    }
                    return [];
                });
                const searchComplete = await this._proxy.$searchInNotebooks(handle, textQuery, thisPriorityInfo, otherEditorsPriorityInfo, token);
                const revivedResults = searchComplete.results.map(result => {
                    const resource = URI.revive(result.resource);
                    return {
                        resource,
                        cellResults: result.cellResults.map(e => revive(e))
                    };
                });
                return { results: revivedResults, limitHit: searchComplete.limitHit };
            }
        }));
        if (data) {
            disposables.add(this._notebookService.registerContributedNotebookType(viewType, data));
        }
        this._notebookSerializer.set(handle, disposables);
        this._logService.trace('[NotebookSerializer] registered notebook serializer', {
            viewType,
            extensionId: extension.id.value,
        });
    }
    $unregisterNotebookSerializer(handle) {
        this._notebookSerializer.get(handle)?.dispose();
        this._notebookSerializer.delete(handle);
    }
    $emitCellStatusBarEvent(eventHandle) {
        const emitter = this._notebookCellStatusBarRegistrations.get(eventHandle);
        if (emitter instanceof Emitter) {
            emitter.fire(undefined);
        }
    }
    async $registerNotebookCellStatusBarItemProvider(handle, eventHandle, viewType) {
        const that = this;
        const provider = {
            async provideCellStatusBarItems(uri, index, token) {
                const result = await that._proxy.$provideNotebookCellStatusBarItems(handle, uri, index, token);
                return {
                    items: result?.items ?? [],
                    dispose() {
                        if (result) {
                            that._proxy.$releaseNotebookCellStatusBarItems(result.cacheId);
                        }
                    }
                };
            },
            viewType
        };
        if (typeof eventHandle === 'number') {
            const emitter = new Emitter();
            this._notebookCellStatusBarRegistrations.set(eventHandle, emitter);
            provider.onDidChangeStatusBarItems = emitter.event;
        }
        const disposable = this._cellStatusBarService.registerCellStatusBarItemProvider(provider);
        this._notebookCellStatusBarRegistrations.set(handle, disposable);
    }
    async $unregisterNotebookCellStatusBarItemProvider(handle, eventHandle) {
        const unregisterThing = (handle) => {
            const entry = this._notebookCellStatusBarRegistrations.get(handle);
            if (entry) {
                this._notebookCellStatusBarRegistrations.get(handle)?.dispose();
                this._notebookCellStatusBarRegistrations.delete(handle);
            }
        };
        unregisterThing(handle);
        if (typeof eventHandle === 'number') {
            unregisterThing(eventHandle);
        }
    }
};
MainThreadNotebooks = __decorate([
    extHostNamedCustomer(MainContext.MainThreadNotebook),
    __param(1, INotebookService),
    __param(2, INotebookCellStatusBarService),
    __param(3, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], MainThreadNotebooks);
export { MainThreadNotebooks };
CommandsRegistry.registerCommand('_executeDataToNotebook', async (accessor, ...args) => {
    const [notebookType, bytes] = args;
    assertType(typeof notebookType === 'string', 'string');
    assertType(bytes instanceof VSBuffer, 'VSBuffer');
    const notebookService = accessor.get(INotebookService);
    const info = await notebookService.withNotebookDataProvider(notebookType);
    if (!(info instanceof SimpleNotebookProviderInfo)) {
        return;
    }
    const dto = await info.serializer.dataToNotebook(bytes);
    return new SerializableObjectWithBuffers(NotebookDto.toNotebookDataDto(dto));
});
CommandsRegistry.registerCommand('_executeNotebookToData', async (accessor, ...args) => {
    const [notebookType, dto] = args;
    assertType(typeof notebookType === 'string', 'string');
    assertType(typeof dto === 'object');
    const notebookService = accessor.get(INotebookService);
    const info = await notebookService.withNotebookDataProvider(notebookType);
    if (!(info instanceof SimpleNotebookProviderInfo)) {
        return;
    }
    const data = NotebookDto.fromNotebookDataDto(dto.value);
    const bytes = await info.serializer.notebookToData(data);
    return bytes;
});
