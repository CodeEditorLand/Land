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
var WorkbenchKeybindingService_1;
import * as nls from '../../../../nls.js';
// base
import * as browser from '../../../../base/browser/browser.js';
import { BrowserFeatures } from '../../../../base/browser/canIUse.js';
import * as dom from '../../../../base/browser/dom.js';
import { printKeyboardEvent, printStandardKeyboardEvent, StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { DeferredPromise, RunOnceScheduler } from '../../../../base/common/async.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { parse } from '../../../../base/common/json.js';
import { UserSettingsLabelProvider } from '../../../../base/common/keybindingLabels.js';
import { KeybindingParser } from '../../../../base/common/keybindingParser.js';
import { KeyCodeChord, ScanCodeChord } from '../../../../base/common/keybindings.js';
import { IMMUTABLE_CODE_TO_KEY_CODE, KeyCodeUtils, ScanCodeUtils } from '../../../../base/common/keyCodes.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import * as objects from '../../../../base/common/objects.js';
import { isMacintosh, OS } from '../../../../base/common/platform.js';
import { dirname } from '../../../../base/common/resources.js';
import { mainWindow } from '../../../../base/browser/window.js';
// platform
import { MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Extensions } from '../../../../platform/jsonschemas/common/jsonContributionRegistry.js';
import { AbstractKeybindingService } from '../../../../platform/keybinding/common/abstractKeybindingService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { KeybindingResolver } from '../../../../platform/keybinding/common/keybindingResolver.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ResolvedKeybindingItem } from '../../../../platform/keybinding/common/resolvedKeybindingItem.js';
import { IKeyboardLayoutService } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { isLocalizedString } from '../../../../platform/action/common/action.js';
// workbench
import { commandsExtensionPoint } from '../../actions/common/menusExtensionPoint.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { ExtensionsRegistry } from '../../extensions/common/extensionsRegistry.js';
import { IHostService } from '../../host/browser/host.js';
import { getAllUnboundCommands } from './unboundCommands.js';
import { KeybindingIO, OutputBuilder } from '../common/keybindingIO.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
function isValidContributedKeyBinding(keyBinding, rejects) {
    if (!keyBinding) {
        rejects.push(nls.localize('nonempty', "expected non-empty value."));
        return false;
    }
    if (typeof keyBinding.command !== 'string') {
        rejects.push(nls.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
        return false;
    }
    if (keyBinding.key && typeof keyBinding.key !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'key'));
        return false;
    }
    if (keyBinding.when && typeof keyBinding.when !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
        return false;
    }
    if (keyBinding.mac && typeof keyBinding.mac !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'mac'));
        return false;
    }
    if (keyBinding.linux && typeof keyBinding.linux !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'linux'));
        return false;
    }
    if (keyBinding.win && typeof keyBinding.win !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'win'));
        return false;
    }
    return true;
}
const keybindingType = {
    type: 'object',
    default: { command: '', key: '' },
    properties: {
        command: {
            description: nls.localize('vscode.extension.contributes.keybindings.command', 'Identifier of the command to run when keybinding is triggered.'),
            type: 'string'
        },
        args: {
            description: nls.localize('vscode.extension.contributes.keybindings.args', "Arguments to pass to the command to execute.")
        },
        key: {
            description: nls.localize('vscode.extension.contributes.keybindings.key', 'Key or key sequence (separate keys with plus-sign and sequences with space, e.g. Ctrl+O and Ctrl+L L for a chord).'),
            type: 'string'
        },
        mac: {
            description: nls.localize('vscode.extension.contributes.keybindings.mac', 'Mac specific key or key sequence.'),
            type: 'string'
        },
        linux: {
            description: nls.localize('vscode.extension.contributes.keybindings.linux', 'Linux specific key or key sequence.'),
            type: 'string'
        },
        win: {
            description: nls.localize('vscode.extension.contributes.keybindings.win', 'Windows specific key or key sequence.'),
            type: 'string'
        },
        when: {
            description: nls.localize('vscode.extension.contributes.keybindings.when', 'Condition when the key is active.'),
            type: 'string'
        },
    }
};
const keybindingsExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'keybindings',
    deps: [commandsExtensionPoint],
    jsonSchema: {
        description: nls.localize('vscode.extension.contributes.keybindings', "Contributes keybindings."),
        oneOf: [
            keybindingType,
            {
                type: 'array',
                items: keybindingType
            }
        ]
    }
});
const NUMPAD_PRINTABLE_SCANCODES = [
    90 /* ScanCode.NumpadDivide */,
    91 /* ScanCode.NumpadMultiply */,
    92 /* ScanCode.NumpadSubtract */,
    93 /* ScanCode.NumpadAdd */,
    95 /* ScanCode.Numpad1 */,
    96 /* ScanCode.Numpad2 */,
    97 /* ScanCode.Numpad3 */,
    98 /* ScanCode.Numpad4 */,
    99 /* ScanCode.Numpad5 */,
    100 /* ScanCode.Numpad6 */,
    101 /* ScanCode.Numpad7 */,
    102 /* ScanCode.Numpad8 */,
    103 /* ScanCode.Numpad9 */,
    104 /* ScanCode.Numpad0 */,
    105 /* ScanCode.NumpadDecimal */
];
const otherMacNumpadMapping = new Map();
otherMacNumpadMapping.set(95 /* ScanCode.Numpad1 */, 22 /* KeyCode.Digit1 */);
otherMacNumpadMapping.set(96 /* ScanCode.Numpad2 */, 23 /* KeyCode.Digit2 */);
otherMacNumpadMapping.set(97 /* ScanCode.Numpad3 */, 24 /* KeyCode.Digit3 */);
otherMacNumpadMapping.set(98 /* ScanCode.Numpad4 */, 25 /* KeyCode.Digit4 */);
otherMacNumpadMapping.set(99 /* ScanCode.Numpad5 */, 26 /* KeyCode.Digit5 */);
otherMacNumpadMapping.set(100 /* ScanCode.Numpad6 */, 27 /* KeyCode.Digit6 */);
otherMacNumpadMapping.set(101 /* ScanCode.Numpad7 */, 28 /* KeyCode.Digit7 */);
otherMacNumpadMapping.set(102 /* ScanCode.Numpad8 */, 29 /* KeyCode.Digit8 */);
otherMacNumpadMapping.set(103 /* ScanCode.Numpad9 */, 30 /* KeyCode.Digit9 */);
otherMacNumpadMapping.set(104 /* ScanCode.Numpad0 */, 21 /* KeyCode.Digit0 */);
let WorkbenchKeybindingService = WorkbenchKeybindingService_1 = class WorkbenchKeybindingService extends AbstractKeybindingService {
    constructor(contextKeyService, commandService, telemetryService, notificationService, userDataProfileService, hostService, extensionService, fileService, uriIdentityService, logService, keyboardLayoutService) {
        super(contextKeyService, commandService, telemetryService, notificationService, logService);
        this.hostService = hostService;
        this.keyboardLayoutService = keyboardLayoutService;
        this._contributions = [];
        this.isComposingGlobalContextKey = contextKeyService.createKey('isComposing', false);
        this.kbsJsonSchema = new KeybindingsJsonSchema();
        this.updateKeybindingsJsonSchema();
        this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
        this._register(this.keyboardLayoutService.onDidChangeKeyboardLayout(() => {
            this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
            this.updateResolver();
        }));
        this._keybindingHoldMode = null;
        this._cachedResolver = null;
        this.userKeybindings = this._register(new UserKeybindings(userDataProfileService, uriIdentityService, fileService, logService));
        this.userKeybindings.initialize().then(() => {
            if (this.userKeybindings.keybindings.length) {
                this.updateResolver();
            }
        });
        this._register(this.userKeybindings.onDidChange(() => {
            logService.debug('User keybindings changed');
            this.updateResolver();
        }));
        keybindingsExtPoint.setHandler((extensions) => {
            const keybindings = [];
            for (const extension of extensions) {
                this._handleKeybindingsExtensionPointUser(extension.description.identifier, extension.description.isBuiltin, extension.value, extension.collector, keybindings);
            }
            KeybindingsRegistry.setExtensionKeybindings(keybindings);
            this.updateResolver();
        });
        this.updateKeybindingsJsonSchema();
        this._register(extensionService.onDidRegisterExtensions(() => this.updateKeybindingsJsonSchema()));
        this._register(Event.runAndSubscribe(dom.onDidRegisterWindow, ({ window, disposables }) => disposables.add(this._registerKeyListeners(window)), { window: mainWindow, disposables: this._store }));
        this._register(browser.onDidChangeFullscreen(windowId => {
            if (windowId !== mainWindow.vscodeWindowId) {
                return;
            }
            const keyboard = navigator.keyboard;
            if (BrowserFeatures.keyboard === 2 /* KeyboardSupport.None */) {
                return;
            }
            if (browser.isFullscreen(mainWindow)) {
                keyboard?.lock(['Escape']);
            }
            else {
                keyboard?.unlock();
            }
            // update resolver which will bring back all unbound keyboard shortcuts
            this._cachedResolver = null;
            this._onDidUpdateKeybindings.fire();
        }));
    }
    _registerKeyListeners(window) {
        const disposables = new DisposableStore();
        // for standard keybindings
        disposables.add(dom.addDisposableListener(window, dom.EventType.KEY_DOWN, (e) => {
            if (this._keybindingHoldMode) {
                return;
            }
            this.isComposingGlobalContextKey.set(e.isComposing);
            const keyEvent = new StandardKeyboardEvent(e);
            this._log(`/ Received  keydown event - ${printKeyboardEvent(e)}`);
            this._log(`| Converted keydown event - ${printStandardKeyboardEvent(keyEvent)}`);
            const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
            if (shouldPreventDefault) {
                keyEvent.preventDefault();
            }
            this.isComposingGlobalContextKey.set(false);
        }));
        // for single modifier chord keybindings (e.g. shift shift)
        disposables.add(dom.addDisposableListener(window, dom.EventType.KEY_UP, (e) => {
            this._resetKeybindingHoldMode();
            this.isComposingGlobalContextKey.set(e.isComposing);
            const keyEvent = new StandardKeyboardEvent(e);
            const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
            if (shouldPreventDefault) {
                keyEvent.preventDefault();
            }
            this.isComposingGlobalContextKey.set(false);
        }));
        return disposables;
    }
    registerSchemaContribution(contribution) {
        this._contributions.push(contribution);
        if (contribution.onDidChange) {
            this._register(contribution.onDidChange(() => this.updateKeybindingsJsonSchema()));
        }
        this.updateKeybindingsJsonSchema();
    }
    updateKeybindingsJsonSchema() {
        this.kbsJsonSchema.updateSchema(this._contributions.flatMap(x => x.getSchemaAdditions()));
    }
    _printKeybinding(keybinding) {
        return UserSettingsLabelProvider.toLabel(OS, keybinding.chords, (chord) => {
            if (chord instanceof KeyCodeChord) {
                return KeyCodeUtils.toString(chord.keyCode);
            }
            return ScanCodeUtils.toString(chord.scanCode);
        }) || '[null]';
    }
    _printResolvedKeybinding(resolvedKeybinding) {
        return resolvedKeybinding.getDispatchChords().map(x => x || '[null]').join(' ');
    }
    _printResolvedKeybindings(output, input, resolvedKeybindings) {
        const padLength = 35;
        const firstRow = `${input.padStart(padLength, ' ')} => `;
        if (resolvedKeybindings.length === 0) {
            // no binding found
            output.push(`${firstRow}${'[NO BINDING]'.padStart(padLength, ' ')}`);
            return;
        }
        const firstRowIndentation = firstRow.length;
        const isFirst = true;
        for (const resolvedKeybinding of resolvedKeybindings) {
            if (isFirst) {
                output.push(`${firstRow}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
            }
            else {
                output.push(`${' '.repeat(firstRowIndentation)}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
            }
        }
    }
    _dumpResolveKeybindingDebugInfo() {
        const seenBindings = new Set();
        const result = [];
        result.push(`Default Resolved Keybindings (unique only):`);
        for (const item of KeybindingsRegistry.getDefaultKeybindings()) {
            if (!item.keybinding) {
                continue;
            }
            const input = this._printKeybinding(item.keybinding);
            if (seenBindings.has(input)) {
                continue;
            }
            seenBindings.add(input);
            const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
            this._printResolvedKeybindings(result, input, resolvedKeybindings);
        }
        result.push(`User Resolved Keybindings (unique only):`);
        for (const item of this.userKeybindings.keybindings) {
            if (!item.keybinding) {
                continue;
            }
            const input = item._sourceKey ?? 'Impossible: missing source key, but has keybinding';
            if (seenBindings.has(input)) {
                continue;
            }
            seenBindings.add(input);
            const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
            this._printResolvedKeybindings(result, input, resolvedKeybindings);
        }
        return result.join('\n');
    }
    _dumpDebugInfo() {
        const layoutInfo = JSON.stringify(this.keyboardLayoutService.getCurrentKeyboardLayout(), null, '\t');
        const mapperInfo = this._keyboardMapper.dumpDebugInfo();
        const resolvedKeybindings = this._dumpResolveKeybindingDebugInfo();
        const rawMapping = JSON.stringify(this.keyboardLayoutService.getRawKeyboardMapping(), null, '\t');
        return `Layout info:\n${layoutInfo}\n\n${resolvedKeybindings}\n\n${mapperInfo}\n\nRaw mapping:\n${rawMapping}`;
    }
    _dumpDebugInfoJSON() {
        const info = {
            layout: this.keyboardLayoutService.getCurrentKeyboardLayout(),
            rawMapping: this.keyboardLayoutService.getRawKeyboardMapping()
        };
        return JSON.stringify(info, null, '\t');
    }
    enableKeybindingHoldMode(commandId) {
        if (this._currentlyDispatchingCommandId !== commandId) {
            return undefined;
        }
        this._keybindingHoldMode = new DeferredPromise();
        const focusTracker = dom.trackFocus(dom.getWindow(undefined));
        const listener = focusTracker.onDidBlur(() => this._resetKeybindingHoldMode());
        this._keybindingHoldMode.p.finally(() => {
            listener.dispose();
            focusTracker.dispose();
        });
        this._log(`+ Enabled hold-mode for ${commandId}.`);
        return this._keybindingHoldMode.p;
    }
    _resetKeybindingHoldMode() {
        if (this._keybindingHoldMode) {
            this._keybindingHoldMode?.complete();
            this._keybindingHoldMode = null;
        }
    }
    customKeybindingsCount() {
        return this.userKeybindings.keybindings.length;
    }
    updateResolver() {
        this._cachedResolver = null;
        this._onDidUpdateKeybindings.fire();
    }
    _getResolver() {
        if (!this._cachedResolver) {
            const defaults = this._resolveKeybindingItems(KeybindingsRegistry.getDefaultKeybindings(), true);
            const overrides = this._resolveUserKeybindingItems(this.userKeybindings.keybindings, false);
            this._cachedResolver = new KeybindingResolver(defaults, overrides, (str) => this._log(str));
        }
        return this._cachedResolver;
    }
    _documentHasFocus() {
        // it is possible that the document has lost focus, but the
        // window is still focused, e.g. when a <webview> element
        // has focus
        return this.hostService.hasFocus;
    }
    _resolveKeybindingItems(items, isDefault) {
        const result = [];
        let resultLen = 0;
        for (const item of items) {
            const when = item.when || undefined;
            const keybinding = item.keybinding;
            if (!keybinding) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
            }
            else {
                if (this._assertBrowserConflicts(keybinding)) {
                    continue;
                }
                const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(keybinding);
                for (let i = resolvedKeybindings.length - 1; i >= 0; i--) {
                    const resolvedKeybinding = resolvedKeybindings[i];
                    result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                }
            }
        }
        return result;
    }
    _resolveUserKeybindingItems(items, isDefault) {
        const result = [];
        let resultLen = 0;
        for (const item of items) {
            const when = item.when || undefined;
            if (!item.keybinding) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, null, false);
            }
            else {
                const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
                for (const resolvedKeybinding of resolvedKeybindings) {
                    result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
                }
            }
        }
        return result;
    }
    _assertBrowserConflicts(keybinding) {
        if (BrowserFeatures.keyboard === 0 /* KeyboardSupport.Always */) {
            return false;
        }
        if (BrowserFeatures.keyboard === 1 /* KeyboardSupport.FullScreen */ && browser.isFullscreen(mainWindow)) {
            return false;
        }
        for (const chord of keybinding.chords) {
            if (!chord.metaKey && !chord.altKey && !chord.ctrlKey && !chord.shiftKey) {
                continue;
            }
            const modifiersMask = 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */;
            let partModifiersMask = 0;
            if (chord.metaKey) {
                partModifiersMask |= 2048 /* KeyMod.CtrlCmd */;
            }
            if (chord.shiftKey) {
                partModifiersMask |= 1024 /* KeyMod.Shift */;
            }
            if (chord.altKey) {
                partModifiersMask |= 512 /* KeyMod.Alt */;
            }
            if (chord.ctrlKey && OS === 2 /* OperatingSystem.Macintosh */) {
                partModifiersMask |= 256 /* KeyMod.WinCtrl */;
            }
            if ((partModifiersMask & modifiersMask) === (2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */)) {
                if (chord instanceof ScanCodeChord && (chord.scanCode === 86 /* ScanCode.ArrowLeft */ || chord.scanCode === 85 /* ScanCode.ArrowRight */)) {
                    // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
                if (chord instanceof KeyCodeChord && (chord.keyCode === 15 /* KeyCode.LeftArrow */ || chord.keyCode === 17 /* KeyCode.RightArrow */)) {
                    // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
            }
            if ((partModifiersMask & modifiersMask) === 2048 /* KeyMod.CtrlCmd */) {
                if (chord instanceof ScanCodeChord && (chord.scanCode >= 36 /* ScanCode.Digit1 */ && chord.scanCode <= 45 /* ScanCode.Digit0 */)) {
                    // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
                if (chord instanceof KeyCodeChord && (chord.keyCode >= 21 /* KeyCode.Digit0 */ && chord.keyCode <= 30 /* KeyCode.Digit9 */)) {
                    // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
            }
        }
        return false;
    }
    resolveKeybinding(kb) {
        return this._keyboardMapper.resolveKeybinding(kb);
    }
    resolveKeyboardEvent(keyboardEvent) {
        this.keyboardLayoutService.validateCurrentKeyboardMapping(keyboardEvent);
        return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
    }
    resolveUserBinding(userBinding) {
        const keybinding = KeybindingParser.parseKeybinding(userBinding);
        return (keybinding ? this._keyboardMapper.resolveKeybinding(keybinding) : []);
    }
    _handleKeybindingsExtensionPointUser(extensionId, isBuiltin, keybindings, collector, result) {
        if (Array.isArray(keybindings)) {
            for (let i = 0, len = keybindings.length; i < len; i++) {
                this._handleKeybinding(extensionId, isBuiltin, i + 1, keybindings[i], collector, result);
            }
        }
        else {
            this._handleKeybinding(extensionId, isBuiltin, 1, keybindings, collector, result);
        }
    }
    _handleKeybinding(extensionId, isBuiltin, idx, keybindings, collector, result) {
        const rejects = [];
        if (isValidContributedKeyBinding(keybindings, rejects)) {
            const rule = this._asCommandRule(extensionId, isBuiltin, idx++, keybindings);
            if (rule) {
                result.push(rule);
            }
        }
        if (rejects.length > 0) {
            collector.error(nls.localize('invalid.keybindings', "Invalid `contributes.{0}`: {1}", keybindingsExtPoint.name, rejects.join('\n')));
        }
    }
    static bindToCurrentPlatform(key, mac, linux, win) {
        if (OS === 1 /* OperatingSystem.Windows */ && win) {
            if (win) {
                return win;
            }
        }
        else if (OS === 2 /* OperatingSystem.Macintosh */) {
            if (mac) {
                return mac;
            }
        }
        else {
            if (linux) {
                return linux;
            }
        }
        return key;
    }
    _asCommandRule(extensionId, isBuiltin, idx, binding) {
        const { command, args, when, key, mac, linux, win } = binding;
        const keybinding = WorkbenchKeybindingService_1.bindToCurrentPlatform(key, mac, linux, win);
        if (!keybinding) {
            return undefined;
        }
        let weight;
        if (isBuiltin) {
            weight = 300 /* KeybindingWeight.BuiltinExtension */ + idx;
        }
        else {
            weight = 400 /* KeybindingWeight.ExternalExtension */ + idx;
        }
        const commandAction = MenuRegistry.getCommand(command);
        const precondition = commandAction && commandAction.precondition;
        let fullWhen;
        if (when && precondition) {
            fullWhen = ContextKeyExpr.and(precondition, ContextKeyExpr.deserialize(when));
        }
        else if (when) {
            fullWhen = ContextKeyExpr.deserialize(when);
        }
        else if (precondition) {
            fullWhen = precondition;
        }
        const desc = {
            id: command,
            args,
            when: fullWhen,
            weight: weight,
            keybinding: KeybindingParser.parseKeybinding(keybinding),
            extensionId: extensionId.value,
            isBuiltinExtension: isBuiltin
        };
        return desc;
    }
    getDefaultKeybindingsContent() {
        const resolver = this._getResolver();
        const defaultKeybindings = resolver.getDefaultKeybindings();
        const boundCommands = resolver.getDefaultBoundCommands();
        return (WorkbenchKeybindingService_1._getDefaultKeybindings(defaultKeybindings)
            + '\n\n'
            + WorkbenchKeybindingService_1._getAllCommandsAsComment(boundCommands));
    }
    static _getDefaultKeybindings(defaultKeybindings) {
        const out = new OutputBuilder();
        out.writeLine('[');
        const lastIndex = defaultKeybindings.length - 1;
        defaultKeybindings.forEach((k, index) => {
            KeybindingIO.writeKeybindingItem(out, k);
            if (index !== lastIndex) {
                out.writeLine(',');
            }
            else {
                out.writeLine();
            }
        });
        out.writeLine(']');
        return out.toString();
    }
    static _getAllCommandsAsComment(boundCommands) {
        const unboundCommands = getAllUnboundCommands(boundCommands);
        const pretty = unboundCommands.sort().join('\n// - ');
        return '// ' + nls.localize('unboundCommands', "Here are other available commands: ") + '\n// - ' + pretty;
    }
    mightProducePrintableCharacter(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) {
            // ignore ctrl/cmd/alt-combination but not shift-combinatios
            return false;
        }
        const code = ScanCodeUtils.toEnum(event.code);
        if (NUMPAD_PRINTABLE_SCANCODES.indexOf(code) !== -1) {
            // This is a numpad key that might produce a printable character based on NumLock.
            // Let's check if NumLock is on or off based on the event's keyCode.
            // e.g.
            // - when NumLock is off, ScanCode.Numpad4 produces KeyCode.LeftArrow
            // - when NumLock is on, ScanCode.Numpad4 produces KeyCode.NUMPAD_4
            // However, ScanCode.NumpadAdd always produces KeyCode.NUMPAD_ADD
            if (event.keyCode === IMMUTABLE_CODE_TO_KEY_CODE[code]) {
                // NumLock is on or this is /, *, -, + on the numpad
                return true;
            }
            if (isMacintosh && event.keyCode === otherMacNumpadMapping.get(code)) {
                // on macOS, the numpad keys can also map to keys 1 - 0.
                return true;
            }
            return false;
        }
        const keycode = IMMUTABLE_CODE_TO_KEY_CODE[code];
        if (keycode !== -1) {
            // https://github.com/microsoft/vscode/issues/74934
            return false;
        }
        // consult the KeyboardMapperFactory to check the given event for
        // a printable value.
        const mapping = this.keyboardLayoutService.getRawKeyboardMapping();
        if (!mapping) {
            return false;
        }
        const keyInfo = mapping[event.code];
        if (!keyInfo) {
            return false;
        }
        if (!keyInfo.value || /\s/.test(keyInfo.value)) {
            return false;
        }
        return true;
    }
};
WorkbenchKeybindingService = WorkbenchKeybindingService_1 = __decorate([
    __param(0, IContextKeyService),
    __param(1, ICommandService),
    __param(2, ITelemetryService),
    __param(3, INotificationService),
    __param(4, IUserDataProfileService),
    __param(5, IHostService),
    __param(6, IExtensionService),
    __param(7, IFileService),
    __param(8, IUriIdentityService),
    __param(9, ILogService),
    __param(10, IKeyboardLayoutService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WorkbenchKeybindingService);
export { WorkbenchKeybindingService };
class UserKeybindings extends Disposable {
    get keybindings() { return this._keybindings; }
    constructor(userDataProfileService, uriIdentityService, fileService, logService) {
        super();
        this.userDataProfileService = userDataProfileService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this._rawKeybindings = [];
        this._keybindings = [];
        this.watchDisposables = this._register(new DisposableStore());
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.watch();
        this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reload().then(changed => {
            if (changed) {
                this._onDidChange.fire();
            }
        }), 50));
        this._register(Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.userDataProfileService.currentProfile.keybindingsResource))(() => {
            logService.debug('Keybindings file changed');
            this.reloadConfigurationScheduler.schedule();
        }));
        this._register(this.fileService.onDidRunOperation((e) => {
            if (e.operation === 4 /* FileOperation.WRITE */ && e.resource.toString() === this.userDataProfileService.currentProfile.keybindingsResource.toString()) {
                logService.debug('Keybindings file written');
                this.reloadConfigurationScheduler.schedule();
            }
        }));
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => {
            if (!this.uriIdentityService.extUri.isEqual(e.previous.keybindingsResource, e.profile.keybindingsResource)) {
                e.join(this.whenCurrentProfileChanged());
            }
        }));
    }
    async whenCurrentProfileChanged() {
        this.watch();
        this.reloadConfigurationScheduler.schedule();
    }
    watch() {
        this.watchDisposables.clear();
        this.watchDisposables.add(this.fileService.watch(dirname(this.userDataProfileService.currentProfile.keybindingsResource)));
        // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
        this.watchDisposables.add(this.fileService.watch(this.userDataProfileService.currentProfile.keybindingsResource));
    }
    async initialize() {
        await this.reload();
    }
    async reload() {
        const newKeybindings = await this.readUserKeybindings();
        if (objects.equals(this._rawKeybindings, newKeybindings)) {
            // no change
            return false;
        }
        this._rawKeybindings = newKeybindings;
        this._keybindings = this._rawKeybindings.map((k) => KeybindingIO.readUserKeybindingItem(k));
        return true;
    }
    async readUserKeybindings() {
        try {
            const content = await this.fileService.readFile(this.userDataProfileService.currentProfile.keybindingsResource);
            const value = parse(content.value.toString());
            return Array.isArray(value)
                ? value.filter(v => v && typeof v === 'object' /* just typeof === object doesn't catch `null` */)
                : [];
        }
        catch (e) {
            return [];
        }
    }
}
/**
 * Registers the `keybindings.json`'s schema with the JSON schema registry. Allows updating the schema, e.g., when new commands are registered (e.g., by extensions).
 *
 * Lifecycle owned by `WorkbenchKeybindingService`. Must be instantiated only once.
 */
class KeybindingsJsonSchema {
    static { this.schemaId = 'vscode://schemas/keybindings'; }
    constructor() {
        this.commandsSchemas = [];
        this.commandsEnum = [];
        this.removalCommandsEnum = [];
        this.commandsEnumDescriptions = [];
        this.schema = {
            id: KeybindingsJsonSchema.schemaId,
            type: 'array',
            title: nls.localize('keybindings.json.title', "Keybindings configuration"),
            allowTrailingCommas: true,
            allowComments: true,
            definitions: {
                'editorGroupsSchema': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'groups': {
                                '$ref': '#/definitions/editorGroupsSchema',
                                'default': [{}, {}]
                            },
                            'size': {
                                'type': 'number',
                                'default': 0.5
                            }
                        }
                    }
                },
                'commandNames': {
                    'type': 'string',
                    'enum': this.commandsEnum,
                    'enumDescriptions': this.commandsEnumDescriptions,
                    'description': nls.localize('keybindings.json.command', "Name of the command to execute"),
                },
                'commandType': {
                    'anyOf': [
                        {
                            $ref: '#/definitions/commandNames'
                        },
                        {
                            'type': 'string',
                            'enum': this.removalCommandsEnum,
                            'enumDescriptions': this.commandsEnumDescriptions,
                            'description': nls.localize('keybindings.json.removalCommand', "Name of the command to remove keyboard shortcut for"),
                        },
                        {
                            'type': 'string'
                        },
                    ]
                },
                'commandsSchemas': {
                    'allOf': this.commandsSchemas
                }
            },
            items: {
                'required': ['key'],
                'type': 'object',
                'defaultSnippets': [{ 'body': { 'key': '$1', 'command': '$2', 'when': '$3' } }],
                'properties': {
                    'key': {
                        'type': 'string',
                        'description': nls.localize('keybindings.json.key', "Key or key sequence (separated by space)"),
                    },
                    'command': {
                        'anyOf': [
                            {
                                'if': {
                                    'type': 'array'
                                },
                                'then': {
                                    'not': {
                                        'type': 'array'
                                    },
                                    'errorMessage': nls.localize('keybindings.commandsIsArray', "Incorrect type. Expected \"{0}\". The field 'command' does not support running multiple commands. Use command 'runCommands' to pass it multiple commands to run.", 'string')
                                },
                                'else': {
                                    '$ref': '#/definitions/commandType'
                                }
                            },
                            {
                                '$ref': '#/definitions/commandType'
                            }
                        ]
                    },
                    'when': {
                        'type': 'string',
                        'description': nls.localize('keybindings.json.when', "Condition when the key is active.")
                    },
                    'args': {
                        'description': nls.localize('keybindings.json.args', "Arguments to pass to the command to execute.")
                    }
                },
                '$ref': '#/definitions/commandsSchemas'
            }
        };
        this.schemaRegistry = Registry.as(Extensions.JSONContribution);
        this.schemaRegistry.registerSchema(KeybindingsJsonSchema.schemaId, this.schema);
    }
    // TODO@ulugbekna: can updates happen incrementally rather than rebuilding; concerns:
    // - is just appending additional schemas enough for the registry to pick them up?
    // - can `CommandsRegistry.getCommands` and `MenuRegistry.getCommands` return different values at different times? ie would just pushing new schemas from `additionalContributions` not be enough?
    updateSchema(additionalContributions) {
        this.commandsSchemas.length = 0;
        this.commandsEnum.length = 0;
        this.removalCommandsEnum.length = 0;
        this.commandsEnumDescriptions.length = 0;
        const knownCommands = new Set();
        const addKnownCommand = (commandId, description) => {
            if (!/^_/.test(commandId)) {
                if (!knownCommands.has(commandId)) {
                    knownCommands.add(commandId);
                    this.commandsEnum.push(commandId);
                    this.commandsEnumDescriptions.push(isLocalizedString(description) ? description.value : description);
                    // Also add the negative form for keybinding removal
                    this.removalCommandsEnum.push(`-${commandId}`);
                }
            }
        };
        const allCommands = CommandsRegistry.getCommands();
        for (const [commandId, command] of allCommands) {
            const commandMetadata = command.metadata;
            addKnownCommand(commandId, commandMetadata?.description);
            if (!commandMetadata || !commandMetadata.args || commandMetadata.args.length !== 1 || !commandMetadata.args[0].schema) {
                continue;
            }
            const argsSchema = commandMetadata.args[0].schema;
            const argsRequired = ((typeof commandMetadata.args[0].isOptional !== 'undefined')
                ? (!commandMetadata.args[0].isOptional)
                : (Array.isArray(argsSchema.required) && argsSchema.required.length > 0));
            const addition = {
                'if': {
                    'required': ['command'],
                    'properties': {
                        'command': { 'const': commandId }
                    }
                },
                'then': {
                    'required': [].concat(argsRequired ? ['args'] : []),
                    'properties': {
                        'args': argsSchema
                    }
                }
            };
            this.commandsSchemas.push(addition);
        }
        const menuCommands = MenuRegistry.getCommands();
        for (const commandId of menuCommands.keys()) {
            addKnownCommand(commandId);
        }
        this.commandsSchemas.push(...additionalContributions);
        this.schemaRegistry.notifySchemaChanged(KeybindingsJsonSchema.schemaId);
    }
}
registerSingleton(IKeybindingService, WorkbenchKeybindingService, 0 /* InstantiationType.Eager */);
