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
import { asArray } from '../../../base/common/arrays.js';
import { DeferredPromise, timeout } from '../../../base/common/async.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../base/common/map.js';
import { URI } from '../../../base/common/uri.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { MainContext } from './extHost.protocol.js';
import { ApiCommand, ApiCommandArgument, ApiCommandResult, ExtHostCommands } from './extHostCommands.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { ExtHostNotebookController } from './extHostNotebook.js';
import * as extHostTypeConverters from './extHostTypeConverters.js';
import { NotebookCellExecutionState as ExtHostNotebookCellExecutionState, NotebookCellOutput, NotebookControllerAffinity2, NotebookVariablesRequestKind } from './extHostTypes.js';
import { asWebviewUri } from '../../contrib/webview/common/webview.js';
import { CellExecutionUpdateType } from '../../contrib/notebook/common/notebookExecutionService.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
import { variablePageSize } from '../../contrib/notebook/common/notebookKernelService.js';
let ExtHostNotebookKernels = class ExtHostNotebookKernels {
    constructor(mainContext, _initData, _extHostNotebook, _commands, _logService) {
        this._initData = _initData;
        this._extHostNotebook = _extHostNotebook;
        this._commands = _commands;
        this._logService = _logService;
        this._activeExecutions = new ResourceMap();
        this._activeNotebookExecutions = new ResourceMap();
        this._kernelDetectionTask = new Map();
        this._kernelDetectionTaskHandlePool = 0;
        this._kernelSourceActionProviders = new Map();
        this._kernelSourceActionProviderHandlePool = 0;
        this._kernelData = new Map();
        this._handlePool = 0;
        this._onDidChangeCellExecutionState = new Emitter();
        this.onDidChangeNotebookCellExecutionState = this._onDidChangeCellExecutionState.event;
        this.id = 0;
        this.variableStore = {};
        this._proxy = mainContext.getProxy(MainContext.MainThreadNotebookKernels);
        const selectKernelApiCommand = new ApiCommand('notebook.selectKernel', '_notebook.selectKernel', 'Trigger kernel picker for specified notebook editor widget', [
            new ApiCommandArgument('options', 'Select kernel options', v => true, (v) => {
                if (v && 'notebookEditor' in v && 'id' in v) {
                    const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
                    return {
                        id: v.id, extension: v.extension, notebookEditorId
                    };
                }
                else if (v && 'notebookEditor' in v) {
                    const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
                    if (notebookEditorId === undefined) {
                        throw new Error(`Cannot invoke 'notebook.selectKernel' for unrecognized notebook editor ${v.notebookEditor.notebook.uri.toString()}`);
                    }
                    return { notebookEditorId };
                }
                return v;
            })
        ], ApiCommandResult.Void);
        const requestKernelVariablesApiCommand = new ApiCommand('vscode.executeNotebookVariableProvider', '_executeNotebookVariableProvider', 'Execute notebook variable provider', [ApiCommandArgument.Uri], new ApiCommandResult('A promise that resolves to an array of variables', (value, apiArgs) => {
            return value.map(variable => {
                return {
                    variable: {
                        name: variable.name,
                        value: variable.value,
                        expression: variable.expression,
                        type: variable.type,
                        language: variable.language
                    },
                    hasNamedChildren: variable.hasNamedChildren,
                    indexedChildrenCount: variable.indexedChildrenCount
                };
            });
        }));
        this._commands.registerApiCommand(selectKernelApiCommand);
        this._commands.registerApiCommand(requestKernelVariablesApiCommand);
    }
    createNotebookController(extension, id, viewType, label, handler, preloads) {
        for (const data of this._kernelData.values()) {
            if (data.controller.id === id && ExtensionIdentifier.equals(extension.identifier, data.extensionId)) {
                throw new Error(`notebook controller with id '${id}' ALREADY exist`);
            }
        }
        const handle = this._handlePool++;
        const that = this;
        this._logService.trace(`NotebookController[${handle}], CREATED by ${extension.identifier.value}, ${id}`);
        const _defaultExecutHandler = () => console.warn(`NO execute handler from notebook controller '${data.id}' of extension: '${extension.identifier}'`);
        let isDisposed = false;
        const onDidChangeSelection = new Emitter();
        const onDidReceiveMessage = new Emitter();
        const data = {
            id: createKernelId(extension.identifier, id),
            notebookType: viewType,
            extensionId: extension.identifier,
            extensionLocation: extension.extensionLocation,
            label: label || extension.identifier.value,
            preloads: preloads ? preloads.map(extHostTypeConverters.NotebookRendererScript.from) : []
        };
        let _executeHandler = handler ?? _defaultExecutHandler;
        let _interruptHandler;
        let _variableProvider;
        this._proxy.$addKernel(handle, data).catch(err => {
            console.log(err);
            isDisposed = true;
        });
        let tokenPool = 0;
        const _update = () => {
            if (isDisposed) {
                return;
            }
            const myToken = ++tokenPool;
            Promise.resolve().then(() => {
                if (myToken === tokenPool) {
                    this._proxy.$updateKernel(handle, data);
                }
            });
        };
        const associatedNotebooks = new ResourceMap();
        const controller = {
            get id() { return id; },
            get notebookType() { return data.notebookType; },
            onDidChangeSelectedNotebooks: onDidChangeSelection.event,
            get label() {
                return data.label;
            },
            set label(value) {
                data.label = value ?? extension.displayName ?? extension.name;
                _update();
            },
            get detail() {
                return data.detail ?? '';
            },
            set detail(value) {
                data.detail = value;
                _update();
            },
            get description() {
                return data.description ?? '';
            },
            set description(value) {
                data.description = value;
                _update();
            },
            get supportedLanguages() {
                return data.supportedLanguages;
            },
            set supportedLanguages(value) {
                data.supportedLanguages = value;
                _update();
            },
            get supportsExecutionOrder() {
                return data.supportsExecutionOrder ?? false;
            },
            set supportsExecutionOrder(value) {
                data.supportsExecutionOrder = value;
                _update();
            },
            get rendererScripts() {
                return data.preloads ? data.preloads.map(extHostTypeConverters.NotebookRendererScript.to) : [];
            },
            get executeHandler() {
                return _executeHandler;
            },
            set executeHandler(value) {
                _executeHandler = value ?? _defaultExecutHandler;
            },
            get interruptHandler() {
                return _interruptHandler;
            },
            set interruptHandler(value) {
                _interruptHandler = value;
                data.supportsInterrupt = Boolean(value);
                _update();
            },
            set variableProvider(value) {
                checkProposedApiEnabled(extension, 'notebookVariableProvider');
                _variableProvider = value;
                data.hasVariableProvider = !!value;
                value?.onDidChangeVariables(e => that._proxy.$variablesUpdated(e.uri));
                _update();
            },
            get variableProvider() {
                return _variableProvider;
            },
            createNotebookCellExecution(cell) {
                if (isDisposed) {
                    throw new Error('notebook controller is DISPOSED');
                }
                if (!associatedNotebooks.has(cell.notebook.uri)) {
                    that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                    throw new Error(`notebook controller is NOT associated to notebook: ${cell.notebook.uri.toString()}`);
                }
                return that._createNotebookCellExecution(cell, createKernelId(extension.identifier, this.id));
            },
            createNotebookExecution(notebook) {
                checkProposedApiEnabled(extension, 'notebookExecution');
                if (isDisposed) {
                    throw new Error('notebook controller is DISPOSED');
                }
                if (!associatedNotebooks.has(notebook.uri)) {
                    that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                    throw new Error(`notebook controller is NOT associated to notebook: ${notebook.uri.toString()}`);
                }
                return that._createNotebookExecution(notebook, createKernelId(extension.identifier, this.id));
            },
            dispose: () => {
                if (!isDisposed) {
                    this._logService.trace(`NotebookController[${handle}], DISPOSED`);
                    isDisposed = true;
                    this._kernelData.delete(handle);
                    onDidChangeSelection.dispose();
                    onDidReceiveMessage.dispose();
                    this._proxy.$removeKernel(handle);
                }
            },
            updateNotebookAffinity(notebook, priority) {
                if (priority === NotebookControllerAffinity2.Hidden) {
                    checkProposedApiEnabled(extension, 'notebookControllerAffinityHidden');
                }
                that._proxy.$updateNotebookPriority(handle, notebook.uri, priority);
            },
            onDidReceiveMessage: onDidReceiveMessage.event,
            postMessage(message, editor) {
                checkProposedApiEnabled(extension, 'notebookMessaging');
                return that._proxy.$postMessage(handle, editor && that._extHostNotebook.getIdByEditor(editor), message);
            },
            asWebviewUri(uri) {
                checkProposedApiEnabled(extension, 'notebookMessaging');
                return asWebviewUri(uri, that._initData.remote);
            },
        };
        this._kernelData.set(handle, {
            extensionId: extension.identifier,
            controller,
            onDidReceiveMessage,
            onDidChangeSelection,
            associatedNotebooks
        });
        return controller;
    }
    getIdByController(controller) {
        for (const [_, candidate] of this._kernelData) {
            if (candidate.controller === controller) {
                return createKernelId(candidate.extensionId, controller.id);
            }
        }
        return null;
    }
    createNotebookControllerDetectionTask(extension, viewType) {
        const handle = this._kernelDetectionTaskHandlePool++;
        const that = this;
        this._logService.trace(`NotebookControllerDetectionTask[${handle}], CREATED by ${extension.identifier.value}`);
        this._proxy.$addKernelDetectionTask(handle, viewType);
        const detectionTask = {
            dispose: () => {
                this._kernelDetectionTask.delete(handle);
                that._proxy.$removeKernelDetectionTask(handle);
            }
        };
        this._kernelDetectionTask.set(handle, detectionTask);
        return detectionTask;
    }
    registerKernelSourceActionProvider(extension, viewType, provider) {
        const handle = this._kernelSourceActionProviderHandlePool++;
        const eventHandle = typeof provider.onDidChangeNotebookKernelSourceActions === 'function' ? handle : undefined;
        const that = this;
        this._kernelSourceActionProviders.set(handle, provider);
        this._logService.trace(`NotebookKernelSourceActionProvider[${handle}], CREATED by ${extension.identifier.value}`);
        this._proxy.$addKernelSourceActionProvider(handle, handle, viewType);
        let subscription;
        if (eventHandle !== undefined) {
            subscription = provider.onDidChangeNotebookKernelSourceActions(_ => this._proxy.$emitNotebookKernelSourceActionsChangeEvent(eventHandle));
        }
        return {
            dispose: () => {
                this._kernelSourceActionProviders.delete(handle);
                that._proxy.$removeKernelSourceActionProvider(handle, handle);
                subscription?.dispose();
            }
        };
    }
    async $provideKernelSourceActions(handle, token) {
        const provider = this._kernelSourceActionProviders.get(handle);
        if (provider) {
            const disposables = new DisposableStore();
            const ret = await provider.provideNotebookKernelSourceActions(token);
            return (ret ?? []).map(item => extHostTypeConverters.NotebookKernelSourceAction.from(item, this._commands.converter, disposables));
        }
        return [];
    }
    $acceptNotebookAssociation(handle, uri, value) {
        const obj = this._kernelData.get(handle);
        if (obj) {
            const notebook = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
            if (value) {
                obj.associatedNotebooks.set(notebook.uri, true);
            }
            else {
                obj.associatedNotebooks.delete(notebook.uri);
            }
            this._logService.trace(`NotebookController[${handle}] ASSOCIATE notebook`, notebook.uri.toString(), value);
            obj.onDidChangeSelection.fire({
                selected: value,
                notebook: notebook.apiNotebook
            });
        }
    }
    async $executeCells(handle, uri, handles) {
        const obj = this._kernelData.get(handle);
        if (!obj) {
            return;
        }
        const document = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
        const cells = [];
        for (const cellHandle of handles) {
            const cell = document.getCell(cellHandle);
            if (cell) {
                cells.push(cell.apiCell);
            }
        }
        try {
            this._logService.trace(`NotebookController[${handle}] EXECUTE cells`, document.uri.toString(), cells.length);
            await obj.controller.executeHandler.call(obj.controller, cells, document.apiNotebook, obj.controller);
        }
        catch (err) {
            this._logService.error(`NotebookController[${handle}] execute cells FAILED`, err);
            console.error(err);
        }
    }
    async $cancelCells(handle, uri, handles) {
        const obj = this._kernelData.get(handle);
        if (!obj) {
            return;
        }
        const document = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
        if (obj.controller.interruptHandler) {
            await obj.controller.interruptHandler.call(obj.controller, document.apiNotebook);
        }
        else {
            for (const cellHandle of handles) {
                const cell = document.getCell(cellHandle);
                if (cell) {
                    this._activeExecutions.get(cell.uri)?.cancel();
                }
            }
        }
        if (obj.controller.interruptHandler) {
            const items = this._activeNotebookExecutions.get(document.uri);
            this._activeNotebookExecutions.delete(document.uri);
            if (handles.length && Array.isArray(items) && items.length) {
                items.forEach(d => d.dispose());
            }
        }
    }
    async $provideVariables(handle, requestId, notebookUri, parentId, kind, start, token) {
        const obj = this._kernelData.get(handle);
        if (!obj) {
            return;
        }
        const document = this._extHostNotebook.getNotebookDocument(URI.revive(notebookUri));
        const variableProvider = obj.controller.variableProvider;
        if (!variableProvider) {
            return;
        }
        let parent = undefined;
        if (parentId !== undefined) {
            parent = this.variableStore[parentId];
            if (!parent) {
                return;
            }
        }
        else {
            this.variableStore = {};
        }
        const requestKind = kind === 'named' ? NotebookVariablesRequestKind.Named : NotebookVariablesRequestKind.Indexed;
        const variableResults = variableProvider.provideVariables(document.apiNotebook, parent, requestKind, start, token);
        let resultCount = 0;
        for await (const result of variableResults) {
            if (token.isCancellationRequested) {
                return;
            }
            const variable = {
                id: this.id++,
                name: result.variable.name,
                value: result.variable.value,
                type: result.variable.type,
                interfaces: result.variable.interfaces,
                language: result.variable.language,
                expression: result.variable.expression,
                hasNamedChildren: result.hasNamedChildren,
                indexedChildrenCount: result.indexedChildrenCount,
                extensionId: obj.extensionId.value,
            };
            this.variableStore[variable.id] = result.variable;
            this._proxy.$receiveVariable(requestId, variable);
            if (resultCount++ >= variablePageSize) {
                return;
            }
        }
    }
    $acceptKernelMessageFromRenderer(handle, editorId, message) {
        const obj = this._kernelData.get(handle);
        if (!obj) {
            return;
        }
        const editor = this._extHostNotebook.getEditorById(editorId);
        obj.onDidReceiveMessage.fire(Object.freeze({ editor: editor.apiEditor, message }));
    }
    $cellExecutionChanged(uri, cellHandle, state) {
        const document = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
        const cell = document.getCell(cellHandle);
        if (cell) {
            const newState = state ? extHostTypeConverters.NotebookCellExecutionState.to(state) : ExtHostNotebookCellExecutionState.Idle;
            if (newState !== undefined) {
                this._onDidChangeCellExecutionState.fire({
                    cell: cell.apiCell,
                    state: newState
                });
            }
        }
    }
    _createNotebookCellExecution(cell, controllerId) {
        if (cell.index < 0) {
            throw new Error('CANNOT execute cell that has been REMOVED from notebook');
        }
        const notebook = this._extHostNotebook.getNotebookDocument(cell.notebook.uri);
        const cellObj = notebook.getCellFromApiCell(cell);
        if (!cellObj) {
            throw new Error('invalid cell');
        }
        if (this._activeExecutions.has(cellObj.uri)) {
            throw new Error(`duplicate execution for ${cellObj.uri}`);
        }
        const execution = new NotebookCellExecutionTask(controllerId, cellObj, this._proxy);
        this._activeExecutions.set(cellObj.uri, execution);
        const listener = execution.onDidChangeState(() => {
            if (execution.state === NotebookCellExecutionTaskState.Resolved) {
                execution.dispose();
                listener.dispose();
                this._activeExecutions.delete(cellObj.uri);
            }
        });
        return execution.asApiObject();
    }
    _createNotebookExecution(nb, controllerId) {
        const notebook = this._extHostNotebook.getNotebookDocument(nb.uri);
        const runningCell = nb.getCells().find(cell => {
            const apiCell = notebook.getCellFromApiCell(cell);
            return apiCell && this._activeExecutions.has(apiCell.uri);
        });
        if (runningCell) {
            throw new Error(`duplicate cell execution for ${runningCell.document.uri}`);
        }
        if (this._activeNotebookExecutions.has(notebook.uri)) {
            throw new Error(`duplicate notebook execution for ${notebook.uri}`);
        }
        const execution = new NotebookExecutionTask(controllerId, notebook, this._proxy);
        const listener = execution.onDidChangeState(() => {
            if (execution.state === NotebookExecutionTaskState.Resolved) {
                execution.dispose();
                listener.dispose();
                this._activeNotebookExecutions.delete(notebook.uri);
            }
        });
        this._activeNotebookExecutions.set(notebook.uri, [execution, listener]);
        return execution.asApiObject();
    }
};
ExtHostNotebookKernels = __decorate([
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, ExtHostNotebookController,
        ExtHostCommands, Object])
], ExtHostNotebookKernels);
export { ExtHostNotebookKernels };
var NotebookCellExecutionTaskState;
(function (NotebookCellExecutionTaskState) {
    NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Init"] = 0] = "Init";
    NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Started"] = 1] = "Started";
    NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Resolved"] = 2] = "Resolved";
})(NotebookCellExecutionTaskState || (NotebookCellExecutionTaskState = {}));
class NotebookCellExecutionTask extends Disposable {
    static { this.HANDLE = 0; }
    get state() { return this._state; }
    constructor(controllerId, _cell, _proxy) {
        super();
        this._cell = _cell;
        this._proxy = _proxy;
        this._handle = NotebookCellExecutionTask.HANDLE++;
        this._onDidChangeState = new Emitter();
        this.onDidChangeState = this._onDidChangeState.event;
        this._state = NotebookCellExecutionTaskState.Init;
        this._tokenSource = this._register(new CancellationTokenSource());
        this._collector = new TimeoutBasedCollector(10, updates => this.update(updates));
        this._executionOrder = _cell.internalMetadata.executionOrder;
        this._proxy.$createExecution(this._handle, controllerId, this._cell.notebook.uri, this._cell.handle);
    }
    cancel() {
        this._tokenSource.cancel();
    }
    async updateSoon(update) {
        await this._collector.addItem(update);
    }
    async update(update) {
        const updates = Array.isArray(update) ? update : [update];
        return this._proxy.$updateExecution(this._handle, new SerializableObjectWithBuffers(updates));
    }
    verifyStateForOutput() {
        if (this._state === NotebookCellExecutionTaskState.Init) {
            throw new Error('Must call start before modifying cell output');
        }
        if (this._state === NotebookCellExecutionTaskState.Resolved) {
            throw new Error('Cannot modify cell output after calling resolve');
        }
    }
    cellIndexToHandle(cellOrCellIndex) {
        let cell = this._cell;
        if (cellOrCellIndex) {
            cell = this._cell.notebook.getCellFromApiCell(cellOrCellIndex);
        }
        if (!cell) {
            throw new Error('INVALID cell');
        }
        return cell.handle;
    }
    validateAndConvertOutputs(items) {
        return items.map(output => {
            const newOutput = NotebookCellOutput.ensureUniqueMimeTypes(output.items, true);
            if (newOutput === output.items) {
                return extHostTypeConverters.NotebookCellOutput.from(output);
            }
            return extHostTypeConverters.NotebookCellOutput.from({
                items: newOutput,
                id: output.id,
                metadata: output.metadata
            });
        });
    }
    async updateOutputs(outputs, cell, append) {
        const handle = this.cellIndexToHandle(cell);
        const outputDtos = this.validateAndConvertOutputs(asArray(outputs));
        return this.updateSoon({
            editType: CellExecutionUpdateType.Output,
            cellHandle: handle,
            append,
            outputs: outputDtos
        });
    }
    async updateOutputItems(items, output, append) {
        items = NotebookCellOutput.ensureUniqueMimeTypes(asArray(items), true);
        return this.updateSoon({
            editType: CellExecutionUpdateType.OutputItems,
            items: items.map(extHostTypeConverters.NotebookCellOutputItem.from),
            outputId: output.id,
            append
        });
    }
    asApiObject() {
        const that = this;
        const result = {
            get token() { return that._tokenSource.token; },
            get cell() { return that._cell.apiCell; },
            get executionOrder() { return that._executionOrder; },
            set executionOrder(v) {
                that._executionOrder = v;
                that.update([{
                        editType: CellExecutionUpdateType.ExecutionState,
                        executionOrder: that._executionOrder
                    }]);
            },
            start(startTime) {
                if (that._state === NotebookCellExecutionTaskState.Resolved || that._state === NotebookCellExecutionTaskState.Started) {
                    throw new Error('Cannot call start again');
                }
                that._state = NotebookCellExecutionTaskState.Started;
                that._onDidChangeState.fire();
                that.update({
                    editType: CellExecutionUpdateType.ExecutionState,
                    runStartTime: startTime
                });
            },
            end(success, endTime, executionError) {
                if (that._state === NotebookCellExecutionTaskState.Resolved) {
                    throw new Error('Cannot call resolve twice');
                }
                that._state = NotebookCellExecutionTaskState.Resolved;
                that._onDidChangeState.fire();
                that._collector.flush();
                const error = executionError ? {
                    message: executionError.message,
                    stack: executionError.stack,
                    location: executionError?.location ? {
                        startLineNumber: executionError.location.start.line,
                        startColumn: executionError.location.start.character,
                        endLineNumber: executionError.location.end.line,
                        endColumn: executionError.location.end.character
                    } : undefined,
                    uri: executionError.uri
                } : undefined;
                that._proxy.$completeExecution(that._handle, new SerializableObjectWithBuffers({
                    runEndTime: endTime,
                    lastRunSuccess: success,
                    error
                }));
            },
            clearOutput(cell) {
                that.verifyStateForOutput();
                return that.updateOutputs([], cell, false);
            },
            appendOutput(outputs, cell) {
                that.verifyStateForOutput();
                return that.updateOutputs(outputs, cell, true);
            },
            replaceOutput(outputs, cell) {
                that.verifyStateForOutput();
                return that.updateOutputs(outputs, cell, false);
            },
            appendOutputItems(items, output) {
                that.verifyStateForOutput();
                return that.updateOutputItems(items, output, true);
            },
            replaceOutputItems(items, output) {
                that.verifyStateForOutput();
                return that.updateOutputItems(items, output, false);
            }
        };
        return Object.freeze(result);
    }
}
var NotebookExecutionTaskState;
(function (NotebookExecutionTaskState) {
    NotebookExecutionTaskState[NotebookExecutionTaskState["Init"] = 0] = "Init";
    NotebookExecutionTaskState[NotebookExecutionTaskState["Started"] = 1] = "Started";
    NotebookExecutionTaskState[NotebookExecutionTaskState["Resolved"] = 2] = "Resolved";
})(NotebookExecutionTaskState || (NotebookExecutionTaskState = {}));
class NotebookExecutionTask extends Disposable {
    static { this.HANDLE = 0; }
    get state() { return this._state; }
    constructor(controllerId, _notebook, _proxy) {
        super();
        this._notebook = _notebook;
        this._proxy = _proxy;
        this._handle = NotebookExecutionTask.HANDLE++;
        this._onDidChangeState = new Emitter();
        this.onDidChangeState = this._onDidChangeState.event;
        this._state = NotebookExecutionTaskState.Init;
        this._tokenSource = this._register(new CancellationTokenSource());
        this._proxy.$createNotebookExecution(this._handle, controllerId, this._notebook.uri);
    }
    cancel() {
        this._tokenSource.cancel();
    }
    asApiObject() {
        const result = {
            start: () => {
                if (this._state === NotebookExecutionTaskState.Resolved || this._state === NotebookExecutionTaskState.Started) {
                    throw new Error('Cannot call start again');
                }
                this._state = NotebookExecutionTaskState.Started;
                this._onDidChangeState.fire();
                this._proxy.$beginNotebookExecution(this._handle);
            },
            end: () => {
                if (this._state === NotebookExecutionTaskState.Resolved) {
                    throw new Error('Cannot call resolve twice');
                }
                this._state = NotebookExecutionTaskState.Resolved;
                this._onDidChangeState.fire();
                this._proxy.$completeNotebookExecution(this._handle);
            },
        };
        return Object.freeze(result);
    }
}
class TimeoutBasedCollector {
    constructor(delay, callback) {
        this.delay = delay;
        this.callback = callback;
        this.batch = [];
        this.startedTimer = Date.now();
    }
    addItem(item) {
        this.batch.push(item);
        if (!this.currentDeferred) {
            this.currentDeferred = new DeferredPromise();
            this.startedTimer = Date.now();
            timeout(this.delay).then(() => {
                return this.flush();
            });
        }
        if (Date.now() - this.startedTimer > this.delay) {
            return this.flush();
        }
        return this.currentDeferred.p;
    }
    flush() {
        if (this.batch.length === 0 || !this.currentDeferred) {
            return Promise.resolve();
        }
        const deferred = this.currentDeferred;
        this.currentDeferred = undefined;
        const batch = this.batch;
        this.batch = [];
        return this.callback(batch)
            .finally(() => deferred.complete());
    }
}
export function createKernelId(extensionIdentifier, id) {
    return `${extensionIdentifier.value}/${id}`;
}
