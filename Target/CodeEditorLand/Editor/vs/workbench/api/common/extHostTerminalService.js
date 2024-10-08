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
import { Emitter } from '../../../base/common/event.js';
import { MainContext } from './extHost.protocol.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { URI } from '../../../base/common/uri.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { DisposableStore, Disposable, MutableDisposable } from '../../../base/common/lifecycle.js';
import { Disposable as VSCodeDisposable, EnvironmentVariableMutatorType } from './extHostTypes.js';
import { localize } from '../../../nls.js';
import { NotSupportedError } from '../../../base/common/errors.js';
import { serializeEnvironmentDescriptionMap, serializeEnvironmentVariableCollection } from '../../../platform/terminal/common/environmentVariableShared.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { TerminalDataBufferer } from '../../../platform/terminal/common/terminalDataBuffering.js';
import { ThemeColor } from '../../../base/common/themables.js';
import { Promises } from '../../../base/common/async.js';
import { TerminalQuickFix, ViewColumn } from './extHostTypeConverters.js';
import { IExtHostCommands } from './extHostCommands.js';
export const IExtHostTerminalService = createDecorator('IExtHostTerminalService');
export class ExtHostTerminal extends Disposable {
    constructor(_proxy, _id, _creationOptions, _name) {
        super();
        this._proxy = _proxy;
        this._id = _id;
        this._creationOptions = _creationOptions;
        this._name = _name;
        this._disposed = false;
        this._state = { isInteractedWith: false };
        this.isOpen = false;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        this._creationOptions = Object.freeze(this._creationOptions);
        this._pidPromise = new Promise(c => this._pidPromiseComplete = c);
        const that = this;
        this.value = {
            get name() {
                return that._name || '';
            },
            get processId() {
                return that._pidPromise;
            },
            get creationOptions() {
                return that._creationOptions;
            },
            get exitStatus() {
                return that._exitStatus;
            },
            get state() {
                return that._state;
            },
            get selection() {
                return that._selection;
            },
            get shellIntegration() {
                return that.shellIntegration;
            },
            sendText(text, shouldExecute = true) {
                that._checkDisposed();
                that._proxy.$sendText(that._id, text, shouldExecute);
            },
            show(preserveFocus) {
                that._checkDisposed();
                that._proxy.$show(that._id, preserveFocus);
            },
            hide() {
                that._checkDisposed();
                that._proxy.$hide(that._id);
            },
            dispose() {
                if (!that._disposed) {
                    that._disposed = true;
                    that._proxy.$dispose(that._id);
                }
            },
            get dimensions() {
                if (that._cols === undefined || that._rows === undefined) {
                    return undefined;
                }
                return {
                    columns: that._cols,
                    rows: that._rows
                };
            }
        };
    }
    dispose() {
        this._onWillDispose.fire();
        super.dispose();
    }
    async create(options, internalOptions) {
        if (typeof this._id !== 'string') {
            throw new Error('Terminal has already been created');
        }
        await this._proxy.$createTerminal(this._id, {
            name: options.name,
            shellPath: options.shellPath ?? undefined,
            shellArgs: options.shellArgs ?? undefined,
            cwd: options.cwd ?? internalOptions?.cwd ?? undefined,
            env: options.env ?? undefined,
            icon: asTerminalIcon(options.iconPath) ?? undefined,
            color: ThemeColor.isThemeColor(options.color) ? options.color.id : undefined,
            initialText: options.message ?? undefined,
            strictEnv: options.strictEnv ?? undefined,
            hideFromUser: options.hideFromUser ?? undefined,
            forceShellIntegration: internalOptions?.forceShellIntegration ?? undefined,
            isFeatureTerminal: internalOptions?.isFeatureTerminal ?? undefined,
            isExtensionOwnedTerminal: true,
            useShellEnvironment: internalOptions?.useShellEnvironment ?? undefined,
            location: internalOptions?.location || this._serializeParentTerminal(options.location, internalOptions?.resolvedExtHostIdentifier),
            isTransient: options.isTransient ?? undefined,
        });
    }
    async createExtensionTerminal(location, internalOptions, parentTerminal, iconPath, color) {
        if (typeof this._id !== 'string') {
            throw new Error('Terminal has already been created');
        }
        await this._proxy.$createTerminal(this._id, {
            name: this._name,
            isExtensionCustomPtyTerminal: true,
            icon: iconPath,
            color: ThemeColor.isThemeColor(color) ? color.id : undefined,
            location: internalOptions?.location || this._serializeParentTerminal(location, parentTerminal),
            isTransient: true
        });
        // At this point, the id has been set via `$acceptTerminalOpened`
        if (typeof this._id === 'string') {
            throw new Error('Terminal creation failed');
        }
        return this._id;
    }
    _serializeParentTerminal(location, parentTerminal) {
        if (typeof location === 'object') {
            if ('parentTerminal' in location && location.parentTerminal && parentTerminal) {
                return { parentTerminal };
            }
            if ('viewColumn' in location) {
                return { viewColumn: ViewColumn.from(location.viewColumn), preserveFocus: location.preserveFocus };
            }
            return undefined;
        }
        return location;
    }
    _checkDisposed() {
        if (this._disposed) {
            throw new Error('Terminal has already been disposed');
        }
    }
    set name(name) {
        this._name = name;
    }
    setExitStatus(code, reason) {
        this._exitStatus = Object.freeze({ code, reason });
    }
    setDimensions(cols, rows) {
        if (cols === this._cols && rows === this._rows) {
            // Nothing changed
            return false;
        }
        if (cols === 0 || rows === 0) {
            return false;
        }
        this._cols = cols;
        this._rows = rows;
        return true;
    }
    setInteractedWith() {
        if (!this._state.isInteractedWith) {
            this._state = { isInteractedWith: true };
            return true;
        }
        return false;
    }
    setSelection(selection) {
        this._selection = selection;
    }
    _setProcessId(processId) {
        // The event may fire 2 times when the panel is restored
        if (this._pidPromiseComplete) {
            this._pidPromiseComplete(processId);
            this._pidPromiseComplete = undefined;
        }
        else {
            // Recreate the promise if this is the nth processId set (e.g. reused task terminals)
            this._pidPromise.then(pid => {
                if (pid !== processId) {
                    this._pidPromise = Promise.resolve(processId);
                }
            });
        }
    }
}
class ExtHostPseudoterminal {
    get onProcessReady() { return this._onProcessReady.event; }
    constructor(_pty) {
        this._pty = _pty;
        this.id = 0;
        this.shouldPersist = false;
        this._onProcessData = new Emitter();
        this.onProcessData = this._onProcessData.event;
        this._onProcessReady = new Emitter();
        this._onDidChangeProperty = new Emitter();
        this.onDidChangeProperty = this._onDidChangeProperty.event;
        this._onProcessExit = new Emitter();
        this.onProcessExit = this._onProcessExit.event;
    }
    refreshProperty(property) {
        throw new Error(`refreshProperty is not suppported in extension owned terminals. property: ${property}`);
    }
    updateProperty(property, value) {
        throw new Error(`updateProperty is not suppported in extension owned terminals. property: ${property}, value: ${value}`);
    }
    async start() {
        return undefined;
    }
    shutdown() {
        this._pty.close();
    }
    input(data) {
        this._pty.handleInput?.(data);
    }
    resize(cols, rows) {
        this._pty.setDimensions?.({ columns: cols, rows });
    }
    clearBuffer() {
        // no-op
    }
    async processBinary(data) {
        // No-op, processBinary is not supported in extension owned terminals.
    }
    acknowledgeDataEvent(charCount) {
        // No-op, flow control is not supported in extension owned terminals. If this is ever
        // implemented it will need new pause and resume VS Code APIs.
    }
    async setUnicodeVersion(version) {
        // No-op, xterm-headless isn't used for extension owned terminals.
    }
    getInitialCwd() {
        return Promise.resolve('');
    }
    getCwd() {
        return Promise.resolve('');
    }
    startSendingEvents(initialDimensions) {
        // Attach the listeners
        this._pty.onDidWrite(e => this._onProcessData.fire(e));
        this._pty.onDidClose?.((e = undefined) => {
            this._onProcessExit.fire(e === void 0 ? undefined : e);
        });
        this._pty.onDidOverrideDimensions?.(e => {
            if (e) {
                this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: e.columns, rows: e.rows } });
            }
        });
        this._pty.onDidChangeName?.(title => {
            this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: title });
        });
        this._pty.open(initialDimensions ? initialDimensions : undefined);
        if (initialDimensions) {
            this._pty.setDimensions?.(initialDimensions);
        }
        this._onProcessReady.fire({ pid: -1, cwd: '', windowsPty: undefined });
    }
}
let nextLinkId = 1;
let BaseExtHostTerminalService = class BaseExtHostTerminalService extends Disposable {
    get activeTerminal() { return this._activeTerminal?.value; }
    get terminals() { return this._terminals.map(term => term.value); }
    constructor(supportsProcesses, _extHostCommands, extHostRpc) {
        super();
        this._extHostCommands = _extHostCommands;
        this._terminals = [];
        this._terminalProcesses = new Map();
        this._terminalProcessDisposables = {};
        this._extensionTerminalAwaitingStart = {};
        this._getTerminalPromises = {};
        this._environmentVariableCollections = new Map();
        this._lastQuickFixCommands = this._register(new MutableDisposable());
        this._linkProviders = new Set();
        this._profileProviders = new Map();
        this._quickFixProviders = new Map();
        this._terminalLinkCache = new Map();
        this._terminalLinkCancellationSource = new Map();
        this._onDidCloseTerminal = new Emitter();
        this.onDidCloseTerminal = this._onDidCloseTerminal.event;
        this._onDidOpenTerminal = new Emitter();
        this.onDidOpenTerminal = this._onDidOpenTerminal.event;
        this._onDidChangeActiveTerminal = new Emitter();
        this.onDidChangeActiveTerminal = this._onDidChangeActiveTerminal.event;
        this._onDidChangeTerminalDimensions = new Emitter();
        this.onDidChangeTerminalDimensions = this._onDidChangeTerminalDimensions.event;
        this._onDidChangeTerminalState = new Emitter();
        this.onDidChangeTerminalState = this._onDidChangeTerminalState.event;
        this._onDidChangeShell = new Emitter();
        this.onDidChangeShell = this._onDidChangeShell.event;
        this._onDidWriteTerminalData = new Emitter({
            onWillAddFirstListener: () => this._proxy.$startSendingDataEvents(),
            onDidRemoveLastListener: () => this._proxy.$stopSendingDataEvents()
        });
        this.onDidWriteTerminalData = this._onDidWriteTerminalData.event;
        this._onDidExecuteCommand = new Emitter({
            onWillAddFirstListener: () => this._proxy.$startSendingCommandEvents(),
            onDidRemoveLastListener: () => this._proxy.$stopSendingCommandEvents()
        });
        this.onDidExecuteTerminalCommand = this._onDidExecuteCommand.event;
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadTerminalService);
        this._bufferer = new TerminalDataBufferer(this._proxy.$sendProcessData);
        this._proxy.$registerProcessSupport(supportsProcesses);
        this._extHostCommands.registerArgumentProcessor({
            processArgument: arg => {
                const deserialize = (arg) => {
                    const cast = arg;
                    return this.getTerminalById(cast.instanceId)?.value;
                };
                switch (arg?.$mid) {
                    case 15 /* MarshalledId.TerminalContext */: return deserialize(arg);
                    default: {
                        // Do array transformation in place as this is a hot path
                        if (Array.isArray(arg)) {
                            for (let i = 0; i < arg.length; i++) {
                                if (arg[i].$mid === 15 /* MarshalledId.TerminalContext */) {
                                    arg[i] = deserialize(arg[i]);
                                }
                                else {
                                    // Probably something else, so exit early
                                    break;
                                }
                            }
                        }
                        return arg;
                    }
                }
            }
        });
        this._register({
            dispose: () => {
                for (const [_, terminalProcess] of this._terminalProcesses) {
                    terminalProcess.shutdown(true);
                }
            }
        });
    }
    getDefaultShell(useAutomationShell) {
        const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
        return profile?.path || '';
    }
    getDefaultShellArgs(useAutomationShell) {
        const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
        return profile?.args || [];
    }
    createExtensionTerminal(options, internalOptions) {
        const terminal = new ExtHostTerminal(this._proxy, generateUuid(), options, options.name);
        const p = new ExtHostPseudoterminal(options.pty);
        terminal.createExtensionTerminal(options.location, internalOptions, this._serializeParentTerminal(options, internalOptions).resolvedExtHostIdentifier, asTerminalIcon(options.iconPath), asTerminalColor(options.color)).then(id => {
            const disposable = this._setupExtHostProcessListeners(id, p);
            this._terminalProcessDisposables[id] = disposable;
        });
        this._terminals.push(terminal);
        return terminal.value;
    }
    _serializeParentTerminal(options, internalOptions) {
        internalOptions = internalOptions ? internalOptions : {};
        if (options.location && typeof options.location === 'object' && 'parentTerminal' in options.location) {
            const parentTerminal = options.location.parentTerminal;
            if (parentTerminal) {
                const parentExtHostTerminal = this._terminals.find(t => t.value === parentTerminal);
                if (parentExtHostTerminal) {
                    internalOptions.resolvedExtHostIdentifier = parentExtHostTerminal._id;
                }
            }
        }
        else if (options.location && typeof options.location !== 'object') {
            internalOptions.location = options.location;
        }
        else if (internalOptions.location && typeof internalOptions.location === 'object' && 'splitActiveTerminal' in internalOptions.location) {
            internalOptions.location = { splitActiveTerminal: true };
        }
        return internalOptions;
    }
    attachPtyToTerminal(id, pty) {
        const terminal = this.getTerminalById(id);
        if (!terminal) {
            throw new Error(`Cannot resolve terminal with id ${id} for virtual process`);
        }
        const p = new ExtHostPseudoterminal(pty);
        const disposable = this._setupExtHostProcessListeners(id, p);
        this._terminalProcessDisposables[id] = disposable;
    }
    async $acceptActiveTerminalChanged(id) {
        const original = this._activeTerminal;
        if (id === null) {
            this._activeTerminal = undefined;
            if (original !== this._activeTerminal) {
                this._onDidChangeActiveTerminal.fire(this._activeTerminal);
            }
            return;
        }
        const terminal = this.getTerminalById(id);
        if (terminal) {
            this._activeTerminal = terminal;
            if (original !== this._activeTerminal) {
                this._onDidChangeActiveTerminal.fire(this._activeTerminal.value);
            }
        }
    }
    async $acceptTerminalProcessData(id, data) {
        const terminal = this.getTerminalById(id);
        if (terminal) {
            this._onDidWriteTerminalData.fire({ terminal: terminal.value, data });
        }
    }
    async $acceptTerminalDimensions(id, cols, rows) {
        const terminal = this.getTerminalById(id);
        if (terminal) {
            if (terminal.setDimensions(cols, rows)) {
                this._onDidChangeTerminalDimensions.fire({
                    terminal: terminal.value,
                    dimensions: terminal.value.dimensions
                });
            }
        }
    }
    async $acceptDidExecuteCommand(id, command) {
        const terminal = this.getTerminalById(id);
        if (terminal) {
            this._onDidExecuteCommand.fire({ terminal: terminal.value, ...command });
        }
    }
    async $acceptTerminalMaximumDimensions(id, cols, rows) {
        // Extension pty terminal only - when virtual process resize fires it means that the
        // terminal's maximum dimensions changed
        this._terminalProcesses.get(id)?.resize(cols, rows);
    }
    async $acceptTerminalTitleChange(id, name) {
        const terminal = this.getTerminalById(id);
        if (terminal) {
            terminal.name = name;
        }
    }
    async $acceptTerminalClosed(id, exitCode, exitReason) {
        const index = this._getTerminalObjectIndexById(this._terminals, id);
        if (index !== null) {
            const terminal = this._terminals.splice(index, 1)[0];
            terminal.setExitStatus(exitCode, exitReason);
            this._onDidCloseTerminal.fire(terminal.value);
        }
    }
    $acceptTerminalOpened(id, extHostTerminalId, name, shellLaunchConfigDto) {
        if (extHostTerminalId) {
            // Resolve with the renderer generated id
            const index = this._getTerminalObjectIndexById(this._terminals, extHostTerminalId);
            if (index !== null) {
                // The terminal has already been created (via createTerminal*), only fire the event
                this._terminals[index]._id = id;
                this._onDidOpenTerminal.fire(this.terminals[index]);
                this._terminals[index].isOpen = true;
                return;
            }
        }
        const creationOptions = {
            name: shellLaunchConfigDto.name,
            shellPath: shellLaunchConfigDto.executable,
            shellArgs: shellLaunchConfigDto.args,
            cwd: typeof shellLaunchConfigDto.cwd === 'string' ? shellLaunchConfigDto.cwd : URI.revive(shellLaunchConfigDto.cwd),
            env: shellLaunchConfigDto.env,
            hideFromUser: shellLaunchConfigDto.hideFromUser
        };
        const terminal = new ExtHostTerminal(this._proxy, id, creationOptions, name);
        this._terminals.push(terminal);
        this._onDidOpenTerminal.fire(terminal.value);
        terminal.isOpen = true;
    }
    async $acceptTerminalProcessId(id, processId) {
        const terminal = this.getTerminalById(id);
        terminal?._setProcessId(processId);
    }
    async $startExtensionTerminal(id, initialDimensions) {
        // Make sure the ExtHostTerminal exists so onDidOpenTerminal has fired before we call
        // Pseudoterminal.start
        const terminal = this.getTerminalById(id);
        if (!terminal) {
            return { message: localize('launchFail.idMissingOnExtHost', "Could not find the terminal with id {0} on the extension host", id) };
        }
        // Wait for onDidOpenTerminal to fire
        if (!terminal.isOpen) {
            await new Promise(r => {
                // Ensure open is called after onDidOpenTerminal
                const listener = this.onDidOpenTerminal(async (e) => {
                    if (e === terminal.value) {
                        listener.dispose();
                        r();
                    }
                });
            });
        }
        const terminalProcess = this._terminalProcesses.get(id);
        if (terminalProcess) {
            terminalProcess.startSendingEvents(initialDimensions);
        }
        else {
            // Defer startSendingEvents call to when _setupExtHostProcessListeners is called
            this._extensionTerminalAwaitingStart[id] = { initialDimensions };
        }
        return undefined;
    }
    _setupExtHostProcessListeners(id, p) {
        const disposables = new DisposableStore();
        disposables.add(p.onProcessReady(e => this._proxy.$sendProcessReady(id, e.pid, e.cwd, e.windowsPty)));
        disposables.add(p.onDidChangeProperty(property => this._proxy.$sendProcessProperty(id, property)));
        // Buffer data events to reduce the amount of messages going to the renderer
        this._bufferer.startBuffering(id, p.onProcessData);
        disposables.add(p.onProcessExit(exitCode => this._onProcessExit(id, exitCode)));
        this._terminalProcesses.set(id, p);
        const awaitingStart = this._extensionTerminalAwaitingStart[id];
        if (awaitingStart && p instanceof ExtHostPseudoterminal) {
            p.startSendingEvents(awaitingStart.initialDimensions);
            delete this._extensionTerminalAwaitingStart[id];
        }
        return disposables;
    }
    $acceptProcessAckDataEvent(id, charCount) {
        this._terminalProcesses.get(id)?.acknowledgeDataEvent(charCount);
    }
    $acceptProcessInput(id, data) {
        this._terminalProcesses.get(id)?.input(data);
    }
    $acceptTerminalInteraction(id) {
        const terminal = this.getTerminalById(id);
        if (terminal?.setInteractedWith()) {
            this._onDidChangeTerminalState.fire(terminal.value);
        }
    }
    $acceptTerminalSelection(id, selection) {
        this.getTerminalById(id)?.setSelection(selection);
    }
    $acceptProcessResize(id, cols, rows) {
        try {
            this._terminalProcesses.get(id)?.resize(cols, rows);
        }
        catch (error) {
            // We tried to write to a closed pipe / channel.
            if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                throw (error);
            }
        }
    }
    $acceptProcessShutdown(id, immediate) {
        this._terminalProcesses.get(id)?.shutdown(immediate);
    }
    $acceptProcessRequestInitialCwd(id) {
        this._terminalProcesses.get(id)?.getInitialCwd().then(initialCwd => this._proxy.$sendProcessProperty(id, { type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: initialCwd }));
    }
    $acceptProcessRequestCwd(id) {
        this._terminalProcesses.get(id)?.getCwd().then(cwd => this._proxy.$sendProcessProperty(id, { type: "cwd" /* ProcessPropertyType.Cwd */, value: cwd }));
    }
    $acceptProcessRequestLatency(id) {
        return Promise.resolve(id);
    }
    registerLinkProvider(provider) {
        this._linkProviders.add(provider);
        if (this._linkProviders.size === 1) {
            this._proxy.$startLinkProvider();
        }
        return new VSCodeDisposable(() => {
            this._linkProviders.delete(provider);
            if (this._linkProviders.size === 0) {
                this._proxy.$stopLinkProvider();
            }
        });
    }
    registerProfileProvider(extension, id, provider) {
        if (this._profileProviders.has(id)) {
            throw new Error(`Terminal profile provider "${id}" already registered`);
        }
        this._profileProviders.set(id, provider);
        this._proxy.$registerProfileProvider(id, extension.identifier.value);
        return new VSCodeDisposable(() => {
            this._profileProviders.delete(id);
            this._proxy.$unregisterProfileProvider(id);
        });
    }
    registerTerminalQuickFixProvider(id, extensionId, provider) {
        if (this._quickFixProviders.has(id)) {
            throw new Error(`Terminal quick fix provider "${id}" is already registered`);
        }
        this._quickFixProviders.set(id, provider);
        this._proxy.$registerQuickFixProvider(id, extensionId);
        return new VSCodeDisposable(() => {
            this._quickFixProviders.delete(id);
            this._proxy.$unregisterQuickFixProvider(id);
        });
    }
    async $provideTerminalQuickFixes(id, matchResult) {
        const token = new CancellationTokenSource().token;
        if (token.isCancellationRequested) {
            return;
        }
        const provider = this._quickFixProviders.get(id);
        if (!provider) {
            return;
        }
        const quickFixes = await provider.provideTerminalQuickFixes(matchResult, token);
        if (quickFixes === null || (Array.isArray(quickFixes) && quickFixes.length === 0)) {
            return undefined;
        }
        const store = new DisposableStore();
        this._lastQuickFixCommands.value = store;
        // Single
        if (!Array.isArray(quickFixes)) {
            return quickFixes ? TerminalQuickFix.from(quickFixes, this._extHostCommands.converter, store) : undefined;
        }
        // Many
        const result = [];
        for (const fix of quickFixes) {
            const converted = TerminalQuickFix.from(fix, this._extHostCommands.converter, store);
            if (converted) {
                result.push(converted);
            }
        }
        return result;
    }
    async $createContributedProfileTerminal(id, options) {
        const token = new CancellationTokenSource().token;
        let profile = await this._profileProviders.get(id)?.provideTerminalProfile(token);
        if (token.isCancellationRequested) {
            return;
        }
        if (profile && !('options' in profile)) {
            profile = { options: profile };
        }
        if (!profile || !('options' in profile)) {
            throw new Error(`No terminal profile options provided for id "${id}"`);
        }
        if ('pty' in profile.options) {
            this.createExtensionTerminal(profile.options, options);
            return;
        }
        this.createTerminalFromOptions(profile.options, options);
    }
    async $provideLinks(terminalId, line) {
        const terminal = this.getTerminalById(terminalId);
        if (!terminal) {
            return [];
        }
        // Discard any cached links the terminal has been holding, currently all links are released
        // when new links are provided.
        this._terminalLinkCache.delete(terminalId);
        const oldToken = this._terminalLinkCancellationSource.get(terminalId);
        oldToken?.dispose(true);
        const cancellationSource = new CancellationTokenSource();
        this._terminalLinkCancellationSource.set(terminalId, cancellationSource);
        const result = [];
        const context = { terminal: terminal.value, line };
        const promises = [];
        for (const provider of this._linkProviders) {
            promises.push(Promises.withAsyncBody(async (r) => {
                cancellationSource.token.onCancellationRequested(() => r({ provider, links: [] }));
                const links = (await provider.provideTerminalLinks(context, cancellationSource.token)) || [];
                if (!cancellationSource.token.isCancellationRequested) {
                    r({ provider, links });
                }
            }));
        }
        const provideResults = await Promise.all(promises);
        if (cancellationSource.token.isCancellationRequested) {
            return [];
        }
        const cacheLinkMap = new Map();
        for (const provideResult of provideResults) {
            if (provideResult && provideResult.links.length > 0) {
                result.push(...provideResult.links.map(providerLink => {
                    const link = {
                        id: nextLinkId++,
                        startIndex: providerLink.startIndex,
                        length: providerLink.length,
                        label: providerLink.tooltip
                    };
                    cacheLinkMap.set(link.id, {
                        provider: provideResult.provider,
                        link: providerLink
                    });
                    return link;
                }));
            }
        }
        this._terminalLinkCache.set(terminalId, cacheLinkMap);
        return result;
    }
    $activateLink(terminalId, linkId) {
        const cachedLink = this._terminalLinkCache.get(terminalId)?.get(linkId);
        if (!cachedLink) {
            return;
        }
        cachedLink.provider.handleTerminalLink(cachedLink.link);
    }
    _onProcessExit(id, exitCode) {
        this._bufferer.stopBuffering(id);
        // Remove process reference
        this._terminalProcesses.delete(id);
        delete this._extensionTerminalAwaitingStart[id];
        // Clean up process disposables
        const processDiposable = this._terminalProcessDisposables[id];
        if (processDiposable) {
            processDiposable.dispose();
            delete this._terminalProcessDisposables[id];
        }
        // Send exit event to main side
        this._proxy.$sendProcessExit(id, exitCode);
    }
    getTerminalById(id) {
        return this._getTerminalObjectById(this._terminals, id);
    }
    getTerminalIdByApiObject(terminal) {
        const index = this._terminals.findIndex(item => {
            return item.value === terminal;
        });
        return index >= 0 ? index : null;
    }
    _getTerminalObjectById(array, id) {
        const index = this._getTerminalObjectIndexById(array, id);
        return index !== null ? array[index] : null;
    }
    _getTerminalObjectIndexById(array, id) {
        const index = array.findIndex(item => {
            return item._id === id;
        });
        return index >= 0 ? index : null;
    }
    getEnvironmentVariableCollection(extension) {
        let collection = this._environmentVariableCollections.get(extension.identifier.value);
        if (!collection) {
            collection = this._register(new UnifiedEnvironmentVariableCollection());
            this._setEnvironmentVariableCollection(extension.identifier.value, collection);
        }
        return collection.getScopedEnvironmentVariableCollection(undefined);
    }
    _syncEnvironmentVariableCollection(extensionIdentifier, collection) {
        const serialized = serializeEnvironmentVariableCollection(collection.map);
        const serializedDescription = serializeEnvironmentDescriptionMap(collection.descriptionMap);
        this._proxy.$setEnvironmentVariableCollection(extensionIdentifier, collection.persistent, serialized.length === 0 ? undefined : serialized, serializedDescription);
    }
    $initEnvironmentVariableCollections(collections) {
        collections.forEach(entry => {
            const extensionIdentifier = entry[0];
            const collection = this._register(new UnifiedEnvironmentVariableCollection(entry[1]));
            this._setEnvironmentVariableCollection(extensionIdentifier, collection);
        });
    }
    $acceptDefaultProfile(profile, automationProfile) {
        const oldProfile = this._defaultProfile;
        this._defaultProfile = profile;
        this._defaultAutomationProfile = automationProfile;
        if (oldProfile?.path !== profile.path) {
            this._onDidChangeShell.fire(profile.path);
        }
    }
    _setEnvironmentVariableCollection(extensionIdentifier, collection) {
        this._environmentVariableCollections.set(extensionIdentifier, collection);
        this._register(collection.onDidChangeCollection(() => {
            // When any collection value changes send this immediately, this is done to ensure
            // following calls to createTerminal will be created with the new environment. It will
            // result in more noise by sending multiple updates when called but collections are
            // expected to be small.
            this._syncEnvironmentVariableCollection(extensionIdentifier, collection);
        }));
    }
};
BaseExtHostTerminalService = __decorate([
    __param(1, IExtHostCommands),
    __param(2, IExtHostRpcService),
    __metadata("design:paramtypes", [Boolean, Object, Object])
], BaseExtHostTerminalService);
export { BaseExtHostTerminalService };
/**
 * Unified environment variable collection carrying information for all scopes, for a specific extension.
 */
class UnifiedEnvironmentVariableCollection extends Disposable {
    get persistent() { return this._persistent; }
    set persistent(value) {
        this._persistent = value;
        this._onDidChangeCollection.fire();
    }
    get onDidChangeCollection() { return this._onDidChangeCollection && this._onDidChangeCollection.event; }
    constructor(serialized) {
        super();
        this.map = new Map();
        this.scopedCollections = new Map();
        this.descriptionMap = new Map();
        this._persistent = true;
        this._onDidChangeCollection = new Emitter();
        this.map = new Map(serialized);
    }
    getScopedEnvironmentVariableCollection(scope) {
        const scopedCollectionKey = this.getScopeKey(scope);
        let scopedCollection = this.scopedCollections.get(scopedCollectionKey);
        if (!scopedCollection) {
            scopedCollection = new ScopedEnvironmentVariableCollection(this, scope);
            this.scopedCollections.set(scopedCollectionKey, scopedCollection);
            this._register(scopedCollection.onDidChangeCollection(() => this._onDidChangeCollection.fire()));
        }
        return scopedCollection;
    }
    replace(variable, value, options, scope) {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Replace, options: options ?? { applyAtProcessCreation: true }, scope });
    }
    append(variable, value, options, scope) {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Append, options: options ?? { applyAtProcessCreation: true }, scope });
    }
    prepend(variable, value, options, scope) {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Prepend, options: options ?? { applyAtProcessCreation: true }, scope });
    }
    _setIfDiffers(variable, mutator) {
        if (mutator.options && mutator.options.applyAtProcessCreation === false && !mutator.options.applyAtShellIntegration) {
            throw new Error('EnvironmentVariableMutatorOptions must apply at either process creation or shell integration');
        }
        const key = this.getKey(variable, mutator.scope);
        const current = this.map.get(key);
        const newOptions = mutator.options ? {
            applyAtProcessCreation: mutator.options.applyAtProcessCreation ?? false,
            applyAtShellIntegration: mutator.options.applyAtShellIntegration ?? false,
        } : {
            applyAtProcessCreation: true
        };
        if (!current ||
            current.value !== mutator.value ||
            current.type !== mutator.type ||
            current.options?.applyAtProcessCreation !== newOptions.applyAtProcessCreation ||
            current.options?.applyAtShellIntegration !== newOptions.applyAtShellIntegration ||
            current.scope?.workspaceFolder?.index !== mutator.scope?.workspaceFolder?.index) {
            const key = this.getKey(variable, mutator.scope);
            const value = {
                variable,
                ...mutator,
                options: newOptions
            };
            this.map.set(key, value);
            this._onDidChangeCollection.fire();
        }
    }
    get(variable, scope) {
        const key = this.getKey(variable, scope);
        const value = this.map.get(key);
        // TODO: Set options to defaults if needed
        return value ? convertMutator(value) : undefined;
    }
    getKey(variable, scope) {
        const scopeKey = this.getScopeKey(scope);
        return scopeKey.length ? `${variable}:::${scopeKey}` : variable;
    }
    getScopeKey(scope) {
        return this.getWorkspaceKey(scope?.workspaceFolder) ?? '';
    }
    getWorkspaceKey(workspaceFolder) {
        return workspaceFolder ? workspaceFolder.uri.toString() : undefined;
    }
    getVariableMap(scope) {
        const map = new Map();
        for (const [_, value] of this.map) {
            if (this.getScopeKey(value.scope) === this.getScopeKey(scope)) {
                map.set(value.variable, convertMutator(value));
            }
        }
        return map;
    }
    delete(variable, scope) {
        const key = this.getKey(variable, scope);
        this.map.delete(key);
        this._onDidChangeCollection.fire();
    }
    clear(scope) {
        if (scope?.workspaceFolder) {
            for (const [key, mutator] of this.map) {
                if (mutator.scope?.workspaceFolder?.index === scope.workspaceFolder.index) {
                    this.map.delete(key);
                }
            }
            this.clearDescription(scope);
        }
        else {
            this.map.clear();
            this.descriptionMap.clear();
        }
        this._onDidChangeCollection.fire();
    }
    setDescription(description, scope) {
        const key = this.getScopeKey(scope);
        const current = this.descriptionMap.get(key);
        if (!current || current.description !== description) {
            let descriptionStr;
            if (typeof description === 'string') {
                descriptionStr = description;
            }
            else {
                // Only take the description before the first `\n\n`, so that the description doesn't mess up the UI
                descriptionStr = description?.value.split('\n\n')[0];
            }
            const value = { description: descriptionStr, scope };
            this.descriptionMap.set(key, value);
            this._onDidChangeCollection.fire();
        }
    }
    getDescription(scope) {
        const key = this.getScopeKey(scope);
        return this.descriptionMap.get(key)?.description;
    }
    clearDescription(scope) {
        const key = this.getScopeKey(scope);
        this.descriptionMap.delete(key);
    }
}
class ScopedEnvironmentVariableCollection {
    get persistent() { return this.collection.persistent; }
    set persistent(value) {
        this.collection.persistent = value;
    }
    get onDidChangeCollection() { return this._onDidChangeCollection && this._onDidChangeCollection.event; }
    constructor(collection, scope) {
        this.collection = collection;
        this.scope = scope;
        this._onDidChangeCollection = new Emitter();
    }
    getScoped(scope) {
        return this.collection.getScopedEnvironmentVariableCollection(scope);
    }
    replace(variable, value, options) {
        this.collection.replace(variable, value, options, this.scope);
    }
    append(variable, value, options) {
        this.collection.append(variable, value, options, this.scope);
    }
    prepend(variable, value, options) {
        this.collection.prepend(variable, value, options, this.scope);
    }
    get(variable) {
        return this.collection.get(variable, this.scope);
    }
    forEach(callback, thisArg) {
        this.collection.getVariableMap(this.scope).forEach((value, variable) => callback.call(thisArg, variable, value, this), this.scope);
    }
    [Symbol.iterator]() {
        return this.collection.getVariableMap(this.scope).entries();
    }
    delete(variable) {
        this.collection.delete(variable, this.scope);
        this._onDidChangeCollection.fire(undefined);
    }
    clear() {
        this.collection.clear(this.scope);
    }
    set description(description) {
        this.collection.setDescription(description, this.scope);
    }
    get description() {
        return this.collection.getDescription(this.scope);
    }
}
let WorkerExtHostTerminalService = class WorkerExtHostTerminalService extends BaseExtHostTerminalService {
    constructor(extHostCommands, extHostRpc) {
        super(false, extHostCommands, extHostRpc);
    }
    createTerminal(name, shellPath, shellArgs) {
        throw new NotSupportedError();
    }
    createTerminalFromOptions(options, internalOptions) {
        throw new NotSupportedError();
    }
};
WorkerExtHostTerminalService = __decorate([
    __param(0, IExtHostCommands),
    __param(1, IExtHostRpcService),
    __metadata("design:paramtypes", [Object, Object])
], WorkerExtHostTerminalService);
export { WorkerExtHostTerminalService };
function asTerminalIcon(iconPath) {
    if (!iconPath || typeof iconPath === 'string') {
        return undefined;
    }
    if (!('id' in iconPath)) {
        return iconPath;
    }
    return {
        id: iconPath.id,
        color: iconPath.color
    };
}
function asTerminalColor(color) {
    return ThemeColor.isThemeColor(color) ? color : undefined;
}
function convertMutator(mutator) {
    const newMutator = { ...mutator };
    delete newMutator.scope;
    newMutator.options = newMutator.options ?? undefined;
    delete newMutator.variable;
    return newMutator;
}
