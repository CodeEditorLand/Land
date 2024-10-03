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
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import * as dom from '../../../../../base/browser/dom.js';
import { asArray } from '../../../../../base/common/arrays.js';
import { localize } from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { updateLayout } from '../../../terminal/browser/xterm/decorationStyles.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IActionWidgetService } from '../../../../../platform/actionWidget/browser/actionWidget.js';
import { getLinesForCommand } from '../../../../../platform/terminal/common/capabilities/commandDetectionCapability.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { Schemas } from '../../../../../base/common/network.js';
import { ITerminalQuickFixService, TerminalQuickFixType } from './quickFix.js';
import { CodeActionKind } from '../../../../../editor/contrib/codeAction/common/types.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
const quickFixClasses = [
    "quick-fix",
    "codicon",
    "terminal-command-decoration",
    "xterm-decoration"
];
let TerminalQuickFixAddon = class TerminalQuickFixAddon extends Disposable {
    constructor(_aliases, _capabilities, _quickFixService, _commandService, _configurationService, _accessibilitySignalService, _openerService, _telemetryService, _extensionService, _actionWidgetService, _labelService) {
        super();
        this._aliases = _aliases;
        this._capabilities = _capabilities;
        this._quickFixService = _quickFixService;
        this._commandService = _commandService;
        this._configurationService = _configurationService;
        this._accessibilitySignalService = _accessibilitySignalService;
        this._openerService = _openerService;
        this._telemetryService = _telemetryService;
        this._extensionService = _extensionService;
        this._actionWidgetService = _actionWidgetService;
        this._labelService = _labelService;
        this._onDidRequestRerunCommand = new Emitter();
        this.onDidRequestRerunCommand = this._onDidRequestRerunCommand.event;
        this._commandListeners = new Map();
        this._registeredSelectors = new Set();
        const commandDetectionCapability = this._capabilities.get(2);
        if (commandDetectionCapability) {
            this._registerCommandHandlers();
        }
        else {
            this._register(this._capabilities.onDidAddCapabilityType(c => {
                if (c === 2) {
                    this._registerCommandHandlers();
                }
            }));
        }
        this._register(this._quickFixService.onDidRegisterProvider(result => this.registerCommandFinishedListener(convertToQuickFixOptions(result))));
        this._quickFixService.extensionQuickFixes.then(quickFixSelectors => {
            for (const selector of quickFixSelectors) {
                this.registerCommandSelector(selector);
            }
        });
        this._register(this._quickFixService.onDidRegisterCommandSelector(selector => this.registerCommandSelector(selector)));
        this._register(this._quickFixService.onDidUnregisterProvider(id => this._commandListeners.delete(id)));
    }
    activate(terminal) {
        this._terminal = terminal;
    }
    showMenu() {
        if (!this._currentRenderContext) {
            return;
        }
        const actions = this._currentRenderContext.quickFixes.map(f => new TerminalQuickFixItem(f, f.type, f.source, f.label, f.kind));
        const actionSet = {
            allActions: actions,
            hasAutoFix: false,
            hasAIFix: false,
            allAIFixes: false,
            validActions: actions,
            dispose: () => { }
        };
        const delegate = {
            onSelect: async (fix) => {
                fix.action?.run();
                this._actionWidgetService.hide();
                this._disposeQuickFix(fix.action.id, true);
            },
            onHide: () => {
                this._terminal?.focus();
            },
        };
        this._actionWidgetService.show('quickFixWidget', false, toActionWidgetItems(actionSet.validActions, true), delegate, this._currentRenderContext.anchor, this._currentRenderContext.parentElement);
    }
    registerCommandSelector(selector) {
        if (this._registeredSelectors.has(selector.id)) {
            return;
        }
        const matcherKey = selector.commandLineMatcher.toString();
        const currentOptions = this._commandListeners.get(matcherKey) || [];
        currentOptions.push({
            id: selector.id,
            type: 'unresolved',
            commandLineMatcher: selector.commandLineMatcher,
            outputMatcher: selector.outputMatcher,
            commandExitResult: selector.commandExitResult,
            kind: selector.kind
        });
        this._registeredSelectors.add(selector.id);
        this._commandListeners.set(matcherKey, currentOptions);
    }
    registerCommandFinishedListener(options) {
        const matcherKey = options.commandLineMatcher.toString();
        let currentOptions = this._commandListeners.get(matcherKey) || [];
        currentOptions = currentOptions.filter(o => o.id !== options.id);
        currentOptions.push(options);
        this._commandListeners.set(matcherKey, currentOptions);
    }
    _registerCommandHandlers() {
        const terminal = this._terminal;
        const commandDetection = this._capabilities.get(2);
        if (!terminal || !commandDetection) {
            return;
        }
        this._register(commandDetection.onCommandFinished(async (command) => await this._resolveQuickFixes(command, this._aliases)));
    }
    async _resolveQuickFixes(command, aliases) {
        const terminal = this._terminal;
        if (!terminal || command.wasReplayed) {
            return;
        }
        if (command.command !== '' && this._lastQuickFixId) {
            this._disposeQuickFix(this._lastQuickFixId, false);
        }
        const resolver = async (selector, lines) => {
            if (lines === undefined) {
                return undefined;
            }
            const id = selector.id;
            await this._extensionService.activateByEvent(`onTerminalQuickFixRequest:${id}`);
            return this._quickFixService.providers.get(id)?.provideTerminalQuickFixes(command, lines, {
                type: 'resolved',
                commandLineMatcher: selector.commandLineMatcher,
                outputMatcher: selector.outputMatcher,
                commandExitResult: selector.commandExitResult,
                kind: selector.kind,
                id: selector.id
            }, new CancellationTokenSource().token);
        };
        const result = await getQuickFixesForCommand(aliases, terminal, command, this._commandListeners, this._commandService, this._openerService, this._labelService, this._onDidRequestRerunCommand, resolver);
        if (!result) {
            return;
        }
        this._quickFixes = result;
        this._lastQuickFixId = this._quickFixes[0].id;
        this._registerQuickFixDecoration();
    }
    _disposeQuickFix(id, ranQuickFix) {
        this._telemetryService?.publicLog2('terminal/quick-fix', {
            quickFixId: id,
            ranQuickFix
        });
        this._decoration?.dispose();
        this._decoration = undefined;
        this._quickFixes = undefined;
        this._lastQuickFixId = undefined;
    }
    _registerQuickFixDecoration() {
        if (!this._terminal) {
            return;
        }
        if (!this._quickFixes) {
            return;
        }
        const marker = this._terminal.registerMarker();
        if (!marker) {
            return;
        }
        const decoration = this._terminal.registerDecoration({ marker, width: 2, layer: 'top' });
        if (!decoration) {
            return;
        }
        this._decoration = decoration;
        const fixes = this._quickFixes;
        if (!fixes) {
            decoration.dispose();
            return;
        }
        decoration?.onRender((e) => {
            const rect = e.getBoundingClientRect();
            const anchor = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
            if (e.classList.contains("quick-fix")) {
                if (this._currentRenderContext) {
                    this._currentRenderContext.anchor = anchor;
                }
                return;
            }
            e.classList.add(...quickFixClasses);
            const isExplainOnly = fixes.every(e => e.kind === 'explain');
            if (isExplainOnly) {
                e.classList.add('explainOnly');
            }
            e.classList.add(...ThemeIcon.asClassNameArray(isExplainOnly ? Codicon.sparkle : Codicon.lightBulb));
            updateLayout(this._configurationService, e);
            this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalQuickFix);
            const parentElement = e.closest('.xterm')?.parentElement;
            if (!parentElement) {
                return;
            }
            this._currentRenderContext = { quickFixes: fixes, anchor, parentElement };
            this._register(dom.addDisposableListener(e, dom.EventType.CLICK, () => this.showMenu()));
        });
        decoration.onDispose(() => this._currentRenderContext = undefined);
        this._quickFixes = undefined;
    }
};
TerminalQuickFixAddon = __decorate([
    __param(2, ITerminalQuickFixService),
    __param(3, ICommandService),
    __param(4, IConfigurationService),
    __param(5, IAccessibilitySignalService),
    __param(6, IOpenerService),
    __param(7, ITelemetryService),
    __param(8, IExtensionService),
    __param(9, IActionWidgetService),
    __param(10, ILabelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalQuickFixAddon);
export { TerminalQuickFixAddon };
export async function getQuickFixesForCommand(aliases, terminal, terminalCommand, quickFixOptions, commandService, openerService, labelService, onDidRequestRerunCommand, getResolvedFixes) {
    const commandQuickFixSet = new Set();
    const openQuickFixSet = new Set();
    const fixes = [];
    const newCommand = terminalCommand.command;
    for (const options of quickFixOptions.values()) {
        for (const option of options) {
            if ((option.commandExitResult === 'success' && terminalCommand.exitCode !== 0) || (option.commandExitResult === 'error' && terminalCommand.exitCode === 0)) {
                continue;
            }
            let quickFixes;
            if (option.type === 'resolved') {
                quickFixes = await option.getQuickFixes(terminalCommand, getLinesForCommand(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher), option, new CancellationTokenSource().token);
            }
            else if (option.type === 'unresolved') {
                if (!getResolvedFixes) {
                    throw new Error('No resolved fix provider');
                }
                quickFixes = await getResolvedFixes(option, option.outputMatcher ? getLinesForCommand(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher) : undefined);
            }
            else if (option.type === 'internal') {
                const commandLineMatch = newCommand.match(option.commandLineMatcher);
                if (!commandLineMatch) {
                    continue;
                }
                const outputMatcher = option.outputMatcher;
                let outputMatch;
                if (outputMatcher) {
                    outputMatch = terminalCommand.getOutputMatch(outputMatcher);
                }
                if (!outputMatch) {
                    continue;
                }
                const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
                quickFixes = option.getQuickFixes(matchResult);
            }
            if (quickFixes) {
                for (const quickFix of asArray(quickFixes)) {
                    let action;
                    if ('type' in quickFix) {
                        switch (quickFix.type) {
                            case TerminalQuickFixType.TerminalCommand: {
                                const fix = quickFix;
                                if (commandQuickFixSet.has(fix.terminalCommand)) {
                                    continue;
                                }
                                commandQuickFixSet.add(fix.terminalCommand);
                                const label = localize('quickFix.command', 'Run: {0}', fix.terminalCommand);
                                action = {
                                    type: TerminalQuickFixType.TerminalCommand,
                                    kind: option.kind,
                                    class: undefined,
                                    source: quickFix.source,
                                    id: quickFix.id,
                                    label,
                                    enabled: true,
                                    run: () => {
                                        onDidRequestRerunCommand?.fire({
                                            command: fix.terminalCommand,
                                            shouldExecute: fix.shouldExecute ?? true
                                        });
                                    },
                                    tooltip: label,
                                    command: fix.terminalCommand,
                                    shouldExecute: fix.shouldExecute
                                };
                                break;
                            }
                            case TerminalQuickFixType.Opener: {
                                const fix = quickFix;
                                if (!fix.uri) {
                                    return;
                                }
                                if (openQuickFixSet.has(fix.uri.toString())) {
                                    continue;
                                }
                                openQuickFixSet.add(fix.uri.toString());
                                const isUrl = (fix.uri.scheme === Schemas.http || fix.uri.scheme === Schemas.https);
                                const uriLabel = isUrl ? encodeURI(fix.uri.toString(true)) : labelService.getUriLabel(fix.uri);
                                const label = localize('quickFix.opener', 'Open: {0}', uriLabel);
                                action = {
                                    source: quickFix.source,
                                    id: quickFix.id,
                                    label,
                                    type: TerminalQuickFixType.Opener,
                                    kind: option.kind,
                                    class: undefined,
                                    enabled: true,
                                    run: () => openerService.open(fix.uri),
                                    tooltip: label,
                                    uri: fix.uri
                                };
                                break;
                            }
                            case TerminalQuickFixType.Port: {
                                const fix = quickFix;
                                action = {
                                    source: 'builtin',
                                    type: fix.type,
                                    kind: option.kind,
                                    id: fix.id,
                                    label: fix.label,
                                    class: fix.class,
                                    enabled: fix.enabled,
                                    run: () => {
                                        fix.run();
                                    },
                                    tooltip: fix.tooltip
                                };
                                break;
                            }
                            case TerminalQuickFixType.VscodeCommand: {
                                const fix = quickFix;
                                action = {
                                    source: quickFix.source,
                                    type: fix.type,
                                    kind: option.kind,
                                    id: fix.id,
                                    label: fix.title,
                                    class: undefined,
                                    enabled: true,
                                    run: () => commandService.executeCommand(fix.id),
                                    tooltip: fix.title
                                };
                                break;
                            }
                        }
                        if (action) {
                            fixes.push(action);
                        }
                    }
                }
            }
        }
    }
    return fixes.length > 0 ? fixes : undefined;
}
function convertToQuickFixOptions(selectorProvider) {
    return {
        id: selectorProvider.selector.id,
        type: 'resolved',
        commandLineMatcher: selectorProvider.selector.commandLineMatcher,
        outputMatcher: selectorProvider.selector.outputMatcher,
        commandExitResult: selectorProvider.selector.commandExitResult,
        kind: selectorProvider.selector.kind,
        getQuickFixes: selectorProvider.provider.provideTerminalQuickFixes
    };
}
class TerminalQuickFixItem {
    constructor(action, type, source, title, kind = 'fix') {
        this.action = action;
        this.type = type;
        this.source = source;
        this.title = title;
        this.kind = kind;
        this.disabled = false;
    }
}
function toActionWidgetItems(inputQuickFixes, showHeaders) {
    const menuItems = [];
    menuItems.push({
        kind: "header",
        group: {
            kind: CodeActionKind.QuickFix,
            title: localize('codeAction.widget.id.quickfix', 'Quick Fix')
        }
    });
    for (const quickFix of showHeaders ? inputQuickFixes : inputQuickFixes.filter(i => !!i.action)) {
        if (!quickFix.disabled && quickFix.action) {
            menuItems.push({
                kind: "action",
                item: quickFix,
                group: {
                    kind: CodeActionKind.QuickFix,
                    icon: getQuickFixIcon(quickFix),
                    title: quickFix.action.label
                },
                disabled: false,
                label: quickFix.title
            });
        }
    }
    return menuItems;
}
function getQuickFixIcon(quickFix) {
    if (quickFix.kind === 'explain') {
        return Codicon.sparkle;
    }
    switch (quickFix.type) {
        case TerminalQuickFixType.Opener:
            if ('uri' in quickFix.action && quickFix.action.uri) {
                const isUrl = (quickFix.action.uri.scheme === Schemas.http || quickFix.action.uri.scheme === Schemas.https);
                return isUrl ? Codicon.linkExternal : Codicon.goToFile;
            }
        case TerminalQuickFixType.TerminalCommand:
            return Codicon.run;
        case TerminalQuickFixType.Port:
            return Codicon.debugDisconnect;
        case TerminalQuickFixType.VscodeCommand:
            return Codicon.lightbulb;
    }
}
