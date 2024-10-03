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
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from '../../../terminal/browser/terminal.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { localize } from '../../../../../nls.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { OS } from '../../../../../base/common/platform.js';
import { KeybindingLabel } from '../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js';
import { renderFormattedText } from '../../../../../base/browser/formattedTextRenderer.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { status } from '../../../../../base/browser/ui/aria/aria.js';
import * as dom from '../../../../../base/browser/dom.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { TerminalInstance } from '../../../terminal/browser/terminalInstance.js';
import './media/terminalInitialHint.css';
import { ChatAgentLocation, IChatAgentService } from '../../../chat/common/chatAgents.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { StandardMouseEvent } from '../../../../../base/browser/mouseEvent.js';
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
        const capability = this._capabilities.get(2);
        if (capability) {
            store.add(Event.once(capability.promptInputModel.onDidStartInput)(() => this._onDidRequestCreateHint.fire()));
        }
        else {
            this._register(this._capabilities.onDidAddCapability(e => {
                if (e.id === 2) {
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
    constructor(_instance, processManager, widgetManager, _instantiationService, _configurationService, _terminalGroupService, _terminalEditorService, _chatAgentService, _storageService) {
        super();
        this._instance = _instance;
        this._instantiationService = _instantiationService;
        this._configurationService = _configurationService;
        this._terminalGroupService = _terminalGroupService;
        this._terminalEditorService = _terminalEditorService;
        this._chatAgentService = _chatAgentService;
        this._storageService = _storageService;
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.initialHint")) {
                this._storageService.remove("terminal.initialHint.hide", -1);
            }
        }));
    }
    xtermOpen(xterm) {
        if ('shellLaunchConfig' in this._instance && (this._instance.shellLaunchConfig.isExtensionOwnedTerminal || this._instance.shellLaunchConfig.isFeatureTerminal)) {
            return;
        }
        if (this._storageService.getBoolean("terminal.initialHint.hide", -1, false)) {
            return;
        }
        if (this._terminalGroupService.instances.length + this._terminalEditorService.instances.length !== 1) {
            return;
        }
        this._xterm = xterm;
        this._addon = this._register(this._instantiationService.createInstance(InitialHintAddon, this._instance.capabilities, this._chatAgentService.onDidChangeAgents));
        this._xterm.raw.loadAddon(this._addon);
        this._register(this._addon.onDidRequestCreateHint(() => this._createHint()));
    }
    _createHint() {
        const instance = this._instance instanceof TerminalInstance ? this._instance : undefined;
        const commandDetectionCapability = instance?.capabilities.get(2);
        if (!instance || !this._xterm || this._hintWidget || !commandDetectionCapability || commandDetectionCapability.promptInputModel.value || !!instance.shellLaunchConfig.attachPersistentProcess) {
            return;
        }
        if (!this._configurationService.getValue("terminal.integrated.initialHint")) {
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
            if (e.affectsConfiguration("terminal.integrated.initialHint") && !this._configurationService.getValue("terminal.integrated.initialHint")) {
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
    __param(3, IInstantiationService),
    __param(4, IConfigurationService),
    __param(5, ITerminalGroupService),
    __param(6, ITerminalEditorService),
    __param(7, IChatAgentService),
    __param(8, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalInitialHintContribution);
export { TerminalInitialHintContribution };
registerTerminalContribution(TerminalInitialHintContribution.ID, TerminalInitialHintContribution, false);
let TerminalInitialHintWidget = class TerminalInitialHintWidget extends Disposable {
    constructor(_instance, _chatAgentService, commandService, configurationService, keybindingService, telemetryService, productService, terminalService, _storageService, contextMenuService) {
        super();
        this._instance = _instance;
        this._chatAgentService = _chatAgentService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.telemetryService = telemetryService;
        this.productService = productService;
        this.terminalService = terminalService;
        this._storageService = _storageService;
        this.contextMenuService = contextMenuService;
        this.toDispose = this._register(new DisposableStore());
        this.isVisible = false;
        this.ariaLabel = '';
        this.toDispose.add(_instance.onDidFocus(() => {
            if (this._instance.hasFocus && this.isVisible && this.ariaLabel && this.configurationService.getValue("accessibility.verbosity.terminalChat")) {
                status(this.ariaLabel);
            }
        }));
        this.toDispose.add(terminalService.onDidChangeInstances(() => {
            if (this.terminalService.instances.length !== 1) {
                this.dispose();
            }
        }));
        this.toDispose.add(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.initialHint") && !this.configurationService.getValue("terminal.integrated.initialHint")) {
                this.dispose();
            }
        }));
    }
    _getHintInlineChat(agents) {
        let providerName = (agents.length === 1 ? agents[0].fullName : undefined) ?? this.productService.nameShort;
        const defaultAgent = this._chatAgentService.getDefaultAgent(ChatAgentLocation.Panel);
        if (defaultAgent?.extensionId.value === agents[0].extensionId.value) {
            providerName = defaultAgent.fullName ?? providerName;
        }
        let ariaLabel = `Ask ${providerName} something or start typing to dismiss.`;
        const handleClick = () => {
            this._storageService.store("terminal.initialHint.hide", true, -1, 0);
            this.telemetryService.publicLog2('workbenchActionExecuted', {
                id: 'terminalInlineChat.hintAction',
                from: 'hint'
            });
            this.commandService.executeCommand("workbench.action.terminal.chat.start", { from: 'hint' });
        };
        this.toDispose.add(this.commandService.onDidExecuteCommand(e => {
            if (e.commandId === "workbench.action.terminal.chat.start") {
                this._storageService.store("terminal.initialHint.hide", true, -1, 0);
                this.dispose();
            }
        }));
        const hintHandler = {
            disposables: this.toDispose,
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
        const keybindingHint = this.keybindingService.lookupKeybinding("workbench.action.terminal.chat.start");
        const keybindingHintLabel = keybindingHint?.getLabel();
        if (keybindingHint && keybindingHintLabel) {
            const actionPart = localize('emptyHintText', 'Press {0} to ask {1} to do something. ', keybindingHintLabel, providerName);
            const [before, after] = actionPart.split(keybindingHintLabel).map((fragment) => {
                const hintPart = $('a', undefined, fragment);
                this.toDispose.add(dom.addDisposableListener(hintPart, dom.EventType.CLICK, handleClick));
                return hintPart;
            });
            hintElement.appendChild(before);
            const label = hintHandler.disposables.add(new KeybindingLabel(hintElement, OS));
            label.set(keybindingHint);
            label.element.style.width = 'min-content';
            label.element.style.display = 'inline';
            label.element.style.cursor = 'pointer';
            this.toDispose.add(dom.addDisposableListener(label.element, dom.EventType.CLICK, handleClick));
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
        if (!this.domNode) {
            this.domNode = $('.terminal-initial-hint');
            this.domNode.style.paddingLeft = '4px';
            const { hintElement, ariaLabel } = this._getHintInlineChat(agents);
            this.domNode.append(hintElement);
            this.ariaLabel = ariaLabel.concat(localize('disableHint', ' Toggle {0} in settings to disable this hint.', "accessibility.verbosity.terminalChat"));
            this.toDispose.add(dom.addDisposableListener(this.domNode, 'click', () => {
                this.domNode?.remove();
                this.domNode = undefined;
            }));
            this.toDispose.add(dom.addDisposableListener(this.domNode, dom.EventType.CONTEXT_MENU, (e) => {
                this.contextMenuService.showContextMenu({
                    getAnchor: () => { return new StandardMouseEvent(dom.getActiveWindow(), e); },
                    getActions: () => {
                        return [{
                                id: 'workench.action.disableTerminalInitialHint',
                                label: localize('disableInitialHint', "Disable Initial Hint"),
                                tooltip: localize('disableInitialHint', "Disable Initial Hint"),
                                enabled: true,
                                class: undefined,
                                run: () => this.configurationService.updateValue("terminal.integrated.initialHint", false)
                            }
                        ];
                    }
                });
            }));
        }
        return this.domNode;
    }
    dispose() {
        this.domNode?.remove();
        super.dispose();
    }
};
TerminalInitialHintWidget = __decorate([
    __param(1, IChatAgentService),
    __param(2, ICommandService),
    __param(3, IConfigurationService),
    __param(4, IKeybindingService),
    __param(5, ITelemetryService),
    __param(6, IProductService),
    __param(7, ITerminalService),
    __param(8, IStorageService),
    __param(9, IContextMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalInitialHintWidget);
