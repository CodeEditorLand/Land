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
import { Emitter } from '../../../../base/common/event.js';
import * as objects from '../../../../base/common/objects.js';
import { toAction } from '../../../../base/common/actions.js';
import * as errors from '../../../../base/common/errors.js';
import { createErrorWithActions } from '../../../../base/common/errorMessage.js';
import { formatPII, isUri } from '../common/debugUtils.js';
import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.js';
import { URI } from '../../../../base/common/uri.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { dispose } from '../../../../base/common/lifecycle.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { Schemas } from '../../../../base/common/network.js';
let RawDebugSession = class RawDebugSession {
    constructor(debugAdapter, dbgr, sessionId, name, extensionHostDebugService, openerService, notificationService, dialogSerivce) {
        this.dbgr = dbgr;
        this.sessionId = sessionId;
        this.name = name;
        this.extensionHostDebugService = extensionHostDebugService;
        this.openerService = openerService;
        this.notificationService = notificationService;
        this.dialogSerivce = dialogSerivce;
        this.allThreadsContinued = true;
        this._readyForBreakpoints = false;
        this.debugAdapterStopped = false;
        this.inShutdown = false;
        this.terminated = false;
        this.firedAdapterExitEvent = false;
        this.startTime = 0;
        this.didReceiveStoppedEvent = false;
        this._onDidInitialize = new Emitter();
        this._onDidStop = new Emitter();
        this._onDidContinued = new Emitter();
        this._onDidTerminateDebugee = new Emitter();
        this._onDidExitDebugee = new Emitter();
        this._onDidThread = new Emitter();
        this._onDidOutput = new Emitter();
        this._onDidBreakpoint = new Emitter();
        this._onDidLoadedSource = new Emitter();
        this._onDidProgressStart = new Emitter();
        this._onDidProgressUpdate = new Emitter();
        this._onDidProgressEnd = new Emitter();
        this._onDidInvalidated = new Emitter();
        this._onDidInvalidateMemory = new Emitter();
        this._onDidCustomEvent = new Emitter();
        this._onDidEvent = new Emitter();
        this._onDidExitAdapter = new Emitter();
        this.stoppedSinceLastStep = false;
        this.toDispose = [];
        this.debugAdapter = debugAdapter;
        this._capabilities = Object.create(null);
        this.toDispose.push(this.debugAdapter.onError(err => {
            this.shutdown(err);
        }));
        this.toDispose.push(this.debugAdapter.onExit(code => {
            if (code !== 0) {
                this.shutdown(new Error(`exit code: ${code}`));
            }
            else {
                this.shutdown();
            }
        }));
        this.debugAdapter.onEvent(event => {
            switch (event.event) {
                case 'initialized':
                    this._readyForBreakpoints = true;
                    this._onDidInitialize.fire(event);
                    break;
                case 'loadedSource':
                    this._onDidLoadedSource.fire(event);
                    break;
                case 'capabilities':
                    if (event.body) {
                        const capabilities = event.body.capabilities;
                        this.mergeCapabilities(capabilities);
                    }
                    break;
                case 'stopped':
                    this.didReceiveStoppedEvent = true;
                    this.stoppedSinceLastStep = true;
                    this._onDidStop.fire(event);
                    break;
                case 'continued':
                    this.allThreadsContinued = event.body.allThreadsContinued === false ? false : true;
                    this._onDidContinued.fire(event);
                    break;
                case 'thread':
                    this._onDidThread.fire(event);
                    break;
                case 'output':
                    this._onDidOutput.fire(event);
                    break;
                case 'breakpoint':
                    this._onDidBreakpoint.fire(event);
                    break;
                case 'terminated':
                    this._onDidTerminateDebugee.fire(event);
                    break;
                case 'exited':
                    this._onDidExitDebugee.fire(event);
                    break;
                case 'progressStart':
                    this._onDidProgressStart.fire(event);
                    break;
                case 'progressUpdate':
                    this._onDidProgressUpdate.fire(event);
                    break;
                case 'progressEnd':
                    this._onDidProgressEnd.fire(event);
                    break;
                case 'invalidated':
                    this._onDidInvalidated.fire(event);
                    break;
                case 'memory':
                    this._onDidInvalidateMemory.fire(event);
                    break;
                case 'process':
                    break;
                case 'module':
                    break;
                default:
                    this._onDidCustomEvent.fire(event);
                    break;
            }
            this._onDidEvent.fire(event);
        });
        this.debugAdapter.onRequest(request => this.dispatchRequest(request));
    }
    get isInShutdown() {
        return this.inShutdown;
    }
    get onDidExitAdapter() {
        return this._onDidExitAdapter.event;
    }
    get capabilities() {
        return this._capabilities;
    }
    get readyForBreakpoints() {
        return this._readyForBreakpoints;
    }
    get onDidInitialize() {
        return this._onDidInitialize.event;
    }
    get onDidStop() {
        return this._onDidStop.event;
    }
    get onDidContinued() {
        return this._onDidContinued.event;
    }
    get onDidTerminateDebugee() {
        return this._onDidTerminateDebugee.event;
    }
    get onDidExitDebugee() {
        return this._onDidExitDebugee.event;
    }
    get onDidThread() {
        return this._onDidThread.event;
    }
    get onDidOutput() {
        return this._onDidOutput.event;
    }
    get onDidBreakpoint() {
        return this._onDidBreakpoint.event;
    }
    get onDidLoadedSource() {
        return this._onDidLoadedSource.event;
    }
    get onDidCustomEvent() {
        return this._onDidCustomEvent.event;
    }
    get onDidProgressStart() {
        return this._onDidProgressStart.event;
    }
    get onDidProgressUpdate() {
        return this._onDidProgressUpdate.event;
    }
    get onDidProgressEnd() {
        return this._onDidProgressEnd.event;
    }
    get onDidInvalidated() {
        return this._onDidInvalidated.event;
    }
    get onDidInvalidateMemory() {
        return this._onDidInvalidateMemory.event;
    }
    get onDidEvent() {
        return this._onDidEvent.event;
    }
    async start() {
        if (!this.debugAdapter) {
            return Promise.reject(new Error(nls.localize('noDebugAdapterStart', "No debug adapter, can not start debug session.")));
        }
        await this.debugAdapter.startSession();
        this.startTime = new Date().getTime();
    }
    async initialize(args) {
        const response = await this.send('initialize', args, undefined, undefined, false);
        if (response) {
            this.mergeCapabilities(response.body);
        }
        return response;
    }
    disconnect(args) {
        const terminateDebuggee = this.capabilities.supportTerminateDebuggee ? args.terminateDebuggee : undefined;
        const suspendDebuggee = this.capabilities.supportTerminateDebuggee && this.capabilities.supportSuspendDebuggee ? args.suspendDebuggee : undefined;
        return this.shutdown(undefined, args.restart, terminateDebuggee, suspendDebuggee);
    }
    async launchOrAttach(config) {
        const response = await this.send(config.request, config, undefined, undefined, false);
        if (response) {
            this.mergeCapabilities(response.body);
        }
        return response;
    }
    terminate(restart = false) {
        if (this.capabilities.supportsTerminateRequest) {
            if (!this.terminated) {
                this.terminated = true;
                return this.send('terminate', { restart }, undefined);
            }
            return this.disconnect({ terminateDebuggee: true, restart });
        }
        return Promise.reject(new Error('terminated not supported'));
    }
    restart(args) {
        if (this.capabilities.supportsRestartRequest) {
            return this.send('restart', args);
        }
        return Promise.reject(new Error('restart not supported'));
    }
    async next(args) {
        this.stoppedSinceLastStep = false;
        const response = await this.send('next', args);
        if (!this.stoppedSinceLastStep) {
            this.fireSimulatedContinuedEvent(args.threadId);
        }
        return response;
    }
    async stepIn(args) {
        this.stoppedSinceLastStep = false;
        const response = await this.send('stepIn', args);
        if (!this.stoppedSinceLastStep) {
            this.fireSimulatedContinuedEvent(args.threadId);
        }
        return response;
    }
    async stepOut(args) {
        this.stoppedSinceLastStep = false;
        const response = await this.send('stepOut', args);
        if (!this.stoppedSinceLastStep) {
            this.fireSimulatedContinuedEvent(args.threadId);
        }
        return response;
    }
    async continue(args) {
        this.stoppedSinceLastStep = false;
        const response = await this.send('continue', args);
        if (response && response.body && response.body.allThreadsContinued !== undefined) {
            this.allThreadsContinued = response.body.allThreadsContinued;
        }
        if (!this.stoppedSinceLastStep) {
            this.fireSimulatedContinuedEvent(args.threadId, this.allThreadsContinued);
        }
        return response;
    }
    pause(args) {
        return this.send('pause', args);
    }
    terminateThreads(args) {
        if (this.capabilities.supportsTerminateThreadsRequest) {
            return this.send('terminateThreads', args);
        }
        return Promise.reject(new Error('terminateThreads not supported'));
    }
    setVariable(args) {
        if (this.capabilities.supportsSetVariable) {
            return this.send('setVariable', args);
        }
        return Promise.reject(new Error('setVariable not supported'));
    }
    setExpression(args) {
        if (this.capabilities.supportsSetExpression) {
            return this.send('setExpression', args);
        }
        return Promise.reject(new Error('setExpression not supported'));
    }
    async restartFrame(args, threadId) {
        if (this.capabilities.supportsRestartFrame) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('restartFrame', args);
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(threadId);
            }
            return response;
        }
        return Promise.reject(new Error('restartFrame not supported'));
    }
    stepInTargets(args) {
        if (this.capabilities.supportsStepInTargetsRequest) {
            return this.send('stepInTargets', args);
        }
        return Promise.reject(new Error('stepInTargets not supported'));
    }
    completions(args, token) {
        if (this.capabilities.supportsCompletionsRequest) {
            return this.send('completions', args, token);
        }
        return Promise.reject(new Error('completions not supported'));
    }
    setBreakpoints(args) {
        return this.send('setBreakpoints', args);
    }
    setFunctionBreakpoints(args) {
        if (this.capabilities.supportsFunctionBreakpoints) {
            return this.send('setFunctionBreakpoints', args);
        }
        return Promise.reject(new Error('setFunctionBreakpoints not supported'));
    }
    dataBreakpointInfo(args) {
        if (this.capabilities.supportsDataBreakpoints) {
            return this.send('dataBreakpointInfo', args);
        }
        return Promise.reject(new Error('dataBreakpointInfo not supported'));
    }
    setDataBreakpoints(args) {
        if (this.capabilities.supportsDataBreakpoints) {
            return this.send('setDataBreakpoints', args);
        }
        return Promise.reject(new Error('setDataBreakpoints not supported'));
    }
    setExceptionBreakpoints(args) {
        return this.send('setExceptionBreakpoints', args);
    }
    breakpointLocations(args) {
        if (this.capabilities.supportsBreakpointLocationsRequest) {
            return this.send('breakpointLocations', args);
        }
        return Promise.reject(new Error('breakpointLocations is not supported'));
    }
    configurationDone() {
        if (this.capabilities.supportsConfigurationDoneRequest) {
            return this.send('configurationDone', null);
        }
        return Promise.reject(new Error('configurationDone not supported'));
    }
    stackTrace(args, token) {
        return this.send('stackTrace', args, token);
    }
    exceptionInfo(args) {
        if (this.capabilities.supportsExceptionInfoRequest) {
            return this.send('exceptionInfo', args);
        }
        return Promise.reject(new Error('exceptionInfo not supported'));
    }
    scopes(args, token) {
        return this.send('scopes', args, token);
    }
    variables(args, token) {
        return this.send('variables', args, token);
    }
    source(args) {
        return this.send('source', args);
    }
    locations(args) {
        return this.send('locations', args);
    }
    loadedSources(args) {
        if (this.capabilities.supportsLoadedSourcesRequest) {
            return this.send('loadedSources', args);
        }
        return Promise.reject(new Error('loadedSources not supported'));
    }
    threads() {
        return this.send('threads', null);
    }
    evaluate(args) {
        return this.send('evaluate', args);
    }
    async stepBack(args) {
        if (this.capabilities.supportsStepBack) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('stepBack', args);
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(args.threadId);
            }
            return response;
        }
        return Promise.reject(new Error('stepBack not supported'));
    }
    async reverseContinue(args) {
        if (this.capabilities.supportsStepBack) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('reverseContinue', args);
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(args.threadId);
            }
            return response;
        }
        return Promise.reject(new Error('reverseContinue not supported'));
    }
    gotoTargets(args) {
        if (this.capabilities.supportsGotoTargetsRequest) {
            return this.send('gotoTargets', args);
        }
        return Promise.reject(new Error('gotoTargets is not supported'));
    }
    async goto(args) {
        if (this.capabilities.supportsGotoTargetsRequest) {
            this.stoppedSinceLastStep = false;
            const response = await this.send('goto', args);
            if (!this.stoppedSinceLastStep) {
                this.fireSimulatedContinuedEvent(args.threadId);
            }
            return response;
        }
        return Promise.reject(new Error('goto is not supported'));
    }
    async setInstructionBreakpoints(args) {
        if (this.capabilities.supportsInstructionBreakpoints) {
            return await this.send('setInstructionBreakpoints', args);
        }
        return Promise.reject(new Error('setInstructionBreakpoints is not supported'));
    }
    async disassemble(args) {
        if (this.capabilities.supportsDisassembleRequest) {
            return await this.send('disassemble', args);
        }
        return Promise.reject(new Error('disassemble is not supported'));
    }
    async readMemory(args) {
        if (this.capabilities.supportsReadMemoryRequest) {
            return await this.send('readMemory', args);
        }
        return Promise.reject(new Error('readMemory is not supported'));
    }
    async writeMemory(args) {
        if (this.capabilities.supportsWriteMemoryRequest) {
            return await this.send('writeMemory', args);
        }
        return Promise.reject(new Error('writeMemory is not supported'));
    }
    cancel(args) {
        return this.send('cancel', args);
    }
    custom(request, args) {
        return this.send(request, args);
    }
    async shutdown(error, restart = false, terminateDebuggee = undefined, suspendDebuggee = undefined) {
        if (!this.inShutdown) {
            this.inShutdown = true;
            if (this.debugAdapter) {
                try {
                    const args = { restart };
                    if (typeof terminateDebuggee === 'boolean') {
                        args.terminateDebuggee = terminateDebuggee;
                    }
                    if (typeof suspendDebuggee === 'boolean') {
                        args.suspendDebuggee = suspendDebuggee;
                    }
                    await this.send('disconnect', args, undefined, error ? 200 : 2000);
                }
                catch (e) {
                }
                finally {
                    await this.stopAdapter(error);
                }
            }
            else {
                return this.stopAdapter(error);
            }
        }
    }
    async stopAdapter(error) {
        try {
            if (this.debugAdapter) {
                const da = this.debugAdapter;
                this.debugAdapter = null;
                await da.stopSession();
                this.debugAdapterStopped = true;
            }
        }
        finally {
            this.fireAdapterExitEvent(error);
        }
    }
    fireAdapterExitEvent(error) {
        if (!this.firedAdapterExitEvent) {
            this.firedAdapterExitEvent = true;
            const e = {
                emittedStopped: this.didReceiveStoppedEvent,
                sessionLengthInSeconds: (new Date().getTime() - this.startTime) / 1000
            };
            if (error && !this.debugAdapterStopped) {
                e.error = error;
            }
            this._onDidExitAdapter.fire(e);
        }
    }
    async dispatchRequest(request) {
        const response = {
            type: 'response',
            seq: 0,
            command: request.command,
            request_seq: request.seq,
            success: true
        };
        const safeSendResponse = (response) => this.debugAdapter && this.debugAdapter.sendResponse(response);
        if (request.command === 'launchVSCode') {
            try {
                let result = await this.launchVsCode(request.arguments);
                if (!result.success) {
                    const { confirmed } = await this.dialogSerivce.confirm({
                        type: Severity.Warning,
                        message: nls.localize('canNotStart', "The debugger needs to open a new tab or window for the debuggee but the browser prevented this. You must give permission to continue."),
                        primaryButton: nls.localize({ key: 'continue', comment: ['&& denotes a mnemonic'] }, "&&Continue")
                    });
                    if (confirmed) {
                        result = await this.launchVsCode(request.arguments);
                    }
                    else {
                        response.success = false;
                        safeSendResponse(response);
                        await this.shutdown();
                    }
                }
                response.body = {
                    rendererDebugPort: result.rendererDebugPort,
                };
                safeSendResponse(response);
            }
            catch (err) {
                response.success = false;
                response.message = err.message;
                safeSendResponse(response);
            }
        }
        else if (request.command === 'runInTerminal') {
            try {
                const shellProcessId = await this.dbgr.runInTerminal(request.arguments, this.sessionId);
                const resp = response;
                resp.body = {};
                if (typeof shellProcessId === 'number') {
                    resp.body.shellProcessId = shellProcessId;
                }
                safeSendResponse(resp);
            }
            catch (err) {
                response.success = false;
                response.message = err.message;
                safeSendResponse(response);
            }
        }
        else if (request.command === 'startDebugging') {
            try {
                const args = request.arguments;
                const config = {
                    ...args.configuration,
                    ...{
                        request: args.request,
                        type: this.dbgr.type,
                        name: args.configuration.name || this.name
                    }
                };
                const success = await this.dbgr.startDebugging(config, this.sessionId);
                if (success) {
                    safeSendResponse(response);
                }
                else {
                    response.success = false;
                    response.message = 'Failed to start debugging';
                    safeSendResponse(response);
                }
            }
            catch (err) {
                response.success = false;
                response.message = err.message;
                safeSendResponse(response);
            }
        }
        else {
            response.success = false;
            response.message = `unknown request '${request.command}'`;
            safeSendResponse(response);
        }
    }
    launchVsCode(vscodeArgs) {
        const args = [];
        for (const arg of vscodeArgs.args) {
            const a2 = (arg.prefix || '') + (arg.path || '');
            const match = /^--(.+)=(.+)$/.exec(a2);
            if (match && match.length === 3) {
                const key = match[1];
                let value = match[2];
                if ((key === 'file-uri' || key === 'folder-uri') && !isUri(arg.path)) {
                    value = isUri(value) ? value : URI.file(value).toString();
                }
                args.push(`--${key}=${value}`);
            }
            else {
                args.push(a2);
            }
        }
        if (vscodeArgs.env) {
            args.push(`--extensionEnvironment=${JSON.stringify(vscodeArgs.env)}`);
        }
        return this.extensionHostDebugService.openExtensionDevelopmentHostWindow(args, !!vscodeArgs.debugRenderer);
    }
    send(command, args, token, timeout, showErrors = true) {
        return new Promise((completeDispatch, errorDispatch) => {
            if (!this.debugAdapter) {
                if (this.inShutdown) {
                    completeDispatch(undefined);
                }
                else {
                    errorDispatch(new Error(nls.localize('noDebugAdapter', "No debugger available found. Can not send '{0}'.", command)));
                }
                return;
            }
            let cancelationListener;
            const requestId = this.debugAdapter.sendRequest(command, args, (response) => {
                cancelationListener?.dispose();
                if (response.success) {
                    completeDispatch(response);
                }
                else {
                    errorDispatch(response);
                }
            }, timeout);
            if (token) {
                cancelationListener = token.onCancellationRequested(() => {
                    cancelationListener.dispose();
                    if (this.capabilities.supportsCancelRequest) {
                        this.cancel({ requestId });
                    }
                });
            }
        }).then(undefined, err => Promise.reject(this.handleErrorResponse(err, showErrors)));
    }
    handleErrorResponse(errorResponse, showErrors) {
        if (errorResponse.command === 'canceled' && errorResponse.message === 'canceled') {
            return new errors.CancellationError();
        }
        const error = errorResponse?.body?.error;
        const errorMessage = errorResponse?.message || '';
        const userMessage = error ? formatPII(error.format, false, error.variables) : errorMessage;
        const url = error?.url;
        if (error && url) {
            const label = error.urlLabel ? error.urlLabel : nls.localize('moreInfo', "More Info");
            const uri = URI.parse(url);
            const actionId = uri.scheme === Schemas.command ? 'debug.moreInfo.command' : 'debug.moreInfo';
            return createErrorWithActions(userMessage, [toAction({ id: actionId, label, run: () => this.openerService.open(uri, { allowCommands: true }) })]);
        }
        if (showErrors && error && error.format && error.showUser) {
            this.notificationService.error(userMessage);
        }
        const result = new errors.ErrorNoTelemetry(userMessage);
        result.showUser = error?.showUser;
        return result;
    }
    mergeCapabilities(capabilities) {
        if (capabilities) {
            this._capabilities = objects.mixin(this._capabilities, capabilities);
        }
    }
    fireSimulatedContinuedEvent(threadId, allThreadsContinued = false) {
        this._onDidContinued.fire({
            type: 'event',
            event: 'continued',
            body: {
                threadId,
                allThreadsContinued
            },
            seq: undefined
        });
    }
    dispose() {
        dispose(this.toDispose);
    }
};
RawDebugSession = __decorate([
    __param(4, IExtensionHostDebugService),
    __param(5, IOpenerService),
    __param(6, INotificationService),
    __param(7, IDialogService),
    __metadata("design:paramtypes", [Object, Object, String, String, Object, Object, Object, Object])
], RawDebugSession);
export { RawDebugSession };
