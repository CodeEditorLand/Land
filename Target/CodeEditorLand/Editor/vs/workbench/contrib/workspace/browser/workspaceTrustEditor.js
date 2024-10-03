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
var TrustedUriActionsColumnRenderer_1, TrustedUriPathColumnRenderer_1, TrustedUriHostColumnRenderer_1, WorkspaceTrustEditor_1;
import { $, addDisposableListener, addStandardDisposableListener, append, clearNode, EventHelper, EventType, isAncestorOfActiveElement } from '../../../../base/browser/dom.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { ButtonBar } from '../../../../base/browser/ui/button/button.js';
import { InputBox } from '../../../../base/browser/ui/inputbox/inputBox.js';
import { DomScrollableElement } from '../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { Action } from '../../../../base/common/actions.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { debounce } from '../../../../base/common/decorators.js';
import { Emitter } from '../../../../base/common/event.js';
import { normalizeDriveLetter } from '../../../../base/common/labels.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { parseLinkedText } from '../../../../base/common/linkedText.js';
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { WorkbenchTable } from '../../../../platform/list/browser/listService.js';
import { Link } from '../../../../platform/opener/browser/link.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { isVirtualResource, isVirtualWorkspace } from '../../../../platform/workspace/common/virtualWorkspace.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { asCssVariable, buttonBackground, buttonSecondaryBackground, editorErrorForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { IWorkspaceContextService, toWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { debugIconStartForeground } from '../../debug/browser/debugColors.js';
import { IExtensionsWorkbenchService, LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID } from '../../extensions/common/extensions.js';
import { IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { IExtensionManifestPropertiesService } from '../../../services/extensions/common/extensionManifestPropertiesService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { getExtensionDependencies } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { posix, win32 } from '../../../../base/common/path.js';
import { hasDriveLetter, toSlashes } from '../../../../base/common/extpath.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { defaultButtonStyles, defaultInputBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { basename, dirname } from '../../../../base/common/resources.js';
export const shieldIcon = registerIcon('workspace-trust-banner', Codicon.shield, localize('shieldIcon', 'Icon for workspace trust ion the banner.'));
const checkListIcon = registerIcon('workspace-trust-editor-check', Codicon.check, localize('checkListIcon', 'Icon for the checkmark in the workspace trust editor.'));
const xListIcon = registerIcon('workspace-trust-editor-cross', Codicon.x, localize('xListIcon', 'Icon for the cross in the workspace trust editor.'));
const folderPickerIcon = registerIcon('workspace-trust-editor-folder-picker', Codicon.folder, localize('folderPickerIcon', 'Icon for the pick folder icon in the workspace trust editor.'));
const editIcon = registerIcon('workspace-trust-editor-edit-folder', Codicon.edit, localize('editIcon', 'Icon for the edit folder icon in the workspace trust editor.'));
const removeIcon = registerIcon('workspace-trust-editor-remove-folder', Codicon.close, localize('removeIcon', 'Icon for the remove folder icon in the workspace trust editor.'));
let WorkspaceTrustedUrisTable = class WorkspaceTrustedUrisTable extends Disposable {
    constructor(container, instantiationService, workspaceService, workspaceTrustManagementService, uriService, labelService, fileDialogService) {
        super();
        this.container = container;
        this.instantiationService = instantiationService;
        this.workspaceService = workspaceService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.uriService = uriService;
        this.labelService = labelService;
        this.fileDialogService = fileDialogService;
        this._onDidAcceptEdit = this._register(new Emitter());
        this.onDidAcceptEdit = this._onDidAcceptEdit.event;
        this._onDidRejectEdit = this._register(new Emitter());
        this.onDidRejectEdit = this._onDidRejectEdit.event;
        this._onEdit = this._register(new Emitter());
        this.onEdit = this._onEdit.event;
        this._onDelete = this._register(new Emitter());
        this.onDelete = this._onDelete.event;
        this.descriptionElement = container.appendChild($('.workspace-trusted-folders-description'));
        const tableElement = container.appendChild($('.trusted-uris-table'));
        const addButtonBarElement = container.appendChild($('.trusted-uris-button-bar'));
        this.table = this.instantiationService.createInstance(WorkbenchTable, 'WorkspaceTrust', tableElement, new TrustedUriTableVirtualDelegate(), [
            {
                label: localize('hostColumnLabel', "Host"),
                tooltip: '',
                weight: 1,
                templateId: TrustedUriHostColumnRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
            {
                label: localize('pathColumnLabel', "Path"),
                tooltip: '',
                weight: 8,
                templateId: TrustedUriPathColumnRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
            {
                label: '',
                tooltip: '',
                weight: 1,
                minimumWidth: 75,
                maximumWidth: 75,
                templateId: TrustedUriActionsColumnRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
        ], [
            this.instantiationService.createInstance(TrustedUriHostColumnRenderer),
            this.instantiationService.createInstance(TrustedUriPathColumnRenderer, this),
            this.instantiationService.createInstance(TrustedUriActionsColumnRenderer, this, this.currentWorkspaceUri),
        ], {
            horizontalScrolling: false,
            alwaysConsumeMouseWheel: false,
            openOnSingleClick: false,
            multipleSelectionSupport: false,
            accessibilityProvider: {
                getAriaLabel: (item) => {
                    const hostLabel = getHostLabel(this.labelService, item);
                    if (hostLabel === undefined || hostLabel.length === 0) {
                        return localize('trustedFolderAriaLabel', "{0}, trusted", this.labelService.getUriLabel(item.uri));
                    }
                    return localize('trustedFolderWithHostAriaLabel', "{0} on {1}, trusted", this.labelService.getUriLabel(item.uri), hostLabel);
                },
                getWidgetAriaLabel: () => localize('trustedFoldersAndWorkspaces', "Trusted Folders & Workspaces")
            },
            identityProvider: {
                getId(element) {
                    return element.uri.toString();
                },
            }
        });
        this._register(this.table.onDidOpen(item => {
            if (item && item.element && !item.browserEvent?.defaultPrevented) {
                this.edit(item.element, true);
            }
        }));
        const buttonBar = this._register(new ButtonBar(addButtonBarElement));
        const addButton = this._register(buttonBar.addButton({ title: localize('addButton', "Add Folder"), ...defaultButtonStyles }));
        addButton.label = localize('addButton', "Add Folder");
        this._register(addButton.onDidClick(async () => {
            const uri = await this.fileDialogService.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: this.currentWorkspaceUri,
                openLabel: localize('trustUri', "Trust Folder"),
                title: localize('selectTrustedUri', "Select Folder To Trust")
            });
            if (uri) {
                this.workspaceTrustManagementService.setUrisTrust(uri, true);
            }
        }));
        this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => {
            this.updateTable();
        }));
    }
    getIndexOfTrustedUriEntry(item) {
        const index = this.trustedUriEntries.indexOf(item);
        if (index === -1) {
            for (let i = 0; i < this.trustedUriEntries.length; i++) {
                if (this.trustedUriEntries[i].uri === item.uri) {
                    return i;
                }
            }
        }
        return index;
    }
    selectTrustedUriEntry(item, focus = true) {
        const index = this.getIndexOfTrustedUriEntry(item);
        if (index !== -1) {
            if (focus) {
                this.table.domFocus();
                this.table.setFocus([index]);
            }
            this.table.setSelection([index]);
        }
    }
    get currentWorkspaceUri() {
        return this.workspaceService.getWorkspace().folders[0]?.uri || URI.file('/');
    }
    get trustedUriEntries() {
        const currentWorkspace = this.workspaceService.getWorkspace();
        const currentWorkspaceUris = currentWorkspace.folders.map(folder => folder.uri);
        if (currentWorkspace.configuration) {
            currentWorkspaceUris.push(currentWorkspace.configuration);
        }
        const entries = this.workspaceTrustManagementService.getTrustedUris().map(uri => {
            let relatedToCurrentWorkspace = false;
            for (const workspaceUri of currentWorkspaceUris) {
                relatedToCurrentWorkspace = relatedToCurrentWorkspace || this.uriService.extUri.isEqualOrParent(workspaceUri, uri);
            }
            return {
                uri,
                parentOfWorkspaceItem: relatedToCurrentWorkspace
            };
        });
        const sortedEntries = entries.sort((a, b) => {
            if (a.uri.scheme !== b.uri.scheme) {
                if (a.uri.scheme === Schemas.file) {
                    return -1;
                }
                if (b.uri.scheme === Schemas.file) {
                    return 1;
                }
            }
            const aIsWorkspace = a.uri.path.endsWith('.code-workspace');
            const bIsWorkspace = b.uri.path.endsWith('.code-workspace');
            if (aIsWorkspace !== bIsWorkspace) {
                if (aIsWorkspace) {
                    return 1;
                }
                if (bIsWorkspace) {
                    return -1;
                }
            }
            return a.uri.fsPath.localeCompare(b.uri.fsPath);
        });
        return sortedEntries;
    }
    layout() {
        this.table.layout((this.trustedUriEntries.length * TrustedUriTableVirtualDelegate.ROW_HEIGHT) + TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT, undefined);
    }
    updateTable() {
        const entries = this.trustedUriEntries;
        this.container.classList.toggle('empty', entries.length === 0);
        this.descriptionElement.innerText = entries.length ?
            localize('trustedFoldersDescription', "You trust the following folders, their subfolders, and workspace files.") :
            localize('noTrustedFoldersDescriptions', "You haven't trusted any folders or workspace files yet.");
        this.table.splice(0, Number.POSITIVE_INFINITY, this.trustedUriEntries);
        this.layout();
    }
    validateUri(path, item) {
        if (!item) {
            return null;
        }
        if (item.uri.scheme === 'vscode-vfs') {
            const segments = path.split(posix.sep).filter(s => s.length);
            if (segments.length === 0 && path.startsWith(posix.sep)) {
                return {
                    type: 2,
                    content: localize({ key: 'trustAll', comment: ['The {0} will be a host name where repositories are hosted.'] }, "You will trust all repositories on {0}.", getHostLabel(this.labelService, item))
                };
            }
            if (segments.length === 1) {
                return {
                    type: 2,
                    content: localize({ key: 'trustOrg', comment: ['The {0} will be an organization or user name.', 'The {1} will be a host name where repositories are hosted.'] }, "You will trust all repositories and forks under '{0}' on {1}.", segments[0], getHostLabel(this.labelService, item))
                };
            }
            if (segments.length > 2) {
                return {
                    type: 3,
                    content: localize('invalidTrust', "You cannot trust individual folders within a repository.", path)
                };
            }
        }
        return null;
    }
    acceptEdit(item, uri) {
        const trustedFolders = this.workspaceTrustManagementService.getTrustedUris();
        const index = trustedFolders.findIndex(u => this.uriService.extUri.isEqual(u, item.uri));
        if (index >= trustedFolders.length || index === -1) {
            trustedFolders.push(uri);
        }
        else {
            trustedFolders[index] = uri;
        }
        this.workspaceTrustManagementService.setTrustedUris(trustedFolders);
        this._onDidAcceptEdit.fire(item);
    }
    rejectEdit(item) {
        this._onDidRejectEdit.fire(item);
    }
    async delete(item) {
        this.table.focusNext();
        await this.workspaceTrustManagementService.setUrisTrust([item.uri], false);
        if (this.table.getFocus().length === 0) {
            this.table.focusLast();
        }
        this._onDelete.fire(item);
        this.table.domFocus();
    }
    async edit(item, usePickerIfPossible) {
        const canUseOpenDialog = item.uri.scheme === Schemas.file ||
            (item.uri.scheme === this.currentWorkspaceUri.scheme &&
                this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) &&
                !isVirtualResource(item.uri));
        if (canUseOpenDialog && usePickerIfPossible) {
            const uri = await this.fileDialogService.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: item.uri,
                openLabel: localize('trustUri', "Trust Folder"),
                title: localize('selectTrustedUri', "Select Folder To Trust")
            });
            if (uri) {
                this.acceptEdit(item, uri[0]);
            }
            else {
                this.rejectEdit(item);
            }
        }
        else {
            this.selectTrustedUriEntry(item);
            this._onEdit.fire(item);
        }
    }
};
WorkspaceTrustedUrisTable = __decorate([
    __param(1, IInstantiationService),
    __param(2, IWorkspaceContextService),
    __param(3, IWorkspaceTrustManagementService),
    __param(4, IUriIdentityService),
    __param(5, ILabelService),
    __param(6, IFileDialogService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object])
], WorkspaceTrustedUrisTable);
class TrustedUriTableVirtualDelegate {
    constructor() {
        this.headerRowHeight = TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT;
    }
    static { this.HEADER_ROW_HEIGHT = 30; }
    static { this.ROW_HEIGHT = 24; }
    getHeight(item) {
        return TrustedUriTableVirtualDelegate.ROW_HEIGHT;
    }
}
let TrustedUriActionsColumnRenderer = class TrustedUriActionsColumnRenderer {
    static { TrustedUriActionsColumnRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'actions'; }
    constructor(table, currentWorkspaceUri, uriService) {
        this.table = table;
        this.currentWorkspaceUri = currentWorkspaceUri;
        this.uriService = uriService;
        this.templateId = TrustedUriActionsColumnRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const element = container.appendChild($('.actions'));
        const actionBar = new ActionBar(element);
        return { actionBar };
    }
    renderElement(item, index, templateData, height) {
        templateData.actionBar.clear();
        const canUseOpenDialog = item.uri.scheme === Schemas.file ||
            (item.uri.scheme === this.currentWorkspaceUri.scheme &&
                this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) &&
                !isVirtualResource(item.uri));
        const actions = [];
        if (canUseOpenDialog) {
            actions.push(this.createPickerAction(item));
        }
        actions.push(this.createEditAction(item));
        actions.push(this.createDeleteAction(item));
        templateData.actionBar.push(actions, { icon: true });
    }
    createEditAction(item) {
        return {
            label: '',
            class: ThemeIcon.asClassName(editIcon),
            enabled: true,
            id: 'editTrustedUri',
            tooltip: localize('editTrustedUri', "Edit Path"),
            run: () => {
                this.table.edit(item, false);
            }
        };
    }
    createPickerAction(item) {
        return {
            label: '',
            class: ThemeIcon.asClassName(folderPickerIcon),
            enabled: true,
            id: 'pickerTrustedUri',
            tooltip: localize('pickerTrustedUri', "Open File Picker"),
            run: () => {
                this.table.edit(item, true);
            }
        };
    }
    createDeleteAction(item) {
        return {
            label: '',
            class: ThemeIcon.asClassName(removeIcon),
            enabled: true,
            id: 'deleteTrustedUri',
            tooltip: localize('deleteTrustedUri', "Delete Path"),
            run: async () => {
                await this.table.delete(item);
            }
        };
    }
    disposeTemplate(templateData) {
        templateData.actionBar.dispose();
    }
};
TrustedUriActionsColumnRenderer = TrustedUriActionsColumnRenderer_1 = __decorate([
    __param(2, IUriIdentityService),
    __metadata("design:paramtypes", [WorkspaceTrustedUrisTable,
        URI, Object])
], TrustedUriActionsColumnRenderer);
let TrustedUriPathColumnRenderer = class TrustedUriPathColumnRenderer {
    static { TrustedUriPathColumnRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'path'; }
    constructor(table, contextViewService) {
        this.table = table;
        this.contextViewService = contextViewService;
        this.templateId = TrustedUriPathColumnRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const element = container.appendChild($('.path'));
        const pathLabel = element.appendChild($('div.path-label'));
        const pathInput = new InputBox(element, this.contextViewService, {
            validationOptions: {
                validation: value => this.table.validateUri(value, this.currentItem)
            },
            inputBoxStyles: defaultInputBoxStyles
        });
        const disposables = new DisposableStore();
        const renderDisposables = disposables.add(new DisposableStore());
        return {
            element,
            pathLabel,
            pathInput,
            disposables,
            renderDisposables
        };
    }
    renderElement(item, index, templateData, height) {
        templateData.renderDisposables.clear();
        this.currentItem = item;
        templateData.renderDisposables.add(this.table.onEdit(async (e) => {
            if (item === e) {
                templateData.element.classList.add('input-mode');
                templateData.pathInput.focus();
                templateData.pathInput.select();
                templateData.element.parentElement.style.paddingLeft = '0px';
            }
        }));
        templateData.renderDisposables.add(addDisposableListener(templateData.pathInput.element, EventType.DBLCLICK, e => {
            EventHelper.stop(e);
        }));
        const hideInputBox = () => {
            templateData.element.classList.remove('input-mode');
            templateData.element.parentElement.style.paddingLeft = '5px';
        };
        const accept = () => {
            hideInputBox();
            const pathToUse = templateData.pathInput.value;
            const uri = hasDriveLetter(pathToUse) ? item.uri.with({ path: posix.sep + toSlashes(pathToUse) }) : item.uri.with({ path: pathToUse });
            templateData.pathLabel.innerText = this.formatPath(uri);
            if (uri) {
                this.table.acceptEdit(item, uri);
            }
        };
        const reject = () => {
            hideInputBox();
            templateData.pathInput.value = stringValue;
            this.table.rejectEdit(item);
        };
        templateData.renderDisposables.add(addStandardDisposableListener(templateData.pathInput.inputElement, EventType.KEY_DOWN, e => {
            let handled = false;
            if (e.equals(3)) {
                accept();
                handled = true;
            }
            else if (e.equals(9)) {
                reject();
                handled = true;
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        }));
        templateData.renderDisposables.add((addDisposableListener(templateData.pathInput.inputElement, EventType.BLUR, () => {
            reject();
        })));
        const stringValue = this.formatPath(item.uri);
        templateData.pathInput.value = stringValue;
        templateData.pathLabel.innerText = stringValue;
        templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
        templateData.renderDisposables.dispose();
    }
    formatPath(uri) {
        if (uri.scheme === Schemas.file) {
            return normalizeDriveLetter(uri.fsPath);
        }
        if (uri.path.startsWith(posix.sep)) {
            const pathWithoutLeadingSeparator = uri.path.substring(1);
            const isWindowsPath = hasDriveLetter(pathWithoutLeadingSeparator, true);
            if (isWindowsPath) {
                return normalizeDriveLetter(win32.normalize(pathWithoutLeadingSeparator), true);
            }
        }
        return uri.path;
    }
};
TrustedUriPathColumnRenderer = TrustedUriPathColumnRenderer_1 = __decorate([
    __param(1, IContextViewService),
    __metadata("design:paramtypes", [WorkspaceTrustedUrisTable, Object])
], TrustedUriPathColumnRenderer);
function getHostLabel(labelService, item) {
    return item.uri.authority ? labelService.getHostLabel(item.uri.scheme, item.uri.authority) : localize('localAuthority', "Local");
}
let TrustedUriHostColumnRenderer = class TrustedUriHostColumnRenderer {
    static { TrustedUriHostColumnRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'host'; }
    constructor(labelService) {
        this.labelService = labelService;
        this.templateId = TrustedUriHostColumnRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const disposables = new DisposableStore();
        const renderDisposables = disposables.add(new DisposableStore());
        const element = container.appendChild($('.host'));
        const hostContainer = element.appendChild($('div.host-label'));
        const buttonBarContainer = element.appendChild($('div.button-bar'));
        return {
            element,
            hostContainer,
            buttonBarContainer,
            disposables,
            renderDisposables
        };
    }
    renderElement(item, index, templateData, height) {
        templateData.renderDisposables.clear();
        templateData.renderDisposables.add({ dispose: () => { clearNode(templateData.buttonBarContainer); } });
        templateData.hostContainer.innerText = getHostLabel(this.labelService, item);
        templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
        templateData.hostContainer.style.display = '';
        templateData.buttonBarContainer.style.display = 'none';
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
    }
};
TrustedUriHostColumnRenderer = TrustedUriHostColumnRenderer_1 = __decorate([
    __param(0, ILabelService),
    __metadata("design:paramtypes", [Object])
], TrustedUriHostColumnRenderer);
let WorkspaceTrustEditor = class WorkspaceTrustEditor extends EditorPane {
    static { WorkspaceTrustEditor_1 = this; }
    static { this.ID = 'workbench.editor.workspaceTrust'; }
    constructor(group, telemetryService, themeService, storageService, workspaceService, extensionWorkbenchService, extensionManifestPropertiesService, instantiationService, workspaceTrustManagementService, configurationService, extensionEnablementService, productService, keybindingService) {
        super(WorkspaceTrustEditor_1.ID, group, telemetryService, themeService, storageService);
        this.workspaceService = workspaceService;
        this.extensionWorkbenchService = extensionWorkbenchService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.instantiationService = instantiationService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.configurationService = configurationService;
        this.extensionEnablementService = extensionEnablementService;
        this.productService = productService;
        this.keybindingService = keybindingService;
        this.rendering = false;
        this.rerenderDisposables = this._register(new DisposableStore());
        this.layoutParticipants = [];
    }
    createEditor(parent) {
        this.rootElement = append(parent, $('.workspace-trust-editor', { tabindex: '0' }));
        this.createHeaderElement(this.rootElement);
        const scrollableContent = $('.workspace-trust-editor-body');
        this.bodyScrollBar = this._register(new DomScrollableElement(scrollableContent, {
            horizontal: 2,
            vertical: 1,
        }));
        append(this.rootElement, this.bodyScrollBar.getDomNode());
        this.createAffectedFeaturesElement(scrollableContent);
        this.createConfigurationElement(scrollableContent);
        this.rootElement.style.setProperty('--workspace-trust-selected-color', asCssVariable(buttonBackground));
        this.rootElement.style.setProperty('--workspace-trust-unselected-color', asCssVariable(buttonSecondaryBackground));
        this.rootElement.style.setProperty('--workspace-trust-check-color', asCssVariable(debugIconStartForeground));
        this.rootElement.style.setProperty('--workspace-trust-x-color', asCssVariable(editorErrorForeground));
        this._register(addDisposableListener(this.rootElement, EventType.KEY_DOWN, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(16) || event.equals(18)) {
                const navOrder = [this.headerContainer, this.trustedContainer, this.untrustedContainer, this.configurationContainer];
                const currentIndex = navOrder.findIndex(element => {
                    return isAncestorOfActiveElement(element);
                });
                let newIndex = currentIndex;
                if (event.equals(18)) {
                    newIndex++;
                }
                else if (event.equals(16)) {
                    newIndex = Math.max(0, newIndex);
                    newIndex--;
                }
                newIndex += navOrder.length;
                newIndex %= navOrder.length;
                navOrder[newIndex].focus();
            }
            else if (event.equals(9)) {
                this.rootElement.focus();
            }
            else if (event.equals(2048 | 3)) {
                if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                    this.workspaceTrustManagementService.setWorkspaceTrust(!this.workspaceTrustManagementService.isWorkspaceTrusted());
                }
            }
            else if (event.equals(2048 | 1024 | 3)) {
                if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
                    this.workspaceTrustManagementService.setParentFolderTrust(true);
                }
            }
        }));
    }
    focus() {
        super.focus();
        this.rootElement.focus();
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        if (token.isCancellationRequested) {
            return;
        }
        await this.workspaceTrustManagementService.workspaceTrustInitialized;
        this.registerListeners();
        await this.render();
    }
    registerListeners() {
        this._register(this.extensionWorkbenchService.onChange(() => this.render()));
        this._register(this.configurationService.onDidChangeRestrictedSettings(() => this.render()));
        this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this.render()));
        this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => this.render()));
    }
    getHeaderContainerClass(trusted) {
        if (trusted) {
            return 'workspace-trust-header workspace-trust-trusted';
        }
        return 'workspace-trust-header workspace-trust-untrusted';
    }
    getHeaderTitleText(trusted) {
        if (trusted) {
            if (this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
                return localize('trustedUnsettableWindow', "This window is trusted");
            }
            switch (this.workspaceService.getWorkbenchState()) {
                case 1:
                    return localize('trustedHeaderWindow', "You trust this window");
                case 2:
                    return localize('trustedHeaderFolder', "You trust this folder");
                case 3:
                    return localize('trustedHeaderWorkspace', "You trust this workspace");
            }
        }
        return localize('untrustedHeader', "You are in Restricted Mode");
    }
    getHeaderTitleIconClassNames(trusted) {
        return ThemeIcon.asClassNameArray(shieldIcon);
    }
    getFeaturesHeaderText(trusted) {
        let title = '';
        let subTitle = '';
        switch (this.workspaceService.getWorkbenchState()) {
            case 1: {
                title = trusted ? localize('trustedWindow', "In a Trusted Window") : localize('untrustedWorkspace', "In Restricted Mode");
                subTitle = trusted ? localize('trustedWindowSubtitle', "You trust the authors of the files in the current window. All features are enabled:") :
                    localize('untrustedWindowSubtitle', "You do not trust the authors of the files in the current window. The following features are disabled:");
                break;
            }
            case 2: {
                title = trusted ? localize('trustedFolder', "In a Trusted Folder") : localize('untrustedWorkspace', "In Restricted Mode");
                subTitle = trusted ? localize('trustedFolderSubtitle', "You trust the authors of the files in the current folder. All features are enabled:") :
                    localize('untrustedFolderSubtitle', "You do not trust the authors of the files in the current folder. The following features are disabled:");
                break;
            }
            case 3: {
                title = trusted ? localize('trustedWorkspace', "In a Trusted Workspace") : localize('untrustedWorkspace', "In Restricted Mode");
                subTitle = trusted ? localize('trustedWorkspaceSubtitle', "You trust the authors of the files in the current workspace. All features are enabled:") :
                    localize('untrustedWorkspaceSubtitle', "You do not trust the authors of the files in the current workspace. The following features are disabled:");
                break;
            }
        }
        return [title, subTitle];
    }
    async render() {
        if (this.rendering) {
            return;
        }
        this.rendering = true;
        this.rerenderDisposables.clear();
        const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
        this.rootElement.classList.toggle('trusted', isWorkspaceTrusted);
        this.rootElement.classList.toggle('untrusted', !isWorkspaceTrusted);
        this.headerTitleText.innerText = this.getHeaderTitleText(isWorkspaceTrusted);
        this.headerTitleIcon.className = 'workspace-trust-title-icon';
        this.headerTitleIcon.classList.add(...this.getHeaderTitleIconClassNames(isWorkspaceTrusted));
        this.headerDescription.innerText = '';
        const headerDescriptionText = append(this.headerDescription, $('div'));
        headerDescriptionText.innerText = isWorkspaceTrusted ?
            localize('trustedDescription', "All features are enabled because trust has been granted to the workspace.") :
            localize('untrustedDescription', "{0} is in a restricted mode intended for safe code browsing.", this.productService.nameShort);
        const headerDescriptionActions = append(this.headerDescription, $('div'));
        const headerDescriptionActionsText = localize({ key: 'workspaceTrustEditorHeaderActions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[Configure your settings]({0}) or [learn more](https://aka.ms/vscode-workspace-trust).", `command:workbench.trust.configure`);
        for (const node of parseLinkedText(headerDescriptionActionsText).nodes) {
            if (typeof node === 'string') {
                append(headerDescriptionActions, document.createTextNode(node));
            }
            else {
                this.rerenderDisposables.add(this.instantiationService.createInstance(Link, headerDescriptionActions, { ...node, tabIndex: -1 }, {}));
            }
        }
        this.headerContainer.className = this.getHeaderContainerClass(isWorkspaceTrusted);
        this.rootElement.setAttribute('aria-label', `${localize('root element label', "Manage Workspace Trust")}:  ${this.headerContainer.innerText}`);
        const restrictedSettings = this.configurationService.restrictedSettings;
        const configurationRegistry = Registry.as(Extensions.Configuration);
        const settingsRequiringTrustedWorkspaceCount = restrictedSettings.default.filter(key => {
            const property = configurationRegistry.getConfigurationProperties()[key];
            if (property.scope === 1 || property.scope === 2) {
                return false;
            }
            if (property.deprecationMessage || property.markdownDeprecationMessage) {
                if (restrictedSettings.workspace?.includes(key)) {
                    return true;
                }
                if (restrictedSettings.workspaceFolder) {
                    for (const workspaceFolderSettings of restrictedSettings.workspaceFolder.values()) {
                        if (workspaceFolderSettings.includes(key)) {
                            return true;
                        }
                    }
                }
                return false;
            }
            return true;
        }).length;
        this.renderAffectedFeatures(settingsRequiringTrustedWorkspaceCount, this.getExtensionCount());
        this.workspaceTrustedUrisTable.updateTable();
        this.bodyScrollBar.getDomNode().style.height = `calc(100% - ${this.headerContainer.clientHeight}px)`;
        this.bodyScrollBar.scanDomNode();
        this.rendering = false;
    }
    getExtensionCount() {
        const set = new Set();
        const inVirtualWorkspace = isVirtualWorkspace(this.workspaceService.getWorkspace());
        const localExtensions = this.extensionWorkbenchService.local.filter(ext => ext.local).map(ext => ext.local);
        for (const extension of localExtensions) {
            const enablementState = this.extensionEnablementService.getEnablementState(extension);
            if (enablementState !== 9 && enablementState !== 10 &&
                enablementState !== 0 && enablementState !== 6) {
                continue;
            }
            if (inVirtualWorkspace && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) === false) {
                continue;
            }
            if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) !== true) {
                set.add(extension.identifier.id);
                continue;
            }
            const dependencies = getExtensionDependencies(localExtensions, extension);
            if (dependencies.some(ext => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === false)) {
                set.add(extension.identifier.id);
            }
        }
        return set.size;
    }
    createHeaderElement(parent) {
        this.headerContainer = append(parent, $('.workspace-trust-header', { tabIndex: '0' }));
        this.headerTitleContainer = append(this.headerContainer, $('.workspace-trust-title'));
        this.headerTitleIcon = append(this.headerTitleContainer, $('.workspace-trust-title-icon'));
        this.headerTitleText = append(this.headerTitleContainer, $('.workspace-trust-title-text'));
        this.headerDescription = append(this.headerContainer, $('.workspace-trust-description'));
    }
    createConfigurationElement(parent) {
        this.configurationContainer = append(parent, $('.workspace-trust-settings', { tabIndex: '0' }));
        const configurationTitle = append(this.configurationContainer, $('.workspace-trusted-folders-title'));
        configurationTitle.innerText = localize('trustedFoldersAndWorkspaces', "Trusted Folders & Workspaces");
        this.workspaceTrustedUrisTable = this._register(this.instantiationService.createInstance(WorkspaceTrustedUrisTable, this.configurationContainer));
    }
    createAffectedFeaturesElement(parent) {
        this.affectedFeaturesContainer = append(parent, $('.workspace-trust-features'));
        this.trustedContainer = append(this.affectedFeaturesContainer, $('.workspace-trust-limitations.trusted', { tabIndex: '0' }));
        this.untrustedContainer = append(this.affectedFeaturesContainer, $('.workspace-trust-limitations.untrusted', { tabIndex: '0' }));
    }
    async renderAffectedFeatures(numSettings, numExtensions) {
        clearNode(this.trustedContainer);
        clearNode(this.untrustedContainer);
        const [trustedTitle, trustedSubTitle] = this.getFeaturesHeaderText(true);
        this.renderLimitationsHeaderElement(this.trustedContainer, trustedTitle, trustedSubTitle);
        const trustedContainerItems = this.workspaceService.getWorkbenchState() === 1 ?
            [
                localize('trustedTasks', "Tasks are allowed to run"),
                localize('trustedDebugging', "Debugging is enabled"),
                localize('trustedExtensions', "All enabled extensions are activated")
            ] :
            [
                localize('trustedTasks', "Tasks are allowed to run"),
                localize('trustedDebugging', "Debugging is enabled"),
                localize('trustedSettings', "All workspace settings are applied"),
                localize('trustedExtensions', "All enabled extensions are activated")
            ];
        this.renderLimitationsListElement(this.trustedContainer, trustedContainerItems, ThemeIcon.asClassNameArray(checkListIcon));
        const [untrustedTitle, untrustedSubTitle] = this.getFeaturesHeaderText(false);
        this.renderLimitationsHeaderElement(this.untrustedContainer, untrustedTitle, untrustedSubTitle);
        const untrustedContainerItems = this.workspaceService.getWorkbenchState() === 1 ?
            [
                localize('untrustedTasks', "Tasks are not allowed to run"),
                localize('untrustedDebugging', "Debugging is disabled"),
                fixBadLocalizedLinks(localize({ key: 'untrustedExtensions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} extensions]({1}) are disabled or have limited functionality", numExtensions, `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
            ] :
            [
                localize('untrustedTasks', "Tasks are not allowed to run"),
                localize('untrustedDebugging', "Debugging is disabled"),
                fixBadLocalizedLinks(numSettings ? localize({ key: 'untrustedSettings', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} workspace settings]({1}) are not applied", numSettings, 'command:settings.filterUntrusted') : localize('no untrustedSettings', "Workspace settings requiring trust are not applied")),
                fixBadLocalizedLinks(localize({ key: 'untrustedExtensions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} extensions]({1}) are disabled or have limited functionality", numExtensions, `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
            ];
        this.renderLimitationsListElement(this.untrustedContainer, untrustedContainerItems, ThemeIcon.asClassNameArray(xListIcon));
        if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                this.addDontTrustButtonToElement(this.untrustedContainer);
            }
            else {
                this.addTrustedTextToElement(this.untrustedContainer);
            }
        }
        else {
            if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                this.addTrustButtonToElement(this.trustedContainer);
            }
        }
    }
    createButtonRow(parent, buttonInfo, enabled) {
        const buttonRow = append(parent, $('.workspace-trust-buttons-row'));
        const buttonContainer = append(buttonRow, $('.workspace-trust-buttons'));
        const buttonBar = this.rerenderDisposables.add(new ButtonBar(buttonContainer));
        for (const { action, keybinding } of buttonInfo) {
            const button = buttonBar.addButtonWithDescription(defaultButtonStyles);
            button.label = action.label;
            button.enabled = enabled !== undefined ? enabled : action.enabled;
            button.description = keybinding.getLabel();
            button.element.ariaLabel = action.label + ', ' + localize('keyboardShortcut', "Keyboard Shortcut: {0}", keybinding.getAriaLabel());
            this.rerenderDisposables.add(button.onDidClick(e => {
                if (e) {
                    EventHelper.stop(e, true);
                }
                action.run();
            }));
        }
    }
    addTrustButtonToElement(parent) {
        const trustAction = new Action('workspace.trust.button.action.grant', localize('trustButton', "Trust"), undefined, true, async () => {
            await this.workspaceTrustManagementService.setWorkspaceTrust(true);
        });
        const trustActions = [{ action: trustAction, keybinding: this.keybindingService.resolveUserBinding(isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter')[0] }];
        if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
            const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceService.getWorkspace());
            const name = basename(dirname(workspaceIdentifier.uri));
            const trustMessageElement = append(parent, $('.trust-message-box'));
            trustMessageElement.innerText = localize('trustMessage', "Trust the authors of all files in the current folder or its parent '{0}'.", name);
            const trustParentAction = new Action('workspace.trust.button.action.grantParent', localize('trustParentButton', "Trust Parent"), undefined, true, async () => {
                await this.workspaceTrustManagementService.setParentFolderTrust(true);
            });
            trustActions.push({ action: trustParentAction, keybinding: this.keybindingService.resolveUserBinding(isMacintosh ? 'Cmd+Shift+Enter' : 'Ctrl+Shift+Enter')[0] });
        }
        this.createButtonRow(parent, trustActions);
    }
    addDontTrustButtonToElement(parent) {
        this.createButtonRow(parent, [{
                action: new Action('workspace.trust.button.action.deny', localize('dontTrustButton', "Don't Trust"), undefined, true, async () => {
                    await this.workspaceTrustManagementService.setWorkspaceTrust(false);
                }),
                keybinding: this.keybindingService.resolveUserBinding(isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter')[0]
            }]);
    }
    addTrustedTextToElement(parent) {
        if (this.workspaceService.getWorkbenchState() === 1) {
            return;
        }
        const textElement = append(parent, $('.workspace-trust-untrusted-description'));
        if (!this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
            textElement.innerText = this.workspaceService.getWorkbenchState() === 3 ? localize('untrustedWorkspaceReason', "This workspace is trusted via the bolded entries in the trusted folders below.") : localize('untrustedFolderReason', "This folder is trusted via the bolded entries in the the trusted folders below.");
        }
        else {
            textElement.innerText = localize('trustedForcedReason', "This window is trusted by nature of the workspace that is opened.");
        }
    }
    renderLimitationsHeaderElement(parent, headerText, subtitleText) {
        const limitationsHeaderContainer = append(parent, $('.workspace-trust-limitations-header'));
        const titleElement = append(limitationsHeaderContainer, $('.workspace-trust-limitations-title'));
        const textElement = append(titleElement, $('.workspace-trust-limitations-title-text'));
        const subtitleElement = append(limitationsHeaderContainer, $('.workspace-trust-limitations-subtitle'));
        textElement.innerText = headerText;
        subtitleElement.innerText = subtitleText;
    }
    renderLimitationsListElement(parent, limitations, iconClassNames) {
        const listContainer = append(parent, $('.workspace-trust-limitations-list-container'));
        const limitationsList = append(listContainer, $('ul'));
        for (const limitation of limitations) {
            const limitationListItem = append(limitationsList, $('li'));
            const icon = append(limitationListItem, $('.list-item-icon'));
            const text = append(limitationListItem, $('.list-item-text'));
            icon.classList.add(...iconClassNames);
            const linkedText = parseLinkedText(limitation);
            for (const node of linkedText.nodes) {
                if (typeof node === 'string') {
                    append(text, document.createTextNode(node));
                }
                else {
                    this.rerenderDisposables.add(this.instantiationService.createInstance(Link, text, { ...node, tabIndex: -1 }, {}));
                }
            }
        }
    }
    layout(dimension) {
        if (!this.isVisible()) {
            return;
        }
        this.workspaceTrustedUrisTable.layout();
        this.layoutParticipants.forEach(participant => {
            participant.layout();
        });
        this.bodyScrollBar.scanDomNode();
    }
};
__decorate([
    debounce(100),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkspaceTrustEditor.prototype, "render", null);
WorkspaceTrustEditor = WorkspaceTrustEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, IStorageService),
    __param(4, IWorkspaceContextService),
    __param(5, IExtensionsWorkbenchService),
    __param(6, IExtensionManifestPropertiesService),
    __param(7, IInstantiationService),
    __param(8, IWorkspaceTrustManagementService),
    __param(9, IWorkbenchConfigurationService),
    __param(10, IWorkbenchExtensionEnablementService),
    __param(11, IProductService),
    __param(12, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WorkspaceTrustEditor);
export { WorkspaceTrustEditor };
function fixBadLocalizedLinks(badString) {
    const regex = /(.*)\[(.+)\]\s*\((.+)\)(.*)/;
    return badString.replace(regex, '$1[$2]($3)$4');
}
