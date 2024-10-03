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
import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import Severity from '../../../../base/common/severity.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { EditorExtensions, isEditorOpenError } from '../../../common/editor.js';
import { Dimension, show, hide, isAncestor, getActiveElement, getWindowById, isEditableElement } from '../../../../base/browser/dom.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorProgressService, LongRunningOperation } from '../../../../platform/progress/common/progress.js';
import { DEFAULT_EDITOR_MIN_DIMENSIONS, DEFAULT_EDITOR_MAX_DIMENSIONS } from './editor.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { ErrorPlaceholderEditor, WorkspaceTrustRequiredPlaceholderEditor } from './editorPlaceholder.js';
import { EditorOpenSource } from '../../../../platform/editor/common/editor.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IHostService } from '../../../services/host/browser/host.js';
let EditorPanes = class EditorPanes extends Disposable {
    get minimumWidth() { return this._activeEditorPane?.minimumWidth ?? DEFAULT_EDITOR_MIN_DIMENSIONS.width; }
    get minimumHeight() { return this._activeEditorPane?.minimumHeight ?? DEFAULT_EDITOR_MIN_DIMENSIONS.height; }
    get maximumWidth() { return this._activeEditorPane?.maximumWidth ?? DEFAULT_EDITOR_MAX_DIMENSIONS.width; }
    get maximumHeight() { return this._activeEditorPane?.maximumHeight ?? DEFAULT_EDITOR_MAX_DIMENSIONS.height; }
    get activeEditorPane() { return this._activeEditorPane; }
    constructor(editorGroupParent, editorPanesParent, groupView, layoutService, instantiationService, editorProgressService, workspaceTrustService, logService, dialogService, hostService) {
        super();
        this.editorGroupParent = editorGroupParent;
        this.editorPanesParent = editorPanesParent;
        this.groupView = groupView;
        this.layoutService = layoutService;
        this.instantiationService = instantiationService;
        this.editorProgressService = editorProgressService;
        this.workspaceTrustService = workspaceTrustService;
        this.logService = logService;
        this.dialogService = dialogService;
        this.hostService = hostService;
        this._onDidFocus = this._register(new Emitter());
        this.onDidFocus = this._onDidFocus.event;
        this._onDidChangeSizeConstraints = this._register(new Emitter());
        this.onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
        this._activeEditorPane = null;
        this.editorPanes = [];
        this.mapEditorPaneToPendingSetInput = new Map();
        this.activeEditorPaneDisposables = this._register(new DisposableStore());
        this.editorOperation = this._register(new LongRunningOperation(this.editorProgressService));
        this.editorPanesRegistry = Registry.as(EditorExtensions.EditorPane);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.workspaceTrustService.onDidChangeTrust(() => this.onDidChangeWorkspaceTrust()));
    }
    onDidChangeWorkspaceTrust() {
        const editor = this._activeEditorPane?.input;
        const options = this._activeEditorPane?.options;
        if (editor?.hasCapability(16)) {
            this.groupView.openEditor(editor, options);
        }
    }
    async openEditor(editor, options, internalOptions, context = Object.create(null)) {
        try {
            return await this.doOpenEditor(this.getEditorPaneDescriptor(editor), editor, options, internalOptions, context);
        }
        catch (error) {
            if (options?.ignoreError) {
                return { error };
            }
            return this.doShowError(error, editor, options, internalOptions, context);
        }
    }
    async doShowError(error, editor, options, internalOptions, context) {
        this.logService.error(error);
        let errorHandled = false;
        if (options?.source === EditorOpenSource.USER && (!isEditorOpenError(error) || error.allowDialog)) {
            errorHandled = await this.doShowErrorDialog(error, editor);
        }
        if (errorHandled) {
            return { error };
        }
        const editorPlaceholderOptions = { ...options };
        if (!isCancellationError(error)) {
            editorPlaceholderOptions.error = error;
        }
        return {
            ...(await this.doOpenEditor(ErrorPlaceholderEditor.DESCRIPTOR, editor, editorPlaceholderOptions, internalOptions, context)),
            error
        };
    }
    async doShowErrorDialog(error, editor) {
        let severity = Severity.Error;
        let message = undefined;
        let detail = toErrorMessage(error);
        let errorActions = undefined;
        if (isEditorOpenError(error)) {
            errorActions = error.actions;
            severity = error.forceSeverity ?? Severity.Error;
            if (error.forceMessage) {
                message = error.message;
                detail = undefined;
            }
        }
        if (!message) {
            message = localize('editorOpenErrorDialog', "Unable to open '{0}'", editor.getName());
        }
        const buttons = [];
        if (errorActions && errorActions.length > 0) {
            for (const errorAction of errorActions) {
                buttons.push({
                    label: errorAction.label,
                    run: () => errorAction
                });
            }
        }
        else {
            buttons.push({
                label: localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                run: () => undefined
            });
        }
        let cancelButton = undefined;
        if (buttons.length === 1) {
            cancelButton = {
                run: () => {
                    errorHandled = true;
                    return undefined;
                }
            };
        }
        let errorHandled = false;
        const { result } = await this.dialogService.prompt({
            type: severity,
            message,
            detail,
            buttons,
            cancelButton
        });
        if (result) {
            const errorActionResult = result.run();
            if (errorActionResult instanceof Promise) {
                errorActionResult.catch(error => this.dialogService.error(toErrorMessage(error)));
            }
            errorHandled = true;
        }
        return errorHandled;
    }
    async doOpenEditor(descriptor, editor, options, internalOptions, context = Object.create(null)) {
        const pane = this.doShowEditorPane(descriptor);
        const activeElement = getActiveElement();
        const { changed, cancelled } = await this.doSetInput(pane, editor, options, context);
        if (!cancelled) {
            const focus = !options || !options.preserveFocus;
            if (focus && this.shouldRestoreFocus(activeElement)) {
                pane.focus();
            }
            else if (!internalOptions?.preserveWindowOrder) {
                this.hostService.moveTop(getWindowById(this.groupView.windowId, true).window);
            }
        }
        return { pane, changed, cancelled };
    }
    shouldRestoreFocus(expectedActiveElement) {
        if (!this.layoutService.isRestored()) {
            return true;
        }
        if (!expectedActiveElement) {
            return true;
        }
        const activeElement = getActiveElement();
        if (!activeElement || activeElement === expectedActiveElement.ownerDocument.body) {
            return true;
        }
        const same = expectedActiveElement === activeElement;
        if (same) {
            return true;
        }
        if (!isEditableElement(activeElement)) {
            return true;
        }
        if (isAncestor(activeElement, this.editorGroupParent)) {
            return true;
        }
        return false;
    }
    getEditorPaneDescriptor(editor) {
        if (editor.hasCapability(16) && !this.workspaceTrustService.isWorkspaceTrusted()) {
            return WorkspaceTrustRequiredPlaceholderEditor.DESCRIPTOR;
        }
        return assertIsDefined(this.editorPanesRegistry.getEditorPane(editor));
    }
    doShowEditorPane(descriptor) {
        if (this._activeEditorPane && descriptor.describes(this._activeEditorPane)) {
            return this._activeEditorPane;
        }
        this.doHideActiveEditorPane();
        const editorPane = this.doCreateEditorPane(descriptor);
        this.doSetActiveEditorPane(editorPane);
        const container = assertIsDefined(editorPane.getContainer());
        this.editorPanesParent.appendChild(container);
        show(container);
        editorPane.setVisible(true);
        if (this.pagePosition) {
            editorPane.layout(new Dimension(this.pagePosition.width, this.pagePosition.height), { top: this.pagePosition.top, left: this.pagePosition.left });
        }
        if (this.boundarySashes) {
            editorPane.setBoundarySashes(this.boundarySashes);
        }
        return editorPane;
    }
    doCreateEditorPane(descriptor) {
        const editorPane = this.doInstantiateEditorPane(descriptor);
        if (!editorPane.getContainer()) {
            const editorPaneContainer = document.createElement('div');
            editorPaneContainer.classList.add('editor-instance');
            this.editorPanesParent.appendChild(editorPaneContainer);
            editorPane.create(editorPaneContainer);
        }
        return editorPane;
    }
    doInstantiateEditorPane(descriptor) {
        const existingEditorPane = this.editorPanes.find(editorPane => descriptor.describes(editorPane));
        if (existingEditorPane) {
            return existingEditorPane;
        }
        const editorPane = this._register(descriptor.instantiate(this.instantiationService, this.groupView));
        this.editorPanes.push(editorPane);
        return editorPane;
    }
    doSetActiveEditorPane(editorPane) {
        this._activeEditorPane = editorPane;
        this.activeEditorPaneDisposables.clear();
        if (editorPane) {
            this.activeEditorPaneDisposables.add(editorPane.onDidChangeSizeConstraints(e => this._onDidChangeSizeConstraints.fire(e)));
            this.activeEditorPaneDisposables.add(editorPane.onDidFocus(() => this._onDidFocus.fire()));
        }
        this._onDidChangeSizeConstraints.fire(undefined);
    }
    async doSetInput(editorPane, editor, options, context) {
        let inputMatches = editorPane.input?.matches(editor);
        if (inputMatches && !options?.forceReload) {
            if (this.mapEditorPaneToPendingSetInput.has(editorPane)) {
                await this.mapEditorPaneToPendingSetInput.get(editorPane);
            }
            inputMatches = editorPane.input?.matches(editor);
            if (inputMatches) {
                editorPane.setOptions(options);
            }
            return { changed: false, cancelled: !inputMatches };
        }
        const operation = this.editorOperation.start(this.layoutService.isRestored() ? 800 : 3200);
        let cancelled = false;
        try {
            editorPane.clearInput();
            const pendingSetInput = editorPane.setInput(editor, options, context, operation.token);
            this.mapEditorPaneToPendingSetInput.set(editorPane, pendingSetInput);
            await pendingSetInput;
            if (!operation.isCurrent()) {
                cancelled = true;
            }
        }
        catch (error) {
            if (!operation.isCurrent()) {
                cancelled = true;
            }
            else {
                throw error;
            }
        }
        finally {
            if (operation.isCurrent()) {
                this.mapEditorPaneToPendingSetInput.delete(editorPane);
            }
            operation.stop();
        }
        return { changed: !inputMatches, cancelled };
    }
    doHideActiveEditorPane() {
        if (!this._activeEditorPane) {
            return;
        }
        this.editorOperation.stop();
        this.safeRun(() => this._activeEditorPane?.clearInput());
        this.safeRun(() => this._activeEditorPane?.setVisible(false));
        this.mapEditorPaneToPendingSetInput.delete(this._activeEditorPane);
        const editorPaneContainer = this._activeEditorPane.getContainer();
        if (editorPaneContainer) {
            editorPaneContainer.remove();
            hide(editorPaneContainer);
        }
        this.doSetActiveEditorPane(null);
    }
    closeEditor(editor) {
        if (this._activeEditorPane?.input && editor.matches(this._activeEditorPane.input)) {
            this.doHideActiveEditorPane();
        }
    }
    setVisible(visible) {
        this.safeRun(() => this._activeEditorPane?.setVisible(visible));
    }
    layout(pagePosition) {
        this.pagePosition = pagePosition;
        this.safeRun(() => this._activeEditorPane?.layout(new Dimension(pagePosition.width, pagePosition.height), pagePosition));
    }
    setBoundarySashes(sashes) {
        this.boundarySashes = sashes;
        this.safeRun(() => this._activeEditorPane?.setBoundarySashes(sashes));
    }
    safeRun(fn) {
        try {
            fn();
        }
        catch (error) {
            this.logService.error(error);
        }
    }
};
EditorPanes = __decorate([
    __param(3, IWorkbenchLayoutService),
    __param(4, IInstantiationService),
    __param(5, IEditorProgressService),
    __param(6, IWorkspaceTrustManagementService),
    __param(7, ILogService),
    __param(8, IDialogService),
    __param(9, IHostService),
    __metadata("design:paramtypes", [HTMLElement,
        HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object])
], EditorPanes);
export { EditorPanes };
