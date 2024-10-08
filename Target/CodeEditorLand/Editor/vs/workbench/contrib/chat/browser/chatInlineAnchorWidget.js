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
var InlineAnchorWidget_1;
import * as dom from '../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { SymbolKinds } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { getIconClasses } from '../../../../editor/common/services/getIconClasses.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { DefinitionAction } from '../../../../editor/contrib/gotoSymbol/browser/goToCommands.js';
import * as nls from '../../../../nls.js';
import { localize } from '../../../../nls.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Action2, IMenuService, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { FileKind, IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { fillEditorsDragData } from '../../../browser/dnd.js';
import { ResourceContextKey } from '../../../common/contextkeys.js';
import { OPEN_TO_SIDE_COMMAND_ID } from '../../files/browser/fileConstants.js';
import { ExplorerFolderContext } from '../../files/common/files.js';
import { IChatVariablesService } from '../common/chatVariables.js';
import { IChatWidgetService } from './chat.js';
import { IChatMarkdownAnchorService } from './chatContentParts/chatMarkdownAnchorService.js';
const chatResourceContextKey = new RawContextKey('chatAnchorResource', undefined, { type: 'URI', description: localize('resource', "The full value of the chat anchor resource, including scheme and path") });
let InlineAnchorWidget = class InlineAnchorWidget extends Disposable {
    static { InlineAnchorWidget_1 = this; }
    static { this.className = 'chat-inline-anchor-widget'; }
    constructor(element, data, originalContextKeyService, contextMenuService, fileService, hoverService, instantiationService, labelService, languageFeaturesService, languageService, menuService, modelService, telemetryService) {
        super();
        this.element = element;
        this.data = data;
        const contextKeyService = this._register(originalContextKeyService.createScoped(element));
        this._chatResourceContext = chatResourceContextKey.bindTo(contextKeyService);
        const anchorId = new Lazy(generateUuid);
        element.classList.add(InlineAnchorWidget_1.className, 'show-file-icons');
        let iconText;
        let iconClasses;
        let location;
        let contextMenuId;
        let contextMenuArg;
        if (data.kind === 'symbol') {
            location = data.symbol.location;
            contextMenuId = MenuId.ChatInlineSymbolAnchorContext;
            contextMenuArg = location;
            iconText = data.symbol.name;
            iconClasses = ['codicon', ...getIconClasses(modelService, languageService, undefined, undefined, SymbolKinds.toIcon(data.symbol.kind))];
            const model = modelService.getModel(location.uri);
            if (model) {
                const hasDefinitionProvider = EditorContextKeys.hasDefinitionProvider.bindTo(contextKeyService);
                const hasReferenceProvider = EditorContextKeys.hasReferenceProvider.bindTo(contextKeyService);
                const updateContents = () => {
                    if (model.isDisposed()) {
                        return;
                    }
                    hasDefinitionProvider.set(languageFeaturesService.definitionProvider.has(model));
                    hasReferenceProvider.set(languageFeaturesService.definitionProvider.has(model));
                };
                updateContents();
                this._register(languageFeaturesService.definitionProvider.onDidChange(updateContents));
                this._register(languageFeaturesService.referenceProvider.onDidChange(updateContents));
            }
            this._register(dom.addDisposableListener(element, 'click', () => {
                telemetryService.publicLog2('chat.inlineAnchor.openSymbol', {
                    anchorId: anchorId.value
                });
            }));
        }
        else {
            location = data;
            contextMenuId = MenuId.ChatInlineResourceAnchorContext;
            contextMenuArg = location.uri;
            const resourceContextKey = this._register(new ResourceContextKey(contextKeyService, fileService, languageService, modelService));
            resourceContextKey.set(location.uri);
            this._chatResourceContext.set(location.uri.toString());
            const label = labelService.getUriBasenameLabel(location.uri);
            iconText = location.range && data.kind !== 'symbol' ?
                `${label}#${location.range.startLineNumber}-${location.range.endLineNumber}` :
                label;
            const fileKind = location.uri.path.endsWith('/') ? FileKind.FOLDER : FileKind.FILE;
            iconClasses = getIconClasses(modelService, languageService, location.uri, fileKind);
            const isFolderContext = ExplorerFolderContext.bindTo(contextKeyService);
            fileService.stat(location.uri)
                .then(stat => {
                isFolderContext.set(stat.isDirectory);
            })
                .catch(() => { });
            this._register(dom.addDisposableListener(element, 'click', () => {
                telemetryService.publicLog2('chat.inlineAnchor.openResource', {
                    anchorId: anchorId.value
                });
            }));
        }
        const iconEl = dom.$('span.icon');
        iconEl.classList.add(...iconClasses);
        element.replaceChildren(iconEl, dom.$('span.icon-label', {}, iconText));
        const fragment = location.range ? `${location.range.startLineNumber}-${location.range.endLineNumber}` : '';
        element.setAttribute('data-href', location.uri.with({ fragment }).toString());
        // Context menu
        this._register(dom.addDisposableListener(element, dom.EventType.CONTEXT_MENU, domEvent => {
            const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
            dom.EventHelper.stop(domEvent, true);
            contextMenuService.showContextMenu({
                contextKeyService,
                getAnchor: () => event,
                getActions: () => {
                    const menu = menuService.getMenuActions(contextMenuId, contextKeyService, { arg: contextMenuArg });
                    const primary = [];
                    createAndFillInContextMenuActions(menu, primary);
                    return primary;
                },
            });
        }));
        // Hover
        const relativeLabel = labelService.getUriLabel(location.uri, { relative: true });
        this._register(hoverService.setupManagedHover(getDefaultHoverDelegate('element'), element, relativeLabel));
        // Drag and drop
        element.draggable = true;
        this._register(dom.addDisposableListener(element, 'dragstart', e => {
            instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, [location.uri], e));
            e.dataTransfer?.setDragImage(element, 0, 0);
        }));
    }
    getHTMLElement() {
        return this.element;
    }
};
InlineAnchorWidget = InlineAnchorWidget_1 = __decorate([
    __param(2, IContextKeyService),
    __param(3, IContextMenuService),
    __param(4, IFileService),
    __param(5, IHoverService),
    __param(6, IInstantiationService),
    __param(7, ILabelService),
    __param(8, ILanguageFeaturesService),
    __param(9, ILanguageService),
    __param(10, IMenuService),
    __param(11, IModelService),
    __param(12, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], InlineAnchorWidget);
export { InlineAnchorWidget };
//#region Resource context menu
registerAction2(class AddFileToChatAction extends Action2 {
    static { this.id = 'chat.inlineResourceAnchor.addFileToChat'; }
    constructor() {
        super({
            id: AddFileToChatAction.id,
            title: nls.localize2('actions.attach.label', "Add File to Chat"),
            menu: [{
                    id: MenuId.ChatInlineResourceAnchorContext,
                    group: 'chat',
                    order: 1,
                    when: ExplorerFolderContext.negate(),
                }]
        });
    }
    async run(accessor, resource) {
        const chatWidgetService = accessor.get(IChatWidgetService);
        const variablesService = accessor.get(IChatVariablesService);
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        variablesService.attachContext('file', resource, widget.location);
    }
});
//#endregion
//#region Resource keybindings
registerAction2(class CopyResourceAction extends Action2 {
    static { this.id = 'chat.inlineResourceAnchor.copyResource'; }
    constructor() {
        super({
            id: CopyResourceAction.id,
            title: nls.localize2('actions.copy.label', "Copy"),
            f1: false,
            precondition: chatResourceContextKey,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            }
        });
    }
    async run(accessor) {
        const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
        const clipboardService = accessor.get(IClipboardService);
        const anchor = chatWidgetService.lastFocusedAnchor;
        if (!anchor || anchor.data.kind === 'symbol') {
            return;
        }
        clipboardService.writeResources([anchor.data.uri]);
    }
});
registerAction2(class CopyResourceAction extends Action2 {
    static { this.id = 'chat.inlineResourceAnchor.openToSide'; }
    constructor() {
        super({
            id: CopyResourceAction.id,
            title: nls.localize2('actions.openToSide.label', "Open to the Side"),
            f1: false,
            precondition: chatResourceContextKey,
            keybinding: {
                weight: 400 /* KeybindingWeight.ExternalExtension */ + 2,
                primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                mac: {
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
                },
            }
        });
    }
    async run(accessor) {
        const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
        const commandService = accessor.get(ICommandService);
        const anchor = chatWidgetService.lastFocusedAnchor;
        if (!anchor || anchor.data.kind === 'symbol') {
            return;
        }
        commandService.executeCommand(OPEN_TO_SIDE_COMMAND_ID, anchor.data.uri);
    }
});
//#endregion
//#region Symbol context menu
registerAction2(class GoToDefinitionAction extends Action2 {
    static { this.id = 'chat.inlineSymbolAnchor.goToDefinition'; }
    constructor() {
        super({
            id: GoToDefinitionAction.id,
            title: {
                ...nls.localize2('actions.goToDecl.label', "Go to Definition"),
                mnemonicTitle: nls.localize({ key: 'miGotoDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Definition"),
            },
            precondition: EditorContextKeys.hasDefinitionProvider,
            menu: [{
                    id: MenuId.ChatInlineSymbolAnchorContext,
                    group: 'navigation',
                    order: 1.1,
                },]
        });
    }
    async run(accessor, location) {
        const editorService = accessor.get(ICodeEditorService);
        await editorService.openCodeEditor({
            resource: location.uri, options: {
                selection: {
                    startColumn: location.range.startColumn,
                    startLineNumber: location.range.startLineNumber,
                }
            }
        }, null);
        const action = new DefinitionAction({ openToSide: false, openInPeek: false, muteMessage: true }, { title: { value: '', original: '' }, id: '', precondition: undefined });
        return action.run(accessor);
    }
});
registerAction2(class GoToReferencesAction extends Action2 {
    static { this.id = 'chat.inlineSymbolAnchor.goToReferences'; }
    constructor() {
        super({
            id: GoToReferencesAction.id,
            title: {
                ...nls.localize2('goToReferences.label', "Go to References"),
                mnemonicTitle: nls.localize({ key: 'miGotoReference', comment: ['&& denotes a mnemonic'] }, "Go to &&References"),
            },
            precondition: EditorContextKeys.hasReferenceProvider,
            menu: [{
                    id: MenuId.ChatInlineSymbolAnchorContext,
                    group: 'navigation',
                    order: 1.1,
                },]
        });
    }
    async run(accessor, location) {
        const editorService = accessor.get(ICodeEditorService);
        const commandService = accessor.get(ICommandService);
        await editorService.openCodeEditor({
            resource: location.uri, options: {
                selection: {
                    startColumn: location.range.startColumn,
                    startLineNumber: location.range.startLineNumber,
                }
            }
        }, null);
        await commandService.executeCommand('editor.action.goToReferences');
    }
});
//#endregion
