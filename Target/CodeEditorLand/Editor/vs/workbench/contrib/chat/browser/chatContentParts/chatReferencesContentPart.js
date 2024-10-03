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
var CollapsibleListRenderer_1;
import * as dom from '../../../../../base/browser/dom.js';
import { Button } from '../../../../../base/browser/ui/button/button.js';
import { coalesce } from '../../../../../base/common/arrays.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { matchesSomeScheme, Schemas } from '../../../../../base/common/network.js';
import { basename } from '../../../../../base/common/path.js';
import { basenameOrAuthority, isEqualAuthority } from '../../../../../base/common/resources.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../../nls.js';
import { createAndFillInContextMenuActions } from '../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuWorkbenchToolBar } from '../../../../../platform/actions/browser/toolbar.js';
import { Action2, IMenuService, MenuId, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { FileKind } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { WorkbenchList } from '../../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { fillEditorsDragData } from '../../../../browser/dnd.js';
import { ResourceLabels } from '../../../../browser/labels.js';
import { ColorScheme } from '../../../../browser/web.api.js';
import { ResourceContextKey } from '../../../../common/contextkeys.js';
import { SETTINGS_AUTHORITY } from '../../../../services/preferences/common/preferences.js';
import { createFileIconThemableTreeContainerScope } from '../../../files/browser/views/explorerView.js';
import { ExplorerFolderContext } from '../../../files/common/files.js';
import { ChatResponseReferencePartStatusKind } from '../../common/chatService.js';
import { IChatVariablesService } from '../../common/chatVariables.js';
import { IChatWidgetService } from '../chat.js';
import { ResourcePool } from './chatCollections.js';
const $ = dom.$;
let ChatCollapsibleListContentPart = class ChatCollapsibleListContentPart extends Disposable {
    constructor(data, labelOverride, element, contentReferencesListPool, openerService, menuService, instantiationService, contextMenuService) {
        super();
        this.data = data;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        const referencesLabel = labelOverride ?? (data.length > 1 ?
            localize('usedReferencesPlural', "Used {0} references", data.length) :
            localize('usedReferencesSingular', "Used {0} reference", 1));
        const iconElement = $('.chat-used-context-icon');
        const icon = (element) => element.usedReferencesExpanded ? Codicon.chevronDown : Codicon.chevronRight;
        iconElement.classList.add(...ThemeIcon.asClassNameArray(icon(element)));
        const buttonElement = $('.chat-used-context-label', undefined);
        const collapseButton = this._register(new Button(buttonElement, {
            buttonBackground: undefined,
            buttonBorder: undefined,
            buttonForeground: undefined,
            buttonHoverBackground: undefined,
            buttonSecondaryBackground: undefined,
            buttonSecondaryForeground: undefined,
            buttonSecondaryHoverBackground: undefined,
            buttonSeparator: undefined
        }));
        this.domNode = $('.chat-used-context', undefined, buttonElement);
        collapseButton.label = referencesLabel;
        collapseButton.element.prepend(iconElement);
        this.updateAriaLabel(collapseButton.element, referencesLabel, element.usedReferencesExpanded);
        this.domNode.classList.toggle('chat-used-context-collapsed', !element.usedReferencesExpanded);
        this._register(collapseButton.onDidClick(() => {
            iconElement.classList.remove(...ThemeIcon.asClassNameArray(icon(element)));
            element.usedReferencesExpanded = !element.usedReferencesExpanded;
            iconElement.classList.add(...ThemeIcon.asClassNameArray(icon(element)));
            this.domNode.classList.toggle('chat-used-context-collapsed', !element.usedReferencesExpanded);
            this._onDidChangeHeight.fire();
            this.updateAriaLabel(collapseButton.element, referencesLabel, element.usedReferencesExpanded);
        }));
        const ref = this._register(contentReferencesListPool.get());
        const list = ref.object;
        this.domNode.appendChild(list.getHTMLElement().parentElement);
        this._register(list.onDidOpen((e) => {
            if (e.element && 'reference' in e.element && typeof e.element.reference === 'object') {
                const uriOrLocation = 'variableName' in e.element.reference ? e.element.reference.value : e.element.reference;
                const uri = URI.isUri(uriOrLocation) ? uriOrLocation :
                    uriOrLocation?.uri;
                if (uri) {
                    openerService.open(uri, {
                        fromUserGesture: true,
                        editorOptions: {
                            ...e.editorOptions,
                            ...{
                                selection: uriOrLocation && 'range' in uriOrLocation ? uriOrLocation.range : undefined
                            }
                        }
                    });
                }
            }
        }));
        this._register(list.onContextMenu(e => {
            dom.EventHelper.stop(e.browserEvent, true);
            const uri = e.element && getResourceForElement(e.element);
            if (!uri) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => {
                    const menu = menuService.getMenuActions(MenuId.ChatAttachmentsContext, list.contextKeyService, { shouldForwardArgs: true, arg: uri });
                    const primary = [];
                    createAndFillInContextMenuActions(menu, primary);
                    return primary;
                }
            });
        }));
        const resourceContextKey = this._register(this.instantiationService.createInstance(ResourceContextKey));
        this._register(list.onDidChangeFocus(e => {
            resourceContextKey.reset();
            const element = e.elements.length ? e.elements[0] : undefined;
            const uri = element && getResourceForElement(element);
            resourceContextKey.set(uri ?? null);
        }));
        const maxItemsShown = 6;
        const itemsShown = Math.min(data.length, maxItemsShown);
        const height = itemsShown * 22;
        list.layout(height);
        list.getHTMLElement().style.height = `${height}px`;
        list.splice(0, list.length, data);
    }
    hasSameContent(other, followingContent, element) {
        return other.kind === 'references' && other.references.length === this.data.length ||
            other.kind === 'codeCitations' && other.citations.length === this.data.length;
    }
    updateAriaLabel(element, label, expanded) {
        element.ariaLabel = expanded ? localize('usedReferencesExpanded', "{0}, expanded", label) : localize('usedReferencesCollapsed', "{0}, collapsed", label);
    }
    addDisposable(disposable) {
        this._register(disposable);
    }
};
ChatCollapsibleListContentPart = __decorate([
    __param(4, IOpenerService),
    __param(5, IMenuService),
    __param(6, IInstantiationService),
    __param(7, IContextMenuService),
    __metadata("design:paramtypes", [Array, Object, Object, CollapsibleListPool, Object, Object, Object, Object])
], ChatCollapsibleListContentPart);
export { ChatCollapsibleListContentPart };
let CollapsibleListPool = class CollapsibleListPool extends Disposable {
    get inUse() {
        return this._pool.inUse;
    }
    constructor(_onDidChangeVisibility, menuId, options, instantiationService, themeService, labelService) {
        super();
        this._onDidChangeVisibility = _onDidChangeVisibility;
        this.menuId = menuId;
        this.options = options;
        this.instantiationService = instantiationService;
        this.themeService = themeService;
        this.labelService = labelService;
        this._pool = this._register(new ResourcePool(() => this.listFactory()));
    }
    listFactory() {
        const resourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility }));
        const container = $('.chat-used-context-list');
        this._register(createFileIconThemableTreeContainerScope(container, this.themeService));
        const list = this.instantiationService.createInstance((WorkbenchList), 'ChatListRenderer', container, new CollapsibleListDelegate(), [this.instantiationService.createInstance(CollapsibleListRenderer, resourceLabels, this.menuId, this.options)], {
            alwaysConsumeMouseWheel: false,
            accessibilityProvider: {
                getAriaLabel: (element) => {
                    if (element.kind === 'warning') {
                        return element.content.value;
                    }
                    const reference = element.reference;
                    if (typeof reference === 'string') {
                        return reference;
                    }
                    else if ('variableName' in reference) {
                        return reference.variableName;
                    }
                    else if (URI.isUri(reference)) {
                        return basename(reference.path);
                    }
                    else {
                        return basename(reference.uri.path);
                    }
                },
                getWidgetAriaLabel: () => localize('chatCollapsibleList', "Collapsible Chat List")
            },
            dnd: {
                getDragURI: (element) => getResourceForElement(element)?.toString() ?? null,
                getDragLabel: (elements, originalEvent) => {
                    const uris = coalesce(elements.map(getResourceForElement));
                    if (!uris.length) {
                        return undefined;
                    }
                    else if (uris.length === 1) {
                        return this.labelService.getUriLabel(uris[0], { relative: true });
                    }
                    else {
                        return `${uris.length}`;
                    }
                },
                dispose: () => { },
                onDragOver: () => false,
                drop: () => { },
                onDragStart: (data, originalEvent) => {
                    try {
                        const elements = data.getData();
                        const uris = coalesce(elements.map(getResourceForElement));
                        this.instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, uris, originalEvent));
                    }
                    catch {
                    }
                },
            },
        });
        return list;
    }
    get() {
        const object = this._pool.get();
        let stale = false;
        return {
            object,
            isStale: () => stale,
            dispose: () => {
                stale = true;
                this._pool.release(object);
            }
        };
    }
};
CollapsibleListPool = __decorate([
    __param(3, IInstantiationService),
    __param(4, IThemeService),
    __param(5, ILabelService),
    __metadata("design:paramtypes", [Function, Object, Object, Object, Object, Object])
], CollapsibleListPool);
export { CollapsibleListPool };
class CollapsibleListDelegate {
    getHeight(element) {
        return 22;
    }
    getTemplateId(element) {
        return CollapsibleListRenderer.TEMPLATE_ID;
    }
}
let CollapsibleListRenderer = class CollapsibleListRenderer {
    static { CollapsibleListRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'chatCollapsibleListRenderer'; }
    constructor(labels, menuId, options, themeService, chatVariablesService, productService, instantiationService) {
        this.labels = labels;
        this.menuId = menuId;
        this.options = options;
        this.themeService = themeService;
        this.chatVariablesService = chatVariablesService;
        this.productService = productService;
        this.instantiationService = instantiationService;
        this.templateId = CollapsibleListRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const templateDisposables = new DisposableStore();
        const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true, supportIcons: true }));
        return { templateDisposables, label, toolbar: undefined };
    }
    getReferenceIcon(data) {
        if (ThemeIcon.isThemeIcon(data.iconPath)) {
            return data.iconPath;
        }
        else {
            return this.themeService.getColorTheme().type === ColorScheme.DARK && data.iconPath?.dark
                ? data.iconPath?.dark
                : data.iconPath?.light;
        }
    }
    renderElement(data, index, templateData, height) {
        templateData.toolbar?.dispose();
        if (data.kind === 'warning') {
            templateData.label.setResource({ name: data.content.value }, { icon: Codicon.warning });
            return;
        }
        const reference = data.reference;
        const icon = this.getReferenceIcon(data);
        templateData.label.element.style.display = 'flex';
        let arg;
        if (typeof reference === 'object' && 'variableName' in reference) {
            if (reference.value) {
                const uri = URI.isUri(reference.value) ? reference.value : reference.value.uri;
                templateData.label.setResource({
                    resource: uri,
                    name: basenameOrAuthority(uri),
                    description: `#${reference.variableName}`,
                    range: 'range' in reference.value ? reference.value.range : undefined,
                }, { icon, title: data.options?.status?.description ?? data.title });
            }
            else if (reference.variableName.startsWith('kernelVariable')) {
                const variable = reference.variableName.split(':')[1];
                const asVariableName = `${variable}`;
                const label = `Kernel variable`;
                templateData.label.setLabel(label, asVariableName, { title: data.options?.status?.description });
            }
            else {
                const variable = this.chatVariablesService.getVariable(reference.variableName);
                const asThemeIcon = variable?.icon ? `$(${variable.icon.id}) ` : '';
                const asVariableName = `#${reference.variableName}`;
                const label = `${asThemeIcon}${variable?.fullName ?? asVariableName}`;
                templateData.label.setLabel(label, asVariableName, { title: data.options?.status?.description ?? variable?.description });
            }
        }
        else if (typeof reference === 'string') {
            templateData.label.setLabel(reference, undefined, { iconPath: URI.isUri(icon) ? icon : undefined, title: data.options?.status?.description ?? data.title });
        }
        else {
            const uri = 'uri' in reference ? reference.uri : reference;
            arg = uri;
            if (uri.scheme === 'https' && isEqualAuthority(uri.authority, 'github.com') && uri.path.includes('/tree/')) {
                const label = uri.path.split('/').slice(1, 3).join('/');
                const description = uri.path.split('/').slice(5).join('/');
                templateData.label.setResource({ resource: uri, name: label, description }, { icon: Codicon.github, title: data.title });
            }
            else if (uri.scheme === this.productService.urlProtocol && isEqualAuthority(uri.authority, SETTINGS_AUTHORITY)) {
                const settingId = uri.path.substring(1);
                templateData.label.setResource({ resource: uri, name: settingId }, { icon: Codicon.settingsGear, title: localize('setting.hover', "Open setting '{0}'", settingId) });
            }
            else if (matchesSomeScheme(uri, Schemas.mailto, Schemas.http, Schemas.https)) {
                templateData.label.setResource({ resource: uri, name: uri.toString() }, { icon: icon ?? Codicon.globe, title: data.options?.status?.description ?? data.title ?? uri.toString() });
            }
            else {
                templateData.label.setFile(uri, {
                    fileKind: FileKind.FILE,
                    fileDecorations: this.options?.enableFileDecorations ? { badges: true, colors: true } : { badges: false, colors: false },
                    range: 'range' in reference ? reference.range : undefined,
                    title: data.options?.status?.description ?? data.title
                });
            }
        }
        for (const selector of ['.monaco-icon-suffix-container', '.monaco-icon-name-container']) {
            const element = templateData.label.element.querySelector(selector);
            if (element) {
                if (data.options?.status?.kind === ChatResponseReferencePartStatusKind.Omitted || data.options?.status?.kind === ChatResponseReferencePartStatusKind.Partial) {
                    element.classList.add('warning');
                }
                else {
                    element.classList.remove('warning');
                }
            }
        }
        if (this.menuId) {
            const actionBarContainer = $('.chat-collapsible-list-action-bar');
            templateData.toolbar = templateData.templateDisposables.add(this.instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, this.menuId, { menuOptions: { shouldForwardArgs: true, arg: arg } }));
            templateData.label.element.appendChild(actionBarContainer);
        }
    }
    disposeTemplate(templateData) {
        templateData.templateDisposables.dispose();
    }
};
CollapsibleListRenderer = CollapsibleListRenderer_1 = __decorate([
    __param(3, IThemeService),
    __param(4, IChatVariablesService),
    __param(5, IProductService),
    __param(6, IInstantiationService),
    __metadata("design:paramtypes", [ResourceLabels, Object, Object, Object, Object, Object, Object])
], CollapsibleListRenderer);
function getResourceForElement(element) {
    if (element.kind === 'warning') {
        return null;
    }
    const { reference } = element;
    if (typeof reference === 'string' || 'variableName' in reference) {
        return null;
    }
    else if (URI.isUri(reference)) {
        return reference;
    }
    else {
        return reference.uri;
    }
}
registerAction2(class AddToChatAction extends Action2 {
    static { this.id = 'workbench.action.chat.addToChatAction'; }
    constructor() {
        super({
            id: AddToChatAction.id,
            title: {
                ...localize2('addToChat', "Add File to Chat"),
            },
            f1: false,
            menu: [{
                    id: MenuId.ChatAttachmentsContext,
                    group: 'chat',
                    order: 1,
                    when: ExplorerFolderContext.negate(),
                }]
        });
    }
    async run(accessor, resource) {
        const chatWidgetService = accessor.get(IChatWidgetService);
        const variablesService = accessor.get(IChatVariablesService);
        if (!resource) {
            return;
        }
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        variablesService.attachContext('file', resource, widget.location);
    }
});
