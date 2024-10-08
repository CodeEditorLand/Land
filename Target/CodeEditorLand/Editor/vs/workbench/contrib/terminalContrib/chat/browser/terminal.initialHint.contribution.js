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
var TerminalInitialHintContribution_1;
import * as dom from '../../../../../base/browser/dom.js';
import { renderFormattedText } from '../../../../../base/browser/formattedTextRenderer.js';
import { StandardMouseEvent } from '../../../../../base/browser/mouseEvent.js';
import { status } from '../../../../../base/browser/ui/aria/aria.js';
import { KeybindingLabel } from '../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { OS } from '../../../../../base/common/platform.js';
import { localize } from '../../../../../nls.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { ChatAgentLocation, IChatAgentService } from '../../../chat/common/chatAgents.js';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from '../../../terminal/browser/terminal.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalInstance } from '../../../terminal/browser/terminalInstance.js';
import './media/terminalInitialHint.css';
const $ = dom.$;
export class InitialHintAddon extends Disposable {
    get onDidRequestCreateHint() { return this._onDidRequestCreateHint.event; }
    constructor(_capabilities, _onDidChangeAgents) {
        super();
        this._capabilities = _capabilities;
        this._onDidChangeAgents = _onDidChangeAgents;
        this._onDidRequestCreateHint = this._register(new Emitter());
        this._disposables = this._register(new MutableDisposable());
    }
    activate(terminal) {
        const store = this._register(new DisposableStore());
        this._disposables.value = store;
        const capability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
        if (capability) {
            store.add(Event.once(capability.promptInputModel.onDidStartInput)(() => this._onDidRequestCreateHint.fire()));
        }
        else {
            this._register(this._capabilities.onDidAddCapability(e => {
                if (e.id === 2 /* TerminalCapability.CommandDetection */) {
                    const capability = e.capability;
                    store.add(Event.once(capability.promptInputModel.onDidStartInput)(() => this._onDidRequestCreateHint.fire()));
                    if (!capability.promptInputModel.value) {
                        this._onDidRequestCreateHint.fire();
                    }
                }
            }));
        }
        const agentListener = this._onDidChangeAgents((e) => {
            if (e?.locations.includes(ChatAgentLocation.Terminal)) {
                this._onDidRequestCreateHint.fire();
                agentListener.dispose();
            }
        });
        this._disposables.value?.add(agentListener);
    }
}
let TerminalInitialHintContribution = class TerminalInitialHintContribution extends Disposable {
    static { TerminalInitialHintContribution_1 = this; }
    static { this.ID = 'terminal.initialHint'; }
    static get(instance) {
        return instance.getContribution(TerminalInitialHintContribution_1.ID);
    }
    constructor(_ctx, _chatAgentService, _configurationService, _instantiationService, _storageService, _terminalEditorService, _terminalGroupService) {
        super();
        this._ctx = _ctx;
        this._chatAgentService = _chatAgentService;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        this._terminalEditorService = _terminalEditorService;
        this._terminalGroupService = _terminalGroupService;
        // Reset hint state when config changes
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */)) {
                this._storageService.remove("terminal.initialHint.hide" /* Constants.InitialHintHideStorageKey */, -1 /* StorageScope.APPLICATION */);
            }
        }));
    }
    xtermOpen(xterm) {
        // Don't show is the terminal was launched by an extension or a feature like debug
        if ('shellLaunchConfig' in this._ctx.instance && (this._ctx.instance.shellLaunchConfig.isExtensionOwnedTerminal || this._ctx.instance.shellLaunchConfig.isFeatureTerminal)) {
            return;
        }
        // Don't show if disabled
        if (this._storageService.getBoolean("terminal.initialHint.hide" /* Constants.InitialHintHideStorageKey */, -1 /* StorageScope.APPLICATION */, false)) {
            return;
        }
        // Only show for the first terminal
        if (this._terminalGroupService.instances.length + this._terminalEditorService.instances.length !== 1) {
            return;
        }
        this._xterm = xterm;
        this._addon = this._register(this._instantiationService.createInstance(InitialHintAddon, this._ctx.instance.capabilities, this._chatAgentService.onDidChangeAgents));
        this._xterm.raw.loadAddon(this._addon);
        this._register(this._addon.onDidRequestCreateHint(() => this._createHint()));
    }
    _createHint() {
        const instance = this._ctx.instance instanceof TerminalInstance ? this._ctx.instance : undefined;
        const commandDetectionCapability = instance?.capabilities.get(2 /* TerminalCapability.CommandDetection */);
        if (!instance || !this._xterm || this._hintWidget || !commandDetectionCapability || commandDetectionCapability.promptInputModel.value || !!instance.shellLaunchConfig.attachPersistentProcess) {
            return;
        }
        if (!this._configurationService.getValue("terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */)) {
            return;
        }
        if (!this._decoration) {
            const marker = this._xterm.raw.registerMarker();
            if (!marker) {
                return;
            }
            if (this._xterm.raw.buffer.active.cursorX === 0) {
                return;
            }
            this._register(marker);
            this._decoration = this._xterm.raw.registerDecoration({
                marker,
                x: this._xterm.raw.buffer.active.cursorX + 1,
            });
            if (this._decoration) {
                this._register(this._decoration);
            }
        }
        this._register(this._xterm.raw.onKey(() => this.dispose()));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */) && !this._configurationService.getValue("terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */)) {
                this.dispose();
            }
        }));
        const inputModel = commandDetectionCapability.promptInputModel;
        if (inputModel) {
            this._register(inputModel.onDidChangeInput(() => {
                if (inputModel.value) {
                    this.dispose();
                }
            }));
        }
        if (!this._decoration) {
            return;
        }
        this._register(this._decoration);
        this._register(this._decoration.onRender((e) => {
            if (!this._hintWidget && this._xterm?.isFocused && this._terminalGroupService.instances.length + this._terminalEditorService.instances.length === 1) {
                const terminalAgents = this._chatAgentService.getActivatedAgents().filter(candidate => candidate.locations.includes(ChatAgentLocation.Terminal));
                if (terminalAgents?.length) {
                    const widget = this._register(this._instantiationService.createInstance(TerminalInitialHintWidget, instance));
                    this._addon?.dispose();
                    this._hintWidget = widget.getDomNode(terminalAgents);
                    if (!this._hintWidget) {
                        return;
                    }
                    e.appendChild(this._hintWidget);
                    e.classList.add('terminal-initial-hint');
                    const font = this._xterm.getFont();
                    if (font) {
                        e.style.fontFamily = font.fontFamily;
                        e.style.fontSize = font.fontSize + 'px';
                    }
                }
            }
            if (this._hintWidget && this._xterm) {
                const decoration = this._hintWidget.parentElement;
                if (decoration) {
                    decoration.style.width = (this._xterm.raw.cols - this._xterm.raw.buffer.active.cursorX) / this._xterm.raw.cols * 100 + '%';
                }
            }
        }));
    }
};
TerminalInitialHintContribution = TerminalInitialHintContribution_1 = __decorate([
    __param(1, IChatAgentService),
    __param(2, IConfigurationService),
    __param(3, IInstantiationService),
    __param(4, IStorageService),
    __param(5, ITerminalEditorService),
    __param(6, ITerminalGroupService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], TerminalInitialHintContribution);
export { TerminalInitialHintContribution };
registerTerminalContribution(TerminalInitialHintContribution.ID, TerminalInitialHintContribution, false);
let TerminalInitialHintWidget = class TerminalInitialHintWidget extends Disposable {
    constructor(_instance, _chatAgentService, _commandService, _configurationService, _contextMenuService, _keybindingService, _productService, _storageService, _telemetryService, _terminalService) {
        super();
        this._instance = _instance;
        this._chatAgentService = _chatAgentService;
        this._commandService = _commandService;
        this._configurationService = _configurationService;
        this._contextMenuService = _contextMenuService;
        this._keybindingService = _keybindingService;
        this._productService = _productService;
        this._storageService = _storageService;
        this._telemetryService = _telemetryService;
        this._terminalService = _terminalService;
        this._toDispose = this._register(new DisposableStore());
        this._isVisible = false;
        this._ariaLabel = '';
        this._toDispose.add(_instance.onDidFocus(() => {
            if (this._instance.hasFocus && this._isVisible && this._ariaLabel && this._configurationService.getValue("accessibility.verbosity.terminalChat" /* AccessibilityVerbositySettingId.TerminalChat */)) {
                status(this._ariaLabel);
            }
        }));
        this._toDispose.add(_terminalService.onDidChangeInstances(() => {
            if (this._terminalService.instances.length !== 1) {
                this.dispose();
            }
        }));
        this._toDispose.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */) && !this._configurationService.getValue("terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */)) {
                this.dispose();
            }
        }));
    }
    _getHintInlineChat(agents) {
        let providerName = (agents.length === 1 ? agents[0].fullName : undefined) ?? this._productService.nameShort;
        const defaultAgent = this._chatAgentService.getDefaultAgent(ChatAgentLocation.Panel);
        if (defaultAgent?.extensionId.value === agents[0].extensionId.value) {
            providerName = defaultAgent.fullName ?? providerName;
        }
        let ariaLabel = `Ask ${providerName} something or start typing to dismiss.`;
        const handleClick = () => {
            this._storageService.store("terminal.initialHint.hide" /* Constants.InitialHintHideStorageKey */, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
            this._telemetryService.publicLog2('workbenchActionExecuted', {
                id: 'terminalInlineChat.hintAction',
                from: 'hint'
            });
            this._commandService.executeCommand("workbench.action.terminal.chat.start" /* TerminalChatCommandId.Start */, { from: 'hint' });
        };
        this._toDispose.add(this._commandService.onDidExecuteCommand(e => {
            if (e.commandId === "workbench.action.terminal.chat.start" /* TerminalChatCommandId.Start */) {
                this._storageService.store("terminal.initialHint.hide" /* Constants.InitialHintHideStorageKey */, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                this.dispose();
            }
        }));
        const hintHandler = {
            disposables: this._toDispose,
            callback: (index, _event) => {
                switch (index) {
                    case '0':
                        handleClick();
                        break;
                }
            }
        };
        const hintElement = $('div.terminal-initial-hint');
        hintElement.style.display = 'block';
        const keybindingHint = this._keybindingService.lookupKeybinding("workbench.action.terminal.chat.start" /* TerminalChatCommandId.Start */);
        const keybindingHintLabel = keybindingHint?.getLabel();
        if (keybindingHint && keybindingHintLabel) {
            const actionPart = localize('emptyHintText', 'Press {0} to ask {1} to do something. ', keybindingHintLabel, providerName);
            const [before, after] = actionPart.split(keybindingHintLabel).map((fragment) => {
                const hintPart = $('a', undefined, fragment);
                this._toDispose.add(dom.addDisposableListener(hintPart, dom.EventType.CLICK, handleClick));
                return hintPart;
            });
            hintElement.appendChild(before);
            const label = hintHandler.disposables.add(new KeybindingLabel(hintElement, OS));
            label.set(keybindingHint);
            label.element.style.width = 'min-content';
            label.element.style.display = 'inline';
            label.element.style.cursor = 'pointer';
            this._toDispose.add(dom.addDisposableListener(label.element, dom.EventType.CLICK, handleClick));
            hintElement.appendChild(after);
            const typeToDismiss = localize('hintTextDismiss', 'Start typing to dismiss.');
            const textHint2 = $('span.detail', undefined, typeToDismiss);
            hintElement.appendChild(textHint2);
            ariaLabel = actionPart.concat(typeToDismiss);
        }
        else {
            const hintMsg = localize({
                key: 'inlineChatHint',
                comment: [
                    'Preserve double-square brackets and their order',
                ]
            }, '[[Ask {0} to do something]] or start typing to dismiss.', providerName);
            const rendered = renderFormattedText(hintMsg, { actionHandler: hintHandler });
            hintElement.appendChild(rendered);
        }
        return { ariaLabel, hintHandler, hintElement };
    }
    getDomNode(agents) {
        if (!this._domNode) {
            this._domNode = $('.terminal-initial-hint');
            this._domNode.style.paddingLeft = '4px';
            const { hintElement, ariaLabel } = this._getHintInlineChat(agents);
            this._domNode.append(hintElement);
            this._ariaLabel = ariaLabel.concat(localize('disableHint', ' Toggle {0} in settings to disable this hint.', "accessibility.verbosity.terminalChat" /* AccessibilityVerbositySettingId.TerminalChat */));
            this._toDispose.add(dom.addDisposableListener(this._domNode, 'click', () => {
                this._domNode?.remove();
                this._domNode = undefined;
            }));
            this._toDispose.add(dom.addDisposableListener(this._domNode, dom.EventType.CONTEXT_MENU, (e) => {
                this._contextMenuService.showContextMenu({
                    getAnchor: () => { return new StandardMouseEvent(dom.getActiveWindow(), e); },
                    getActions: () => {
                        return [{
                                id: 'workench.action.disableTerminalInitialHint',
                                label: localize('disableInitialHint', "Disable Initial Hint"),
                                tooltip: localize('disableInitialHint', "Disable Initial Hint"),
                                enabled: true,
                                class: undefined,
                                run: () => this._configurationService.updateValue("terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */, false)
                            }
                        ];
                    }
                });
            }));
        }
        return this._domNode;
    }
    dispose() {
        this._domNode?.remove();
        super.dispose();
    }
};
TerminalInitialHintWidget = __decorate([
    __param(1, IChatAgentService),
    __param(2, ICommandService),
    __param(3, IConfigurationService),
    __param(4, IContextMenuService),
    __param(5, IKeybindingService),
    __param(6, IProductService),
    __param(7, IStorageService),
    __param(8, ITelemetryService),
    __param(9, ITerminalService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalInitialHintWidget);
