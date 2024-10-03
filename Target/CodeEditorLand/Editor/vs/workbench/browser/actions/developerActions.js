import './media/actions.css';
import { localize, localize2 } from '../../../nls.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { DomEmitter } from '../../../base/browser/event.js';
import { Color } from '../../../base/common/color.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { toDisposable, dispose, DisposableStore, setDisposableTracker, DisposableTracker } from '../../../base/common/lifecycle.js';
import { getDomNodePagePosition, createStyleSheet, createCSSRule, append, $, getActiveDocument, onDidRegisterWindow, getWindows } from '../../../base/browser/dom.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../platform/contextkey/common/contextkey.js';
import { StandardKeyboardEvent } from '../../../base/browser/keyboardEvent.js';
import { RunOnceScheduler } from '../../../base/common/async.js';
import { ILayoutService } from '../../../platform/layout/browser/layoutService.js';
import { Registry } from '../../../platform/registry/common/platform.js';
import { registerAction2, Action2, MenuRegistry } from '../../../platform/actions/common/actions.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { clamp } from '../../../base/common/numbers.js';
import { Extensions as ConfigurationExtensions } from '../../../platform/configuration/common/configurationRegistry.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IWorkingCopyService } from '../../services/workingCopy/common/workingCopyService.js';
import { Categories } from '../../../platform/action/common/actionCommonCategories.js';
import { IWorkingCopyBackupService } from '../../services/workingCopy/common/workingCopyBackup.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { IOutputService } from '../../services/output/common/output.js';
import { windowLogId } from '../../services/log/common/logConstants.js';
import { ByteSize } from '../../../platform/files/common/files.js';
import { IQuickInputService } from '../../../platform/quickinput/common/quickInput.js';
import { IUserDataProfileService } from '../../services/userDataProfile/common/userDataProfile.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import product from '../../../platform/product/common/product.js';
import { CommandsRegistry } from '../../../platform/commands/common/commands.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.js';
class InspectContextKeysAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.inspectContextKeys',
            title: localize2('inspect context keys', 'Inspect Context Keys'),
            category: Categories.Developer,
            f1: true
        });
    }
    run(accessor) {
        const contextKeyService = accessor.get(IContextKeyService);
        const disposables = new DisposableStore();
        const stylesheet = createStyleSheet(undefined, undefined, disposables);
        createCSSRule('*', 'cursor: crosshair !important;', stylesheet);
        const hoverFeedback = document.createElement('div');
        const activeDocument = getActiveDocument();
        activeDocument.body.appendChild(hoverFeedback);
        disposables.add(toDisposable(() => hoverFeedback.remove()));
        hoverFeedback.style.position = 'absolute';
        hoverFeedback.style.pointerEvents = 'none';
        hoverFeedback.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        hoverFeedback.style.zIndex = '1000';
        const onMouseMove = disposables.add(new DomEmitter(activeDocument, 'mousemove', true));
        disposables.add(onMouseMove.event(e => {
            const target = e.target;
            const position = getDomNodePagePosition(target);
            hoverFeedback.style.top = `${position.top}px`;
            hoverFeedback.style.left = `${position.left}px`;
            hoverFeedback.style.width = `${position.width}px`;
            hoverFeedback.style.height = `${position.height}px`;
        }));
        const onMouseDown = disposables.add(new DomEmitter(activeDocument, 'mousedown', true));
        Event.once(onMouseDown.event)(e => { e.preventDefault(); e.stopPropagation(); }, null, disposables);
        const onMouseUp = disposables.add(new DomEmitter(activeDocument, 'mouseup', true));
        Event.once(onMouseUp.event)(e => {
            e.preventDefault();
            e.stopPropagation();
            const context = contextKeyService.getContext(e.target);
            console.log(context.collectAllValues());
            dispose(disposables);
        }, null, disposables);
    }
}
class ToggleScreencastModeAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleScreencastMode',
            title: localize2('toggle screencast mode', 'Toggle Screencast Mode'),
            category: Categories.Developer,
            f1: true
        });
    }
    run(accessor) {
        if (ToggleScreencastModeAction.disposable) {
            ToggleScreencastModeAction.disposable.dispose();
            ToggleScreencastModeAction.disposable = undefined;
            return;
        }
        const layoutService = accessor.get(ILayoutService);
        const configurationService = accessor.get(IConfigurationService);
        const keybindingService = accessor.get(IKeybindingService);
        const disposables = new DisposableStore();
        const container = layoutService.activeContainer;
        const mouseMarker = append(container, $('.screencast-mouse'));
        disposables.add(toDisposable(() => mouseMarker.remove()));
        const keyboardMarker = append(container, $('.screencast-keyboard'));
        disposables.add(toDisposable(() => keyboardMarker.remove()));
        const onMouseDown = disposables.add(new Emitter());
        const onMouseUp = disposables.add(new Emitter());
        const onMouseMove = disposables.add(new Emitter());
        function registerContainerListeners(container, disposables) {
            disposables.add(disposables.add(new DomEmitter(container, 'mousedown', true)).event(e => onMouseDown.fire(e)));
            disposables.add(disposables.add(new DomEmitter(container, 'mouseup', true)).event(e => onMouseUp.fire(e)));
            disposables.add(disposables.add(new DomEmitter(container, 'mousemove', true)).event(e => onMouseMove.fire(e)));
        }
        for (const { window, disposables } of getWindows()) {
            registerContainerListeners(layoutService.getContainer(window), disposables);
        }
        disposables.add(onDidRegisterWindow(({ window, disposables }) => registerContainerListeners(layoutService.getContainer(window), disposables)));
        disposables.add(layoutService.onDidChangeActiveContainer(() => {
            layoutService.activeContainer.appendChild(mouseMarker);
            layoutService.activeContainer.appendChild(keyboardMarker);
        }));
        const updateMouseIndicatorColor = () => {
            mouseMarker.style.borderColor = Color.fromHex(configurationService.getValue('screencastMode.mouseIndicatorColor')).toString();
        };
        let mouseIndicatorSize;
        const updateMouseIndicatorSize = () => {
            mouseIndicatorSize = clamp(configurationService.getValue('screencastMode.mouseIndicatorSize') || 20, 20, 100);
            mouseMarker.style.height = `${mouseIndicatorSize}px`;
            mouseMarker.style.width = `${mouseIndicatorSize}px`;
        };
        updateMouseIndicatorColor();
        updateMouseIndicatorSize();
        disposables.add(onMouseDown.event(e => {
            mouseMarker.style.top = `${e.clientY - mouseIndicatorSize / 2}px`;
            mouseMarker.style.left = `${e.clientX - mouseIndicatorSize / 2}px`;
            mouseMarker.style.display = 'block';
            mouseMarker.style.transform = `scale(${1})`;
            mouseMarker.style.transition = 'transform 0.1s';
            const mouseMoveListener = onMouseMove.event(e => {
                mouseMarker.style.top = `${e.clientY - mouseIndicatorSize / 2}px`;
                mouseMarker.style.left = `${e.clientX - mouseIndicatorSize / 2}px`;
                mouseMarker.style.transform = `scale(${.8})`;
            });
            Event.once(onMouseUp.event)(() => {
                mouseMarker.style.display = 'none';
                mouseMoveListener.dispose();
            });
        }));
        const updateKeyboardFontSize = () => {
            keyboardMarker.style.fontSize = `${clamp(configurationService.getValue('screencastMode.fontSize') || 56, 20, 100)}px`;
        };
        const updateKeyboardMarker = () => {
            keyboardMarker.style.bottom = `${clamp(configurationService.getValue('screencastMode.verticalOffset') || 0, 0, 90)}%`;
        };
        let keyboardMarkerTimeout;
        const updateKeyboardMarkerTimeout = () => {
            keyboardMarkerTimeout = clamp(configurationService.getValue('screencastMode.keyboardOverlayTimeout') || 800, 500, 5000);
        };
        updateKeyboardFontSize();
        updateKeyboardMarker();
        updateKeyboardMarkerTimeout();
        disposables.add(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('screencastMode.verticalOffset')) {
                updateKeyboardMarker();
            }
            if (e.affectsConfiguration('screencastMode.fontSize')) {
                updateKeyboardFontSize();
            }
            if (e.affectsConfiguration('screencastMode.keyboardOverlayTimeout')) {
                updateKeyboardMarkerTimeout();
            }
            if (e.affectsConfiguration('screencastMode.mouseIndicatorColor')) {
                updateMouseIndicatorColor();
            }
            if (e.affectsConfiguration('screencastMode.mouseIndicatorSize')) {
                updateMouseIndicatorSize();
            }
        }));
        const onKeyDown = disposables.add(new Emitter());
        const onCompositionStart = disposables.add(new Emitter());
        const onCompositionUpdate = disposables.add(new Emitter());
        const onCompositionEnd = disposables.add(new Emitter());
        function registerWindowListeners(window, disposables) {
            disposables.add(disposables.add(new DomEmitter(window, 'keydown', true)).event(e => onKeyDown.fire(e)));
            disposables.add(disposables.add(new DomEmitter(window, 'compositionstart', true)).event(e => onCompositionStart.fire(e)));
            disposables.add(disposables.add(new DomEmitter(window, 'compositionupdate', true)).event(e => onCompositionUpdate.fire(e)));
            disposables.add(disposables.add(new DomEmitter(window, 'compositionend', true)).event(e => onCompositionEnd.fire(e)));
        }
        for (const { window, disposables } of getWindows()) {
            registerWindowListeners(window, disposables);
        }
        disposables.add(onDidRegisterWindow(({ window, disposables }) => registerWindowListeners(window, disposables)));
        let length = 0;
        let composing = undefined;
        let imeBackSpace = false;
        const clearKeyboardScheduler = new RunOnceScheduler(() => {
            keyboardMarker.textContent = '';
            composing = undefined;
            length = 0;
        }, keyboardMarkerTimeout);
        disposables.add(onCompositionStart.event(e => {
            imeBackSpace = true;
        }));
        disposables.add(onCompositionUpdate.event(e => {
            if (e.data && imeBackSpace) {
                if (length > 20) {
                    keyboardMarker.innerText = '';
                    length = 0;
                }
                composing = composing ?? append(keyboardMarker, $('span.key'));
                composing.textContent = e.data;
            }
            else if (imeBackSpace) {
                keyboardMarker.innerText = '';
                append(keyboardMarker, $('span.key', {}, `Backspace`));
            }
            clearKeyboardScheduler.schedule();
        }));
        disposables.add(onCompositionEnd.event(e => {
            composing = undefined;
            length++;
        }));
        disposables.add(onKeyDown.event(e => {
            if (e.key === 'Process' || /[\uac00-\ud787\u3131-\u314e\u314f-\u3163\u3041-\u3094\u30a1-\u30f4\u30fc\u3005\u3006\u3024\u4e00-\u9fa5]/u.test(e.key)) {
                if (e.code === 'Backspace') {
                    imeBackSpace = true;
                }
                else if (!e.code.includes('Key')) {
                    composing = undefined;
                    imeBackSpace = false;
                }
                else {
                    imeBackSpace = true;
                }
                clearKeyboardScheduler.schedule();
                return;
            }
            if (e.isComposing) {
                return;
            }
            const options = configurationService.getValue('screencastMode.keyboardOptions');
            const event = new StandardKeyboardEvent(e);
            const shortcut = keybindingService.softDispatch(event, event.target);
            if (shortcut.kind === 2 && shortcut.commandId && !(options.showSingleEditorCursorMoves ?? true) && (['cursorLeft', 'cursorRight', 'cursorUp', 'cursorDown'].includes(shortcut.commandId))) {
                return;
            }
            if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey
                || length > 20
                || event.keyCode === 1 || event.keyCode === 9
                || event.keyCode === 16 || event.keyCode === 18
                || event.keyCode === 15 || event.keyCode === 17) {
                keyboardMarker.innerText = '';
                length = 0;
            }
            const keybinding = keybindingService.resolveKeyboardEvent(event);
            const commandDetails = (this._isKbFound(shortcut) && shortcut.commandId) ? this.getCommandDetails(shortcut.commandId) : undefined;
            let commandAndGroupLabel = commandDetails?.title;
            let keyLabel = keybinding.getLabel();
            if (commandDetails) {
                if ((options.showCommandGroups ?? false) && commandDetails.category) {
                    commandAndGroupLabel = `${commandDetails.category}: ${commandAndGroupLabel} `;
                }
                if (this._isKbFound(shortcut) && shortcut.commandId) {
                    const keybindings = keybindingService.lookupKeybindings(shortcut.commandId)
                        .filter(k => k.getLabel()?.endsWith(keyLabel ?? ''));
                    if (keybindings.length > 0) {
                        keyLabel = keybindings[keybindings.length - 1].getLabel();
                    }
                }
            }
            if ((options.showCommands ?? true) && commandAndGroupLabel) {
                append(keyboardMarker, $('span.title', {}, `${commandAndGroupLabel} `));
            }
            if ((options.showKeys ?? true) || ((options.showKeybindings ?? true) && this._isKbFound(shortcut))) {
                keyLabel = keyLabel?.replace('UpArrow', '↑')
                    ?.replace('DownArrow', '↓')
                    ?.replace('LeftArrow', '←')
                    ?.replace('RightArrow', '→');
                append(keyboardMarker, $('span.key', {}, keyLabel ?? ''));
            }
            length++;
            clearKeyboardScheduler.schedule();
        }));
        ToggleScreencastModeAction.disposable = disposables;
    }
    _isKbFound(resolutionResult) {
        return resolutionResult.kind === 2;
    }
    getCommandDetails(commandId) {
        const fromMenuRegistry = MenuRegistry.getCommand(commandId);
        if (fromMenuRegistry) {
            return {
                title: typeof fromMenuRegistry.title === 'string' ? fromMenuRegistry.title : fromMenuRegistry.title.value,
                category: fromMenuRegistry.category ? (typeof fromMenuRegistry.category === 'string' ? fromMenuRegistry.category : fromMenuRegistry.category.value) : undefined
            };
        }
        const fromCommandsRegistry = CommandsRegistry.getCommand(commandId);
        if (fromCommandsRegistry && fromCommandsRegistry.metadata?.description) {
            return { title: typeof fromCommandsRegistry.metadata.description === 'string' ? fromCommandsRegistry.metadata.description : fromCommandsRegistry.metadata.description.value };
        }
        return undefined;
    }
}
class LogStorageAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.logStorage',
            title: localize2({ key: 'logStorage', comment: ['A developer only action to log the contents of the storage for the current window.'] }, "Log Storage Database Contents"),
            category: Categories.Developer,
            f1: true
        });
    }
    run(accessor) {
        const storageService = accessor.get(IStorageService);
        const dialogService = accessor.get(IDialogService);
        storageService.log();
        dialogService.info(localize('storageLogDialogMessage', "The storage database contents have been logged to the developer tools."), localize('storageLogDialogDetails', "Open developer tools from the menu and select the Console tab."));
    }
}
class LogWorkingCopiesAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.logWorkingCopies',
            title: localize2({ key: 'logWorkingCopies', comment: ['A developer only action to log the working copies that exist.'] }, "Log Working Copies"),
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        const workingCopyService = accessor.get(IWorkingCopyService);
        const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
        const logService = accessor.get(ILogService);
        const outputService = accessor.get(IOutputService);
        const backups = await workingCopyBackupService.getBackups();
        const msg = [
            ``,
            `[Working Copies]`,
            ...(workingCopyService.workingCopies.length > 0) ?
                workingCopyService.workingCopies.map(workingCopy => `${workingCopy.isDirty() ? '● ' : ''}${workingCopy.resource.toString(true)} (typeId: ${workingCopy.typeId || '<no typeId>'})`) :
                ['<none>'],
            ``,
            `[Backups]`,
            ...(backups.length > 0) ?
                backups.map(backup => `${backup.resource.toString(true)} (typeId: ${backup.typeId || '<no typeId>'})`) :
                ['<none>'],
        ];
        logService.info(msg.join('\n'));
        outputService.showChannel(windowLogId, true);
    }
}
class RemoveLargeStorageEntriesAction extends Action2 {
    static { this.SIZE_THRESHOLD = 1024 * 16; }
    constructor() {
        super({
            id: 'workbench.action.removeLargeStorageDatabaseEntries',
            title: localize2('removeLargeStorageDatabaseEntries', 'Remove Large Storage Database Entries...'),
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        const storageService = accessor.get(IStorageService);
        const quickInputService = accessor.get(IQuickInputService);
        const userDataProfileService = accessor.get(IUserDataProfileService);
        const dialogService = accessor.get(IDialogService);
        const environmentService = accessor.get(IEnvironmentService);
        const items = [];
        for (const scope of [-1, 0, 1]) {
            if (scope === 0 && userDataProfileService.currentProfile.isDefault) {
                continue;
            }
            for (const target of [1, 0]) {
                for (const key of storageService.keys(scope, target)) {
                    const value = storageService.get(key, scope);
                    if (value && (!environmentService.isBuilt || value.length > RemoveLargeStorageEntriesAction.SIZE_THRESHOLD)) {
                        items.push({
                            key,
                            scope,
                            target,
                            size: value.length,
                            label: key,
                            description: ByteSize.formatSize(value.length),
                            detail: localize('largeStorageItemDetail', "Scope: {0}, Target: {1}", scope === -1 ? localize('global', "Global") : scope === 0 ? localize('profile', "Profile") : localize('workspace', "Workspace"), target === 1 ? localize('machine', "Machine") : localize('user', "User")),
                        });
                    }
                }
            }
        }
        items.sort((itemA, itemB) => itemB.size - itemA.size);
        const selectedItems = await new Promise(resolve => {
            const disposables = new DisposableStore();
            const picker = disposables.add(quickInputService.createQuickPick());
            picker.items = items;
            picker.canSelectMany = true;
            picker.ok = false;
            picker.customButton = true;
            picker.hideCheckAll = true;
            picker.customLabel = localize('removeLargeStorageEntriesPickerButton', "Remove");
            picker.placeholder = localize('removeLargeStorageEntriesPickerPlaceholder', "Select large entries to remove from storage");
            if (items.length === 0) {
                picker.description = localize('removeLargeStorageEntriesPickerDescriptionNoEntries', "There are no large storage entries to remove.");
            }
            picker.show();
            disposables.add(picker.onDidCustom(() => {
                resolve(picker.selectedItems);
                picker.hide();
            }));
            disposables.add(picker.onDidHide(() => disposables.dispose()));
        });
        if (selectedItems.length === 0) {
            return;
        }
        const { confirmed } = await dialogService.confirm({
            type: 'warning',
            message: localize('removeLargeStorageEntriesConfirmRemove', "Do you want to remove the selected storage entries from the database?"),
            detail: localize('removeLargeStorageEntriesConfirmRemoveDetail', "{0}\n\nThis action is irreversible and may result in data loss!", selectedItems.map(item => item.label).join('\n')),
            primaryButton: localize({ key: 'removeLargeStorageEntriesButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Remove")
        });
        if (!confirmed) {
            return;
        }
        const scopesToOptimize = new Set();
        for (const item of selectedItems) {
            storageService.remove(item.key, item.scope);
            scopesToOptimize.add(item.scope);
        }
        for (const scope of scopesToOptimize) {
            await storageService.optimize(scope);
        }
    }
}
let tracker = undefined;
let trackedDisposables = new Set();
const DisposablesSnapshotStateContext = new RawContextKey('dirtyWorkingCopies', 'stopped');
class StartTrackDisposables extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.startTrackDisposables',
            title: localize2('startTrackDisposables', 'Start Tracking Disposables'),
            category: Categories.Developer,
            f1: true,
            precondition: ContextKeyExpr.and(DisposablesSnapshotStateContext.isEqualTo('pending').negate(), DisposablesSnapshotStateContext.isEqualTo('started').negate())
        });
    }
    run(accessor) {
        const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(IContextKeyService));
        disposablesSnapshotStateContext.set('started');
        trackedDisposables.clear();
        tracker = new DisposableTracker();
        setDisposableTracker(tracker);
    }
}
class SnapshotTrackedDisposables extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.snapshotTrackedDisposables',
            title: localize2('snapshotTrackedDisposables', 'Snapshot Tracked Disposables'),
            category: Categories.Developer,
            f1: true,
            precondition: DisposablesSnapshotStateContext.isEqualTo('started')
        });
    }
    run(accessor) {
        const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(IContextKeyService));
        disposablesSnapshotStateContext.set('pending');
        trackedDisposables = new Set(tracker?.computeLeakingDisposables(1000)?.leaks.map(disposable => disposable.value));
    }
}
class StopTrackDisposables extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.stopTrackDisposables',
            title: localize2('stopTrackDisposables', 'Stop Tracking Disposables'),
            category: Categories.Developer,
            f1: true,
            precondition: DisposablesSnapshotStateContext.isEqualTo('pending')
        });
    }
    run(accessor) {
        const editorService = accessor.get(IEditorService);
        const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(IContextKeyService));
        disposablesSnapshotStateContext.set('stopped');
        if (tracker) {
            const disposableLeaks = new Set();
            for (const disposable of new Set(tracker.computeLeakingDisposables(1000)?.leaks) ?? []) {
                if (trackedDisposables.has(disposable.value)) {
                    disposableLeaks.add(disposable);
                }
            }
            const leaks = tracker.computeLeakingDisposables(1000, Array.from(disposableLeaks));
            if (leaks) {
                editorService.openEditor({ resource: undefined, contents: leaks.details });
            }
        }
        setDisposableTracker(null);
        tracker = undefined;
        trackedDisposables.clear();
    }
}
registerAction2(InspectContextKeysAction);
registerAction2(ToggleScreencastModeAction);
registerAction2(LogStorageAction);
registerAction2(LogWorkingCopiesAction);
registerAction2(RemoveLargeStorageEntriesAction);
if (!product.commit) {
    registerAction2(StartTrackDisposables);
    registerAction2(SnapshotTrackedDisposables);
    registerAction2(StopTrackDisposables);
}
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
    id: 'screencastMode',
    order: 9,
    title: localize('screencastModeConfigurationTitle', "Screencast Mode"),
    type: 'object',
    properties: {
        'screencastMode.verticalOffset': {
            type: 'number',
            default: 20,
            minimum: 0,
            maximum: 90,
            description: localize('screencastMode.location.verticalPosition', "Controls the vertical offset of the screencast mode overlay from the bottom as a percentage of the workbench height.")
        },
        'screencastMode.fontSize': {
            type: 'number',
            default: 56,
            minimum: 20,
            maximum: 100,
            description: localize('screencastMode.fontSize', "Controls the font size (in pixels) of the screencast mode keyboard.")
        },
        'screencastMode.keyboardOptions': {
            type: 'object',
            description: localize('screencastMode.keyboardOptions.description', "Options for customizing the keyboard overlay in screencast mode."),
            properties: {
                'showKeys': {
                    type: 'boolean',
                    default: true,
                    description: localize('screencastMode.keyboardOptions.showKeys', "Show raw keys.")
                },
                'showKeybindings': {
                    type: 'boolean',
                    default: true,
                    description: localize('screencastMode.keyboardOptions.showKeybindings', "Show keyboard shortcuts.")
                },
                'showCommands': {
                    type: 'boolean',
                    default: true,
                    description: localize('screencastMode.keyboardOptions.showCommands', "Show command names.")
                },
                'showCommandGroups': {
                    type: 'boolean',
                    default: false,
                    description: localize('screencastMode.keyboardOptions.showCommandGroups', "Show command group names, when commands are also shown.")
                },
                'showSingleEditorCursorMoves': {
                    type: 'boolean',
                    default: true,
                    description: localize('screencastMode.keyboardOptions.showSingleEditorCursorMoves', "Show single editor cursor move commands.")
                }
            },
            default: {
                'showKeys': true,
                'showKeybindings': true,
                'showCommands': true,
                'showCommandGroups': false,
                'showSingleEditorCursorMoves': true
            },
            additionalProperties: false
        },
        'screencastMode.keyboardOverlayTimeout': {
            type: 'number',
            default: 800,
            minimum: 500,
            maximum: 5000,
            description: localize('screencastMode.keyboardOverlayTimeout', "Controls how long (in milliseconds) the keyboard overlay is shown in screencast mode.")
        },
        'screencastMode.mouseIndicatorColor': {
            type: 'string',
            format: 'color-hex',
            default: '#FF0000',
            description: localize('screencastMode.mouseIndicatorColor', "Controls the color in hex (#RGB, #RGBA, #RRGGBB or #RRGGBBAA) of the mouse indicator in screencast mode.")
        },
        'screencastMode.mouseIndicatorSize': {
            type: 'number',
            default: 20,
            minimum: 20,
            maximum: 100,
            description: localize('screencastMode.mouseIndicatorSize', "Controls the size (in pixels) of the mouse indicator in screencast mode.")
        },
    }
});
