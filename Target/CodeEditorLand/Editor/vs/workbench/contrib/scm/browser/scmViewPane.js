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
var ActionButtonRenderer_1, InputRenderer_1, ResourceGroupRenderer_1, ResourceRenderer_1, SCMInputWidget_1;
import './media/scm.css';
import { Event, Emitter } from '../../../../base/common/event.js';
import { basename, dirname } from '../../../../base/common/resources.js';
import { Disposable, DisposableStore, combinedDisposable, dispose, toDisposable, MutableDisposable, DisposableMap } from '../../../../base/common/lifecycle.js';
import { ViewPane, ViewAction } from '../../../browser/parts/views/viewPane.js';
import { append, $, Dimension, trackFocus, clearNode, isPointerEvent, isActiveElement } from '../../../../base/browser/dom.js';
import { asCSSUrl } from '../../../../base/browser/cssValue.js';
import { ISCMViewService, ISCMService, SCMInputChangeReason, VIEW_PANE_ID } from '../common/scm.js';
import { ResourceLabels } from '../../../browser/labels.js';
import { CountBadge } from '../../../../base/browser/ui/countBadge/countBadge.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextViewService, IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService, ContextKeyExpr, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { MenuItemAction, IMenuService, registerAction2, MenuId, MenuRegistry, Action2 } from '../../../../platform/actions/common/actions.js';
import { ActionRunner, Action, Separator } from '../../../../base/common/actions.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { isSCMResource, isSCMResourceGroup, connectPrimaryMenuToInlineActionBar, isSCMRepository, isSCMInput, collectContextMenuActions, getActionViewItemProvider, isSCMActionButton, isSCMViewService, isSCMResourceNode } from './util.js';
import { WorkbenchCompressibleAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { disposableTimeout, Sequencer, ThrottledDelayer, Throttler } from '../../../../base/common/async.js';
import { ResourceTree } from '../../../../base/common/resourceTree.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { FileKind } from '../../../../platform/files/common/files.js';
import { compareFileNames, comparePaths } from '../../../../base/common/comparers.js';
import { createMatches } from '../../../../base/common/filters.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { localize } from '../../../../nls.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from '../../codeEditor/browser/simpleEditorOptions.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { MenuPreventer } from '../../codeEditor/browser/menuPreventer.js';
import { SelectionClipboardContributionID } from '../../codeEditor/browser/selectionClipboard.js';
import { EditorDictation } from '../../codeEditor/browser/dictation/editorDictation.js';
import { ContextMenuController } from '../../../../editor/contrib/contextmenu/browser/contextmenu.js';
import * as platform from '../../../../base/common/platform.js';
import { compare, format } from '../../../../base/common/strings.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { SnippetController2 } from '../../../../editor/contrib/snippet/browser/snippetController2.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { ColorDetector } from '../../../../editor/contrib/colorPicker/browser/colorDetector.js';
import { LinkDetector } from '../../../../editor/contrib/links/browser/links.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { DEFAULT_FONT_FAMILY } from '../../../../base/browser/fonts.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { RepositoryActionRunner, RepositoryRenderer } from './scmRepositoryRenderer.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from '../../../browser/parts/editor/editorCommands.js';
import { createActionViewItem, createAndFillInActionBarActions, createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MarkdownRenderer, openLinkFromMarkdown } from '../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { Button, ButtonWithDropdown } from '../../../../base/browser/ui/button/button.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { RepositoryContextKeys } from './scmViewService.js';
import { DragAndDropController } from '../../../../editor/contrib/dnd/browser/dnd.js';
import { CopyPasteController } from '../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js';
import { DropIntoEditorController } from '../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js';
import { MessageController } from '../../../../editor/contrib/message/browser/messageController.js';
import { defaultButtonStyles, defaultCountBadgeStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { InlineCompletionsController } from '../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js';
import { CodeActionController } from '../../../../editor/contrib/codeAction/browser/codeActionController.js';
import { Schemas } from '../../../../base/common/network.js';
import { fillEditorsDragData } from '../../../browser/dnd.js';
import { CodeDataTransfers } from '../../../../platform/dnd/browser/dnd.js';
import { FormatOnType } from '../../../../editor/contrib/format/browser/formatActions.js';
import { EditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { EditOperation } from '../../../../editor/common/core/editOperation.js';
import { WorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { clamp, rot } from '../../../../base/common/numbers.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { OpenScmGroupAction } from '../../multiDiffEditor/browser/scmMultiDiffSourceResolver.js';
import { ContentHoverController } from '../../../../editor/contrib/hover/browser/contentHoverController.js';
import { GlyphHoverController } from '../../../../editor/contrib/hover/browser/glyphHoverController.js';
import { autorun } from '../../../../base/common/observable.js';
import { PlaceholderTextContribution } from '../../../../editor/contrib/placeholderText/browser/placeholderTextContribution.js';
import { observableConfigValue } from '../../../../platform/observable/common/platformObservableUtils.js';
function processResourceFilterData(uri, filterData) {
    if (!filterData) {
        return [undefined, undefined];
    }
    if (!filterData.label) {
        const matches = createMatches(filterData);
        return [matches, undefined];
    }
    const fileName = basename(uri);
    const label = filterData.label;
    const pathLength = label.length - fileName.length;
    const matches = createMatches(filterData.score);
    // FileName match
    if (label === fileName) {
        return [matches, undefined];
    }
    // FilePath match
    const labelMatches = [];
    const descriptionMatches = [];
    for (const match of matches) {
        if (match.start > pathLength) {
            // Label match
            labelMatches.push({
                start: match.start - pathLength,
                end: match.end - pathLength
            });
        }
        else if (match.end < pathLength) {
            // Description match
            descriptionMatches.push(match);
        }
        else {
            // Spanning match
            labelMatches.push({
                start: 0,
                end: match.end - pathLength
            });
            descriptionMatches.push({
                start: match.start,
                end: pathLength
            });
        }
    }
    return [labelMatches, descriptionMatches];
}
let ActionButtonRenderer = class ActionButtonRenderer {
    static { ActionButtonRenderer_1 = this; }
    static { this.DEFAULT_HEIGHT = 30; }
    static { this.TEMPLATE_ID = 'actionButton'; }
    get templateId() { return ActionButtonRenderer_1.TEMPLATE_ID; }
    constructor(commandService, contextMenuService, notificationService) {
        this.commandService = commandService;
        this.contextMenuService = contextMenuService;
        this.notificationService = notificationService;
        this.actionButtons = new Map();
    }
    renderTemplate(container) {
        // hack
        container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
        // Use default cursor & disable hover for list item
        container.parentElement.parentElement.classList.add('cursor-default', 'force-no-hover');
        const buttonContainer = append(container, $('.button-container'));
        const actionButton = new SCMActionButton(buttonContainer, this.contextMenuService, this.commandService, this.notificationService);
        return { actionButton, disposable: Disposable.None, templateDisposable: actionButton };
    }
    renderElement(node, index, templateData, height) {
        templateData.disposable.dispose();
        const disposables = new DisposableStore();
        const actionButton = node.element;
        templateData.actionButton.setButton(node.element.button);
        // Remember action button
        this.actionButtons.set(actionButton, templateData.actionButton);
        disposables.add({ dispose: () => this.actionButtons.delete(actionButton) });
        templateData.disposable = disposables;
    }
    renderCompressedElements() {
        throw new Error('Should never happen since node is incompressible');
    }
    focusActionButton(actionButton) {
        this.actionButtons.get(actionButton)?.focus();
    }
    disposeElement(node, index, template) {
        template.disposable.dispose();
    }
    disposeTemplate(templateData) {
        templateData.disposable.dispose();
        templateData.templateDisposable.dispose();
    }
};
ActionButtonRenderer = ActionButtonRenderer_1 = __decorate([
    __param(0, ICommandService),
    __param(1, IContextMenuService),
    __param(2, INotificationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ActionButtonRenderer);
export { ActionButtonRenderer };
class SCMTreeDragAndDrop {
    constructor(instantiationService) {
        this.instantiationService = instantiationService;
    }
    getDragURI(element) {
        if (isSCMResource(element)) {
            return element.sourceUri.toString();
        }
        return null;
    }
    onDragStart(data, originalEvent) {
        const items = SCMTreeDragAndDrop.getResourcesFromDragAndDropData(data);
        if (originalEvent.dataTransfer && items?.length) {
            this.instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, items, originalEvent));
            const fileResources = items.filter(s => s.scheme === Schemas.file).map(r => r.fsPath);
            if (fileResources.length) {
                originalEvent.dataTransfer.setData(CodeDataTransfers.FILES, JSON.stringify(fileResources));
            }
        }
    }
    getDragLabel(elements, originalEvent) {
        if (elements.length === 1) {
            const element = elements[0];
            if (isSCMResource(element)) {
                return basename(element.sourceUri);
            }
        }
        return String(elements.length);
    }
    onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
        return true;
    }
    drop(data, targetElement, targetIndex, targetSector, originalEvent) { }
    static getResourcesFromDragAndDropData(data) {
        const uris = [];
        for (const element of [...data.context ?? [], ...data.elements]) {
            if (isSCMResource(element)) {
                uris.push(element.sourceUri);
            }
        }
        return uris;
    }
    dispose() { }
}
let InputRenderer = class InputRenderer {
    static { InputRenderer_1 = this; }
    static { this.DEFAULT_HEIGHT = 26; }
    static { this.TEMPLATE_ID = 'input'; }
    get templateId() { return InputRenderer_1.TEMPLATE_ID; }
    constructor(outerLayout, overflowWidgetsDomNode, updateHeight, instantiationService) {
        this.outerLayout = outerLayout;
        this.overflowWidgetsDomNode = overflowWidgetsDomNode;
        this.updateHeight = updateHeight;
        this.instantiationService = instantiationService;
        this.inputWidgets = new Map();
        this.contentHeights = new WeakMap();
        this.editorSelections = new WeakMap();
    }
    renderTemplate(container) {
        // hack
        container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
        // Disable hover for list item
        container.parentElement.parentElement.classList.add('force-no-hover');
        const templateDisposable = new DisposableStore();
        const inputElement = append(container, $('.scm-input'));
        const inputWidget = this.instantiationService.createInstance(SCMInputWidget, inputElement, this.overflowWidgetsDomNode);
        templateDisposable.add(inputWidget);
        return { inputWidget, inputWidgetHeight: InputRenderer_1.DEFAULT_HEIGHT, elementDisposables: new DisposableStore(), templateDisposable };
    }
    renderElement(node, index, templateData) {
        const input = node.element;
        templateData.inputWidget.input = input;
        // Remember widget
        this.inputWidgets.set(input, templateData.inputWidget);
        templateData.elementDisposables.add({
            dispose: () => this.inputWidgets.delete(input)
        });
        // Widget cursor selections
        const selections = this.editorSelections.get(input);
        if (selections) {
            templateData.inputWidget.selections = selections;
        }
        templateData.elementDisposables.add(toDisposable(() => {
            const selections = templateData.inputWidget.selections;
            if (selections) {
                this.editorSelections.set(input, selections);
            }
        }));
        // Reset widget height so it's recalculated
        templateData.inputWidgetHeight = InputRenderer_1.DEFAULT_HEIGHT;
        // Rerender the element whenever the editor content height changes
        const onDidChangeContentHeight = () => {
            const contentHeight = templateData.inputWidget.getContentHeight();
            this.contentHeights.set(input, contentHeight);
            if (templateData.inputWidgetHeight !== contentHeight) {
                this.updateHeight(input, contentHeight + 10);
                templateData.inputWidgetHeight = contentHeight;
                templateData.inputWidget.layout();
            }
        };
        const startListeningContentHeightChange = () => {
            templateData.elementDisposables.add(templateData.inputWidget.onDidChangeContentHeight(onDidChangeContentHeight));
            onDidChangeContentHeight();
        };
        // Setup height change listener on next tick
        disposableTimeout(startListeningContentHeightChange, 0, templateData.elementDisposables);
        // Layout the editor whenever the outer layout happens
        const layoutEditor = () => templateData.inputWidget.layout();
        templateData.elementDisposables.add(this.outerLayout.onDidChange(layoutEditor));
        layoutEditor();
    }
    renderCompressedElements() {
        throw new Error('Should never happen since node is incompressible');
    }
    disposeElement(group, index, template) {
        template.elementDisposables.clear();
    }
    disposeTemplate(templateData) {
        templateData.templateDisposable.dispose();
    }
    getHeight(input) {
        return (this.contentHeights.get(input) ?? InputRenderer_1.DEFAULT_HEIGHT) + 10;
    }
    getRenderedInputWidget(input) {
        return this.inputWidgets.get(input);
    }
    getFocusedInput() {
        for (const [input, inputWidget] of this.inputWidgets) {
            if (inputWidget.hasFocus()) {
                return input;
            }
        }
        return undefined;
    }
    clearValidation() {
        for (const [, inputWidget] of this.inputWidgets) {
            inputWidget.clearValidation();
        }
    }
};
InputRenderer = InputRenderer_1 = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, HTMLElement, Function, Object])
], InputRenderer);
let ResourceGroupRenderer = class ResourceGroupRenderer {
    static { ResourceGroupRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'resource group'; }
    get templateId() { return ResourceGroupRenderer_1.TEMPLATE_ID; }
    constructor(actionViewItemProvider, scmViewService) {
        this.actionViewItemProvider = actionViewItemProvider;
        this.scmViewService = scmViewService;
    }
    renderTemplate(container) {
        // hack
        container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
        const element = append(container, $('.resource-group'));
        const name = append(element, $('.name'));
        const actionsContainer = append(element, $('.actions'));
        const actionBar = new ActionBar(actionsContainer, { actionViewItemProvider: this.actionViewItemProvider });
        const countContainer = append(element, $('.count'));
        const count = new CountBadge(countContainer, {}, defaultCountBadgeStyles);
        const disposables = combinedDisposable(actionBar);
        return { name, count, actionBar, elementDisposables: new DisposableStore(), disposables };
    }
    renderElement(node, index, template) {
        const group = node.element;
        template.name.textContent = group.label;
        template.actionBar.clear();
        template.actionBar.context = group;
        template.count.setCount(group.resources.length);
        const menus = this.scmViewService.menus.getRepositoryMenus(group.provider);
        template.elementDisposables.add(connectPrimaryMenuToInlineActionBar(menus.getResourceGroupMenu(group), template.actionBar));
    }
    renderCompressedElements(node, index, templateData, height) {
        throw new Error('Should never happen since node is incompressible');
    }
    disposeElement(group, index, template) {
        template.elementDisposables.clear();
    }
    disposeTemplate(template) {
        template.elementDisposables.dispose();
        template.disposables.dispose();
    }
};
ResourceGroupRenderer = ResourceGroupRenderer_1 = __decorate([
    __param(1, ISCMViewService),
    __metadata("design:paramtypes", [Function, Object])
], ResourceGroupRenderer);
class RepositoryPaneActionRunner extends ActionRunner {
    constructor(getSelectedResources) {
        super();
        this.getSelectedResources = getSelectedResources;
    }
    async runAction(action, context) {
        if (!(action instanceof MenuItemAction)) {
            return super.runAction(action, context);
        }
        const selection = this.getSelectedResources();
        const contextIsSelected = selection.some(s => s === context);
        const actualContext = contextIsSelected ? selection : [context];
        const args = actualContext.map(e => ResourceTree.isResourceNode(e) ? ResourceTree.collect(e) : [e]).flat();
        await action.run(...args);
    }
}
let ResourceRenderer = class ResourceRenderer {
    static { ResourceRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'resource'; }
    get templateId() { return ResourceRenderer_1.TEMPLATE_ID; }
    constructor(viewMode, labels, actionViewItemProvider, actionRunner, labelService, scmViewService, themeService) {
        this.viewMode = viewMode;
        this.labels = labels;
        this.actionViewItemProvider = actionViewItemProvider;
        this.actionRunner = actionRunner;
        this.labelService = labelService;
        this.scmViewService = scmViewService;
        this.themeService = themeService;
        this.disposables = new DisposableStore();
        this.renderedResources = new Map();
        themeService.onDidColorThemeChange(this.onDidColorThemeChange, this, this.disposables);
    }
    renderTemplate(container) {
        const element = append(container, $('.resource'));
        const name = append(element, $('.name'));
        const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
        const actionsContainer = append(fileLabel.element, $('.actions'));
        const actionBar = new ActionBar(actionsContainer, {
            actionViewItemProvider: this.actionViewItemProvider,
            actionRunner: this.actionRunner
        });
        const decorationIcon = append(element, $('.decoration-icon'));
        const actionBarMenuListener = new MutableDisposable();
        const disposables = combinedDisposable(actionBar, fileLabel, actionBarMenuListener);
        return { element, name, fileLabel, decorationIcon, actionBar, actionBarMenu: undefined, actionBarMenuListener, elementDisposables: new DisposableStore(), disposables };
    }
    renderElement(node, index, template) {
        const resourceOrFolder = node.element;
        const iconResource = ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.element : resourceOrFolder;
        const uri = ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.uri : resourceOrFolder.sourceUri;
        const fileKind = ResourceTree.isResourceNode(resourceOrFolder) ? FileKind.FOLDER : FileKind.FILE;
        const tooltip = !ResourceTree.isResourceNode(resourceOrFolder) && resourceOrFolder.decorations.tooltip || '';
        const hidePath = this.viewMode() === "tree" /* ViewMode.Tree */;
        let matches;
        let descriptionMatches;
        let strikethrough;
        if (ResourceTree.isResourceNode(resourceOrFolder)) {
            if (resourceOrFolder.element) {
                const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.element.resourceGroup.provider);
                this._renderActionBar(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder.element));
                template.element.classList.toggle('faded', resourceOrFolder.element.decorations.faded);
                strikethrough = resourceOrFolder.element.decorations.strikeThrough;
            }
            else {
                const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.context.provider);
                this._renderActionBar(template, resourceOrFolder, menus.getResourceFolderMenu(resourceOrFolder.context));
                matches = createMatches(node.filterData);
                template.element.classList.remove('faded');
            }
        }
        else {
            const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.resourceGroup.provider);
            this._renderActionBar(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder));
            [matches, descriptionMatches] = processResourceFilterData(uri, node.filterData);
            template.element.classList.toggle('faded', resourceOrFolder.decorations.faded);
            strikethrough = resourceOrFolder.decorations.strikeThrough;
        }
        const renderedData = {
            tooltip, uri, fileLabelOptions: { hidePath, fileKind, matches, descriptionMatches, strikethrough }, iconResource
        };
        this.renderIcon(template, renderedData);
        this.renderedResources.set(template, renderedData);
        template.elementDisposables.add(toDisposable(() => this.renderedResources.delete(template)));
        template.element.setAttribute('data-tooltip', tooltip);
    }
    disposeElement(resource, index, template) {
        template.elementDisposables.clear();
    }
    renderCompressedElements(node, index, template, height) {
        const compressed = node.element;
        const folder = compressed.elements[compressed.elements.length - 1];
        const label = compressed.elements.map(e => e.name);
        const fileKind = FileKind.FOLDER;
        const matches = createMatches(node.filterData);
        template.fileLabel.setResource({ resource: folder.uri, name: label }, {
            fileDecorations: { colors: false, badges: true },
            fileKind,
            matches,
            separator: this.labelService.getSeparator(folder.uri.scheme)
        });
        const menus = this.scmViewService.menus.getRepositoryMenus(folder.context.provider);
        this._renderActionBar(template, folder, menus.getResourceFolderMenu(folder.context));
        template.name.classList.remove('strike-through');
        template.element.classList.remove('faded');
        template.decorationIcon.style.display = 'none';
        template.decorationIcon.style.backgroundImage = '';
        template.element.setAttribute('data-tooltip', '');
    }
    disposeCompressedElements(node, index, template, height) {
        template.elementDisposables.clear();
    }
    disposeTemplate(template) {
        template.elementDisposables.dispose();
        template.disposables.dispose();
    }
    _renderActionBar(template, resourceOrFolder, menu) {
        if (!template.actionBarMenu || template.actionBarMenu !== menu) {
            template.actionBar.clear();
            template.actionBarMenu = menu;
            template.actionBarMenuListener.value = connectPrimaryMenuToInlineActionBar(menu, template.actionBar);
        }
        template.actionBar.context = resourceOrFolder;
    }
    onDidColorThemeChange() {
        for (const [template, data] of this.renderedResources) {
            this.renderIcon(template, data);
        }
    }
    renderIcon(template, data) {
        const theme = this.themeService.getColorTheme();
        const icon = theme.type === ColorScheme.LIGHT ? data.iconResource?.decorations.icon : data.iconResource?.decorations.iconDark;
        template.fileLabel.setFile(data.uri, {
            ...data.fileLabelOptions,
            fileDecorations: { colors: false, badges: !icon },
        });
        if (icon) {
            if (ThemeIcon.isThemeIcon(icon)) {
                template.decorationIcon.className = `decoration-icon ${ThemeIcon.asClassName(icon)}`;
                if (icon.color) {
                    template.decorationIcon.style.color = theme.getColor(icon.color.id)?.toString() ?? '';
                }
                template.decorationIcon.style.display = '';
                template.decorationIcon.style.backgroundImage = '';
            }
            else {
                template.decorationIcon.className = 'decoration-icon';
                template.decorationIcon.style.color = '';
                template.decorationIcon.style.display = '';
                template.decorationIcon.style.backgroundImage = asCSSUrl(icon);
            }
            template.decorationIcon.title = data.tooltip;
        }
        else {
            template.decorationIcon.className = 'decoration-icon';
            template.decorationIcon.style.color = '';
            template.decorationIcon.style.display = 'none';
            template.decorationIcon.style.backgroundImage = '';
            template.decorationIcon.title = '';
        }
    }
    dispose() {
        this.disposables.dispose();
    }
};
ResourceRenderer = ResourceRenderer_1 = __decorate([
    __param(4, ILabelService),
    __param(5, ISCMViewService),
    __param(6, IThemeService),
    __metadata("design:paramtypes", [Function, ResourceLabels, Function, ActionRunner, Object, Object, Object])
], ResourceRenderer);
class ListDelegate {
    constructor(inputRenderer) {
        this.inputRenderer = inputRenderer;
    }
    getHeight(element) {
        if (isSCMInput(element)) {
            return this.inputRenderer.getHeight(element);
        }
        else if (isSCMActionButton(element)) {
            return ActionButtonRenderer.DEFAULT_HEIGHT + 10;
        }
        else {
            return 22;
        }
    }
    getTemplateId(element) {
        if (isSCMRepository(element)) {
            return RepositoryRenderer.TEMPLATE_ID;
        }
        else if (isSCMInput(element)) {
            return InputRenderer.TEMPLATE_ID;
        }
        else if (isSCMActionButton(element)) {
            return ActionButtonRenderer.TEMPLATE_ID;
        }
        else if (isSCMResourceGroup(element)) {
            return ResourceGroupRenderer.TEMPLATE_ID;
        }
        else if (isSCMResource(element) || isSCMResourceNode(element)) {
            return ResourceRenderer.TEMPLATE_ID;
        }
        else {
            throw new Error('Unknown element');
        }
    }
}
class SCMTreeCompressionDelegate {
    isIncompressible(element) {
        if (ResourceTree.isResourceNode(element)) {
            return element.childrenCount === 0 || !element.parent || !element.parent.parent;
        }
        return true;
    }
}
class SCMTreeFilter {
    filter(element) {
        if (isSCMResourceGroup(element)) {
            return element.resources.length > 0 || !element.hideWhenEmpty;
        }
        else {
            return true;
        }
    }
}
export class SCMTreeSorter {
    constructor(viewMode, viewSortKey) {
        this.viewMode = viewMode;
        this.viewSortKey = viewSortKey;
    }
    compare(one, other) {
        if (isSCMRepository(one)) {
            if (!isSCMRepository(other)) {
                throw new Error('Invalid comparison');
            }
            return 0;
        }
        if (isSCMInput(one)) {
            return -1;
        }
        else if (isSCMInput(other)) {
            return 1;
        }
        if (isSCMActionButton(one)) {
            return -1;
        }
        else if (isSCMActionButton(other)) {
            return 1;
        }
        if (isSCMResourceGroup(one)) {
            return isSCMResourceGroup(other) ? 0 : -1;
        }
        // Resource (List)
        if (this.viewMode() === "list" /* ViewMode.List */) {
            // FileName
            if (this.viewSortKey() === "name" /* ViewSortKey.Name */) {
                const oneName = basename(one.sourceUri);
                const otherName = basename(other.sourceUri);
                return compareFileNames(oneName, otherName);
            }
            // Status
            if (this.viewSortKey() === "status" /* ViewSortKey.Status */) {
                const oneTooltip = one.decorations.tooltip ?? '';
                const otherTooltip = other.decorations.tooltip ?? '';
                if (oneTooltip !== otherTooltip) {
                    return compare(oneTooltip, otherTooltip);
                }
            }
            // Path (default)
            const onePath = one.sourceUri.fsPath;
            const otherPath = other.sourceUri.fsPath;
            return comparePaths(onePath, otherPath);
        }
        // Resource (Tree)
        const oneIsDirectory = ResourceTree.isResourceNode(one);
        const otherIsDirectory = ResourceTree.isResourceNode(other);
        if (oneIsDirectory !== otherIsDirectory) {
            return oneIsDirectory ? -1 : 1;
        }
        const oneName = ResourceTree.isResourceNode(one) ? one.name : basename(one.sourceUri);
        const otherName = ResourceTree.isResourceNode(other) ? other.name : basename(other.sourceUri);
        return compareFileNames(oneName, otherName);
    }
}
let SCMTreeKeyboardNavigationLabelProvider = class SCMTreeKeyboardNavigationLabelProvider {
    constructor(viewMode, labelService) {
        this.viewMode = viewMode;
        this.labelService = labelService;
    }
    getKeyboardNavigationLabel(element) {
        if (ResourceTree.isResourceNode(element)) {
            return element.name;
        }
        else if (isSCMRepository(element) || isSCMInput(element) || isSCMActionButton(element)) {
            return undefined;
        }
        else if (isSCMResourceGroup(element)) {
            return element.label;
        }
        else {
            if (this.viewMode() === "list" /* ViewMode.List */) {
                // In List mode match using the file name and the path.
                // Since we want to match both on the file name and the
                // full path we return an array of labels. A match in the
                // file name takes precedence over a match in the path.
                const fileName = basename(element.sourceUri);
                const filePath = this.labelService.getUriLabel(element.sourceUri, { relative: true });
                return [fileName, filePath];
            }
            else {
                // In Tree mode only match using the file name
                return basename(element.sourceUri);
            }
        }
    }
    getCompressedNodeKeyboardNavigationLabel(elements) {
        const folders = elements;
        return folders.map(e => e.name).join('/');
    }
};
SCMTreeKeyboardNavigationLabelProvider = __decorate([
    __param(1, ILabelService),
    __metadata("design:paramtypes", [Function, Object])
], SCMTreeKeyboardNavigationLabelProvider);
export { SCMTreeKeyboardNavigationLabelProvider };
function getSCMResourceId(element) {
    if (isSCMRepository(element)) {
        const provider = element.provider;
        return `repo:${provider.id}`;
    }
    else if (isSCMInput(element)) {
        const provider = element.repository.provider;
        return `input:${provider.id}`;
    }
    else if (isSCMActionButton(element)) {
        const provider = element.repository.provider;
        return `actionButton:${provider.id}`;
    }
    else if (isSCMResourceGroup(element)) {
        const provider = element.provider;
        return `resourceGroup:${provider.id}/${element.id}`;
    }
    else if (isSCMResource(element)) {
        const group = element.resourceGroup;
        const provider = group.provider;
        return `resource:${provider.id}/${group.id}/${element.sourceUri.toString()}`;
    }
    else if (isSCMResourceNode(element)) {
        const group = element.context;
        return `folder:${group.provider.id}/${group.id}/$FOLDER/${element.uri.toString()}`;
    }
    else {
        throw new Error('Invalid tree element');
    }
}
class SCMResourceIdentityProvider {
    getId(element) {
        return getSCMResourceId(element);
    }
}
let SCMAccessibilityProvider = class SCMAccessibilityProvider {
    constructor(labelService) {
        this.labelService = labelService;
    }
    getWidgetAriaLabel() {
        return localize('scm', "Source Control Management");
    }
    getAriaLabel(element) {
        if (ResourceTree.isResourceNode(element)) {
            return this.labelService.getUriLabel(element.uri, { relative: true, noPrefix: true }) || element.name;
        }
        else if (isSCMRepository(element)) {
            return `${element.provider.name} ${element.provider.label}`;
        }
        else if (isSCMInput(element)) {
            return localize('input', "Source Control Input");
        }
        else if (isSCMActionButton(element)) {
            return element.button?.command.title ?? '';
        }
        else if (isSCMResourceGroup(element)) {
            return element.label;
        }
        else {
            const result = [];
            result.push(basename(element.sourceUri));
            if (element.decorations.tooltip) {
                result.push(element.decorations.tooltip);
            }
            const path = this.labelService.getUriLabel(dirname(element.sourceUri), { relative: true, noPrefix: true });
            if (path) {
                result.push(path);
            }
            return result.join(', ');
        }
    }
};
SCMAccessibilityProvider = __decorate([
    __param(0, ILabelService),
    __metadata("design:paramtypes", [Object])
], SCMAccessibilityProvider);
export { SCMAccessibilityProvider };
const Menus = {
    ViewSort: new MenuId('SCMViewSort'),
    Repositories: new MenuId('SCMRepositories'),
    ChangesSettings: new MenuId('SCMChangesSettings'),
};
export const ContextKeys = {
    SCMViewMode: new RawContextKey('scmViewMode', "list" /* ViewMode.List */),
    SCMViewSortKey: new RawContextKey('scmViewSortKey', "path" /* ViewSortKey.Path */),
    SCMViewAreAllRepositoriesCollapsed: new RawContextKey('scmViewAreAllRepositoriesCollapsed', false),
    SCMViewIsAnyRepositoryCollapsible: new RawContextKey('scmViewIsAnyRepositoryCollapsible', false),
    SCMProvider: new RawContextKey('scmProvider', undefined),
    SCMProviderRootUri: new RawContextKey('scmProviderRootUri', undefined),
    SCMProviderHasRootUri: new RawContextKey('scmProviderHasRootUri', undefined),
    SCMHistoryItemCount: new RawContextKey('scmHistoryItemCount', 0),
    RepositoryCount: new RawContextKey('scmRepositoryCount', 0),
    RepositoryVisibilityCount: new RawContextKey('scmRepositoryVisibleCount', 0),
    RepositoryVisibility(repository) {
        return new RawContextKey(`scmRepositoryVisible:${repository.provider.id}`, false);
    }
};
MenuRegistry.appendMenuItem(MenuId.SCMTitle, {
    title: localize('sortAction', "View & Sort"),
    submenu: Menus.ViewSort,
    when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0)),
    group: '0_view&sort',
    order: 1
});
MenuRegistry.appendMenuItem(Menus.ViewSort, {
    title: localize('repositories', "Repositories"),
    submenu: Menus.Repositories,
    when: ContextKeyExpr.greater(ContextKeys.RepositoryCount.key, 1),
    group: '0_repositories'
});
class RepositoryVisibilityAction extends Action2 {
    constructor(repository) {
        super({
            id: `workbench.scm.action.toggleRepositoryVisibility.${repository.provider.id}`,
            title: repository.provider.name,
            f1: false,
            precondition: ContextKeyExpr.or(ContextKeys.RepositoryVisibilityCount.notEqualsTo(1), ContextKeys.RepositoryVisibility(repository).isEqualTo(false)),
            toggled: ContextKeys.RepositoryVisibility(repository).isEqualTo(true),
            menu: { id: Menus.Repositories, group: '0_repositories' }
        });
        this.repository = repository;
    }
    run(accessor) {
        const scmViewService = accessor.get(ISCMViewService);
        scmViewService.toggleVisibility(this.repository);
    }
}
let RepositoryVisibilityActionController = class RepositoryVisibilityActionController {
    constructor(contextKeyService, scmViewService, scmService) {
        this.contextKeyService = contextKeyService;
        this.scmViewService = scmViewService;
        this.items = new Map();
        this.disposables = new DisposableStore();
        this.repositoryCountContextKey = ContextKeys.RepositoryCount.bindTo(contextKeyService);
        this.repositoryVisibilityCountContextKey = ContextKeys.RepositoryVisibilityCount.bindTo(contextKeyService);
        scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.disposables);
        scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
        scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
        for (const repository of scmService.repositories) {
            this.onDidAddRepository(repository);
        }
    }
    onDidAddRepository(repository) {
        const action = registerAction2(class extends RepositoryVisibilityAction {
            constructor() {
                super(repository);
            }
        });
        const contextKey = ContextKeys.RepositoryVisibility(repository).bindTo(this.contextKeyService);
        contextKey.set(this.scmViewService.isVisible(repository));
        this.items.set(repository, {
            contextKey,
            dispose() {
                contextKey.reset();
                action.dispose();
            }
        });
        this.updateRepositoryContextKeys();
    }
    onDidRemoveRepository(repository) {
        this.items.get(repository)?.dispose();
        this.items.delete(repository);
        this.updateRepositoryContextKeys();
    }
    onDidChangeVisibleRepositories() {
        let count = 0;
        for (const [repository, item] of this.items) {
            const isVisible = this.scmViewService.isVisible(repository);
            item.contextKey.set(isVisible);
            if (isVisible) {
                count++;
            }
        }
        this.repositoryCountContextKey.set(this.items.size);
        this.repositoryVisibilityCountContextKey.set(count);
    }
    updateRepositoryContextKeys() {
        this.repositoryCountContextKey.set(this.items.size);
        this.repositoryVisibilityCountContextKey.set(Iterable.reduce(this.items.keys(), (r, repository) => r + (this.scmViewService.isVisible(repository) ? 1 : 0), 0));
    }
    dispose() {
        this.disposables.dispose();
        dispose(this.items.values());
        this.items.clear();
    }
};
RepositoryVisibilityActionController = __decorate([
    __param(0, IContextKeyService),
    __param(1, ISCMViewService),
    __param(2, ISCMService),
    __metadata("design:paramtypes", [Object, Object, Object])
], RepositoryVisibilityActionController);
class SetListViewModeAction extends ViewAction {
    constructor(id = 'workbench.scm.action.setListViewMode', menu = {}) {
        super({
            id,
            title: localize('setListViewMode', "View as List"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.listTree,
            toggled: ContextKeys.SCMViewMode.isEqualTo("list" /* ViewMode.List */),
            menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
        });
    }
    async runInView(_, view) {
        view.viewMode = "list" /* ViewMode.List */;
    }
}
class SetListViewModeNavigationAction extends SetListViewModeAction {
    constructor() {
        super('workbench.scm.action.setListViewModeNavigation', {
            id: MenuId.SCMTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.SCMViewMode.isEqualTo("tree" /* ViewMode.Tree */)),
            group: 'navigation',
            order: -1000
        });
    }
}
class SetTreeViewModeAction extends ViewAction {
    constructor(id = 'workbench.scm.action.setTreeViewMode', menu = {}) {
        super({
            id,
            title: localize('setTreeViewMode', "View as Tree"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.listFlat,
            toggled: ContextKeys.SCMViewMode.isEqualTo("tree" /* ViewMode.Tree */),
            menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
        });
    }
    async runInView(_, view) {
        view.viewMode = "tree" /* ViewMode.Tree */;
    }
}
class SetTreeViewModeNavigationAction extends SetTreeViewModeAction {
    constructor() {
        super('workbench.scm.action.setTreeViewModeNavigation', {
            id: MenuId.SCMTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.SCMViewMode.isEqualTo("list" /* ViewMode.List */)),
            group: 'navigation',
            order: -1000
        });
    }
}
registerAction2(SetListViewModeAction);
registerAction2(SetTreeViewModeAction);
registerAction2(SetListViewModeNavigationAction);
registerAction2(SetTreeViewModeNavigationAction);
class RepositorySortAction extends ViewAction {
    constructor(sortKey, title) {
        super({
            id: `workbench.scm.action.repositories.setSortKey.${sortKey}`,
            title,
            viewId: VIEW_PANE_ID,
            f1: false,
            toggled: RepositoryContextKeys.RepositorySortKey.isEqualTo(sortKey),
            menu: [
                {
                    id: Menus.Repositories,
                    group: '1_sort'
                },
                {
                    id: MenuId.SCMSourceControlTitle,
                    group: '1_sort',
                },
            ]
        });
        this.sortKey = sortKey;
    }
    runInView(accessor) {
        accessor.get(ISCMViewService).toggleSortKey(this.sortKey);
    }
}
class RepositorySortByDiscoveryTimeAction extends RepositorySortAction {
    constructor() {
        super("discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */, localize('repositorySortByDiscoveryTime', "Sort by Discovery Time"));
    }
}
class RepositorySortByNameAction extends RepositorySortAction {
    constructor() {
        super("name" /* ISCMRepositorySortKey.Name */, localize('repositorySortByName', "Sort by Name"));
    }
}
class RepositorySortByPathAction extends RepositorySortAction {
    constructor() {
        super("path" /* ISCMRepositorySortKey.Path */, localize('repositorySortByPath', "Sort by Path"));
    }
}
registerAction2(RepositorySortByDiscoveryTimeAction);
registerAction2(RepositorySortByNameAction);
registerAction2(RepositorySortByPathAction);
class SetSortKeyAction extends ViewAction {
    constructor(sortKey, title) {
        super({
            id: `workbench.scm.action.setSortKey.${sortKey}`,
            title,
            viewId: VIEW_PANE_ID,
            f1: false,
            toggled: ContextKeys.SCMViewSortKey.isEqualTo(sortKey),
            precondition: ContextKeys.SCMViewMode.isEqualTo("list" /* ViewMode.List */),
            menu: { id: Menus.ViewSort, group: '2_sort' }
        });
        this.sortKey = sortKey;
    }
    async runInView(_, view) {
        view.viewSortKey = this.sortKey;
    }
}
class SetSortByNameAction extends SetSortKeyAction {
    constructor() {
        super("name" /* ViewSortKey.Name */, localize('sortChangesByName', "Sort Changes by Name"));
    }
}
class SetSortByPathAction extends SetSortKeyAction {
    constructor() {
        super("path" /* ViewSortKey.Path */, localize('sortChangesByPath', "Sort Changes by Path"));
    }
}
class SetSortByStatusAction extends SetSortKeyAction {
    constructor() {
        super("status" /* ViewSortKey.Status */, localize('sortChangesByStatus', "Sort Changes by Status"));
    }
}
registerAction2(SetSortByNameAction);
registerAction2(SetSortByPathAction);
registerAction2(SetSortByStatusAction);
class CollapseAllRepositoriesAction extends ViewAction {
    constructor() {
        super({
            id: `workbench.scm.action.collapseAllRepositories`,
            title: localize('collapse all', "Collapse All Repositories"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.collapseAll,
            menu: {
                id: MenuId.SCMTitle,
                group: 'navigation',
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.SCMViewIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.SCMViewAreAllRepositoriesCollapsed.isEqualTo(false))
            }
        });
    }
    async runInView(_, view) {
        view.collapseAllRepositories();
    }
}
class ExpandAllRepositoriesAction extends ViewAction {
    constructor() {
        super({
            id: `workbench.scm.action.expandAllRepositories`,
            title: localize('expand all', "Expand All Repositories"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.expandAll,
            menu: {
                id: MenuId.SCMTitle,
                group: 'navigation',
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.SCMViewIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.SCMViewAreAllRepositoriesCollapsed.isEqualTo(true))
            }
        });
    }
    async runInView(_, view) {
        view.expandAllRepositories();
    }
}
registerAction2(CollapseAllRepositoriesAction);
registerAction2(ExpandAllRepositoriesAction);
let SCMInputWidgetActionRunner = class SCMInputWidgetActionRunner extends ActionRunner {
    get runningActions() { return this._runningActions; }
    constructor(input, storageService) {
        super();
        this.input = input;
        this.storageService = storageService;
        this._runningActions = new Set();
    }
    async runAction(action) {
        try {
            // Cancel previous action
            if (this.runningActions.size !== 0) {
                this._cts?.cancel();
                if (action.id === "scm.input.cancelAction" /* SCMInputWidgetCommandId.CancelAction */) {
                    return;
                }
            }
            // Create action context
            const context = [];
            for (const group of this.input.repository.provider.groups) {
                context.push({
                    resourceGroupId: group.id,
                    resources: [...group.resources.map(r => r.sourceUri)]
                });
            }
            // Run action
            this._runningActions.add(action);
            this._cts = new CancellationTokenSource();
            await action.run(...[this.input.repository.provider.rootUri, context, this._cts.token]);
        }
        finally {
            this._runningActions.delete(action);
            // Save last action
            if (this._runningActions.size === 0) {
                this.storageService.store("scm.input.lastActionId" /* SCMInputWidgetStorageKey.LastActionId */, action.id, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
    }
};
SCMInputWidgetActionRunner = __decorate([
    __param(1, IStorageService),
    __metadata("design:paramtypes", [Object, Object])
], SCMInputWidgetActionRunner);
let SCMInputWidgetToolbar = class SCMInputWidgetToolbar extends WorkbenchToolBar {
    get dropdownActions() { return this._dropdownActions; }
    get dropdownAction() { return this._dropdownAction; }
    constructor(container, options, menuService, contextKeyService, contextMenuService, commandService, keybindingService, storageService, telemetryService) {
        super(container, { resetMenu: MenuId.SCMInputBox, ...options }, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.storageService = storageService;
        this._dropdownActions = [];
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._disposables = this._register(new MutableDisposable());
        this._dropdownAction = new Action('scmInputMoreActions', localize('scmInputMoreActions', "More Actions..."), 'codicon-chevron-down');
        this._cancelAction = new MenuItemAction({
            id: "scm.input.cancelAction" /* SCMInputWidgetCommandId.CancelAction */,
            title: localize('scmInputCancelAction', "Cancel"),
            icon: Codicon.debugStop,
        }, undefined, undefined, undefined, undefined, contextKeyService, commandService);
    }
    setInput(input) {
        this._disposables.value = new DisposableStore();
        const contextKeyService = this.contextKeyService.createOverlay([
            ['scmProvider', input.repository.provider.contextValue],
            ['scmProviderRootUri', input.repository.provider.rootUri?.toString()],
            ['scmProviderHasRootUri', !!input.repository.provider.rootUri]
        ]);
        const menu = this._disposables.value.add(this.menuService.createMenu(MenuId.SCMInputBox, contextKeyService, { emitEventsForSubmenuChanges: true }));
        const isEnabled = () => {
            return input.repository.provider.groups.some(g => g.resources.length > 0);
        };
        const updateToolbar = () => {
            const actions = [];
            createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, actions);
            for (const action of actions) {
                action.enabled = isEnabled();
            }
            this._dropdownAction.enabled = isEnabled();
            let primaryAction = undefined;
            if (actions.length === 1) {
                primaryAction = actions[0];
            }
            else if (actions.length > 1) {
                const lastActionId = this.storageService.get("scm.input.lastActionId" /* SCMInputWidgetStorageKey.LastActionId */, 0 /* StorageScope.PROFILE */, '');
                primaryAction = actions.find(a => a.id === lastActionId) ?? actions[0];
            }
            this._dropdownActions = actions.length === 1 ? [] : actions;
            super.setActions(primaryAction ? [primaryAction] : [], []);
            this._onDidChange.fire();
        };
        this._disposables.value.add(menu.onDidChange(() => updateToolbar()));
        this._disposables.value.add(input.repository.provider.onDidChangeResources(() => updateToolbar()));
        this._disposables.value.add(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, "scm.input.lastActionId" /* SCMInputWidgetStorageKey.LastActionId */, this._disposables.value)(() => updateToolbar()));
        this.actionRunner = new SCMInputWidgetActionRunner(input, this.storageService);
        this._disposables.value.add(this.actionRunner.onWillRun(e => {
            if (this.actionRunner.runningActions.size === 0) {
                super.setActions([this._cancelAction], []);
                this._onDidChange.fire();
            }
        }));
        this._disposables.value.add(this.actionRunner.onDidRun(e => {
            if (this.actionRunner.runningActions.size === 0) {
                updateToolbar();
            }
        }));
        updateToolbar();
    }
};
SCMInputWidgetToolbar = __decorate([
    __param(2, IMenuService),
    __param(3, IContextKeyService),
    __param(4, IContextMenuService),
    __param(5, ICommandService),
    __param(6, IKeybindingService),
    __param(7, IStorageService),
    __param(8, ITelemetryService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object])
], SCMInputWidgetToolbar);
class SCMInputWidgetEditorOptions {
    constructor(overflowWidgetsDomNode, configurationService) {
        this.overflowWidgetsDomNode = overflowWidgetsDomNode;
        this.configurationService = configurationService;
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this.defaultInputFontFamily = DEFAULT_FONT_FAMILY;
        this._disposables = new DisposableStore();
        const onDidChangeConfiguration = Event.filter(this.configurationService.onDidChangeConfiguration, e => {
            return e.affectsConfiguration('editor.accessibilitySupport') ||
                e.affectsConfiguration('editor.cursorBlinking') ||
                e.affectsConfiguration('editor.fontFamily') ||
                e.affectsConfiguration('editor.rulers') ||
                e.affectsConfiguration('editor.wordWrap') ||
                e.affectsConfiguration('scm.inputFontFamily') ||
                e.affectsConfiguration('scm.inputFontSize');
        }, this._disposables);
        this._disposables.add(onDidChangeConfiguration(() => this._onDidChange.fire()));
    }
    getEditorConstructionOptions() {
        const fontFamily = this._getEditorFontFamily();
        const fontSize = this._getEditorFontSize();
        const lineHeight = this._getEditorLineHeight(fontSize);
        return {
            ...getSimpleEditorOptions(this.configurationService),
            ...this._getEditorLanguageConfiguration(),
            cursorWidth: 1,
            dragAndDrop: true,
            dropIntoEditor: { enabled: true },
            fontFamily: fontFamily,
            fontSize: fontSize,
            formatOnType: true,
            lineDecorationsWidth: 6,
            lineHeight: lineHeight,
            overflowWidgetsDomNode: this.overflowWidgetsDomNode,
            padding: { top: 2, bottom: 2 },
            quickSuggestions: false,
            renderWhitespace: 'none',
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                vertical: 'hidden'
            },
            wrappingIndent: 'none',
            wrappingStrategy: 'advanced',
        };
    }
    getEditorOptions() {
        const fontFamily = this._getEditorFontFamily();
        const fontSize = this._getEditorFontSize();
        const lineHeight = this._getEditorLineHeight(fontSize);
        const accessibilitySupport = this.configurationService.getValue('editor.accessibilitySupport');
        const cursorBlinking = this.configurationService.getValue('editor.cursorBlinking');
        return { ...this._getEditorLanguageConfiguration(), accessibilitySupport, cursorBlinking, fontFamily, fontSize, lineHeight };
    }
    _getEditorFontFamily() {
        const inputFontFamily = this.configurationService.getValue('scm.inputFontFamily').trim();
        if (inputFontFamily.toLowerCase() === 'editor') {
            return this.configurationService.getValue('editor.fontFamily').trim();
        }
        if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== 'default') {
            return inputFontFamily;
        }
        return this.defaultInputFontFamily;
    }
    _getEditorFontSize() {
        return this.configurationService.getValue('scm.inputFontSize');
    }
    _getEditorLanguageConfiguration() {
        // editor.rulers
        const rulersConfig = this.configurationService.inspect('editor.rulers', { overrideIdentifier: 'scminput' });
        const rulers = rulersConfig.overrideIdentifiers?.includes('scminput') ? EditorOptions.rulers.validate(rulersConfig.value) : [];
        // editor.wordWrap
        const wordWrapConfig = this.configurationService.inspect('editor.wordWrap', { overrideIdentifier: 'scminput' });
        const wordWrap = wordWrapConfig.overrideIdentifiers?.includes('scminput') ? EditorOptions.wordWrap.validate(wordWrapConfig.value) : 'on';
        return { rulers, wordWrap };
    }
    _getEditorLineHeight(fontSize) {
        return Math.round(fontSize * 1.5);
    }
    dispose() {
        this._disposables.dispose();
    }
}
let SCMInputWidget = class SCMInputWidget {
    static { SCMInputWidget_1 = this; }
    static { this.ValidationTimeouts = {
        [2 /* InputValidationType.Information */]: 5000,
        [1 /* InputValidationType.Warning */]: 8000,
        [0 /* InputValidationType.Error */]: 10000
    }; }
    get input() {
        return this.model?.input;
    }
    set input(input) {
        if (input === this.input) {
            return;
        }
        this.clearValidation();
        this.element.classList.remove('synthetic-focus');
        this.repositoryDisposables.clear();
        this.repositoryIdContextKey.set(input?.repository.id);
        if (!input) {
            this.inputEditor.setModel(undefined);
            this.model = undefined;
            return;
        }
        const textModel = input.repository.provider.inputBoxTextModel;
        this.inputEditor.setModel(textModel);
        if (this.configurationService.getValue('editor.wordBasedSuggestions', { resource: textModel.uri }) !== 'off') {
            this.configurationService.updateValue('editor.wordBasedSuggestions', 'off', { resource: textModel.uri }, 8 /* ConfigurationTarget.MEMORY */);
        }
        // Validation
        const validationDelayer = new ThrottledDelayer(200);
        const validate = async () => {
            const position = this.inputEditor.getSelection()?.getStartPosition();
            const offset = position && textModel.getOffsetAt(position);
            const value = textModel.getValue();
            this.setValidation(await input.validateInput(value, offset || 0));
        };
        const triggerValidation = () => validationDelayer.trigger(validate);
        this.repositoryDisposables.add(validationDelayer);
        this.repositoryDisposables.add(this.inputEditor.onDidChangeCursorPosition(triggerValidation));
        // Adaptive indentation rules
        const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
        const onEnter = Event.filter(this.inputEditor.onKeyDown, e => e.keyCode === 3 /* KeyCode.Enter */, this.repositoryDisposables);
        this.repositoryDisposables.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
        // Keep model in sync with API
        textModel.setValue(input.value);
        this.repositoryDisposables.add(input.onDidChange(({ value, reason }) => {
            const currentValue = textModel.getValue();
            if (value === currentValue) { // circuit breaker
                return;
            }
            textModel.pushStackElement();
            textModel.pushEditOperations(null, [EditOperation.replaceMove(textModel.getFullModelRange(), value)], () => []);
            const position = reason === SCMInputChangeReason.HistoryPrevious
                ? textModel.getFullModelRange().getStartPosition()
                : textModel.getFullModelRange().getEndPosition();
            this.inputEditor.setPosition(position);
            this.inputEditor.revealPositionInCenterIfOutsideViewport(position);
        }));
        this.repositoryDisposables.add(input.onDidChangeFocus(() => this.focus()));
        this.repositoryDisposables.add(input.onDidChangeValidationMessage((e) => this.setValidation(e, { focus: true, timeout: true })));
        this.repositoryDisposables.add(input.onDidChangeValidateInput((e) => triggerValidation()));
        // Keep API in sync with model and validate
        this.repositoryDisposables.add(textModel.onDidChangeContent(() => {
            input.setValue(textModel.getValue(), true);
            triggerValidation();
        }));
        // Update placeholder text
        const updatePlaceholderText = () => {
            const binding = this.keybindingService.lookupKeybinding('scm.acceptInput');
            const label = binding ? binding.getLabel() : (platform.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter');
            const placeholderText = format(input.placeholder, label);
            this.inputEditor.updateOptions({ placeholder: placeholderText });
        };
        this.repositoryDisposables.add(input.onDidChangePlaceholder(updatePlaceholderText));
        this.repositoryDisposables.add(this.keybindingService.onDidUpdateKeybindings(updatePlaceholderText));
        updatePlaceholderText();
        // Update input template
        let commitTemplate = '';
        this.repositoryDisposables.add(autorun(reader => {
            if (!input.visible) {
                return;
            }
            const oldCommitTemplate = commitTemplate;
            commitTemplate = input.repository.provider.commitTemplate.read(reader);
            const value = textModel.getValue();
            if (value && value !== oldCommitTemplate) {
                return;
            }
            textModel.setValue(commitTemplate);
        }));
        // Update input enablement
        const updateEnablement = (enabled) => {
            this.inputEditor.updateOptions({ readOnly: !enabled });
        };
        this.repositoryDisposables.add(input.onDidChangeEnablement(enabled => updateEnablement(enabled)));
        updateEnablement(input.enabled);
        // Toolbar
        this.toolbar.setInput(input);
        // Save model
        this.model = { input, textModel };
    }
    get selections() {
        return this.inputEditor.getSelections();
    }
    set selections(selections) {
        if (selections) {
            this.inputEditor.setSelections(selections);
        }
    }
    setValidation(validation, options) {
        if (this._validationTimer) {
            clearTimeout(this._validationTimer);
            this._validationTimer = 0;
        }
        this.validation = validation;
        this.renderValidation();
        if (options?.focus && !this.hasFocus()) {
            this.focus();
        }
        if (validation && options?.timeout) {
            this._validationTimer = setTimeout(() => this.setValidation(undefined), SCMInputWidget_1.ValidationTimeouts[validation.type]);
        }
    }
    constructor(container, overflowWidgetsDomNode, contextKeyService, modelService, keybindingService, configurationService, instantiationService, scmViewService, contextViewService, openerService) {
        this.modelService = modelService;
        this.keybindingService = keybindingService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.scmViewService = scmViewService;
        this.contextViewService = contextViewService;
        this.openerService = openerService;
        this.disposables = new DisposableStore();
        this.repositoryDisposables = new DisposableStore();
        this.validationHasFocus = false;
        // This is due to "Setup height change listener on next tick" above
        // https://github.com/microsoft/vscode/issues/108067
        this.lastLayoutWasTrash = false;
        this.shouldFocusAfterLayout = false;
        this.element = append(container, $('.scm-editor'));
        this.editorContainer = append(this.element, $('.scm-editor-container'));
        this.toolbarContainer = append(this.element, $('.scm-editor-toolbar'));
        this.contextKeyService = contextKeyService.createScoped(this.element);
        this.repositoryIdContextKey = this.contextKeyService.createKey('scmRepository', undefined);
        this.inputEditorOptions = new SCMInputWidgetEditorOptions(overflowWidgetsDomNode, this.configurationService);
        this.disposables.add(this.inputEditorOptions.onDidChange(this.onDidChangeEditorOptions, this));
        this.disposables.add(this.inputEditorOptions);
        const codeEditorWidgetOptions = {
            contributions: EditorExtensionsRegistry.getSomeEditorContributions([
                CodeActionController.ID,
                ColorDetector.ID,
                ContextMenuController.ID,
                CopyPasteController.ID,
                DragAndDropController.ID,
                DropIntoEditorController.ID,
                EditorDictation.ID,
                FormatOnType.ID,
                ContentHoverController.ID,
                GlyphHoverController.ID,
                InlineCompletionsController.ID,
                LinkDetector.ID,
                MenuPreventer.ID,
                MessageController.ID,
                PlaceholderTextContribution.ID,
                SelectionClipboardContributionID,
                SnippetController2.ID,
                SuggestController.ID
            ]),
            isSimpleWidget: true
        };
        const services = new ServiceCollection([IContextKeyService, this.contextKeyService]);
        const instantiationService2 = instantiationService.createChild(services, this.disposables);
        const editorConstructionOptions = this.inputEditorOptions.getEditorConstructionOptions();
        this.inputEditor = instantiationService2.createInstance(CodeEditorWidget, this.editorContainer, editorConstructionOptions, codeEditorWidgetOptions);
        this.disposables.add(this.inputEditor);
        this.disposables.add(this.inputEditor.onDidFocusEditorText(() => {
            if (this.input?.repository) {
                this.scmViewService.focus(this.input.repository);
            }
            this.element.classList.add('synthetic-focus');
            this.renderValidation();
        }));
        this.disposables.add(this.inputEditor.onDidBlurEditorText(() => {
            this.element.classList.remove('synthetic-focus');
            setTimeout(() => {
                if (!this.validation || !this.validationHasFocus) {
                    this.clearValidation();
                }
            }, 0);
        }));
        this.disposables.add(this.inputEditor.onDidBlurEditorWidget(() => {
            CopyPasteController.get(this.inputEditor)?.clearWidgets();
            DropIntoEditorController.get(this.inputEditor)?.clearWidgets();
        }));
        const firstLineKey = this.contextKeyService.createKey('scmInputIsInFirstPosition', false);
        const lastLineKey = this.contextKeyService.createKey('scmInputIsInLastPosition', false);
        this.disposables.add(this.inputEditor.onDidChangeCursorPosition(({ position }) => {
            const viewModel = this.inputEditor._getViewModel();
            const lastLineNumber = viewModel.getLineCount();
            const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
            const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
            firstLineKey.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
            lastLineKey.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
        }));
        this.disposables.add(this.inputEditor.onDidScrollChange(e => {
            this.toolbarContainer.classList.toggle('scroll-decoration', e.scrollTop > 0);
        }));
        Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.showInputActionButton'))(() => this.layout(), this, this.disposables);
        this.onDidChangeContentHeight = Event.signal(Event.filter(this.inputEditor.onDidContentSizeChange, e => e.contentHeightChanged, this.disposables));
        // Toolbar
        this.toolbar = instantiationService2.createInstance(SCMInputWidgetToolbar, this.toolbarContainer, {
            actionViewItemProvider: (action, options) => {
                if (action instanceof MenuItemAction && this.toolbar.dropdownActions.length > 1) {
                    return instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, this.toolbar.dropdownAction, this.toolbar.dropdownActions, '', { actionRunner: this.toolbar.actionRunner, hoverDelegate: options.hoverDelegate });
                }
                return createActionViewItem(instantiationService, action, options);
            },
            menuOptions: {
                shouldForwardArgs: true
            }
        });
        this.disposables.add(this.toolbar.onDidChange(() => this.layout()));
        this.disposables.add(this.toolbar);
    }
    getContentHeight() {
        const lineHeight = this.inputEditor.getOption(69 /* EditorOption.lineHeight */);
        const { top, bottom } = this.inputEditor.getOption(87 /* EditorOption.padding */);
        const inputMinLinesConfig = this.configurationService.getValue('scm.inputMinLineCount');
        const inputMinLines = typeof inputMinLinesConfig === 'number' ? clamp(inputMinLinesConfig, 1, 50) : 1;
        const editorMinHeight = inputMinLines * lineHeight + top + bottom;
        const inputMaxLinesConfig = this.configurationService.getValue('scm.inputMaxLineCount');
        const inputMaxLines = typeof inputMaxLinesConfig === 'number' ? clamp(inputMaxLinesConfig, 1, 50) : 10;
        const editorMaxHeight = inputMaxLines * lineHeight + top + bottom;
        return clamp(this.inputEditor.getContentHeight(), editorMinHeight, editorMaxHeight);
    }
    layout() {
        const editorHeight = this.getContentHeight();
        const toolbarWidth = this.getToolbarWidth();
        const dimension = new Dimension(this.element.clientWidth - toolbarWidth, editorHeight);
        if (dimension.width < 0) {
            this.lastLayoutWasTrash = true;
            return;
        }
        this.lastLayoutWasTrash = false;
        this.inputEditor.layout(dimension);
        this.renderValidation();
        const showInputActionButton = this.configurationService.getValue('scm.showInputActionButton') === true;
        this.toolbarContainer.classList.toggle('hidden', !showInputActionButton || this.toolbar?.isEmpty() === true);
        if (this.shouldFocusAfterLayout) {
            this.shouldFocusAfterLayout = false;
            this.focus();
        }
    }
    focus() {
        if (this.lastLayoutWasTrash) {
            this.lastLayoutWasTrash = false;
            this.shouldFocusAfterLayout = true;
            return;
        }
        this.inputEditor.focus();
        this.element.classList.add('synthetic-focus');
    }
    hasFocus() {
        return this.inputEditor.hasTextFocus();
    }
    onDidChangeEditorOptions() {
        this.inputEditor.updateOptions(this.inputEditorOptions.getEditorOptions());
    }
    renderValidation() {
        this.clearValidation();
        this.element.classList.toggle('validation-info', this.validation?.type === 2 /* InputValidationType.Information */);
        this.element.classList.toggle('validation-warning', this.validation?.type === 1 /* InputValidationType.Warning */);
        this.element.classList.toggle('validation-error', this.validation?.type === 0 /* InputValidationType.Error */);
        if (!this.validation || !this.inputEditor.hasTextFocus()) {
            return;
        }
        const disposables = new DisposableStore();
        this.validationContextView = this.contextViewService.showContextView({
            getAnchor: () => this.element,
            render: container => {
                this.element.style.borderBottomLeftRadius = '0';
                this.element.style.borderBottomRightRadius = '0';
                const validationContainer = append(container, $('.scm-editor-validation-container'));
                validationContainer.classList.toggle('validation-info', this.validation.type === 2 /* InputValidationType.Information */);
                validationContainer.classList.toggle('validation-warning', this.validation.type === 1 /* InputValidationType.Warning */);
                validationContainer.classList.toggle('validation-error', this.validation.type === 0 /* InputValidationType.Error */);
                validationContainer.style.width = `${this.element.clientWidth + 2}px`;
                const element = append(validationContainer, $('.scm-editor-validation'));
                const message = this.validation.message;
                if (typeof message === 'string') {
                    element.textContent = message;
                }
                else {
                    const tracker = trackFocus(element);
                    disposables.add(tracker);
                    disposables.add(tracker.onDidFocus(() => (this.validationHasFocus = true)));
                    disposables.add(tracker.onDidBlur(() => {
                        this.validationHasFocus = false;
                        this.element.style.borderBottomLeftRadius = '2px';
                        this.element.style.borderBottomRightRadius = '2px';
                        this.contextViewService.hideContextView();
                    }));
                    const renderer = disposables.add(this.instantiationService.createInstance(MarkdownRenderer, {}));
                    const renderedMarkdown = renderer.render(message, {
                        actionHandler: {
                            callback: (link) => {
                                openLinkFromMarkdown(this.openerService, link, message.isTrusted);
                                this.element.style.borderBottomLeftRadius = '2px';
                                this.element.style.borderBottomRightRadius = '2px';
                                this.contextViewService.hideContextView();
                            },
                            disposables: disposables
                        },
                    });
                    disposables.add(renderedMarkdown);
                    element.appendChild(renderedMarkdown.element);
                }
                const actionsContainer = append(validationContainer, $('.scm-editor-validation-actions'));
                const actionbar = new ActionBar(actionsContainer);
                const action = new Action('scmInputWidget.validationMessage.close', localize('label.close', "Close"), ThemeIcon.asClassName(Codicon.close), true, () => {
                    this.contextViewService.hideContextView();
                    this.element.style.borderBottomLeftRadius = '2px';
                    this.element.style.borderBottomRightRadius = '2px';
                });
                disposables.add(actionbar);
                actionbar.push(action, { icon: true, label: false });
                return Disposable.None;
            },
            onHide: () => {
                this.validationHasFocus = false;
                this.element.style.borderBottomLeftRadius = '2px';
                this.element.style.borderBottomRightRadius = '2px';
                disposables.dispose();
            },
            anchorAlignment: 0 /* AnchorAlignment.LEFT */
        });
    }
    getToolbarWidth() {
        const showInputActionButton = this.configurationService.getValue('scm.showInputActionButton');
        if (!this.toolbar || !showInputActionButton || this.toolbar?.isEmpty() === true) {
            return 0;
        }
        return this.toolbar.dropdownActions.length === 0 ?
            26 /* 22px action + 4px margin */ :
            39 /* 35px action + 4px margin */;
    }
    clearValidation() {
        this.validationContextView?.close();
        this.validationContextView = undefined;
        this.validationHasFocus = false;
    }
    dispose() {
        this.input = undefined;
        this.repositoryDisposables.dispose();
        this.clearValidation();
        this.disposables.dispose();
    }
};
SCMInputWidget = SCMInputWidget_1 = __decorate([
    __param(2, IContextKeyService),
    __param(3, IModelService),
    __param(4, IKeybindingService),
    __param(5, IConfigurationService),
    __param(6, IInstantiationService),
    __param(7, ISCMViewService),
    __param(8, IContextViewService),
    __param(9, IOpenerService),
    __metadata("design:paramtypes", [HTMLElement,
        HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object])
], SCMInputWidget);
let SCMViewPane = class SCMViewPane extends ViewPane {
    get viewMode() { return this._viewMode; }
    set viewMode(mode) {
        if (this._viewMode === mode) {
            return;
        }
        this._viewMode = mode;
        // Update sort key based on view mode
        this.viewSortKey = this.getViewSortKey();
        this.updateChildren();
        this.onDidActiveEditorChange();
        this._onDidChangeViewMode.fire(mode);
        this.viewModeContextKey.set(mode);
        this.updateIndentStyles(this.themeService.getFileIconTheme());
        this.storageService.store(`scm.viewMode`, mode, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
    }
    get viewSortKey() { return this._viewSortKey; }
    set viewSortKey(sortKey) {
        if (this._viewSortKey === sortKey) {
            return;
        }
        this._viewSortKey = sortKey;
        this.updateChildren();
        this.viewSortKeyContextKey.set(sortKey);
        this._onDidChangeViewSortKey.fire(sortKey);
        if (this._viewMode === "list" /* ViewMode.List */) {
            this.storageService.store(`scm.viewSortKey`, sortKey, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
    }
    constructor(options, commandService, editorService, menuService, scmService, scmViewService, storageService, uriIdentityService, keybindingService, themeService, contextMenuService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, telemetryService, hoverService) {
        super({ ...options, titleMenuId: MenuId.SCMTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.commandService = commandService;
        this.editorService = editorService;
        this.menuService = menuService;
        this.scmService = scmService;
        this.scmViewService = scmViewService;
        this.storageService = storageService;
        this.uriIdentityService = uriIdentityService;
        this._onDidChangeViewMode = new Emitter();
        this.onDidChangeViewMode = this._onDidChangeViewMode.event;
        this._onDidChangeViewSortKey = new Emitter();
        this.onDidChangeViewSortKey = this._onDidChangeViewSortKey.event;
        this.items = new DisposableMap();
        this.visibilityDisposables = new DisposableStore();
        this.treeOperationSequencer = new Sequencer();
        this.revealResourceThrottler = new Throttler();
        this.updateChildrenThrottler = new Throttler();
        this.disposables = new DisposableStore();
        // View mode and sort key
        this._viewMode = this.getViewMode();
        this._viewSortKey = this.getViewSortKey();
        // Context Keys
        this.viewModeContextKey = ContextKeys.SCMViewMode.bindTo(contextKeyService);
        this.viewModeContextKey.set(this._viewMode);
        this.viewSortKeyContextKey = ContextKeys.SCMViewSortKey.bindTo(contextKeyService);
        this.viewSortKeyContextKey.set(this.viewSortKey);
        this.areAllRepositoriesCollapsedContextKey = ContextKeys.SCMViewAreAllRepositoriesCollapsed.bindTo(contextKeyService);
        this.isAnyRepositoryCollapsibleContextKey = ContextKeys.SCMViewIsAnyRepositoryCollapsible.bindTo(contextKeyService);
        this.scmProviderContextKey = ContextKeys.SCMProvider.bindTo(contextKeyService);
        this.scmProviderRootUriContextKey = ContextKeys.SCMProviderRootUri.bindTo(contextKeyService);
        this.scmProviderHasRootUriContextKey = ContextKeys.SCMProviderHasRootUri.bindTo(contextKeyService);
        this._onDidLayout = new Emitter();
        this.layoutCache = { height: undefined, width: undefined, onDidChange: this._onDidLayout.event };
        this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, this.disposables)(e => {
            switch (e.key) {
                case 'scm.viewMode':
                    this.viewMode = this.getViewMode();
                    break;
                case 'scm.viewSortKey':
                    this.viewSortKey = this.getViewSortKey();
                    break;
            }
        }, this, this.disposables);
        this.storageService.onWillSaveState(e => {
            this.viewMode = this.getViewMode();
            this.viewSortKey = this.getViewSortKey();
            this.storeTreeViewState();
        }, this, this.disposables);
        Event.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository)(() => this._onDidChangeViewWelcomeState.fire(), this, this.disposables);
        this.disposables.add(this.revealResourceThrottler);
        this.disposables.add(this.updateChildrenThrottler);
    }
    layoutBody(height = this.layoutCache.height, width = this.layoutCache.width) {
        if (height === undefined) {
            return;
        }
        if (width !== undefined) {
            super.layoutBody(height, width);
        }
        this.layoutCache.height = height;
        this.layoutCache.width = width;
        this._onDidLayout.fire();
        this.treeContainer.style.height = `${height}px`;
        this.tree.layout(height, width);
    }
    renderBody(container) {
        super.renderBody(container);
        // Tree
        this.treeContainer = append(container, $('.scm-view.show-file-icons'));
        this.treeContainer.classList.add('file-icon-themable-tree');
        this.treeContainer.classList.add('show-file-icons');
        const updateActionsVisibility = () => this.treeContainer.classList.toggle('show-actions', this.configurationService.getValue('scm.alwaysShowActions'));
        Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowActions'), this.disposables)(updateActionsVisibility, this, this.disposables);
        updateActionsVisibility();
        const updateProviderCountVisibility = () => {
            const value = this.configurationService.getValue('scm.providerCountBadge');
            this.treeContainer.classList.toggle('hide-provider-counts', value === 'hidden');
            this.treeContainer.classList.toggle('auto-provider-counts', value === 'auto');
        };
        Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.providerCountBadge'), this.disposables)(updateProviderCountVisibility, this, this.disposables);
        updateProviderCountVisibility();
        const viewState = this.loadTreeViewState();
        this.createTree(this.treeContainer, viewState);
        this.onDidChangeBodyVisibility(async (visible) => {
            if (visible) {
                this.treeOperationSequencer.queue(async () => {
                    await this.tree.setInput(this.scmViewService, viewState);
                    Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowRepositories'), this.visibilityDisposables)(() => {
                        this.updateActions();
                        this.updateChildren();
                    }, this, this.visibilityDisposables);
                    Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.inputMinLineCount') ||
                        e.affectsConfiguration('scm.inputMaxLineCount') ||
                        e.affectsConfiguration('scm.showActionButton'), this.visibilityDisposables)(() => this.updateChildren(), this, this.visibilityDisposables);
                    // Add visible repositories
                    this.editorService.onDidActiveEditorChange(this.onDidActiveEditorChange, this, this.visibilityDisposables);
                    this.scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.visibilityDisposables);
                    this.onDidChangeVisibleRepositories({ added: this.scmViewService.visibleRepositories, removed: Iterable.empty() });
                    // Restore scroll position
                    if (typeof this.treeScrollTop === 'number') {
                        this.tree.scrollTop = this.treeScrollTop;
                        this.treeScrollTop = undefined;
                    }
                    this.updateRepositoryCollapseAllContextKeys();
                });
            }
            else {
                this.visibilityDisposables.clear();
                this.onDidChangeVisibleRepositories({ added: Iterable.empty(), removed: [...this.items.keys()] });
                this.treeScrollTop = this.tree.scrollTop;
                this.updateRepositoryCollapseAllContextKeys();
            }
        }, this, this.disposables);
        this.disposables.add(this.instantiationService.createInstance(RepositoryVisibilityActionController));
        this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this, this.disposables);
        this.updateIndentStyles(this.themeService.getFileIconTheme());
    }
    createTree(container, viewState) {
        const overflowWidgetsDomNode = $('.scm-overflow-widgets-container.monaco-editor');
        this.inputRenderer = this.instantiationService.createInstance(InputRenderer, this.layoutCache, overflowWidgetsDomNode, (input, height) => {
            try {
                // Attempt to update the input element height. There is an
                // edge case where the input has already been disposed and
                // updating the height would fail.
                this.tree.updateElementHeight(input, height);
            }
            catch { }
        });
        this.actionButtonRenderer = this.instantiationService.createInstance(ActionButtonRenderer);
        this.listLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
        this.disposables.add(this.listLabels);
        const resourceActionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
        resourceActionRunner.onWillRun(() => this.tree.domFocus(), this, this.disposables);
        this.disposables.add(resourceActionRunner);
        const treeDataSource = this.instantiationService.createInstance(SCMTreeDataSource, () => this.viewMode);
        this.disposables.add(treeDataSource);
        const compressionEnabled = observableConfigValue('scm.compactFolders', true, this.configurationService);
        this.tree = this.instantiationService.createInstance(WorkbenchCompressibleAsyncDataTree, 'SCM Tree Repo', container, new ListDelegate(this.inputRenderer), new SCMTreeCompressionDelegate(), [
            this.inputRenderer,
            this.actionButtonRenderer,
            this.instantiationService.createInstance(RepositoryRenderer, MenuId.SCMTitle, getActionViewItemProvider(this.instantiationService)),
            this.instantiationService.createInstance(ResourceGroupRenderer, getActionViewItemProvider(this.instantiationService)),
            this.instantiationService.createInstance(ResourceRenderer, () => this.viewMode, this.listLabels, getActionViewItemProvider(this.instantiationService), resourceActionRunner)
        ], treeDataSource, {
            horizontalScrolling: false,
            setRowLineHeight: false,
            transformOptimization: false,
            filter: new SCMTreeFilter(),
            dnd: new SCMTreeDragAndDrop(this.instantiationService),
            identityProvider: new SCMResourceIdentityProvider(),
            sorter: new SCMTreeSorter(() => this.viewMode, () => this.viewSortKey),
            keyboardNavigationLabelProvider: this.instantiationService.createInstance(SCMTreeKeyboardNavigationLabelProvider, () => this.viewMode),
            overrideStyles: this.getLocationBasedColors().listOverrideStyles,
            compressionEnabled: compressionEnabled.get(),
            collapseByDefault: (e) => {
                // Repository, Resource Group, Resource Folder (Tree)
                if (isSCMRepository(e) || isSCMResourceGroup(e) || isSCMResourceNode(e)) {
                    return false;
                }
                // History Item Group, History Item, or History Item Change
                return (viewState?.expanded ?? []).indexOf(getSCMResourceId(e)) === -1;
            },
            accessibilityProvider: this.instantiationService.createInstance(SCMAccessibilityProvider)
        });
        this.disposables.add(this.tree);
        this.tree.onDidOpen(this.open, this, this.disposables);
        this.tree.onContextMenu(this.onListContextMenu, this, this.disposables);
        this.tree.onDidScroll(this.inputRenderer.clearValidation, this.inputRenderer, this.disposables);
        Event.filter(this.tree.onDidChangeCollapseState, e => isSCMRepository(e.node.element?.element), this.disposables)(this.updateRepositoryCollapseAllContextKeys, this, this.disposables);
        this.disposables.add(autorun(reader => {
            this.tree.updateOptions({
                compressionEnabled: compressionEnabled.read(reader)
            });
        }));
        append(container, overflowWidgetsDomNode);
    }
    async open(e) {
        if (!e.element) {
            return;
        }
        else if (isSCMRepository(e.element)) {
            this.scmViewService.focus(e.element);
            return;
        }
        else if (isSCMInput(e.element)) {
            this.scmViewService.focus(e.element.repository);
            const widget = this.inputRenderer.getRenderedInputWidget(e.element);
            if (widget) {
                widget.focus();
                this.tree.setFocus([], e.browserEvent);
                const selection = this.tree.getSelection();
                if (selection.length === 1 && selection[0] === e.element) {
                    setTimeout(() => this.tree.setSelection([]));
                }
            }
            return;
        }
        else if (isSCMActionButton(e.element)) {
            this.scmViewService.focus(e.element.repository);
            // Focus the action button
            this.actionButtonRenderer.focusActionButton(e.element);
            this.tree.setFocus([], e.browserEvent);
            return;
        }
        else if (isSCMResourceGroup(e.element)) {
            const provider = e.element.provider;
            const repository = Iterable.find(this.scmService.repositories, r => r.provider === provider);
            if (repository) {
                this.scmViewService.focus(repository);
            }
            return;
        }
        else if (isSCMResource(e.element)) {
            if (e.element.command?.id === API_OPEN_EDITOR_COMMAND_ID || e.element.command?.id === API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                if (isPointerEvent(e.browserEvent) && e.browserEvent.button === 1) {
                    const resourceGroup = e.element.resourceGroup;
                    const title = `${resourceGroup.provider.label}: ${resourceGroup.label}`;
                    await OpenScmGroupAction.openMultiFileDiffEditor(this.editorService, title, resourceGroup.provider.rootUri, resourceGroup.id, {
                        ...e.editorOptions,
                        viewState: {
                            revealData: {
                                resource: {
                                    original: e.element.multiDiffEditorOriginalUri,
                                    modified: e.element.multiDiffEditorModifiedUri,
                                }
                            }
                        },
                        preserveFocus: true,
                    });
                }
                else {
                    await this.commandService.executeCommand(e.element.command.id, ...(e.element.command.arguments || []), e);
                }
            }
            else {
                await e.element.open(!!e.editorOptions.preserveFocus);
                if (e.editorOptions.pinned) {
                    const activeEditorPane = this.editorService.activeEditorPane;
                    activeEditorPane?.group.pinEditor(activeEditorPane.input);
                }
            }
            const provider = e.element.resourceGroup.provider;
            const repository = Iterable.find(this.scmService.repositories, r => r.provider === provider);
            if (repository) {
                this.scmViewService.focus(repository);
            }
        }
        else if (isSCMResourceNode(e.element)) {
            const provider = e.element.context.provider;
            const repository = Iterable.find(this.scmService.repositories, r => r.provider === provider);
            if (repository) {
                this.scmViewService.focus(repository);
            }
            return;
        }
    }
    onDidActiveEditorChange() {
        if (!this.configurationService.getValue('scm.autoReveal')) {
            return;
        }
        const uri = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
        if (!uri) {
            return;
        }
        // Do not set focus/selection when the resource is already focused and selected
        if (this.tree.getFocus().some(e => isSCMResource(e) && this.uriIdentityService.extUri.isEqual(e.sourceUri, uri)) &&
            this.tree.getSelection().some(e => isSCMResource(e) && this.uriIdentityService.extUri.isEqual(e.sourceUri, uri))) {
            return;
        }
        this.revealResourceThrottler.queue(() => this.treeOperationSequencer.queue(async () => {
            for (const repository of this.scmViewService.visibleRepositories) {
                const item = this.items.get(repository);
                if (!item) {
                    continue;
                }
                // go backwards from last group
                for (let j = repository.provider.groups.length - 1; j >= 0; j--) {
                    const groupItem = repository.provider.groups[j];
                    const resource = this.viewMode === "tree" /* ViewMode.Tree */
                        ? groupItem.resourceTree.getNode(uri)?.element
                        : groupItem.resources.find(r => this.uriIdentityService.extUri.isEqual(r.sourceUri, uri));
                    if (resource) {
                        await this.tree.expandTo(resource);
                        this.tree.reveal(resource);
                        this.tree.setSelection([resource]);
                        this.tree.setFocus([resource]);
                        return;
                    }
                }
            }
        }));
    }
    onDidChangeVisibleRepositories({ added, removed }) {
        // Added repositories
        for (const repository of added) {
            const repositoryDisposables = new DisposableStore();
            repositoryDisposables.add(autorun(reader => {
                /** @description action button */
                repository.provider.actionButton.read(reader);
                this.updateChildren(repository);
            }));
            repositoryDisposables.add(repository.input.onDidChangeVisibility(() => this.updateChildren(repository)));
            repositoryDisposables.add(repository.provider.onDidChangeResourceGroups(() => this.updateChildren(repository)));
            const resourceGroupDisposables = repositoryDisposables.add(new DisposableMap());
            const onDidChangeResourceGroups = () => {
                for (const [resourceGroup] of resourceGroupDisposables) {
                    if (!repository.provider.groups.includes(resourceGroup)) {
                        resourceGroupDisposables.deleteAndDispose(resourceGroup);
                    }
                }
                for (const resourceGroup of repository.provider.groups) {
                    if (!resourceGroupDisposables.has(resourceGroup)) {
                        const disposableStore = new DisposableStore();
                        disposableStore.add(resourceGroup.onDidChange(() => this.updateChildren(repository)));
                        disposableStore.add(resourceGroup.onDidChangeResources(() => this.updateChildren(repository)));
                        resourceGroupDisposables.set(resourceGroup, disposableStore);
                    }
                }
            };
            repositoryDisposables.add(repository.provider.onDidChangeResourceGroups(onDidChangeResourceGroups));
            onDidChangeResourceGroups();
            this.items.set(repository, repositoryDisposables);
        }
        // Removed repositories
        for (const repository of removed) {
            this.items.deleteAndDispose(repository);
        }
        this.updateChildren();
        this.onDidActiveEditorChange();
    }
    onListContextMenu(e) {
        if (!e.element) {
            const menu = this.menuService.getMenuActions(Menus.ViewSort, this.contextKeyService);
            const actions = [];
            createAndFillInContextMenuActions(menu, actions);
            return this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                onHide: () => { }
            });
        }
        const element = e.element;
        let context = element;
        let actions = [];
        let actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
        if (isSCMRepository(element)) {
            const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
            const menu = menus.repositoryContextMenu;
            context = element.provider;
            actionRunner = new RepositoryActionRunner(() => this.getSelectedRepositories());
            actions = collectContextMenuActions(menu);
        }
        else if (isSCMInput(element) || isSCMActionButton(element)) {
            // noop
        }
        else if (isSCMResourceGroup(element)) {
            const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
            const menu = menus.getResourceGroupMenu(element);
            actions = collectContextMenuActions(menu);
        }
        else if (isSCMResource(element)) {
            const menus = this.scmViewService.menus.getRepositoryMenus(element.resourceGroup.provider);
            const menu = menus.getResourceMenu(element);
            actions = collectContextMenuActions(menu);
        }
        else if (isSCMResourceNode(element)) {
            if (element.element) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.element.resourceGroup.provider);
                const menu = menus.getResourceMenu(element.element);
                actions = collectContextMenuActions(menu);
            }
            else {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.context.provider);
                const menu = menus.getResourceFolderMenu(element.context);
                actions = collectContextMenuActions(menu);
            }
        }
        actionRunner.onWillRun(() => this.tree.domFocus());
        this.contextMenuService.showContextMenu({
            getAnchor: () => e.anchor,
            getActions: () => actions,
            getActionsContext: () => context,
            actionRunner
        });
    }
    getSelectedRepositories() {
        const focusedRepositories = this.tree.getFocus().filter(r => !!r && isSCMRepository(r));
        const selectedRepositories = this.tree.getSelection().filter(r => !!r && isSCMRepository(r));
        return Array.from(new Set([...focusedRepositories, ...selectedRepositories]));
    }
    getSelectedResources() {
        return this.tree.getSelection()
            .filter(r => !!r && !isSCMResourceGroup(r));
    }
    getViewMode() {
        let mode = this.configurationService.getValue('scm.defaultViewMode') === 'list' ? "list" /* ViewMode.List */ : "tree" /* ViewMode.Tree */;
        const storageMode = this.storageService.get(`scm.viewMode`, 1 /* StorageScope.WORKSPACE */);
        if (typeof storageMode === 'string') {
            mode = storageMode;
        }
        return mode;
    }
    getViewSortKey() {
        // Tree
        if (this._viewMode === "tree" /* ViewMode.Tree */) {
            return "path" /* ViewSortKey.Path */;
        }
        // List
        let viewSortKey;
        const viewSortKeyString = this.configurationService.getValue('scm.defaultViewSortKey');
        switch (viewSortKeyString) {
            case 'name':
                viewSortKey = "name" /* ViewSortKey.Name */;
                break;
            case 'status':
                viewSortKey = "status" /* ViewSortKey.Status */;
                break;
            default:
                viewSortKey = "path" /* ViewSortKey.Path */;
                break;
        }
        const storageSortKey = this.storageService.get(`scm.viewSortKey`, 1 /* StorageScope.WORKSPACE */);
        if (typeof storageSortKey === 'string') {
            viewSortKey = storageSortKey;
        }
        return viewSortKey;
    }
    loadTreeViewState() {
        const storageViewState = this.storageService.get('scm.viewState2', 1 /* StorageScope.WORKSPACE */);
        if (!storageViewState) {
            return undefined;
        }
        try {
            const treeViewState = JSON.parse(storageViewState);
            return treeViewState;
        }
        catch {
            return undefined;
        }
    }
    storeTreeViewState() {
        if (this.tree) {
            this.storageService.store('scm.viewState2', JSON.stringify(this.tree.getViewState()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    updateChildren(element) {
        this.updateChildrenThrottler.queue(() => this.treeOperationSequencer.queue(async () => {
            const focusedInput = this.inputRenderer.getFocusedInput();
            if (element && this.tree.hasNode(element)) {
                // Refresh specific repository
                await this.tree.updateChildren(element);
            }
            else {
                // Refresh the entire tree
                await this.tree.updateChildren(undefined);
            }
            if (focusedInput) {
                this.inputRenderer.getRenderedInputWidget(focusedInput)?.focus();
            }
            this.updateScmProviderContextKeys();
            this.updateRepositoryCollapseAllContextKeys();
        }));
    }
    updateIndentStyles(theme) {
        this.treeContainer.classList.toggle('list-view-mode', this.viewMode === "list" /* ViewMode.List */);
        this.treeContainer.classList.toggle('tree-view-mode', this.viewMode === "tree" /* ViewMode.Tree */);
        this.treeContainer.classList.toggle('align-icons-and-twisties', (this.viewMode === "list" /* ViewMode.List */ && theme.hasFileIcons) || (theme.hasFileIcons && !theme.hasFolderIcons));
        this.treeContainer.classList.toggle('hide-arrows', this.viewMode === "tree" /* ViewMode.Tree */ && theme.hidesExplorerArrows === true);
    }
    updateScmProviderContextKeys() {
        const alwaysShowRepositories = this.configurationService.getValue('scm.alwaysShowRepositories');
        if (!alwaysShowRepositories && this.items.size === 1) {
            const provider = Iterable.first(this.items.keys()).provider;
            this.scmProviderContextKey.set(provider.contextValue);
            this.scmProviderRootUriContextKey.set(provider.rootUri?.toString());
            this.scmProviderHasRootUriContextKey.set(!!provider.rootUri);
        }
        else {
            this.scmProviderContextKey.set(undefined);
            this.scmProviderRootUriContextKey.set(undefined);
            this.scmProviderHasRootUriContextKey.set(false);
        }
    }
    updateRepositoryCollapseAllContextKeys() {
        if (!this.isBodyVisible() || this.items.size === 1) {
            this.isAnyRepositoryCollapsibleContextKey.set(false);
            this.areAllRepositoriesCollapsedContextKey.set(false);
            return;
        }
        this.isAnyRepositoryCollapsibleContextKey.set(this.scmViewService.visibleRepositories.some(r => this.tree.hasNode(r) && this.tree.isCollapsible(r)));
        this.areAllRepositoriesCollapsedContextKey.set(this.scmViewService.visibleRepositories.every(r => this.tree.hasNode(r) && (!this.tree.isCollapsible(r) || this.tree.isCollapsed(r))));
    }
    collapseAllRepositories() {
        for (const repository of this.scmViewService.visibleRepositories) {
            if (this.tree.isCollapsible(repository)) {
                this.tree.collapse(repository);
            }
        }
    }
    expandAllRepositories() {
        for (const repository of this.scmViewService.visibleRepositories) {
            if (this.tree.isCollapsible(repository)) {
                this.tree.expand(repository);
            }
        }
    }
    focusPreviousInput() {
        this.treeOperationSequencer.queue(() => this.focusInput(-1));
    }
    focusNextInput() {
        this.treeOperationSequencer.queue(() => this.focusInput(1));
    }
    async focusInput(delta) {
        if (!this.scmViewService.focusedRepository ||
            this.scmViewService.visibleRepositories.length === 0) {
            return;
        }
        let input = this.scmViewService.focusedRepository.input;
        const repositories = this.scmViewService.visibleRepositories;
        // One visible repository and the input is already focused
        if (repositories.length === 1 && this.inputRenderer.getRenderedInputWidget(input)?.hasFocus() === true) {
            return;
        }
        // Multiple visible repositories and the input already focused
        if (repositories.length > 1 && this.inputRenderer.getRenderedInputWidget(input)?.hasFocus() === true) {
            const focusedRepositoryIndex = repositories.indexOf(this.scmViewService.focusedRepository);
            const newFocusedRepositoryIndex = rot(focusedRepositoryIndex + delta, repositories.length);
            input = repositories[newFocusedRepositoryIndex].input;
        }
        await this.tree.expandTo(input);
        this.tree.reveal(input);
        this.inputRenderer.getRenderedInputWidget(input)?.focus();
    }
    focusPreviousResourceGroup() {
        this.treeOperationSequencer.queue(() => this.focusResourceGroup(-1));
    }
    focusNextResourceGroup() {
        this.treeOperationSequencer.queue(() => this.focusResourceGroup(1));
    }
    async focusResourceGroup(delta) {
        if (!this.scmViewService.focusedRepository ||
            this.scmViewService.visibleRepositories.length === 0) {
            return;
        }
        const treeHasDomFocus = isActiveElement(this.tree.getHTMLElement());
        const resourceGroups = this.scmViewService.focusedRepository.provider.groups;
        const focusedResourceGroup = this.tree.getFocus().find(e => isSCMResourceGroup(e));
        const focusedResourceGroupIndex = treeHasDomFocus && focusedResourceGroup ? resourceGroups.indexOf(focusedResourceGroup) : -1;
        let resourceGroupNext;
        if (focusedResourceGroupIndex === -1) {
            // First visible resource group
            for (const resourceGroup of resourceGroups) {
                if (this.tree.hasNode(resourceGroup)) {
                    resourceGroupNext = resourceGroup;
                    break;
                }
            }
        }
        else {
            // Next/Previous visible resource group
            let index = rot(focusedResourceGroupIndex + delta, resourceGroups.length);
            while (index !== focusedResourceGroupIndex) {
                if (this.tree.hasNode(resourceGroups[index])) {
                    resourceGroupNext = resourceGroups[index];
                    break;
                }
                index = rot(index + delta, resourceGroups.length);
            }
        }
        if (resourceGroupNext) {
            await this.tree.expandTo(resourceGroupNext);
            this.tree.reveal(resourceGroupNext);
            this.tree.setSelection([resourceGroupNext]);
            this.tree.setFocus([resourceGroupNext]);
            this.tree.domFocus();
        }
    }
    shouldShowWelcome() {
        return this.scmService.repositoryCount === 0;
    }
    getActionsContext() {
        return this.scmViewService.visibleRepositories.length === 1 ? this.scmViewService.visibleRepositories[0].provider : undefined;
    }
    focus() {
        super.focus();
        this.treeOperationSequencer.queue(() => {
            return new Promise(resolve => {
                if (this.isExpanded()) {
                    if (this.tree.getFocus().length === 0) {
                        for (const repository of this.scmViewService.visibleRepositories) {
                            const widget = this.inputRenderer.getRenderedInputWidget(repository.input);
                            if (widget) {
                                widget.focus();
                                resolve();
                                return;
                            }
                        }
                    }
                    this.tree.domFocus();
                    resolve();
                }
            });
        });
    }
    dispose() {
        this.visibilityDisposables.dispose();
        this.disposables.dispose();
        this.items.dispose();
        super.dispose();
    }
};
SCMViewPane = __decorate([
    __param(1, ICommandService),
    __param(2, IEditorService),
    __param(3, IMenuService),
    __param(4, ISCMService),
    __param(5, ISCMViewService),
    __param(6, IStorageService),
    __param(7, IUriIdentityService),
    __param(8, IKeybindingService),
    __param(9, IThemeService),
    __param(10, IContextMenuService),
    __param(11, IInstantiationService),
    __param(12, IViewDescriptorService),
    __param(13, IConfigurationService),
    __param(14, IContextKeyService),
    __param(15, IOpenerService),
    __param(16, ITelemetryService),
    __param(17, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SCMViewPane);
export { SCMViewPane };
let SCMTreeDataSource = class SCMTreeDataSource extends Disposable {
    constructor(viewMode, configurationService, scmViewService) {
        super();
        this.viewMode = viewMode;
        this.configurationService = configurationService;
        this.scmViewService = scmViewService;
    }
    async getChildren(inputOrElement) {
        const repositoryCount = this.scmViewService.visibleRepositories.length;
        const showActionButton = this.configurationService.getValue('scm.showActionButton') === true;
        const alwaysShowRepositories = this.configurationService.getValue('scm.alwaysShowRepositories') === true;
        if (isSCMViewService(inputOrElement) && (repositoryCount > 1 || alwaysShowRepositories)) {
            return this.scmViewService.visibleRepositories;
        }
        else if ((isSCMViewService(inputOrElement) && repositoryCount === 1 && !alwaysShowRepositories) || isSCMRepository(inputOrElement)) {
            const children = [];
            inputOrElement = isSCMRepository(inputOrElement) ? inputOrElement : this.scmViewService.visibleRepositories[0];
            const actionButton = inputOrElement.provider.actionButton.get();
            const resourceGroups = inputOrElement.provider.groups;
            // SCM Input
            if (inputOrElement.input.visible) {
                children.push(inputOrElement.input);
            }
            // Action Button
            if (showActionButton && actionButton) {
                children.push({
                    type: 'actionButton',
                    repository: inputOrElement,
                    button: actionButton
                });
            }
            // ResourceGroups
            const hasSomeChanges = resourceGroups.some(group => group.resources.length > 0);
            if (hasSomeChanges || (repositoryCount === 1 && (!showActionButton || !actionButton))) {
                children.push(...resourceGroups);
            }
            return children;
        }
        else if (isSCMResourceGroup(inputOrElement)) {
            if (this.viewMode() === "list" /* ViewMode.List */) {
                // Resources (List)
                return inputOrElement.resources;
            }
            else if (this.viewMode() === "tree" /* ViewMode.Tree */) {
                // Resources (Tree)
                const children = [];
                for (const node of inputOrElement.resourceTree.root.children) {
                    children.push(node.element && node.childrenCount === 0 ? node.element : node);
                }
                return children;
            }
        }
        else if (isSCMResourceNode(inputOrElement)) {
            // Resources (Tree), History item changes (Tree)
            const children = [];
            for (const node of inputOrElement.children) {
                children.push(node.element && node.childrenCount === 0 ? node.element : node);
            }
            return children;
        }
        return [];
    }
    getParent(element) {
        if (isSCMResourceNode(element)) {
            if (element.parent === element.context.resourceTree.root) {
                return element.context;
            }
            else if (element.parent) {
                return element.parent;
            }
            else {
                throw new Error('Invalid element passed to getParent');
            }
        }
        else if (isSCMResource(element)) {
            if (this.viewMode() === "list" /* ViewMode.List */) {
                return element.resourceGroup;
            }
            const node = element.resourceGroup.resourceTree.getNode(element.sourceUri);
            const result = node?.parent;
            if (!result) {
                throw new Error('Invalid element passed to getParent');
            }
            if (result === element.resourceGroup.resourceTree.root) {
                return element.resourceGroup;
            }
            return result;
        }
        else if (isSCMInput(element)) {
            return element.repository;
        }
        else if (isSCMResourceGroup(element)) {
            const repository = this.scmViewService.visibleRepositories.find(r => r.provider === element.provider);
            if (!repository) {
                throw new Error('Invalid element passed to getParent');
            }
            return repository;
        }
        else {
            throw new Error('Unexpected call to getParent');
        }
    }
    hasChildren(inputOrElement) {
        if (isSCMViewService(inputOrElement)) {
            return this.scmViewService.visibleRepositories.length !== 0;
        }
        else if (isSCMRepository(inputOrElement)) {
            return true;
        }
        else if (isSCMInput(inputOrElement)) {
            return false;
        }
        else if (isSCMActionButton(inputOrElement)) {
            return false;
        }
        else if (isSCMResourceGroup(inputOrElement)) {
            return true;
        }
        else if (isSCMResource(inputOrElement)) {
            return false;
        }
        else if (ResourceTree.isResourceNode(inputOrElement)) {
            return inputOrElement.childrenCount > 0;
        }
        else {
            throw new Error('hasChildren not implemented.');
        }
    }
};
SCMTreeDataSource = __decorate([
    __param(1, IConfigurationService),
    __param(2, ISCMViewService),
    __metadata("design:paramtypes", [Function, Object, Object])
], SCMTreeDataSource);
export class SCMActionButton {
    constructor(container, contextMenuService, commandService, notificationService) {
        this.container = container;
        this.contextMenuService = contextMenuService;
        this.commandService = commandService;
        this.notificationService = notificationService;
        this.disposables = new MutableDisposable();
    }
    dispose() {
        this.disposables?.dispose();
    }
    setButton(button) {
        // Clear old button
        this.clear();
        if (!button) {
            return;
        }
        if (button.secondaryCommands?.length) {
            const actions = [];
            for (let index = 0; index < button.secondaryCommands.length; index++) {
                const commands = button.secondaryCommands[index];
                for (const command of commands) {
                    actions.push(new Action(command.id, command.title, undefined, true, async () => await this.executeCommand(command.id, ...(command.arguments || []))));
                }
                if (commands.length) {
                    actions.push(new Separator());
                }
            }
            // Remove last separator
            actions.pop();
            // ButtonWithDropdown
            this.button = new ButtonWithDropdown(this.container, {
                actions: actions,
                addPrimaryActionToDropdown: false,
                contextMenuProvider: this.contextMenuService,
                title: button.command.tooltip,
                supportIcons: true,
                ...defaultButtonStyles
            });
        }
        else {
            // Button
            this.button = new Button(this.container, { supportIcons: true, supportShortLabel: !!button.command.shortTitle, title: button.command.tooltip, ...defaultButtonStyles });
        }
        this.button.enabled = button.enabled;
        this.button.label = button.command.title;
        if (this.button instanceof Button && button.command.shortTitle) {
            this.button.labelShort = button.command.shortTitle;
        }
        this.button.onDidClick(async () => await this.executeCommand(button.command.id, ...(button.command.arguments || [])), null, this.disposables.value);
        this.disposables.value.add(this.button);
    }
    focus() {
        this.button?.focus();
    }
    clear() {
        this.disposables.value = new DisposableStore();
        this.button = undefined;
        clearNode(this.container);
    }
    async executeCommand(commandId, ...args) {
        try {
            await this.commandService.executeCommand(commandId, ...args);
        }
        catch (ex) {
            this.notificationService.error(ex);
        }
    }
}
setupSimpleEditorSelectionStyling('.scm-view .scm-editor-container');
