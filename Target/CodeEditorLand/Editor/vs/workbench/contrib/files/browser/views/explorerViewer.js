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
var FilesRenderer_1, FileDragAndDrop_1;
import * as DOM from '../../../../../base/browser/dom.js';
import * as glob from '../../../../../base/common/glob.js';
import { IProgressService, } from '../../../../../platform/progress/common/progress.js';
import { INotificationService, Severity } from '../../../../../platform/notification/common/notification.js';
import { IFileService, FileKind } from '../../../../../platform/files/common/files.js';
import { IWorkbenchLayoutService } from '../../../../services/layout/browser/layoutService.js';
import { isTemporaryWorkspace, IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { Disposable, dispose, toDisposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ResourceLabels } from '../../../../browser/labels.js';
import { IContextMenuService, IContextViewService } from '../../../../../platform/contextview/browser/contextView.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { dirname, joinPath, distinctParents } from '../../../../../base/common/resources.js';
import { InputBox } from '../../../../../base/browser/ui/inputbox/inputBox.js';
import { localize } from '../../../../../nls.js';
import { createSingleCallFunction } from '../../../../../base/common/functional.js';
import { equals, deepClone } from '../../../../../base/common/objects.js';
import * as path from '../../../../../base/common/path.js';
import { ExplorerItem, NewExplorerItem } from '../../common/explorerModel.js';
import { compareFileExtensionsDefault, compareFileNamesDefault, compareFileNamesUpper, compareFileExtensionsUpper, compareFileNamesLower, compareFileExtensionsLower, compareFileNamesUnicode, compareFileExtensionsUnicode } from '../../../../../base/common/comparers.js';
import { CodeDataTransfers, containsDragType } from '../../../../../platform/dnd/browser/dnd.js';
import { fillEditorsDragData } from '../../../../browser/dnd.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { DataTransfers } from '../../../../../base/browser/dnd.js';
import { Schemas } from '../../../../../base/common/network.js';
import { NativeDragAndDropData, ExternalElementsDragAndDropData } from '../../../../../base/browser/ui/list/listView.js';
import { isMacintosh, isWeb } from '../../../../../base/common/platform.js';
import { IDialogService, getFileNamesMessage } from '../../../../../platform/dialogs/common/dialogs.js';
import { IWorkspaceEditingService } from '../../../../services/workspaces/common/workspaceEditing.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { findValidPasteFileTarget } from '../fileActions.js';
import { createMatches } from '../../../../../base/common/filters.js';
import { Emitter, Event, EventMultiplexer } from '../../../../../base/common/event.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { isNumber } from '../../../../../base/common/types.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { ResourceFileEdit } from '../../../../../editor/browser/services/bulkEditService.js';
import { IExplorerService } from '../files.js';
import { BrowserFileUpload, ExternalFileImport, getMultipleFilesOverwriteConfirm } from '../fileImportExport.js';
import { toErrorMessage } from '../../../../../base/common/errorMessage.js';
import { WebFileSystemAccess } from '../../../../../platform/files/browser/webFileSystemAccess.js';
import { IgnoreFile } from '../../../../services/search/common/ignoreFile.js';
import { ResourceSet } from '../../../../../base/common/map.js';
import { TernarySearchTree } from '../../../../../base/common/ternarySearchTree.js';
import { defaultInputBoxStyles } from '../../../../../platform/theme/browser/defaultStyles.js';
import { timeout } from '../../../../../base/common/async.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { mainWindow } from '../../../../../base/browser/window.js';
import { explorerFileContribRegistry } from '../explorerFileContrib.js';
export class ExplorerDelegate {
    static { this.ITEM_HEIGHT = 22; }
    getHeight(element) {
        return ExplorerDelegate.ITEM_HEIGHT;
    }
    getTemplateId(element) {
        return FilesRenderer.ID;
    }
}
export const explorerRootErrorEmitter = new Emitter();
let ExplorerDataSource = class ExplorerDataSource {
    constructor(fileFilter, progressService, configService, notificationService, layoutService, fileService, explorerService, contextService, filesConfigService) {
        this.fileFilter = fileFilter;
        this.progressService = progressService;
        this.configService = configService;
        this.notificationService = notificationService;
        this.layoutService = layoutService;
        this.fileService = fileService;
        this.explorerService = explorerService;
        this.contextService = contextService;
        this.filesConfigService = filesConfigService;
    }
    getParent(element) {
        const folders = this.contextService.getWorkspace().folders;
        const isMultiRoot = folders.length > 1;
        if (isMultiRoot) {
            // If we have multiple folders, the root is a workspace folder
            // Workspace folders are rendered and can be returned directly
            if (element.isRoot) {
                return element;
            }
            else if (element.parent) {
                return element.parent;
            }
        }
        else if (element.parent) {
            // If we have a single folder, the root the workspace folder
            // The workspace folder is not rendered, so all it's children are tree roots
            if (element.parent.isRoot) {
                return element;
            }
            else {
                return element.parent;
            }
        }
        throw new Error('getParent only supported for cached parents');
    }
    hasChildren(element) {
        // don't render nest parents as containing children when all the children are filtered out
        return Array.isArray(element) || element.hasChildren((stat) => this.fileFilter.filter(stat, 1 /* TreeVisibility.Visible */));
    }
    getChildren(element) {
        if (Array.isArray(element)) {
            return element;
        }
        const hasError = element.error;
        const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
        const children = element.fetchChildren(sortOrder);
        if (Array.isArray(children)) {
            // fast path when children are known sync (i.e. nested children)
            return children;
        }
        const promise = children.then(children => {
            // Clear previous error decoration on root folder
            if (element instanceof ExplorerItem && element.isRoot && !element.error && hasError && this.contextService.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */) {
                explorerRootErrorEmitter.fire(element.resource);
            }
            return children;
        }, e => {
            if (element instanceof ExplorerItem && element.isRoot) {
                if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    // Single folder create a dummy explorer item to show error
                    const placeholder = new ExplorerItem(element.resource, this.fileService, this.configService, this.filesConfigService, undefined, undefined, false);
                    placeholder.error = e;
                    return [placeholder];
                }
                else {
                    explorerRootErrorEmitter.fire(element.resource);
                }
            }
            else {
                // Do not show error for roots since we already use an explorer decoration to notify user
                this.notificationService.error(e);
            }
            return []; // we could not resolve any children because of an error
        });
        this.progressService.withProgress({
            location: 1 /* ProgressLocation.Explorer */,
            delay: this.layoutService.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
        }, _progress => promise);
        return promise;
    }
};
ExplorerDataSource = __decorate([
    __param(1, IProgressService),
    __param(2, IConfigurationService),
    __param(3, INotificationService),
    __param(4, IWorkbenchLayoutService),
    __param(5, IFileService),
    __param(6, IExplorerService),
    __param(7, IWorkspaceContextService),
    __param(8, IFilesConfigurationService),
    __metadata("design:paramtypes", [FilesFilter, Object, Object, Object, Object, Object, Object, Object, Object])
], ExplorerDataSource);
export { ExplorerDataSource };
export class CompressedNavigationController {
    static { this.ID = 0; }
    get index() { return this._index; }
    get count() { return this.items.length; }
    get current() { return this.items[this._index]; }
    get currentId() { return `${this.id}_${this.index}`; }
    get labels() { return this._labels; }
    constructor(id, items, templateData, depth, collapsed) {
        this.id = id;
        this.items = items;
        this.depth = depth;
        this.collapsed = collapsed;
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._index = items.length - 1;
        this.updateLabels(templateData);
        this._updateLabelDisposable = templateData.label.onDidRender(() => this.updateLabels(templateData));
    }
    updateLabels(templateData) {
        this._labels = Array.from(templateData.container.querySelectorAll('.label-name'));
        let parents = '';
        for (let i = 0; i < this.labels.length; i++) {
            const ariaLabel = parents.length ? `${this.items[i].name}, compact, ${parents}` : this.items[i].name;
            this.labels[i].setAttribute('aria-label', ariaLabel);
            this.labels[i].setAttribute('aria-level', `${this.depth + i}`);
            parents = parents.length ? `${this.items[i].name} ${parents}` : this.items[i].name;
        }
        this.updateCollapsed(this.collapsed);
        if (this._index < this.labels.length) {
            this.labels[this._index].classList.add('active');
        }
    }
    previous() {
        if (this._index <= 0) {
            return;
        }
        this.setIndex(this._index - 1);
    }
    next() {
        if (this._index >= this.items.length - 1) {
            return;
        }
        this.setIndex(this._index + 1);
    }
    first() {
        if (this._index === 0) {
            return;
        }
        this.setIndex(0);
    }
    last() {
        if (this._index === this.items.length - 1) {
            return;
        }
        this.setIndex(this.items.length - 1);
    }
    setIndex(index) {
        if (index < 0 || index >= this.items.length) {
            return;
        }
        this.labels[this._index].classList.remove('active');
        this._index = index;
        this.labels[this._index].classList.add('active');
        this._onDidChange.fire();
    }
    updateCollapsed(collapsed) {
        this.collapsed = collapsed;
        for (let i = 0; i < this.labels.length; i++) {
            this.labels[i].setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        }
    }
    dispose() {
        this._onDidChange.dispose();
        this._updateLabelDisposable.dispose();
    }
}
let FilesRenderer = class FilesRenderer {
    static { FilesRenderer_1 = this; }
    static { this.ID = 'file'; }
    constructor(container, labels, updateWidth, contextViewService, themeService, configurationService, explorerService, labelService, contextService, contextMenuService, instantiationService) {
        this.labels = labels;
        this.updateWidth = updateWidth;
        this.contextViewService = contextViewService;
        this.themeService = themeService;
        this.configurationService = configurationService;
        this.explorerService = explorerService;
        this.labelService = labelService;
        this.contextService = contextService;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this.compressedNavigationControllers = new Map();
        this._onDidChangeActiveDescendant = new EventMultiplexer();
        this.onDidChangeActiveDescendant = this._onDidChangeActiveDescendant.event;
        this.config = this.configurationService.getValue();
        const updateOffsetStyles = () => {
            const indent = this.configurationService.getValue('workbench.tree.indent');
            const offset = Math.max(22 - indent, 0); // derived via inspection
            container.style.setProperty(`--vscode-explorer-align-offset-margin-left`, `${offset}px`);
        };
        this.configListener = this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('explorer')) {
                this.config = this.configurationService.getValue();
            }
            if (e.affectsConfiguration('workbench.tree.indent')) {
                updateOffsetStyles();
            }
        });
        updateOffsetStyles();
    }
    getWidgetAriaLabel() {
        return localize('treeAriaLabel', "Files Explorer");
    }
    get templateId() {
        return FilesRenderer_1.ID;
    }
    renderTemplate(container) {
        const templateDisposables = new DisposableStore();
        const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true }));
        templateDisposables.add(label.onDidRender(() => {
            try {
                if (templateData.currentContext) {
                    this.updateWidth(templateData.currentContext);
                }
            }
            catch (e) {
                // noop since the element might no longer be in the tree, no update of width necessary
            }
        }));
        const contribs = explorerFileContribRegistry.create(this.instantiationService, container, templateDisposables);
        templateDisposables.add(explorerFileContribRegistry.onDidRegisterDescriptor(d => {
            const contr = d.create(this.instantiationService, container);
            contribs.push(templateDisposables.add(contr));
            contr.setResource(templateData.currentContext?.resource);
        }));
        const templateData = { templateDisposables, elementDisposables: templateDisposables.add(new DisposableStore()), label, container, contribs };
        return templateData;
    }
    renderElement(node, index, templateData) {
        const stat = node.element;
        templateData.currentContext = stat;
        const editableData = this.explorerService.getEditableData(stat);
        templateData.label.element.classList.remove('compressed');
        // File Label
        if (!editableData) {
            templateData.label.element.style.display = 'flex';
            this.renderStat(stat, stat.name, undefined, node.filterData, templateData);
        }
        // Input Box
        else {
            templateData.label.element.style.display = 'none';
            templateData.contribs.forEach(c => c.setResource(undefined));
            templateData.elementDisposables.add(this.renderInputBox(templateData.container, stat, editableData));
        }
    }
    renderCompressedElements(node, index, templateData, height) {
        const stat = node.element.elements[node.element.elements.length - 1];
        templateData.currentContext = stat;
        const editable = node.element.elements.filter(e => this.explorerService.isEditable(e));
        const editableData = editable.length === 0 ? undefined : this.explorerService.getEditableData(editable[0]);
        // File Label
        if (!editableData) {
            templateData.label.element.classList.add('compressed');
            templateData.label.element.style.display = 'flex';
            const id = `compressed-explorer_${CompressedNavigationController.ID++}`;
            const label = node.element.elements.map(e => e.name);
            this.renderStat(stat, label, id, node.filterData, templateData);
            const compressedNavigationController = new CompressedNavigationController(id, node.element.elements, templateData, node.depth, node.collapsed);
            templateData.elementDisposables.add(compressedNavigationController);
            const nodeControllers = this.compressedNavigationControllers.get(stat) ?? [];
            this.compressedNavigationControllers.set(stat, [...nodeControllers, compressedNavigationController]);
            // accessibility
            templateData.elementDisposables.add(this._onDidChangeActiveDescendant.add(compressedNavigationController.onDidChange));
            templateData.elementDisposables.add(DOM.addDisposableListener(templateData.container, 'mousedown', e => {
                const result = getIconLabelNameFromHTMLElement(e.target);
                if (result) {
                    compressedNavigationController.setIndex(result.index);
                }
            }));
            templateData.elementDisposables.add(toDisposable(() => {
                const nodeControllers = this.compressedNavigationControllers.get(stat) ?? [];
                const renderedIndex = nodeControllers.findIndex(controller => controller === compressedNavigationController);
                if (renderedIndex < 0) {
                    throw new Error('Disposing unknown navigation controller');
                }
                if (nodeControllers.length === 1) {
                    this.compressedNavigationControllers.delete(stat);
                }
                else {
                    nodeControllers.splice(renderedIndex, 1);
                }
            }));
        }
        // Input Box
        else {
            templateData.label.element.classList.remove('compressed');
            templateData.label.element.style.display = 'none';
            templateData.contribs.forEach(c => c.setResource(undefined));
            templateData.elementDisposables.add(this.renderInputBox(templateData.container, editable[0], editableData));
        }
    }
    renderStat(stat, label, domId, filterData, templateData) {
        templateData.label.element.style.display = 'flex';
        const extraClasses = ['explorer-item'];
        if (this.explorerService.isCut(stat)) {
            extraClasses.push('cut');
        }
        // Offset nested children unless folders have both chevrons and icons, otherwise alignment breaks
        const theme = this.themeService.getFileIconTheme();
        // Hack to always render chevrons for file nests, or else may not be able to identify them.
        const twistieContainer = templateData.container.parentElement?.parentElement?.querySelector('.monaco-tl-twistie');
        twistieContainer?.classList.toggle('force-twistie', stat.hasNests && theme.hidesExplorerArrows);
        // when explorer arrows are hidden or there are no folder icons, nests get misaligned as they are forced to have arrows and files typically have icons
        // Apply some CSS magic to get things looking as reasonable as possible.
        const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
        const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
        templateData.contribs.forEach(c => c.setResource(stat.resource));
        templateData.label.setResource({ resource: stat.resource, name: label }, {
            fileKind: stat.isRoot ? FileKind.ROOT_FOLDER : stat.isDirectory ? FileKind.FOLDER : FileKind.FILE,
            extraClasses: realignNestedChildren ? [...extraClasses, 'align-nest-icon-with-parent-icon'] : extraClasses,
            fileDecorations: this.config.explorer.decorations,
            matches: stat.isDirectory ? [] : createMatches(filterData),
            separator: this.labelService.getSeparator(stat.resource.scheme, stat.resource.authority),
            domId
        });
    }
    renderInputBox(container, stat, editableData) {
        // Use a file label only for the icon next to the input box
        const label = this.labels.create(container);
        const extraClasses = ['explorer-item', 'explorer-item-edited'];
        const fileKind = stat.isRoot ? FileKind.ROOT_FOLDER : stat.isDirectory ? FileKind.FOLDER : FileKind.FILE;
        const theme = this.themeService.getFileIconTheme();
        const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
        const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
        const labelOptions = {
            hidePath: true,
            hideLabel: true,
            fileKind,
            extraClasses: realignNestedChildren ? [...extraClasses, 'align-nest-icon-with-parent-icon'] : extraClasses,
        };
        const parent = stat.name ? dirname(stat.resource) : stat.resource;
        const value = stat.name || '';
        label.setFile(joinPath(parent, value || ' '), labelOptions); // Use icon for ' ' if name is empty.
        // hack: hide label
        label.element.firstElementChild.style.display = 'none';
        // Input field for name
        const inputBox = new InputBox(label.element, this.contextViewService, {
            validationOptions: {
                validation: (value) => {
                    const message = editableData.validationMessage(value);
                    if (!message || message.severity !== Severity.Error) {
                        return null;
                    }
                    return {
                        content: message.content,
                        formatContent: true,
                        type: 3 /* MessageType.ERROR */
                    };
                }
            },
            ariaLabel: localize('fileInputAriaLabel', "Type file name. Press Enter to confirm or Escape to cancel."),
            inputBoxStyles: defaultInputBoxStyles
        });
        const lastDot = value.lastIndexOf('.');
        let currentSelectionState = 'prefix';
        inputBox.value = value;
        inputBox.focus();
        inputBox.select({ start: 0, end: lastDot > 0 && !stat.isDirectory ? lastDot : value.length });
        const done = createSingleCallFunction((success, finishEditing) => {
            label.element.style.display = 'none';
            const value = inputBox.value;
            dispose(toDispose);
            label.element.remove();
            if (finishEditing) {
                editableData.onFinish(value, success);
            }
        });
        const showInputBoxNotification = () => {
            if (inputBox.isInputValid()) {
                const message = editableData.validationMessage(inputBox.value);
                if (message) {
                    inputBox.showMessage({
                        content: message.content,
                        formatContent: true,
                        type: message.severity === Severity.Info ? 1 /* MessageType.INFO */ : message.severity === Severity.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */
                    });
                }
                else {
                    inputBox.hideMessage();
                }
            }
        };
        showInputBoxNotification();
        const toDispose = [
            inputBox,
            inputBox.onDidChange(value => {
                label.setFile(joinPath(parent, value || ' '), labelOptions); // update label icon while typing!
            }),
            DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => {
                if (e.equals(60 /* KeyCode.F2 */)) {
                    const dotIndex = inputBox.value.lastIndexOf('.');
                    if (stat.isDirectory || dotIndex === -1) {
                        return;
                    }
                    if (currentSelectionState === 'prefix') {
                        currentSelectionState = 'all';
                        inputBox.select({ start: 0, end: inputBox.value.length });
                    }
                    else if (currentSelectionState === 'all') {
                        currentSelectionState = 'suffix';
                        inputBox.select({ start: dotIndex + 1, end: inputBox.value.length });
                    }
                    else {
                        currentSelectionState = 'prefix';
                        inputBox.select({ start: 0, end: dotIndex });
                    }
                }
                else if (e.equals(3 /* KeyCode.Enter */)) {
                    if (!inputBox.validate()) {
                        done(true, true);
                    }
                }
                else if (e.equals(9 /* KeyCode.Escape */)) {
                    done(false, true);
                }
            }),
            DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_UP, (e) => {
                showInputBoxNotification();
            }),
            DOM.addDisposableListener(inputBox.inputElement, DOM.EventType.BLUR, async () => {
                while (true) {
                    await timeout(0);
                    const ownerDocument = inputBox.inputElement.ownerDocument;
                    if (!ownerDocument.hasFocus()) {
                        break;
                    }
                    if (DOM.isActiveElement(inputBox.inputElement)) {
                        return;
                    }
                    else if (DOM.isHTMLElement(ownerDocument.activeElement) && DOM.hasParentWithClass(ownerDocument.activeElement, 'context-view')) {
                        await Event.toPromise(this.contextMenuService.onDidHideContextMenu);
                    }
                    else {
                        break;
                    }
                }
                done(inputBox.isInputValid(), true);
            }),
            label
        ];
        return toDisposable(() => {
            done(false, false);
        });
    }
    disposeElement(element, index, templateData) {
        templateData.currentContext = undefined;
        templateData.elementDisposables.clear();
    }
    disposeCompressedElements(node, index, templateData) {
        templateData.currentContext = undefined;
        templateData.elementDisposables.clear();
    }
    disposeTemplate(templateData) {
        templateData.templateDisposables.dispose();
    }
    getCompressedNavigationController(stat) {
        return this.compressedNavigationControllers.get(stat);
    }
    // IAccessibilityProvider
    getAriaLabel(element) {
        return element.name;
    }
    getAriaLevel(element) {
        // We need to comput aria level on our own since children of compact folders will otherwise have an incorrect level	#107235
        let depth = 0;
        let parent = element.parent;
        while (parent) {
            parent = parent.parent;
            depth++;
        }
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            depth = depth + 1;
        }
        return depth;
    }
    getActiveDescendantId(stat) {
        return this.compressedNavigationControllers.get(stat)?.[0]?.currentId ?? undefined;
    }
    dispose() {
        this.configListener.dispose();
    }
};
FilesRenderer = FilesRenderer_1 = __decorate([
    __param(3, IContextViewService),
    __param(4, IThemeService),
    __param(5, IConfigurationService),
    __param(6, IExplorerService),
    __param(7, ILabelService),
    __param(8, IWorkspaceContextService),
    __param(9, IContextMenuService),
    __param(10, IInstantiationService),
    __metadata("design:paramtypes", [HTMLElement,
        ResourceLabels, Function, Object, Object, Object, Object, Object, Object, Object, Object])
], FilesRenderer);
export { FilesRenderer };
/**
 * Respects files.exclude setting in filtering out content from the explorer.
 * Makes sure that visible editors are always shown in the explorer even if they are filtered out by settings.
 */
let FilesFilter = class FilesFilter {
    constructor(contextService, configurationService, explorerService, editorService, uriIdentityService, fileService) {
        this.contextService = contextService;
        this.configurationService = configurationService;
        this.explorerService = explorerService;
        this.editorService = editorService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.hiddenExpressionPerRoot = new Map();
        this.editorsAffectingFilter = new Set();
        this._onDidChange = new Emitter();
        this.toDispose = [];
        // List of ignoreFile resources. Used to detect changes to the ignoreFiles.
        this.ignoreFileResourcesPerRoot = new Map();
        // Ignore tree per root. Similar to `hiddenExpressionPerRoot`
        // Note: URI in the ternary search tree is the URI of the folder containing the ignore file
        // It is not the ignore file itself. This is because of the way the IgnoreFile works and nested paths
        this.ignoreTreesPerRoot = new Map();
        this.toDispose.push(this.contextService.onDidChangeWorkspaceFolders(() => this.updateConfiguration()));
        this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('files.exclude') || e.affectsConfiguration('explorer.excludeGitIgnore')) {
                this.updateConfiguration();
            }
        }));
        this.toDispose.push(this.fileService.onDidFilesChange(e => {
            // Check to see if the update contains any of the ignoreFileResources
            for (const [root, ignoreFileResourceSet] of this.ignoreFileResourcesPerRoot.entries()) {
                ignoreFileResourceSet.forEach(async (ignoreResource) => {
                    if (e.contains(ignoreResource, 0 /* FileChangeType.UPDATED */)) {
                        await this.processIgnoreFile(root, ignoreResource, true);
                    }
                    if (e.contains(ignoreResource, 2 /* FileChangeType.DELETED */)) {
                        this.ignoreTreesPerRoot.get(root)?.delete(dirname(ignoreResource));
                        ignoreFileResourceSet.delete(ignoreResource);
                        this._onDidChange.fire();
                    }
                });
            }
        }));
        this.toDispose.push(this.editorService.onDidVisibleEditorsChange(() => {
            const editors = this.editorService.visibleEditors;
            let shouldFire = false;
            for (const e of editors) {
                if (!e.resource) {
                    continue;
                }
                const stat = this.explorerService.findClosest(e.resource);
                if (stat && stat.isExcluded) {
                    // A filtered resource suddenly became visible since user opened an editor
                    shouldFire = true;
                    break;
                }
            }
            for (const e of this.editorsAffectingFilter) {
                if (!editors.includes(e)) {
                    // Editor that was affecting filtering is no longer visible
                    shouldFire = true;
                    break;
                }
            }
            if (shouldFire) {
                this.editorsAffectingFilter.clear();
                this._onDidChange.fire();
            }
        }));
        this.updateConfiguration();
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    updateConfiguration() {
        let shouldFire = false;
        let updatedGitIgnoreSetting = false;
        this.contextService.getWorkspace().folders.forEach(folder => {
            const configuration = this.configurationService.getValue({ resource: folder.uri });
            const excludesConfig = configuration?.files?.exclude || Object.create(null);
            const parseIgnoreFile = configuration.explorer.excludeGitIgnore;
            // If we should be parsing ignoreFiles for this workspace and don't have an ignore tree initialize one
            if (parseIgnoreFile && !this.ignoreTreesPerRoot.has(folder.uri.toString())) {
                updatedGitIgnoreSetting = true;
                this.ignoreFileResourcesPerRoot.set(folder.uri.toString(), new ResourceSet());
                this.ignoreTreesPerRoot.set(folder.uri.toString(), TernarySearchTree.forUris((uri) => this.uriIdentityService.extUri.ignorePathCasing(uri)));
            }
            // If we shouldn't be parsing ignore files but have an ignore tree, clear the ignore tree
            if (!parseIgnoreFile && this.ignoreTreesPerRoot.has(folder.uri.toString())) {
                updatedGitIgnoreSetting = true;
                this.ignoreFileResourcesPerRoot.delete(folder.uri.toString());
                this.ignoreTreesPerRoot.delete(folder.uri.toString());
            }
            if (!shouldFire) {
                const cached = this.hiddenExpressionPerRoot.get(folder.uri.toString());
                shouldFire = !cached || !equals(cached.original, excludesConfig);
            }
            const excludesConfigCopy = deepClone(excludesConfig); // do not keep the config, as it gets mutated under our hoods
            this.hiddenExpressionPerRoot.set(folder.uri.toString(), { original: excludesConfigCopy, parsed: glob.parse(excludesConfigCopy) });
        });
        if (shouldFire || updatedGitIgnoreSetting) {
            this.editorsAffectingFilter.clear();
            this._onDidChange.fire();
        }
    }
    /**
     * Given a .gitignore file resource, processes the resource and adds it to the ignore tree which hides explorer items
     * @param root The root folder of the workspace as a string. Used for lookup key for ignore tree and resource list
     * @param ignoreFileResource The resource of the .gitignore file
     * @param update Whether or not we're updating an existing ignore file. If true it deletes the old entry
     */
    async processIgnoreFile(root, ignoreFileResource, update) {
        // Get the name of the directory which the ignore file is in
        const dirUri = dirname(ignoreFileResource);
        const ignoreTree = this.ignoreTreesPerRoot.get(root);
        if (!ignoreTree) {
            return;
        }
        // Don't process a directory if we already have it in the tree
        if (!update && ignoreTree.has(dirUri)) {
            return;
        }
        // Maybe we need a cancellation token here in case it's super long?
        const content = await this.fileService.readFile(ignoreFileResource);
        // If it's just an update we update the contents keeping all references the same
        if (update) {
            const ignoreFile = ignoreTree.get(dirUri);
            ignoreFile?.updateContents(content.value.toString());
        }
        else {
            // Otherwise we create a new ignorefile and add it to the tree
            const ignoreParent = ignoreTree.findSubstr(dirUri);
            const ignoreFile = new IgnoreFile(content.value.toString(), dirUri.path, ignoreParent);
            ignoreTree.set(dirUri, ignoreFile);
            // If we haven't seen this resource before then we need to add it to the list of resources we're tracking
            if (!this.ignoreFileResourcesPerRoot.get(root)?.has(ignoreFileResource)) {
                this.ignoreFileResourcesPerRoot.get(root)?.add(ignoreFileResource);
            }
        }
        // Notify the explorer of the change so we may ignore these files
        this._onDidChange.fire();
    }
    filter(stat, parentVisibility) {
        // Add newly visited .gitignore files to the ignore tree
        if (stat.name === '.gitignore' && this.ignoreTreesPerRoot.has(stat.root.resource.toString())) {
            this.processIgnoreFile(stat.root.resource.toString(), stat.resource, false);
            return true;
        }
        return this.isVisible(stat, parentVisibility);
    }
    isVisible(stat, parentVisibility) {
        stat.isExcluded = false;
        if (parentVisibility === 0 /* TreeVisibility.Hidden */) {
            stat.isExcluded = true;
            return false;
        }
        if (this.explorerService.getEditableData(stat)) {
            return true; // always visible
        }
        // Hide those that match Hidden Patterns
        const cached = this.hiddenExpressionPerRoot.get(stat.root.resource.toString());
        const globMatch = cached?.parsed(path.relative(stat.root.resource.path, stat.resource.path), stat.name, name => !!(stat.parent && stat.parent.getChild(name)));
        // Small optimization to only traverse gitIgnore if the globMatch from fileExclude returned nothing
        const ignoreFile = globMatch ? undefined : this.ignoreTreesPerRoot.get(stat.root.resource.toString())?.findSubstr(stat.resource);
        const isIncludedInTraversal = ignoreFile?.isPathIncludedInTraversal(stat.resource.path, stat.isDirectory);
        // Doing !undefined returns true and we want it to be false when undefined because that means it's not included in the ignore file
        const isIgnoredByIgnoreFile = isIncludedInTraversal === undefined ? false : !isIncludedInTraversal;
        if (isIgnoredByIgnoreFile || globMatch || stat.parent?.isExcluded) {
            stat.isExcluded = true;
            const editors = this.editorService.visibleEditors;
            const editor = editors.find(e => e.resource && this.uriIdentityService.extUri.isEqualOrParent(e.resource, stat.resource));
            if (editor && stat.root === this.explorerService.findClosestRoot(stat.resource)) {
                this.editorsAffectingFilter.add(editor);
                return true; // Show all opened files and their parents
            }
            return false; // hidden through pattern
        }
        return true;
    }
    dispose() {
        dispose(this.toDispose);
    }
};
FilesFilter = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IConfigurationService),
    __param(2, IExplorerService),
    __param(3, IEditorService),
    __param(4, IUriIdentityService),
    __param(5, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], FilesFilter);
export { FilesFilter };
// Explorer Sorter
let FileSorter = class FileSorter {
    constructor(explorerService, contextService) {
        this.explorerService = explorerService;
        this.contextService = contextService;
    }
    compare(statA, statB) {
        // Do not sort roots
        if (statA.isRoot) {
            if (statB.isRoot) {
                const workspaceA = this.contextService.getWorkspaceFolder(statA.resource);
                const workspaceB = this.contextService.getWorkspaceFolder(statB.resource);
                return workspaceA && workspaceB ? (workspaceA.index - workspaceB.index) : -1;
            }
            return -1;
        }
        if (statB.isRoot) {
            return 1;
        }
        const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
        const lexicographicOptions = this.explorerService.sortOrderConfiguration.lexicographicOptions;
        const reverse = this.explorerService.sortOrderConfiguration.reverse;
        if (reverse) {
            [statA, statB] = [statB, statA];
        }
        let compareFileNames;
        let compareFileExtensions;
        switch (lexicographicOptions) {
            case 'upper':
                compareFileNames = compareFileNamesUpper;
                compareFileExtensions = compareFileExtensionsUpper;
                break;
            case 'lower':
                compareFileNames = compareFileNamesLower;
                compareFileExtensions = compareFileExtensionsLower;
                break;
            case 'unicode':
                compareFileNames = compareFileNamesUnicode;
                compareFileExtensions = compareFileExtensionsUnicode;
                break;
            default:
                // 'default'
                compareFileNames = compareFileNamesDefault;
                compareFileExtensions = compareFileExtensionsDefault;
        }
        // Sort Directories
        switch (sortOrder) {
            case 'type':
                if (statA.isDirectory && !statB.isDirectory) {
                    return -1;
                }
                if (statB.isDirectory && !statA.isDirectory) {
                    return 1;
                }
                if (statA.isDirectory && statB.isDirectory) {
                    return compareFileNames(statA.name, statB.name);
                }
                break;
            case 'filesFirst':
                if (statA.isDirectory && !statB.isDirectory) {
                    return 1;
                }
                if (statB.isDirectory && !statA.isDirectory) {
                    return -1;
                }
                break;
            case 'foldersNestsFiles':
                if (statA.isDirectory && !statB.isDirectory) {
                    return -1;
                }
                if (statB.isDirectory && !statA.isDirectory) {
                    return 1;
                }
                if (statA.hasNests && !statB.hasNests) {
                    return -1;
                }
                if (statB.hasNests && !statA.hasNests) {
                    return 1;
                }
                break;
            case 'mixed':
                break; // not sorting when "mixed" is on
            default: /* 'default', 'modified' */
                if (statA.isDirectory && !statB.isDirectory) {
                    return -1;
                }
                if (statB.isDirectory && !statA.isDirectory) {
                    return 1;
                }
                break;
        }
        // Sort Files
        switch (sortOrder) {
            case 'type':
                return compareFileExtensions(statA.name, statB.name);
            case 'modified':
                if (statA.mtime !== statB.mtime) {
                    return (statA.mtime && statB.mtime && statA.mtime < statB.mtime) ? 1 : -1;
                }
                return compareFileNames(statA.name, statB.name);
            default: /* 'default', 'mixed', 'filesFirst' */
                return compareFileNames(statA.name, statB.name);
        }
    }
};
FileSorter = __decorate([
    __param(0, IExplorerService),
    __param(1, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object])
], FileSorter);
export { FileSorter };
let FileDragAndDrop = class FileDragAndDrop {
    static { FileDragAndDrop_1 = this; }
    static { this.CONFIRM_DND_SETTING_KEY = 'explorer.confirmDragAndDrop'; }
    constructor(isCollapsed, explorerService, editorService, dialogService, contextService, fileService, configurationService, instantiationService, workspaceEditingService, uriIdentityService) {
        this.isCollapsed = isCollapsed;
        this.explorerService = explorerService;
        this.editorService = editorService;
        this.dialogService = dialogService;
        this.contextService = contextService;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.workspaceEditingService = workspaceEditingService;
        this.uriIdentityService = uriIdentityService;
        this.compressedDropTargetDisposable = Disposable.None;
        this.disposables = new DisposableStore();
        this.dropEnabled = false;
        const updateDropEnablement = (e) => {
            if (!e || e.affectsConfiguration('explorer.enableDragAndDrop')) {
                this.dropEnabled = this.configurationService.getValue('explorer.enableDragAndDrop');
            }
        };
        updateDropEnablement(undefined);
        this.disposables.add(this.configurationService.onDidChangeConfiguration(e => updateDropEnablement(e)));
    }
    onDragOver(data, target, targetIndex, targetSector, originalEvent) {
        if (!this.dropEnabled) {
            return false;
        }
        // Compressed folders
        if (target) {
            const compressedTarget = FileDragAndDrop_1.getCompressedStatFromDragEvent(target, originalEvent);
            if (compressedTarget) {
                const iconLabelName = getIconLabelNameFromHTMLElement(originalEvent.target);
                if (iconLabelName && iconLabelName.index < iconLabelName.count - 1) {
                    const result = this.handleDragOver(data, compressedTarget, targetIndex, targetSector, originalEvent);
                    if (result) {
                        if (iconLabelName.element !== this.compressedDragOverElement) {
                            this.compressedDragOverElement = iconLabelName.element;
                            this.compressedDropTargetDisposable.dispose();
                            this.compressedDropTargetDisposable = toDisposable(() => {
                                iconLabelName.element.classList.remove('drop-target');
                                this.compressedDragOverElement = undefined;
                            });
                            iconLabelName.element.classList.add('drop-target');
                        }
                        return typeof result === 'boolean' ? result : { ...result, feedback: [] };
                    }
                    this.compressedDropTargetDisposable.dispose();
                    return false;
                }
            }
        }
        this.compressedDropTargetDisposable.dispose();
        return this.handleDragOver(data, target, targetIndex, targetSector, originalEvent);
    }
    handleDragOver(data, target, targetIndex, targetSector, originalEvent) {
        const isCopy = originalEvent && ((originalEvent.ctrlKey && !isMacintosh) || (originalEvent.altKey && isMacintosh));
        const isNative = data instanceof NativeDragAndDropData;
        const effectType = (isNative || isCopy) ? 0 /* ListDragOverEffectType.Copy */ : 1 /* ListDragOverEffectType.Move */;
        const effect = { type: effectType, position: "drop-target" /* ListDragOverEffectPosition.Over */ };
        // Native DND
        if (isNative) {
            if (!containsDragType(originalEvent, DataTransfers.FILES, CodeDataTransfers.FILES, DataTransfers.RESOURCES)) {
                return false;
            }
        }
        // Other-Tree DND
        else if (data instanceof ExternalElementsDragAndDropData) {
            return false;
        }
        // In-Explorer DND
        else {
            const items = FileDragAndDrop_1.getStatsFromDragAndDropData(data);
            const isRootsReorder = items.every(item => item.isRoot);
            if (!target) {
                // Dropping onto the empty area. Do not accept if items dragged are already
                // children of the root unless we are copying the file
                if (!isCopy && items.every(i => !!i.parent && i.parent.isRoot)) {
                    return false;
                }
                // root is added after last root folder when hovering on empty background
                if (isRootsReorder) {
                    return { accept: true, effect: { type: 1 /* ListDragOverEffectType.Move */, position: "drop-target-after" /* ListDragOverEffectPosition.After */ } };
                }
                return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect, autoExpand: false };
            }
            if (!Array.isArray(items)) {
                return false;
            }
            if (!isCopy && items.every((source) => source.isReadonly)) {
                return false; // Cannot move readonly items unless we copy
            }
            if (items.some((source) => {
                if (source.isRoot) {
                    return false; // Root folders are handled seperately
                }
                if (this.uriIdentityService.extUri.isEqual(source.resource, target.resource)) {
                    return true; // Can not move anything onto itself excpet for root folders
                }
                if (!isCopy && this.uriIdentityService.extUri.isEqual(dirname(source.resource), target.resource)) {
                    return true; // Can not move a file to the same parent unless we copy
                }
                if (this.uriIdentityService.extUri.isEqualOrParent(target.resource, source.resource)) {
                    return true; // Can not move a parent folder into one of its children
                }
                return false;
            })) {
                return false;
            }
            // reordering roots
            if (isRootsReorder) {
                if (!target.isRoot) {
                    return false;
                }
                let dropEffectPosition = undefined;
                switch (targetSector) {
                    case 0 /* ListViewTargetSector.TOP */:
                    case 1 /* ListViewTargetSector.CENTER_TOP */:
                        dropEffectPosition = "drop-target-before" /* ListDragOverEffectPosition.Before */;
                        break;
                    case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
                    case 3 /* ListViewTargetSector.BOTTOM */:
                        dropEffectPosition = "drop-target-after" /* ListDragOverEffectPosition.After */;
                        break;
                }
                return { accept: true, effect: { type: 1 /* ListDragOverEffectType.Move */, position: dropEffectPosition } };
            }
        }
        // All (target = model)
        if (!target) {
            return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect };
        }
        // All (target = file/folder)
        else {
            if (target.isDirectory) {
                if (target.isReadonly) {
                    return false;
                }
                return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect, autoExpand: true };
            }
            if (this.contextService.getWorkspace().folders.every(folder => folder.uri.toString() !== target.resource.toString())) {
                return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */, effect };
            }
        }
        return false;
    }
    getDragURI(element) {
        if (this.explorerService.isEditable(element)) {
            return null;
        }
        return element.resource.toString();
    }
    getDragLabel(elements, originalEvent) {
        if (elements.length === 1) {
            const stat = FileDragAndDrop_1.getCompressedStatFromDragEvent(elements[0], originalEvent);
            return stat.name;
        }
        return String(elements.length);
    }
    onDragStart(data, originalEvent) {
        const items = FileDragAndDrop_1.getStatsFromDragAndDropData(data, originalEvent);
        if (items && items.length && originalEvent.dataTransfer) {
            // Apply some datatransfer types to allow for dragging the element outside of the application
            this.instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, items, originalEvent));
            // The only custom data transfer we set from the explorer is a file transfer
            // to be able to DND between multiple code file explorers across windows
            const fileResources = items.filter(s => s.resource.scheme === Schemas.file).map(r => r.resource.fsPath);
            if (fileResources.length) {
                originalEvent.dataTransfer.setData(CodeDataTransfers.FILES, JSON.stringify(fileResources));
            }
        }
    }
    async drop(data, target, targetIndex, targetSector, originalEvent) {
        this.compressedDropTargetDisposable.dispose();
        // Find compressed target
        if (target) {
            const compressedTarget = FileDragAndDrop_1.getCompressedStatFromDragEvent(target, originalEvent);
            if (compressedTarget) {
                target = compressedTarget;
            }
        }
        // Find parent to add to
        if (!target) {
            target = this.explorerService.roots[this.explorerService.roots.length - 1];
            targetSector = 3 /* ListViewTargetSector.BOTTOM */;
        }
        if (!target.isDirectory && target.parent) {
            target = target.parent;
        }
        if (target.isReadonly) {
            return;
        }
        const resolvedTarget = target;
        if (!resolvedTarget) {
            return;
        }
        try {
            // External file DND (Import/Upload file)
            if (data instanceof NativeDragAndDropData) {
                // Use local file import when supported
                if (!isWeb || (isTemporaryWorkspace(this.contextService.getWorkspace()) && WebFileSystemAccess.supported(mainWindow))) {
                    const fileImport = this.instantiationService.createInstance(ExternalFileImport);
                    await fileImport.import(resolvedTarget, originalEvent, mainWindow);
                }
                // Otherwise fallback to browser based file upload
                else {
                    const browserUpload = this.instantiationService.createInstance(BrowserFileUpload);
                    await browserUpload.upload(target, originalEvent);
                }
            }
            // In-Explorer DND (Move/Copy file)
            else {
                await this.handleExplorerDrop(data, resolvedTarget, targetIndex, targetSector, originalEvent);
            }
        }
        catch (error) {
            this.dialogService.error(toErrorMessage(error));
        }
    }
    async handleExplorerDrop(data, target, targetIndex, targetSector, originalEvent) {
        const elementsData = FileDragAndDrop_1.getStatsFromDragAndDropData(data);
        const distinctItems = new Map(elementsData.map(element => [element, this.isCollapsed(element)]));
        for (const [item, collapsed] of distinctItems) {
            if (collapsed) {
                const nestedChildren = item.nestedChildren;
                if (nestedChildren) {
                    for (const child of nestedChildren) {
                        // if parent is collapsed, then the nested children is considered collapsed to operate as a group
                        // and skip collapsed state check since they're not in the tree
                        distinctItems.set(child, true);
                    }
                }
            }
        }
        const items = distinctParents([...distinctItems.keys()], s => s.resource);
        const isCopy = (originalEvent.ctrlKey && !isMacintosh) || (originalEvent.altKey && isMacintosh);
        // Handle confirm setting
        const confirmDragAndDrop = !isCopy && this.configurationService.getValue(FileDragAndDrop_1.CONFIRM_DND_SETTING_KEY);
        if (confirmDragAndDrop) {
            const message = items.length > 1 && items.every(s => s.isRoot) ? localize('confirmRootsMove', "Are you sure you want to change the order of multiple root folders in your workspace?")
                : items.length > 1 ? localize('confirmMultiMove', "Are you sure you want to move the following {0} files into '{1}'?", items.length, target.name)
                    : items[0].isRoot ? localize('confirmRootMove', "Are you sure you want to change the order of root folder '{0}' in your workspace?", items[0].name)
                        : localize('confirmMove', "Are you sure you want to move '{0}' into '{1}'?", items[0].name, target.name);
            const detail = items.length > 1 && !items.every(s => s.isRoot) ? getFileNamesMessage(items.map(i => i.resource)) : undefined;
            const confirmation = await this.dialogService.confirm({
                message,
                detail,
                checkbox: {
                    label: localize('doNotAskAgain', "Do not ask me again")
                },
                primaryButton: localize({ key: 'moveButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Move")
            });
            if (!confirmation.confirmed) {
                return;
            }
            // Check for confirmation checkbox
            if (confirmation.checkboxChecked === true) {
                await this.configurationService.updateValue(FileDragAndDrop_1.CONFIRM_DND_SETTING_KEY, false);
            }
        }
        await this.doHandleRootDrop(items.filter(s => s.isRoot), target, targetSector);
        const sources = items.filter(s => !s.isRoot);
        if (isCopy) {
            return this.doHandleExplorerDropOnCopy(sources, target);
        }
        return this.doHandleExplorerDropOnMove(sources, target);
    }
    async doHandleRootDrop(roots, target, targetSector) {
        if (roots.length === 0) {
            return;
        }
        const folders = this.contextService.getWorkspace().folders;
        let targetIndex;
        const sourceIndices = [];
        const workspaceCreationData = [];
        const rootsToMove = [];
        for (let index = 0; index < folders.length; index++) {
            const data = {
                uri: folders[index].uri,
                name: folders[index].name
            };
            // Is current target
            if (target instanceof ExplorerItem && this.uriIdentityService.extUri.isEqual(folders[index].uri, target.resource)) {
                targetIndex = index;
            }
            // Is current source
            for (const root of roots) {
                if (this.uriIdentityService.extUri.isEqual(folders[index].uri, root.resource)) {
                    sourceIndices.push(index);
                    break;
                }
            }
            if (roots.every(r => r.resource.toString() !== folders[index].uri.toString())) {
                workspaceCreationData.push(data);
            }
            else {
                rootsToMove.push(data);
            }
        }
        if (targetIndex === undefined) {
            targetIndex = workspaceCreationData.length;
        }
        else {
            switch (targetSector) {
                case 3 /* ListViewTargetSector.BOTTOM */:
                case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
                    targetIndex++;
                    break;
            }
            // Adjust target index if source was located before target.
            // The move will cause the index to change
            for (const sourceIndex of sourceIndices) {
                if (sourceIndex < targetIndex) {
                    targetIndex--;
                }
            }
        }
        workspaceCreationData.splice(targetIndex, 0, ...rootsToMove);
        return this.workspaceEditingService.updateFolders(0, workspaceCreationData.length, workspaceCreationData);
    }
    async doHandleExplorerDropOnCopy(sources, target) {
        // Reuse duplicate action when user copies
        const explorerConfig = this.configurationService.getValue().explorer;
        const resourceFileEdits = [];
        for (const { resource, isDirectory } of sources) {
            const allowOverwrite = explorerConfig.incrementalNaming === 'disabled';
            const newResource = await findValidPasteFileTarget(this.explorerService, this.fileService, this.dialogService, target, { resource, isDirectory, allowOverwrite }, explorerConfig.incrementalNaming);
            if (!newResource) {
                continue;
            }
            const resourceEdit = new ResourceFileEdit(resource, newResource, { copy: true, overwrite: allowOverwrite });
            resourceFileEdits.push(resourceEdit);
        }
        const labelSuffix = getFileOrFolderLabelSuffix(sources);
        await this.explorerService.applyBulkEdit(resourceFileEdits, {
            confirmBeforeUndo: explorerConfig.confirmUndo === "default" /* UndoConfirmLevel.Default */ || explorerConfig.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
            undoLabel: localize('copy', "Copy {0}", labelSuffix),
            progressLabel: localize('copying', "Copying {0}", labelSuffix),
        });
        const editors = resourceFileEdits.filter(edit => {
            const item = edit.newResource ? this.explorerService.findClosest(edit.newResource) : undefined;
            return item && !item.isDirectory;
        }).map(edit => ({ resource: edit.newResource, options: { pinned: true } }));
        await this.editorService.openEditors(editors);
    }
    async doHandleExplorerDropOnMove(sources, target) {
        // Do not allow moving readonly items
        const resourceFileEdits = sources.filter(source => !source.isReadonly).map(source => new ResourceFileEdit(source.resource, joinPath(target.resource, source.name)));
        const labelSuffix = getFileOrFolderLabelSuffix(sources);
        const options = {
            confirmBeforeUndo: this.configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
            undoLabel: localize('move', "Move {0}", labelSuffix),
            progressLabel: localize('moving', "Moving {0}", labelSuffix)
        };
        try {
            await this.explorerService.applyBulkEdit(resourceFileEdits, options);
        }
        catch (error) {
            // Conflict
            if (error.fileOperationResult === 4 /* FileOperationResult.FILE_MOVE_CONFLICT */) {
                const overwrites = [];
                for (const edit of resourceFileEdits) {
                    if (edit.newResource && await this.fileService.exists(edit.newResource)) {
                        overwrites.push(edit.newResource);
                    }
                }
                // Move with overwrite if the user confirms
                const confirm = getMultipleFilesOverwriteConfirm(overwrites);
                const { confirmed } = await this.dialogService.confirm(confirm);
                if (confirmed) {
                    await this.explorerService.applyBulkEdit(resourceFileEdits.map(re => new ResourceFileEdit(re.oldResource, re.newResource, { overwrite: true })), options);
                }
            }
            // Any other error: bubble up
            else {
                throw error;
            }
        }
    }
    static getStatsFromDragAndDropData(data, dragStartEvent) {
        if (data.context) {
            return data.context;
        }
        // Detect compressed folder dragging
        if (dragStartEvent && data.elements.length === 1) {
            data.context = [FileDragAndDrop_1.getCompressedStatFromDragEvent(data.elements[0], dragStartEvent)];
            return data.context;
        }
        return data.elements;
    }
    static getCompressedStatFromDragEvent(stat, dragEvent) {
        const target = DOM.getWindow(dragEvent).document.elementFromPoint(dragEvent.clientX, dragEvent.clientY);
        const iconLabelName = getIconLabelNameFromHTMLElement(target);
        if (iconLabelName) {
            const { count, index } = iconLabelName;
            let i = count - 1;
            while (i > index && stat.parent) {
                stat = stat.parent;
                i--;
            }
            return stat;
        }
        return stat;
    }
    onDragEnd() {
        this.compressedDropTargetDisposable.dispose();
    }
    dispose() {
        this.compressedDropTargetDisposable.dispose();
    }
};
FileDragAndDrop = FileDragAndDrop_1 = __decorate([
    __param(1, IExplorerService),
    __param(2, IEditorService),
    __param(3, IDialogService),
    __param(4, IWorkspaceContextService),
    __param(5, IFileService),
    __param(6, IConfigurationService),
    __param(7, IInstantiationService),
    __param(8, IWorkspaceEditingService),
    __param(9, IUriIdentityService),
    __metadata("design:paramtypes", [Function, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], FileDragAndDrop);
export { FileDragAndDrop };
function getIconLabelNameFromHTMLElement(target) {
    if (!(DOM.isHTMLElement(target))) {
        return null;
    }
    let element = target;
    while (element && !element.classList.contains('monaco-list-row')) {
        if (element.classList.contains('label-name') && element.hasAttribute('data-icon-label-count')) {
            const count = Number(element.getAttribute('data-icon-label-count'));
            const index = Number(element.getAttribute('data-icon-label-index'));
            if (isNumber(count) && isNumber(index)) {
                return { element: element, count, index };
            }
        }
        element = element.parentElement;
    }
    return null;
}
export function isCompressedFolderName(target) {
    return !!getIconLabelNameFromHTMLElement(target);
}
export class ExplorerCompressionDelegate {
    isIncompressible(stat) {
        return stat.isRoot || !stat.isDirectory || stat instanceof NewExplorerItem || (!stat.parent || stat.parent.isRoot);
    }
}
function getFileOrFolderLabelSuffix(items) {
    if (items.length === 1) {
        return items[0].name;
    }
    if (items.every(i => i.isDirectory)) {
        return localize('numberOfFolders', "{0} folders", items.length);
    }
    if (items.every(i => !i.isDirectory)) {
        return localize('numberOfFiles', "{0} files", items.length);
    }
    return `${items.length} files and folders`;
}
