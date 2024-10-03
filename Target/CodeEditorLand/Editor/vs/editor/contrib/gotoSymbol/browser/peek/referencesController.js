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
var ReferencesController_1;
import { createCancelablePromise } from '../../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../../base/common/errors.js';
import { KeyChord } from '../../../../../base/common/keyCodes.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ICodeEditorService } from '../../../../browser/services/codeEditorService.js';
import { Position } from '../../../../common/core/position.js';
import { Range } from '../../../../common/core/range.js';
import { getOuterEditor, PeekContext } from '../../../peekView/browser/peekView.js';
import * as nls from '../../../../../nls.js';
import { CommandsRegistry } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { KeybindingsRegistry } from '../../../../../platform/keybinding/common/keybindingsRegistry.js';
import { IListService, WorkbenchListFocusContextKey, WorkbenchTreeElementCanCollapse, WorkbenchTreeElementCanExpand } from '../../../../../platform/list/browser/listService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { OneReference } from '../referencesModel.js';
import { LayoutData, ReferenceWidget } from './referencesWidget.js';
import { EditorContextKeys } from '../../../../common/editorContextKeys.js';
import { InputFocusedContext } from '../../../../../platform/contextkey/common/contextkeys.js';
export const ctxReferenceSearchVisible = new RawContextKey('referenceSearchVisible', false, nls.localize('referenceSearchVisible', "Whether reference peek is visible, like 'Peek References' or 'Peek Definition'"));
let ReferencesController = class ReferencesController {
    static { ReferencesController_1 = this; }
    static { this.ID = 'editor.contrib.referencesController'; }
    static get(editor) {
        return editor.getContribution(ReferencesController_1.ID);
    }
    constructor(_defaultTreeKeyboardSupport, _editor, contextKeyService, _editorService, _notificationService, _instantiationService, _storageService, _configurationService) {
        this._defaultTreeKeyboardSupport = _defaultTreeKeyboardSupport;
        this._editor = _editor;
        this._editorService = _editorService;
        this._notificationService = _notificationService;
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        this._configurationService = _configurationService;
        this._disposables = new DisposableStore();
        this._requestIdPool = 0;
        this._ignoreModelChangeEvent = false;
        this._referenceSearchVisible = ctxReferenceSearchVisible.bindTo(contextKeyService);
    }
    dispose() {
        this._referenceSearchVisible.reset();
        this._disposables.dispose();
        this._widget?.dispose();
        this._model?.dispose();
        this._widget = undefined;
        this._model = undefined;
    }
    toggleWidget(range, modelPromise, peekMode) {
        let widgetPosition;
        if (this._widget) {
            widgetPosition = this._widget.position;
        }
        this.closeWidget();
        if (!!widgetPosition && range.containsPosition(widgetPosition)) {
            return;
        }
        this._peekMode = peekMode;
        this._referenceSearchVisible.set(true);
        this._disposables.add(this._editor.onDidChangeModelLanguage(() => { this.closeWidget(); }));
        this._disposables.add(this._editor.onDidChangeModel(() => {
            if (!this._ignoreModelChangeEvent) {
                this.closeWidget();
            }
        }));
        const storageKey = 'peekViewLayout';
        const data = LayoutData.fromJSON(this._storageService.get(storageKey, 0, '{}'));
        this._widget = this._instantiationService.createInstance(ReferenceWidget, this._editor, this._defaultTreeKeyboardSupport, data);
        this._widget.setTitle(nls.localize('labelLoading', "Loading..."));
        this._widget.show(range);
        this._disposables.add(this._widget.onDidClose(() => {
            modelPromise.cancel();
            if (this._widget) {
                this._storageService.store(storageKey, JSON.stringify(this._widget.layoutData), 0, 1);
                if (!this._widget.isClosing) {
                    this.closeWidget();
                }
                this._widget = undefined;
            }
            else {
                this.closeWidget();
            }
        }));
        this._disposables.add(this._widget.onDidSelectReference(event => {
            const { element, kind } = event;
            if (!element) {
                return;
            }
            switch (kind) {
                case 'open':
                    if (event.source !== 'editor' || !this._configurationService.getValue('editor.stablePeek')) {
                        this.openReference(element, false, false);
                    }
                    break;
                case 'side':
                    this.openReference(element, true, false);
                    break;
                case 'goto':
                    if (peekMode) {
                        this._gotoReference(element, true);
                    }
                    else {
                        this.openReference(element, false, true);
                    }
                    break;
            }
        }));
        const requestId = ++this._requestIdPool;
        modelPromise.then(model => {
            if (requestId !== this._requestIdPool || !this._widget) {
                model.dispose();
                return undefined;
            }
            this._model?.dispose();
            this._model = model;
            return this._widget.setModel(this._model).then(() => {
                if (this._widget && this._model && this._editor.hasModel()) {
                    if (!this._model.isEmpty) {
                        this._widget.setMetaTitle(nls.localize('metaTitle.N', "{0} ({1})", this._model.title, this._model.references.length));
                    }
                    else {
                        this._widget.setMetaTitle('');
                    }
                    const uri = this._editor.getModel().uri;
                    const pos = new Position(range.startLineNumber, range.startColumn);
                    const selection = this._model.nearestReference(uri, pos);
                    if (selection) {
                        return this._widget.setSelection(selection).then(() => {
                            if (this._widget && this._editor.getOption(89) === 'editor') {
                                this._widget.focusOnPreviewEditor();
                            }
                        });
                    }
                }
                return undefined;
            });
        }, error => {
            this._notificationService.error(error);
        });
    }
    changeFocusBetweenPreviewAndReferences() {
        if (!this._widget) {
            return;
        }
        if (this._widget.isPreviewEditorFocused()) {
            this._widget.focusOnReferenceTree();
        }
        else {
            this._widget.focusOnPreviewEditor();
        }
    }
    async goToNextOrPreviousReference(fwd) {
        if (!this._editor.hasModel() || !this._model || !this._widget) {
            return;
        }
        const currentPosition = this._widget.position;
        if (!currentPosition) {
            return;
        }
        const source = this._model.nearestReference(this._editor.getModel().uri, currentPosition);
        if (!source) {
            return;
        }
        const target = this._model.nextOrPreviousReference(source, fwd);
        const editorFocus = this._editor.hasTextFocus();
        const previewEditorFocus = this._widget.isPreviewEditorFocused();
        await this._widget.setSelection(target);
        await this._gotoReference(target, false);
        if (editorFocus) {
            this._editor.focus();
        }
        else if (this._widget && previewEditorFocus) {
            this._widget.focusOnPreviewEditor();
        }
    }
    async revealReference(reference) {
        if (!this._editor.hasModel() || !this._model || !this._widget) {
            return;
        }
        await this._widget.revealReference(reference);
    }
    closeWidget(focusEditor = true) {
        this._widget?.dispose();
        this._model?.dispose();
        this._referenceSearchVisible.reset();
        this._disposables.clear();
        this._widget = undefined;
        this._model = undefined;
        if (focusEditor) {
            this._editor.focus();
        }
        this._requestIdPool += 1;
    }
    _gotoReference(ref, pinned) {
        this._widget?.hide();
        this._ignoreModelChangeEvent = true;
        const range = Range.lift(ref.range).collapseToStart();
        return this._editorService.openCodeEditor({
            resource: ref.uri,
            options: { selection: range, selectionSource: "code.jump", pinned }
        }, this._editor).then(openedEditor => {
            this._ignoreModelChangeEvent = false;
            if (!openedEditor || !this._widget) {
                this.closeWidget();
                return;
            }
            if (this._editor === openedEditor) {
                this._widget.show(range);
                this._widget.focusOnReferenceTree();
            }
            else {
                const other = ReferencesController_1.get(openedEditor);
                const model = this._model.clone();
                this.closeWidget();
                openedEditor.focus();
                other?.toggleWidget(range, createCancelablePromise(_ => Promise.resolve(model)), this._peekMode ?? false);
            }
        }, (err) => {
            this._ignoreModelChangeEvent = false;
            onUnexpectedError(err);
        });
    }
    openReference(ref, sideBySide, pinned) {
        if (!sideBySide) {
            this.closeWidget();
        }
        const { uri, range } = ref;
        this._editorService.openCodeEditor({
            resource: uri,
            options: { selection: range, selectionSource: "code.jump", pinned }
        }, this._editor, sideBySide);
    }
};
ReferencesController = ReferencesController_1 = __decorate([
    __param(2, IContextKeyService),
    __param(3, ICodeEditorService),
    __param(4, INotificationService),
    __param(5, IInstantiationService),
    __param(6, IStorageService),
    __param(7, IConfigurationService),
    __metadata("design:paramtypes", [Boolean, Object, Object, Object, Object, Object, Object, Object])
], ReferencesController);
export { ReferencesController };
function withController(accessor, fn) {
    const outerEditor = getOuterEditor(accessor);
    if (!outerEditor) {
        return;
    }
    const controller = ReferencesController.get(outerEditor);
    if (controller) {
        fn(controller);
    }
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'togglePeekWidgetFocus',
    weight: 100,
    primary: KeyChord(2048 | 41, 60),
    when: ContextKeyExpr.or(ctxReferenceSearchVisible, PeekContext.inPeekEditor),
    handler(accessor) {
        withController(accessor, controller => {
            controller.changeFocusBetweenPreviewAndReferences();
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'goToNextReference',
    weight: 100 - 10,
    primary: 62,
    secondary: [70],
    when: ContextKeyExpr.or(ctxReferenceSearchVisible, PeekContext.inPeekEditor),
    handler(accessor) {
        withController(accessor, controller => {
            controller.goToNextOrPreviousReference(true);
        });
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'goToPreviousReference',
    weight: 100 - 10,
    primary: 1024 | 62,
    secondary: [1024 | 70],
    when: ContextKeyExpr.or(ctxReferenceSearchVisible, PeekContext.inPeekEditor),
    handler(accessor) {
        withController(accessor, controller => {
            controller.goToNextOrPreviousReference(false);
        });
    }
});
CommandsRegistry.registerCommandAlias('goToNextReferenceFromEmbeddedEditor', 'goToNextReference');
CommandsRegistry.registerCommandAlias('goToPreviousReferenceFromEmbeddedEditor', 'goToPreviousReference');
CommandsRegistry.registerCommandAlias('closeReferenceSearchEditor', 'closeReferenceSearch');
CommandsRegistry.registerCommand('closeReferenceSearch', accessor => withController(accessor, controller => controller.closeWidget()));
KeybindingsRegistry.registerKeybindingRule({
    id: 'closeReferenceSearch',
    weight: 100 - 101,
    primary: 9,
    secondary: [1024 | 9],
    when: ContextKeyExpr.and(PeekContext.inPeekEditor, ContextKeyExpr.not('config.editor.stablePeek'))
});
KeybindingsRegistry.registerKeybindingRule({
    id: 'closeReferenceSearch',
    weight: 200 + 50,
    primary: 9,
    secondary: [1024 | 9],
    when: ContextKeyExpr.and(ctxReferenceSearchVisible, ContextKeyExpr.not('config.editor.stablePeek'), ContextKeyExpr.or(EditorContextKeys.editorTextFocus, InputFocusedContext.negate()))
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'revealReference',
    weight: 200,
    primary: 3,
    mac: {
        primary: 3,
        secondary: [2048 | 18]
    },
    when: ContextKeyExpr.and(ctxReferenceSearchVisible, WorkbenchListFocusContextKey, WorkbenchTreeElementCanCollapse.negate(), WorkbenchTreeElementCanExpand.negate()),
    handler(accessor) {
        const listService = accessor.get(IListService);
        const focus = listService.lastFocusedList?.getFocus();
        if (Array.isArray(focus) && focus[0] instanceof OneReference) {
            withController(accessor, controller => controller.revealReference(focus[0]));
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'openReferenceToSide',
    weight: 100,
    primary: 2048 | 3,
    mac: {
        primary: 256 | 3
    },
    when: ContextKeyExpr.and(ctxReferenceSearchVisible, WorkbenchListFocusContextKey, WorkbenchTreeElementCanCollapse.negate(), WorkbenchTreeElementCanExpand.negate()),
    handler(accessor) {
        const listService = accessor.get(IListService);
        const focus = listService.lastFocusedList?.getFocus();
        if (Array.isArray(focus) && focus[0] instanceof OneReference) {
            withController(accessor, controller => controller.openReference(focus[0], true, true));
        }
    }
});
CommandsRegistry.registerCommand('openReference', (accessor) => {
    const listService = accessor.get(IListService);
    const focus = listService.lastFocusedList?.getFocus();
    if (Array.isArray(focus) && focus[0] instanceof OneReference) {
        withController(accessor, controller => controller.openReference(focus[0], false, true));
    }
});
