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
var EditorPlaceholder_1, WorkspaceTrustRequiredPlaceholderEditor_1, ErrorPlaceholderEditor_1;
import './media/editorplaceholder.css';
import { localize } from '../../../../nls.js';
import { truncate, truncateMiddle } from '../../../../base/common/strings.js';
import Severity from '../../../../base/common/severity.js';
import { isEditorOpenError } from '../../../common/editor.js';
import { EditorPane } from './editorPane.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { DomScrollableElement } from '../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { size, clearNode, $, EventHelper } from '../../../../base/browser/dom.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { assertAllDefined } from '../../../../base/common/types.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, toWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { EditorOpenSource } from '../../../../platform/editor/common/editor.js';
import { computeEditorAriaLabel, EditorPaneDescriptor } from '../../editor.js';
import { ButtonBar } from '../../../../base/browser/ui/button/button.js';
import { defaultButtonStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { SimpleIconLabel } from '../../../../base/browser/ui/iconLabel/simpleIconLabel.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
let EditorPlaceholder = class EditorPlaceholder extends EditorPane {
    static { EditorPlaceholder_1 = this; }
    static { this.PLACEHOLDER_LABEL_MAX_LENGTH = 1024; }
    constructor(id, group, telemetryService, themeService, storageService) {
        super(id, group, telemetryService, themeService, storageService);
        this.inputDisposable = this._register(new MutableDisposable());
    }
    createEditor(parent) {
        this.container = document.createElement('div');
        this.container.className = 'monaco-editor-pane-placeholder';
        this.container.style.outline = 'none';
        this.container.tabIndex = 0;
        this.scrollbar = this._register(new DomScrollableElement(this.container, { horizontal: 1, vertical: 1 }));
        parent.appendChild(this.scrollbar.getDomNode());
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        if (token.isCancellationRequested) {
            return;
        }
        this.inputDisposable.value = await this.renderInput(input, options);
    }
    async renderInput(input, options) {
        const [container, scrollbar] = assertAllDefined(this.container, this.scrollbar);
        clearNode(container);
        const disposables = new DisposableStore();
        const { icon, label, actions } = await this.getContents(input, options, disposables);
        const truncatedLabel = truncate(label, EditorPlaceholder_1.PLACEHOLDER_LABEL_MAX_LENGTH);
        const iconContainer = container.appendChild($('.editor-placeholder-icon-container'));
        const iconWidget = disposables.add(new SimpleIconLabel(iconContainer));
        iconWidget.text = icon;
        const labelContainer = container.appendChild($('.editor-placeholder-label-container'));
        const labelWidget = document.createElement('span');
        labelWidget.textContent = truncatedLabel;
        labelContainer.appendChild(labelWidget);
        container.setAttribute('aria-label', `${computeEditorAriaLabel(input, undefined, this.group, undefined)}, ${truncatedLabel}`);
        if (actions.length) {
            const actionsContainer = container.appendChild($('.editor-placeholder-buttons-container'));
            const buttons = disposables.add(new ButtonBar(actionsContainer));
            for (let i = 0; i < actions.length; i++) {
                const button = disposables.add(buttons.addButton({
                    ...defaultButtonStyles,
                    secondary: i !== 0
                }));
                button.label = actions[i].label;
                disposables.add(button.onDidClick(e => {
                    if (e) {
                        EventHelper.stop(e, true);
                    }
                    actions[i].run();
                }));
            }
        }
        scrollbar.scanDomNode();
        return disposables;
    }
    clearInput() {
        if (this.container) {
            clearNode(this.container);
        }
        this.inputDisposable.clear();
        super.clearInput();
    }
    layout(dimension) {
        const [container, scrollbar] = assertAllDefined(this.container, this.scrollbar);
        size(container, dimension.width, dimension.height);
        scrollbar.scanDomNode();
        container.classList.toggle('max-height-200px', dimension.height <= 200);
    }
    focus() {
        super.focus();
        this.container?.focus();
    }
    dispose() {
        this.container?.remove();
        super.dispose();
    }
};
EditorPlaceholder = EditorPlaceholder_1 = __decorate([
    __param(2, ITelemetryService),
    __param(3, IThemeService),
    __param(4, IStorageService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object])
], EditorPlaceholder);
export { EditorPlaceholder };
let WorkspaceTrustRequiredPlaceholderEditor = class WorkspaceTrustRequiredPlaceholderEditor extends EditorPlaceholder {
    static { WorkspaceTrustRequiredPlaceholderEditor_1 = this; }
    static { this.ID = 'workbench.editors.workspaceTrustRequiredEditor'; }
    static { this.LABEL = localize('trustRequiredEditor', "Workspace Trust Required"); }
    static { this.DESCRIPTOR = EditorPaneDescriptor.create(WorkspaceTrustRequiredPlaceholderEditor_1, this.ID, this.LABEL); }
    constructor(group, telemetryService, themeService, commandService, workspaceService, storageService) {
        super(WorkspaceTrustRequiredPlaceholderEditor_1.ID, group, telemetryService, themeService, storageService);
        this.commandService = commandService;
        this.workspaceService = workspaceService;
    }
    getTitle() {
        return WorkspaceTrustRequiredPlaceholderEditor_1.LABEL;
    }
    async getContents() {
        return {
            icon: '$(workspace-untrusted)',
            label: isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceService.getWorkspace())) ?
                localize('requiresFolderTrustText', "The file is not displayed in the editor because trust has not been granted to the folder.") :
                localize('requiresWorkspaceTrustText', "The file is not displayed in the editor because trust has not been granted to the workspace."),
            actions: [
                {
                    label: localize('manageTrust', "Manage Workspace Trust"),
                    run: () => this.commandService.executeCommand('workbench.trust.manage')
                }
            ]
        };
    }
};
WorkspaceTrustRequiredPlaceholderEditor = WorkspaceTrustRequiredPlaceholderEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, ICommandService),
    __param(4, IWorkspaceContextService),
    __param(5, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], WorkspaceTrustRequiredPlaceholderEditor);
export { WorkspaceTrustRequiredPlaceholderEditor };
let ErrorPlaceholderEditor = class ErrorPlaceholderEditor extends EditorPlaceholder {
    static { ErrorPlaceholderEditor_1 = this; }
    static { this.ID = 'workbench.editors.errorEditor'; }
    static { this.LABEL = localize('errorEditor', "Error Editor"); }
    static { this.DESCRIPTOR = EditorPaneDescriptor.create(ErrorPlaceholderEditor_1, this.ID, this.LABEL); }
    constructor(group, telemetryService, themeService, storageService, fileService, dialogService) {
        super(ErrorPlaceholderEditor_1.ID, group, telemetryService, themeService, storageService);
        this.fileService = fileService;
        this.dialogService = dialogService;
    }
    async getContents(input, options, disposables) {
        const resource = input.resource;
        const error = options.error;
        const isFileNotFound = error?.fileOperationResult === 1;
        let label;
        if (isFileNotFound) {
            label = localize('unavailableResourceErrorEditorText', "The editor could not be opened because the file was not found.");
        }
        else if (isEditorOpenError(error) && error.forceMessage) {
            label = error.message;
        }
        else if (error) {
            label = localize('unknownErrorEditorTextWithError', "The editor could not be opened due to an unexpected error: {0}", truncateMiddle(toErrorMessage(error), EditorPlaceholder.PLACEHOLDER_LABEL_MAX_LENGTH / 2));
        }
        else {
            label = localize('unknownErrorEditorTextWithoutError', "The editor could not be opened due to an unexpected error.");
        }
        let icon = '$(error)';
        if (isEditorOpenError(error)) {
            if (error.forceSeverity === Severity.Info) {
                icon = '$(info)';
            }
            else if (error.forceSeverity === Severity.Warning) {
                icon = '$(warning)';
            }
        }
        let actions = undefined;
        if (isEditorOpenError(error) && error.actions.length > 0) {
            actions = error.actions.map(action => {
                return {
                    label: action.label,
                    run: () => {
                        const result = action.run();
                        if (result instanceof Promise) {
                            result.catch(error => this.dialogService.error(toErrorMessage(error)));
                        }
                    }
                };
            });
        }
        else {
            actions = [
                {
                    label: localize('retry', "Try Again"),
                    run: () => this.group.openEditor(input, { ...options, source: EditorOpenSource.USER })
                }
            ];
        }
        if (isFileNotFound && resource && this.fileService.hasProvider(resource)) {
            disposables.add(this.fileService.onDidFilesChange(e => {
                if (e.contains(resource, 1, 0)) {
                    this.group.openEditor(input, options);
                }
            }));
        }
        return { icon, label, actions: actions ?? [] };
    }
};
ErrorPlaceholderEditor = ErrorPlaceholderEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, IStorageService),
    __param(4, IFileService),
    __param(5, IDialogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ErrorPlaceholderEditor);
export { ErrorPlaceholderEditor };
