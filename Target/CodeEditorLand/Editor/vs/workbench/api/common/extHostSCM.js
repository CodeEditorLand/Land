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
var ExtHostSCM_1;
/* eslint-disable local/code-no-native-private */
import { URI } from '../../../base/common/uri.js';
import { Event, Emitter } from '../../../base/common/event.js';
import { debounce } from '../../../base/common/decorators.js';
import { DisposableStore, MutableDisposable } from '../../../base/common/lifecycle.js';
import { asPromise } from '../../../base/common/async.js';
import { ExtHostCommands } from './extHostCommands.js';
import { MainContext } from './extHost.protocol.js';
import { sortedDiff, equals } from '../../../base/common/arrays.js';
import { comparePaths } from '../../../base/common/comparers.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtensionIdentifierMap } from '../../../platform/extensions/common/extensions.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { MarkdownString } from './extHostTypeConverters.js';
import { checkProposedApiEnabled, isProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { ExtHostDocuments } from './extHostDocuments.js';
import { Schemas } from '../../../base/common/network.js';
import { isLinux } from '../../../base/common/platform.js';
import { structuralEquals } from '../../../base/common/equals.js';
function isUri(thing) {
    return thing instanceof URI;
}
function uriEquals(a, b) {
    if (a.scheme === Schemas.file && b.scheme === Schemas.file && isLinux) {
        return a.toString() === b.toString();
    }
    return a.toString().toLowerCase() === b.toString().toLowerCase();
}
function getIconResource(decorations) {
    if (!decorations) {
        return undefined;
    }
    else if (typeof decorations.iconPath === 'string') {
        return URI.file(decorations.iconPath);
    }
    else if (URI.isUri(decorations.iconPath)) {
        return decorations.iconPath;
    }
    else if (ThemeIcon.isThemeIcon(decorations.iconPath)) {
        return decorations.iconPath;
    }
    else {
        return undefined;
    }
}
function getHistoryItemIconDto(icon) {
    if (!icon) {
        return undefined;
    }
    else if (URI.isUri(icon)) {
        return icon;
    }
    else if (ThemeIcon.isThemeIcon(icon)) {
        return icon;
    }
    else {
        const iconDto = icon;
        return { light: iconDto.light, dark: iconDto.dark };
    }
}
function toSCMHistoryItemDto(historyItem) {
    const references = historyItem.references?.map(r => ({
        ...r, icon: getHistoryItemIconDto(r.icon)
    }));
    return { ...historyItem, references };
}
function toSCMHistoryItemRefDto(historyItemRef) {
    return historyItemRef ? { ...historyItemRef, icon: getHistoryItemIconDto(historyItemRef.icon) } : undefined;
}
function compareResourceThemableDecorations(a, b) {
    if (!a.iconPath && !b.iconPath) {
        return 0;
    }
    else if (!a.iconPath) {
        return -1;
    }
    else if (!b.iconPath) {
        return 1;
    }
    const aPath = typeof a.iconPath === 'string' ? a.iconPath : URI.isUri(a.iconPath) ? a.iconPath.fsPath : a.iconPath.id;
    const bPath = typeof b.iconPath === 'string' ? b.iconPath : URI.isUri(b.iconPath) ? b.iconPath.fsPath : b.iconPath.id;
    return comparePaths(aPath, bPath);
}
function compareResourceStatesDecorations(a, b) {
    let result = 0;
    if (a.strikeThrough !== b.strikeThrough) {
        return a.strikeThrough ? 1 : -1;
    }
    if (a.faded !== b.faded) {
        return a.faded ? 1 : -1;
    }
    if (a.tooltip !== b.tooltip) {
        return (a.tooltip || '').localeCompare(b.tooltip || '');
    }
    result = compareResourceThemableDecorations(a, b);
    if (result !== 0) {
        return result;
    }
    if (a.light && b.light) {
        result = compareResourceThemableDecorations(a.light, b.light);
    }
    else if (a.light) {
        return 1;
    }
    else if (b.light) {
        return -1;
    }
    if (result !== 0) {
        return result;
    }
    if (a.dark && b.dark) {
        result = compareResourceThemableDecorations(a.dark, b.dark);
    }
    else if (a.dark) {
        return 1;
    }
    else if (b.dark) {
        return -1;
    }
    return result;
}
function compareCommands(a, b) {
    if (a.command !== b.command) {
        return a.command < b.command ? -1 : 1;
    }
    if (a.title !== b.title) {
        return a.title < b.title ? -1 : 1;
    }
    if (a.tooltip !== b.tooltip) {
        if (a.tooltip !== undefined && b.tooltip !== undefined) {
            return a.tooltip < b.tooltip ? -1 : 1;
        }
        else if (a.tooltip !== undefined) {
            return 1;
        }
        else if (b.tooltip !== undefined) {
            return -1;
        }
    }
    if (a.arguments === b.arguments) {
        return 0;
    }
    else if (!a.arguments) {
        return -1;
    }
    else if (!b.arguments) {
        return 1;
    }
    else if (a.arguments.length !== b.arguments.length) {
        return a.arguments.length - b.arguments.length;
    }
    for (let i = 0; i < a.arguments.length; i++) {
        const aArg = a.arguments[i];
        const bArg = b.arguments[i];
        if (aArg === bArg) {
            continue;
        }
        if (isUri(aArg) && isUri(bArg) && uriEquals(aArg, bArg)) {
            continue;
        }
        return aArg < bArg ? -1 : 1;
    }
    return 0;
}
function compareResourceStates(a, b) {
    let result = comparePaths(a.resourceUri.fsPath, b.resourceUri.fsPath, true);
    if (result !== 0) {
        return result;
    }
    if (a.command && b.command) {
        result = compareCommands(a.command, b.command);
    }
    else if (a.command) {
        return 1;
    }
    else if (b.command) {
        return -1;
    }
    if (result !== 0) {
        return result;
    }
    if (a.decorations && b.decorations) {
        result = compareResourceStatesDecorations(a.decorations, b.decorations);
    }
    else if (a.decorations) {
        return 1;
    }
    else if (b.decorations) {
        return -1;
    }
    if (result !== 0) {
        return result;
    }
    if (a.multiFileDiffEditorModifiedUri && b.multiFileDiffEditorModifiedUri) {
        result = comparePaths(a.multiFileDiffEditorModifiedUri.fsPath, b.multiFileDiffEditorModifiedUri.fsPath, true);
    }
    else if (a.multiFileDiffEditorModifiedUri) {
        return 1;
    }
    else if (b.multiFileDiffEditorModifiedUri) {
        return -1;
    }
    if (result !== 0) {
        return result;
    }
    if (a.multiDiffEditorOriginalUri && b.multiDiffEditorOriginalUri) {
        result = comparePaths(a.multiDiffEditorOriginalUri.fsPath, b.multiDiffEditorOriginalUri.fsPath, true);
    }
    else if (a.multiDiffEditorOriginalUri) {
        return 1;
    }
    else if (b.multiDiffEditorOriginalUri) {
        return -1;
    }
    return result;
}
function compareArgs(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
function commandEquals(a, b) {
    return a.command === b.command
        && a.title === b.title
        && a.tooltip === b.tooltip
        && (a.arguments && b.arguments ? compareArgs(a.arguments, b.arguments) : a.arguments === b.arguments);
}
function commandListEquals(a, b) {
    return equals(a, b, commandEquals);
}
export class ExtHostSCMInputBox {
    #proxy;
    #extHostDocuments;
    get value() {
        return this._value;
    }
    set value(value) {
        value = value ?? '';
        this.#proxy.$setInputBoxValue(this._sourceControlHandle, value);
        this.updateValue(value);
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(placeholder) {
        this.#proxy.$setInputBoxPlaceholder(this._sourceControlHandle, placeholder);
        this._placeholder = placeholder;
    }
    get validateInput() {
        checkProposedApiEnabled(this._extension, 'scmValidation');
        return this._validateInput;
    }
    set validateInput(fn) {
        checkProposedApiEnabled(this._extension, 'scmValidation');
        if (fn && typeof fn !== 'function') {
            throw new Error(`[${this._extension.identifier.value}]: Invalid SCM input box validation function`);
        }
        this._validateInput = fn;
        this.#proxy.$setValidationProviderIsEnabled(this._sourceControlHandle, !!fn);
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(enabled) {
        enabled = !!enabled;
        if (this._enabled === enabled) {
            return;
        }
        this._enabled = enabled;
        this.#proxy.$setInputBoxEnablement(this._sourceControlHandle, enabled);
    }
    get visible() {
        return this._visible;
    }
    set visible(visible) {
        visible = !!visible;
        if (this._visible === visible) {
            return;
        }
        this._visible = visible;
        this.#proxy.$setInputBoxVisibility(this._sourceControlHandle, visible);
    }
    get document() {
        checkProposedApiEnabled(this._extension, 'scmTextDocument');
        return this.#extHostDocuments.getDocument(this._documentUri);
    }
    constructor(_extension, _extHostDocuments, proxy, _sourceControlHandle, _documentUri) {
        this._extension = _extension;
        this._sourceControlHandle = _sourceControlHandle;
        this._documentUri = _documentUri;
        this._value = '';
        this._onDidChange = new Emitter();
        this._placeholder = '';
        this._enabled = true;
        this._visible = true;
        this.#extHostDocuments = _extHostDocuments;
        this.#proxy = proxy;
    }
    showValidationMessage(message, type) {
        checkProposedApiEnabled(this._extension, 'scmValidation');
        this.#proxy.$showValidationMessage(this._sourceControlHandle, message, type);
    }
    $onInputBoxValueChange(value) {
        this.updateValue(value);
    }
    updateValue(value) {
        this._value = value;
        this._onDidChange.fire(value);
    }
}
class ExtHostSourceControlResourceGroup {
    static { this._handlePool = 0; }
    get disposed() { return this._disposed; }
    get id() { return this._id; }
    get label() { return this._label; }
    set label(label) {
        this._label = label;
        this._proxy.$updateGroupLabel(this._sourceControlHandle, this.handle, label);
    }
    get hideWhenEmpty() { return this._hideWhenEmpty; }
    set hideWhenEmpty(hideWhenEmpty) {
        this._hideWhenEmpty = hideWhenEmpty;
        this._proxy.$updateGroup(this._sourceControlHandle, this.handle, this.features);
    }
    get features() {
        return {
            hideWhenEmpty: this.hideWhenEmpty
        };
    }
    get resourceStates() { return [...this._resourceStates]; }
    set resourceStates(resources) {
        this._resourceStates = [...resources];
        this._onDidUpdateResourceStates.fire();
    }
    constructor(_proxy, _commands, _sourceControlHandle, _id, _label, multiDiffEditorEnableViewChanges, _extension) {
        this._proxy = _proxy;
        this._commands = _commands;
        this._sourceControlHandle = _sourceControlHandle;
        this._id = _id;
        this._label = _label;
        this.multiDiffEditorEnableViewChanges = multiDiffEditorEnableViewChanges;
        this._extension = _extension;
        this._resourceHandlePool = 0;
        this._resourceStates = [];
        this._resourceStatesMap = new Map();
        this._resourceStatesCommandsMap = new Map();
        this._resourceStatesDisposablesMap = new Map();
        this._onDidUpdateResourceStates = new Emitter();
        this.onDidUpdateResourceStates = this._onDidUpdateResourceStates.event;
        this._disposed = false;
        this._onDidDispose = new Emitter();
        this.onDidDispose = this._onDidDispose.event;
        this._handlesSnapshot = [];
        this._resourceSnapshot = [];
        this._hideWhenEmpty = undefined;
        this.handle = ExtHostSourceControlResourceGroup._handlePool++;
    }
    getResourceState(handle) {
        return this._resourceStatesMap.get(handle);
    }
    $executeResourceCommand(handle, preserveFocus) {
        const command = this._resourceStatesCommandsMap.get(handle);
        if (!command) {
            return Promise.resolve(undefined);
        }
        return asPromise(() => this._commands.executeCommand(command.command, ...(command.arguments || []), preserveFocus));
    }
    _takeResourceStateSnapshot() {
        const snapshot = [...this._resourceStates].sort(compareResourceStates);
        const diffs = sortedDiff(this._resourceSnapshot, snapshot, compareResourceStates);
        const splices = diffs.map(diff => {
            const toInsert = diff.toInsert.map(r => {
                const handle = this._resourceHandlePool++;
                this._resourceStatesMap.set(handle, r);
                const sourceUri = r.resourceUri;
                let command;
                if (r.command) {
                    if (r.command.command === 'vscode.open' || r.command.command === 'vscode.diff' || r.command.command === 'vscode.changes') {
                        const disposables = new DisposableStore();
                        command = this._commands.converter.toInternal(r.command, disposables);
                        this._resourceStatesDisposablesMap.set(handle, disposables);
                    }
                    else {
                        this._resourceStatesCommandsMap.set(handle, r.command);
                    }
                }
                const hasScmMultiDiffEditorProposalEnabled = isProposedApiEnabled(this._extension, 'scmMultiDiffEditor');
                const multiFileDiffEditorOriginalUri = hasScmMultiDiffEditorProposalEnabled ? r.multiDiffEditorOriginalUri : undefined;
                const multiFileDiffEditorModifiedUri = hasScmMultiDiffEditorProposalEnabled ? r.multiFileDiffEditorModifiedUri : undefined;
                const icon = getIconResource(r.decorations);
                const lightIcon = r.decorations && getIconResource(r.decorations.light) || icon;
                const darkIcon = r.decorations && getIconResource(r.decorations.dark) || icon;
                const icons = [lightIcon, darkIcon];
                const tooltip = (r.decorations && r.decorations.tooltip) || '';
                const strikeThrough = r.decorations && !!r.decorations.strikeThrough;
                const faded = r.decorations && !!r.decorations.faded;
                const contextValue = r.contextValue || '';
                const rawResource = [handle, sourceUri, icons, tooltip, strikeThrough, faded, contextValue, command, multiFileDiffEditorOriginalUri, multiFileDiffEditorModifiedUri];
                return { rawResource, handle };
            });
            return { start: diff.start, deleteCount: diff.deleteCount, toInsert };
        });
        const rawResourceSplices = splices
            .map(({ start, deleteCount, toInsert }) => [start, deleteCount, toInsert.map(i => i.rawResource)]);
        const reverseSplices = splices.reverse();
        for (const { start, deleteCount, toInsert } of reverseSplices) {
            const handles = toInsert.map(i => i.handle);
            const handlesToDelete = this._handlesSnapshot.splice(start, deleteCount, ...handles);
            for (const handle of handlesToDelete) {
                this._resourceStatesMap.delete(handle);
                this._resourceStatesCommandsMap.delete(handle);
                this._resourceStatesDisposablesMap.get(handle)?.dispose();
                this._resourceStatesDisposablesMap.delete(handle);
            }
        }
        this._resourceSnapshot = snapshot;
        return rawResourceSplices;
    }
    dispose() {
        this._disposed = true;
        this._onDidDispose.fire();
    }
}
class ExtHostSourceControl {
    static { this._handlePool = 0; }
    #proxy;
    get id() {
        return this._id;
    }
    get label() {
        return this._label;
    }
    get rootUri() {
        return this._rootUri;
    }
    get inputBox() { return this._inputBox; }
    get count() {
        return this._count;
    }
    set count(count) {
        if (this._count === count) {
            return;
        }
        this._count = count;
        this.#proxy.$updateSourceControl(this.handle, { count });
    }
    get quickDiffProvider() {
        return this._quickDiffProvider;
    }
    set quickDiffProvider(quickDiffProvider) {
        this._quickDiffProvider = quickDiffProvider;
        let quickDiffLabel = undefined;
        if (isProposedApiEnabled(this._extension, 'quickDiffProvider')) {
            quickDiffLabel = quickDiffProvider?.label;
        }
        this.#proxy.$updateSourceControl(this.handle, { hasQuickDiffProvider: !!quickDiffProvider, quickDiffLabel });
    }
    get historyProvider() {
        checkProposedApiEnabled(this._extension, 'scmHistoryProvider');
        return this._historyProvider;
    }
    set historyProvider(historyProvider) {
        checkProposedApiEnabled(this._extension, 'scmHistoryProvider');
        this._historyProvider = historyProvider;
        this._historyProviderDisposable.value = new DisposableStore();
        this.#proxy.$updateSourceControl(this.handle, { hasHistoryProvider: !!historyProvider });
        if (historyProvider) {
            this._historyProviderDisposable.value.add(historyProvider.onDidChangeCurrentHistoryItemRefs(() => {
                const historyItemRef = toSCMHistoryItemRefDto(historyProvider?.currentHistoryItemRef);
                const historyItemRemoteRef = toSCMHistoryItemRefDto(historyProvider?.currentHistoryItemRemoteRef);
                const historyItemBaseRef = toSCMHistoryItemRefDto(historyProvider?.currentHistoryItemBaseRef);
                this.#proxy.$onDidChangeHistoryProviderCurrentHistoryItemRefs(this.handle, historyItemRef, historyItemRemoteRef, historyItemBaseRef);
            }));
            this._historyProviderDisposable.value.add(historyProvider.onDidChangeHistoryItemRefs((e) => {
                if (e.added.length === 0 && e.modified.length === 0 && e.removed.length === 0) {
                    return;
                }
                const added = e.added.map(ref => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) }));
                const modified = e.modified.map(ref => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) }));
                const removed = e.removed.map(ref => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) }));
                this.#proxy.$onDidChangeHistoryProviderHistoryItemRefs(this.handle, { added, modified, removed, silent: e.silent });
            }));
        }
    }
    get commitTemplate() {
        return this._commitTemplate;
    }
    set commitTemplate(commitTemplate) {
        if (commitTemplate === this._commitTemplate) {
            return;
        }
        this._commitTemplate = commitTemplate;
        this.#proxy.$updateSourceControl(this.handle, { commitTemplate });
    }
    get acceptInputCommand() {
        return this._acceptInputCommand;
    }
    set acceptInputCommand(acceptInputCommand) {
        this._acceptInputDisposables.value = new DisposableStore();
        this._acceptInputCommand = acceptInputCommand;
        const internal = this._commands.converter.toInternal(acceptInputCommand, this._acceptInputDisposables.value);
        this.#proxy.$updateSourceControl(this.handle, { acceptInputCommand: internal });
    }
    get actionButton() {
        checkProposedApiEnabled(this._extension, 'scmActionButton');
        return this._actionButton;
    }
    set actionButton(actionButton) {
        checkProposedApiEnabled(this._extension, 'scmActionButton');
        // We have to do this check before converting the command to it's internal
        // representation since that would always create a command with a unique
        // identifier
        if (structuralEquals(this._actionButton, actionButton)) {
            return;
        }
        this._actionButton = actionButton;
        this._actionButtonDisposables.value = new DisposableStore();
        const actionButtonDto = actionButton !== undefined ?
            {
                command: {
                    ...this._commands.converter.toInternal(actionButton.command, this._actionButtonDisposables.value),
                    shortTitle: actionButton.command.shortTitle
                },
                secondaryCommands: actionButton.secondaryCommands?.map(commandGroup => {
                    return commandGroup.map(command => this._commands.converter.toInternal(command, this._actionButtonDisposables.value));
                }),
                enabled: actionButton.enabled
            } : undefined;
        this.#proxy.$updateSourceControl(this.handle, { actionButton: actionButtonDto });
    }
    get statusBarCommands() {
        return this._statusBarCommands;
    }
    set statusBarCommands(statusBarCommands) {
        if (this._statusBarCommands && statusBarCommands && commandListEquals(this._statusBarCommands, statusBarCommands)) {
            return;
        }
        this._statusBarDisposables.value = new DisposableStore();
        this._statusBarCommands = statusBarCommands;
        const internal = (statusBarCommands || []).map(c => this._commands.converter.toInternal(c, this._statusBarDisposables.value));
        this.#proxy.$updateSourceControl(this.handle, { statusBarCommands: internal });
    }
    get selected() {
        return this._selected;
    }
    constructor(_extension, _extHostDocuments, proxy, _commands, _id, _label, _rootUri) {
        this._extension = _extension;
        this._commands = _commands;
        this._id = _id;
        this._label = _label;
        this._rootUri = _rootUri;
        this._groups = new Map();
        this._count = undefined;
        this._quickDiffProvider = undefined;
        this._historyProviderDisposable = new MutableDisposable();
        this._commitTemplate = undefined;
        this._acceptInputDisposables = new MutableDisposable();
        this._acceptInputCommand = undefined;
        this._actionButtonDisposables = new MutableDisposable();
        this._statusBarDisposables = new MutableDisposable();
        this._statusBarCommands = undefined;
        this._selected = false;
        this._onDidChangeSelection = new Emitter();
        this.onDidChangeSelection = this._onDidChangeSelection.event;
        this.handle = ExtHostSourceControl._handlePool++;
        this.createdResourceGroups = new Map();
        this.updatedResourceGroups = new Set();
        this.#proxy = proxy;
        const inputBoxDocumentUri = URI.from({
            scheme: Schemas.vscodeSourceControl,
            path: `${_id}/scm${this.handle}/input`,
            query: _rootUri ? `rootUri=${encodeURIComponent(_rootUri.toString())}` : undefined
        });
        this._inputBox = new ExtHostSCMInputBox(_extension, _extHostDocuments, this.#proxy, this.handle, inputBoxDocumentUri);
        this.#proxy.$registerSourceControl(this.handle, _id, _label, _rootUri, inputBoxDocumentUri);
    }
    createResourceGroup(id, label, options) {
        const multiDiffEditorEnableViewChanges = isProposedApiEnabled(this._extension, 'scmMultiDiffEditor') && options?.multiDiffEditorEnableViewChanges === true;
        const group = new ExtHostSourceControlResourceGroup(this.#proxy, this._commands, this.handle, id, label, multiDiffEditorEnableViewChanges, this._extension);
        const disposable = Event.once(group.onDidDispose)(() => this.createdResourceGroups.delete(group));
        this.createdResourceGroups.set(group, disposable);
        this.eventuallyAddResourceGroups();
        return group;
    }
    eventuallyAddResourceGroups() {
        const groups = [];
        const splices = [];
        for (const [group, disposable] of this.createdResourceGroups) {
            disposable.dispose();
            const updateListener = group.onDidUpdateResourceStates(() => {
                this.updatedResourceGroups.add(group);
                this.eventuallyUpdateResourceStates();
            });
            Event.once(group.onDidDispose)(() => {
                this.updatedResourceGroups.delete(group);
                updateListener.dispose();
                this._groups.delete(group.handle);
                this.#proxy.$unregisterGroup(this.handle, group.handle);
            });
            groups.push([group.handle, group.id, group.label, group.features, group.multiDiffEditorEnableViewChanges]);
            const snapshot = group._takeResourceStateSnapshot();
            if (snapshot.length > 0) {
                splices.push([group.handle, snapshot]);
            }
            this._groups.set(group.handle, group);
        }
        this.#proxy.$registerGroups(this.handle, groups, splices);
        this.createdResourceGroups.clear();
    }
    eventuallyUpdateResourceStates() {
        const splices = [];
        this.updatedResourceGroups.forEach(group => {
            const snapshot = group._takeResourceStateSnapshot();
            if (snapshot.length === 0) {
                return;
            }
            splices.push([group.handle, snapshot]);
        });
        if (splices.length > 0) {
            this.#proxy.$spliceResourceStates(this.handle, splices);
        }
        this.updatedResourceGroups.clear();
    }
    getResourceGroup(handle) {
        return this._groups.get(handle);
    }
    setSelectionState(selected) {
        this._selected = selected;
        this._onDidChangeSelection.fire(selected);
    }
    dispose() {
        this._acceptInputDisposables.dispose();
        this._actionButtonDisposables.dispose();
        this._statusBarDisposables.dispose();
        this._groups.forEach(group => group.dispose());
        this.#proxy.$unregisterSourceControl(this.handle);
    }
}
__decorate([
    debounce(100),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExtHostSourceControl.prototype, "eventuallyAddResourceGroups", null);
__decorate([
    debounce(100),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExtHostSourceControl.prototype, "eventuallyUpdateResourceStates", null);
let ExtHostSCM = class ExtHostSCM {
    static { ExtHostSCM_1 = this; }
    static { this._handlePool = 0; }
    get onDidChangeActiveProvider() { return this._onDidChangeActiveProvider.event; }
    constructor(mainContext, _commands, _extHostDocuments, logService) {
        this._commands = _commands;
        this._extHostDocuments = _extHostDocuments;
        this.logService = logService;
        this._sourceControls = new Map();
        this._sourceControlsByExtension = new ExtensionIdentifierMap();
        this._onDidChangeActiveProvider = new Emitter();
        this._proxy = mainContext.getProxy(MainContext.MainThreadSCM);
        this._telemetry = mainContext.getProxy(MainContext.MainThreadTelemetry);
        _commands.registerArgumentProcessor({
            processArgument: arg => {
                if (arg && arg.$mid === 3 /* MarshalledId.ScmResource */) {
                    const sourceControl = this._sourceControls.get(arg.sourceControlHandle);
                    if (!sourceControl) {
                        return arg;
                    }
                    const group = sourceControl.getResourceGroup(arg.groupHandle);
                    if (!group) {
                        return arg;
                    }
                    return group.getResourceState(arg.handle);
                }
                else if (arg && arg.$mid === 4 /* MarshalledId.ScmResourceGroup */) {
                    const sourceControl = this._sourceControls.get(arg.sourceControlHandle);
                    if (!sourceControl) {
                        return arg;
                    }
                    return sourceControl.getResourceGroup(arg.groupHandle);
                }
                else if (arg && arg.$mid === 5 /* MarshalledId.ScmProvider */) {
                    const sourceControl = this._sourceControls.get(arg.handle);
                    if (!sourceControl) {
                        return arg;
                    }
                    return sourceControl;
                }
                return arg;
            }
        });
    }
    createSourceControl(extension, id, label, rootUri) {
        this.logService.trace('ExtHostSCM#createSourceControl', extension.identifier.value, id, label, rootUri);
        this._telemetry.$publicLog2('api/scm/createSourceControl', {
            extensionId: extension.identifier.value,
        });
        const handle = ExtHostSCM_1._handlePool++;
        const sourceControl = new ExtHostSourceControl(extension, this._extHostDocuments, this._proxy, this._commands, id, label, rootUri);
        this._sourceControls.set(handle, sourceControl);
        const sourceControls = this._sourceControlsByExtension.get(extension.identifier) || [];
        sourceControls.push(sourceControl);
        this._sourceControlsByExtension.set(extension.identifier, sourceControls);
        return sourceControl;
    }
    // Deprecated
    getLastInputBox(extension) {
        this.logService.trace('ExtHostSCM#getLastInputBox', extension.identifier.value);
        const sourceControls = this._sourceControlsByExtension.get(extension.identifier);
        const sourceControl = sourceControls && sourceControls[sourceControls.length - 1];
        return sourceControl && sourceControl.inputBox;
    }
    $provideOriginalResource(sourceControlHandle, uriComponents, token) {
        const uri = URI.revive(uriComponents);
        this.logService.trace('ExtHostSCM#$provideOriginalResource', sourceControlHandle, uri.toString());
        const sourceControl = this._sourceControls.get(sourceControlHandle);
        if (!sourceControl || !sourceControl.quickDiffProvider || !sourceControl.quickDiffProvider.provideOriginalResource) {
            return Promise.resolve(null);
        }
        return asPromise(() => sourceControl.quickDiffProvider.provideOriginalResource(uri, token))
            .then(r => r || null);
    }
    $onInputBoxValueChange(sourceControlHandle, value) {
        this.logService.trace('ExtHostSCM#$onInputBoxValueChange', sourceControlHandle);
        const sourceControl = this._sourceControls.get(sourceControlHandle);
        if (!sourceControl) {
            return Promise.resolve(undefined);
        }
        sourceControl.inputBox.$onInputBoxValueChange(value);
        return Promise.resolve(undefined);
    }
    $executeResourceCommand(sourceControlHandle, groupHandle, handle, preserveFocus) {
        this.logService.trace('ExtHostSCM#$executeResourceCommand', sourceControlHandle, groupHandle, handle);
        const sourceControl = this._sourceControls.get(sourceControlHandle);
        if (!sourceControl) {
            return Promise.resolve(undefined);
        }
        const group = sourceControl.getResourceGroup(groupHandle);
        if (!group) {
            return Promise.resolve(undefined);
        }
        return group.$executeResourceCommand(handle, preserveFocus);
    }
    $validateInput(sourceControlHandle, value, cursorPosition) {
        this.logService.trace('ExtHostSCM#$validateInput', sourceControlHandle);
        const sourceControl = this._sourceControls.get(sourceControlHandle);
        if (!sourceControl) {
            return Promise.resolve(undefined);
        }
        if (!sourceControl.inputBox.validateInput) {
            return Promise.resolve(undefined);
        }
        return asPromise(() => sourceControl.inputBox.validateInput(value, cursorPosition)).then(result => {
            if (!result) {
                return Promise.resolve(undefined);
            }
            const message = MarkdownString.fromStrict(result.message);
            if (!message) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve([message, result.type]);
        });
    }
    $setSelectedSourceControl(selectedSourceControlHandle) {
        this.logService.trace('ExtHostSCM#$setSelectedSourceControl', selectedSourceControlHandle);
        if (selectedSourceControlHandle !== undefined) {
            this._sourceControls.get(selectedSourceControlHandle)?.setSelectionState(true);
        }
        if (this._selectedSourceControlHandle !== undefined) {
            this._sourceControls.get(this._selectedSourceControlHandle)?.setSelectionState(false);
        }
        this._selectedSourceControlHandle = selectedSourceControlHandle;
        return Promise.resolve(undefined);
    }
    async $resolveHistoryItemRefsCommonAncestor(sourceControlHandle, historyItemRefs, token) {
        try {
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
            const ancestor = await historyProvider?.resolveHistoryItemRefsCommonAncestor(historyItemRefs, token);
            return ancestor ?? undefined;
        }
        catch (err) {
            this.logService.error('ExtHostSCM#$resolveHistoryItemRefsCommonAncestor', err);
            return undefined;
        }
    }
    async $provideHistoryItemRefs(sourceControlHandle, historyItemRefs, token) {
        try {
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
            const refs = await historyProvider?.provideHistoryItemRefs(historyItemRefs, token);
            return refs?.map(ref => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) })) ?? undefined;
        }
        catch (err) {
            this.logService.error('ExtHostSCM#$provideHistoryItemRefs', err);
            return undefined;
        }
    }
    async $provideHistoryItems(sourceControlHandle, options, token) {
        try {
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
            const historyItems = await historyProvider?.provideHistoryItems(options, token);
            return historyItems?.map(item => toSCMHistoryItemDto(item)) ?? undefined;
        }
        catch (err) {
            this.logService.error('ExtHostSCM#$provideHistoryItems', err);
            return undefined;
        }
    }
    async $provideHistoryItemChanges(sourceControlHandle, historyItemId, historyItemParentId, token) {
        try {
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
            const changes = await historyProvider?.provideHistoryItemChanges(historyItemId, historyItemParentId, token);
            return changes ?? undefined;
        }
        catch (err) {
            this.logService.error('ExtHostSCM#$provideHistoryItemChanges', err);
            return undefined;
        }
    }
};
ExtHostSCM = ExtHostSCM_1 = __decorate([
    __param(3, ILogService),
    __metadata("design:paramtypes", [Object, ExtHostCommands,
        ExtHostDocuments, Object])
], ExtHostSCM);
export { ExtHostSCM };
