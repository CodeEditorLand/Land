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
var DevModeContribution_1;
import { Delayer } from '../../../../../base/common/async.js';
import { VSBuffer } from '../../../../../base/common/buffer.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, combinedDisposable, dispose } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import './media/developer.css';
import { localize, localize2 } from '../../../../../nls.js';
import { Categories } from '../../../../../platform/action/common/actionCommonCategories.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { registerTerminalAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { IStatusbarService } from '../../../../services/statusbar/browser/statusbar.js';
registerTerminalAction({
    id: "workbench.action.terminal.showTextureAtlas",
    title: localize2('workbench.action.terminal.showTextureAtlas', 'Show Terminal Texture Atlas'),
    category: Categories.Developer,
    precondition: ContextKeyExpr.or(TerminalContextKeys.isOpen),
    run: async (c, accessor) => {
        const fileService = accessor.get(IFileService);
        const openerService = accessor.get(IOpenerService);
        const workspaceContextService = accessor.get(IWorkspaceContextService);
        const bitmap = await c.service.activeInstance?.xterm?.textureAtlas;
        if (!bitmap) {
            return;
        }
        const cwdUri = workspaceContextService.getWorkspace().folders[0].uri;
        const fileUri = URI.joinPath(cwdUri, 'textureAtlas.png');
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('bitmaprenderer');
        if (!ctx) {
            return;
        }
        ctx.transferFromImageBitmap(bitmap);
        const blob = await new Promise((res) => canvas.toBlob(res));
        if (!blob) {
            return;
        }
        await fileService.writeFile(fileUri, VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
        openerService.open(fileUri);
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.writeDataToTerminal",
    title: localize2('workbench.action.terminal.writeDataToTerminal', 'Write Data to Terminal'),
    category: Categories.Developer,
    run: async (c, accessor) => {
        const quickInputService = accessor.get(IQuickInputService);
        const instance = await c.service.getActiveOrCreateInstance();
        await c.service.revealActiveTerminal();
        await instance.processReady;
        if (!instance.xterm) {
            throw new Error('Cannot write data to terminal if xterm isn\'t initialized');
        }
        const data = await quickInputService.input({
            value: '',
            placeHolder: 'Enter data, use \\x to escape',
            prompt: localize('workbench.action.terminal.writeDataToTerminal.prompt', "Enter data to write directly to the terminal, bypassing the pty"),
        });
        if (!data) {
            return;
        }
        let escapedData = data
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r');
        while (true) {
            const match = escapedData.match(/\\x([0-9a-fA-F]{2})/);
            if (match === null || match.index === undefined || match.length < 2) {
                break;
            }
            escapedData = escapedData.slice(0, match.index) + String.fromCharCode(parseInt(match[1], 16)) + escapedData.slice(match.index + 4);
        }
        const xterm = instance.xterm;
        xterm._writeText(escapedData);
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.recordSession",
    title: localize2('workbench.action.terminal.recordSession', 'Record Terminal Session'),
    category: Categories.Developer,
    run: async (c, accessor) => {
        const clipboardService = accessor.get(IClipboardService);
        const commandService = accessor.get(ICommandService);
        const statusbarService = accessor.get(IStatusbarService);
        const store = new DisposableStore();
        const text = localize('workbench.action.terminal.recordSession.recording', "Recording terminal session...");
        const statusbarEntry = {
            text,
            name: text,
            ariaLabel: text,
            showProgress: true
        };
        const statusbarHandle = statusbarService.addEntry(statusbarEntry, 'recordSession', 0);
        store.add(statusbarHandle);
        const instance = await c.service.createTerminal();
        c.service.setActiveInstance(instance);
        await c.service.revealActiveTerminal();
        await Promise.all([
            instance.processReady,
            instance.focusWhenReady(true)
        ]);
        return new Promise(resolve => {
            const events = [];
            const endRecording = () => {
                const session = JSON.stringify(events, null, 2);
                clipboardService.writeText(session);
                store.dispose();
                resolve();
            };
            const timer = store.add(new Delayer(5000));
            store.add(Event.runAndSubscribe(instance.onDimensionsChanged, () => {
                events.push({
                    type: 'resize',
                    cols: instance.cols,
                    rows: instance.rows
                });
                timer.trigger(endRecording);
            }));
            store.add(commandService.onWillExecuteCommand(e => {
                events.push({
                    type: 'command',
                    id: e.commandId,
                });
                timer.trigger(endRecording);
            }));
            store.add(instance.onWillData(data => {
                events.push({
                    type: 'output',
                    data,
                });
                timer.trigger(endRecording);
            }));
            store.add(instance.onDidSendText(data => {
                events.push({
                    type: 'sendText',
                    data,
                });
                timer.trigger(endRecording);
            }));
            store.add(instance.xterm.raw.onData(data => {
                events.push({
                    type: 'input',
                    data,
                });
                timer.trigger(endRecording);
            }));
            let commandDetectedRegistered = false;
            store.add(Event.runAndSubscribe(instance.capabilities.onDidAddCapability, e => {
                if (commandDetectedRegistered) {
                    return;
                }
                const commandDetection = instance.capabilities.get(2);
                if (!commandDetection) {
                    return;
                }
                store.add(commandDetection.promptInputModel.onDidChangeInput(e => {
                    events.push({
                        type: 'promptInputChange',
                        data: commandDetection.promptInputModel.getCombinedString(),
                    });
                    timer.trigger(endRecording);
                }));
                commandDetectedRegistered = true;
            }));
        });
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.restartPtyHost",
    title: localize2('workbench.action.terminal.restartPtyHost', 'Restart Pty Host'),
    category: Categories.Developer,
    run: async (c, accessor) => {
        const logService = accessor.get(ITerminalLogService);
        const backends = Array.from(c.instanceService.getRegisteredBackends());
        const unresponsiveBackends = backends.filter(e => !e.isResponsive);
        const restartCandidates = unresponsiveBackends.length > 0 ? unresponsiveBackends : backends;
        for (const backend of restartCandidates) {
            logService.warn(`Restarting pty host for authority "${backend.remoteAuthority}"`);
            backend.restartPtyHost();
        }
    }
});
let DevModeContribution = class DevModeContribution extends Disposable {
    static { DevModeContribution_1 = this; }
    static { this.ID = 'terminal.devMode'; }
    static get(instance) {
        return instance.getContribution(DevModeContribution_1.ID);
    }
    constructor(_instance, processManager, widgetManager, _configurationService, _statusbarService) {
        super();
        this._instance = _instance;
        this._configurationService = _configurationService;
        this._statusbarService = _statusbarService;
        this._activeDevModeDisposables = new MutableDisposable();
        this._currentColor = 0;
        this._statusbarEntryAccessor = this._register(new MutableDisposable());
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.developer.devMode")) {
                this._updateDevMode();
            }
        }));
    }
    xtermReady(xterm) {
        this._xterm = xterm;
        this._updateDevMode();
    }
    _updateDevMode() {
        const devMode = this._isEnabled();
        this._xterm?.raw.element?.classList.toggle('dev-mode', devMode);
        const commandDetection = this._instance.capabilities.get(2);
        if (devMode) {
            if (commandDetection) {
                const commandDecorations = new DisposableMap();
                const otherDisposables = new DisposableStore();
                this._activeDevModeDisposables.value = combinedDisposable(commandDecorations, otherDisposables, this._instance.onDidBlur(() => this._updateDevMode()), this._instance.onDidFocus(() => this._updateDevMode()), commandDetection.promptInputModel.onDidChangeInput(() => this._updateDevMode()), commandDetection.onCommandFinished(command => {
                    const colorClass = `color-${this._currentColor}`;
                    const decorations = [];
                    commandDecorations.set(command, combinedDisposable(...decorations));
                    if (command.promptStartMarker) {
                        const d = this._instance.xterm.raw?.registerDecoration({
                            marker: command.promptStartMarker
                        });
                        if (d) {
                            decorations.push(d);
                            otherDisposables.add(d.onRender(e => {
                                e.textContent = 'A';
                                e.classList.add('xterm-sequence-decoration', 'top', 'left', colorClass);
                            }));
                        }
                    }
                    if (command.marker) {
                        const d = this._instance.xterm.raw?.registerDecoration({
                            marker: command.marker,
                            x: command.startX
                        });
                        if (d) {
                            decorations.push(d);
                            otherDisposables.add(d.onRender(e => {
                                e.textContent = 'B';
                                e.classList.add('xterm-sequence-decoration', 'top', 'right', colorClass);
                            }));
                        }
                    }
                    if (command.executedMarker) {
                        const d = this._instance.xterm.raw?.registerDecoration({
                            marker: command.executedMarker,
                            x: command.executedX
                        });
                        if (d) {
                            decorations.push(d);
                            otherDisposables.add(d.onRender(e => {
                                e.textContent = 'C';
                                e.classList.add('xterm-sequence-decoration', 'bottom', 'left', colorClass);
                            }));
                        }
                    }
                    if (command.endMarker) {
                        const d = this._instance.xterm.raw?.registerDecoration({
                            marker: command.endMarker
                        });
                        if (d) {
                            decorations.push(d);
                            otherDisposables.add(d.onRender(e => {
                                e.textContent = 'D';
                                e.classList.add('xterm-sequence-decoration', 'bottom', 'right', colorClass);
                            }));
                        }
                    }
                    this._currentColor = (this._currentColor + 1) % 2;
                }), commandDetection.onCommandInvalidated(commands => {
                    for (const c of commands) {
                        const decorations = commandDecorations.get(c);
                        if (decorations) {
                            dispose(decorations);
                        }
                        commandDecorations.deleteAndDispose(c);
                    }
                }));
                this._updatePromptInputStatusBar(commandDetection);
            }
            else {
                this._activeDevModeDisposables.value = this._instance.capabilities.onDidAddCapabilityType(e => {
                    if (e === 2) {
                        this._updateDevMode();
                    }
                });
            }
        }
        else {
            this._activeDevModeDisposables.clear();
        }
    }
    _isEnabled() {
        return this._configurationService.getValue("terminal.integrated.developer.devMode") || false;
    }
    _updatePromptInputStatusBar(commandDetection) {
        const promptInputModel = commandDetection.promptInputModel;
        if (promptInputModel) {
            const name = localize('terminalDevMode', 'Terminal Dev Mode');
            const isExecuting = promptInputModel.cursorIndex === -1;
            this._statusbarEntry = {
                name,
                text: `$(${isExecuting ? 'loading~spin' : 'terminal'}) ${promptInputModel.getCombinedString()}`,
                ariaLabel: name,
                tooltip: 'The detected terminal prompt input',
                kind: 'prominent'
            };
            if (!this._statusbarEntryAccessor.value) {
                this._statusbarEntryAccessor.value = this._statusbarService.addEntry(this._statusbarEntry, `terminal.promptInput.${this._instance.instanceId}`, 0);
            }
            else {
                this._statusbarEntryAccessor.value.update(this._statusbarEntry);
            }
            this._statusbarService.updateEntryVisibility(`terminal.promptInput.${this._instance.instanceId}`, this._instance.hasFocus);
        }
    }
};
DevModeContribution = DevModeContribution_1 = __decorate([
    __param(3, IConfigurationService),
    __param(4, IStatusbarService),
    __metadata("design:paramtypes", [Object, Object, TerminalWidgetManager, Object, Object])
], DevModeContribution);
registerTerminalContribution(DevModeContribution.ID, DevModeContribution);
