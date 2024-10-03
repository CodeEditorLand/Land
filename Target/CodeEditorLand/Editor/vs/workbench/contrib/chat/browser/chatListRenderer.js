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
var ChatListItemRenderer_1;
import * as dom from '../../../../base/browser/dom.js';
import { renderFormattedText } from '../../../../base/browser/formattedTextRenderer.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { DropdownMenuActionViewItem } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { coalesce, distinct } from '../../../../base/common/arrays.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter } from '../../../../base/common/event.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable, DisposableStore, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { FileAccess } from '../../../../base/common/network.js';
import { clamp } from '../../../../base/common/numbers.js';
import { autorun } from '../../../../base/common/observable.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { createActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchIssueService } from '../../issue/common/issue.js';
import { annotateSpecialMarkdownContent } from '../common/annotations.js';
import { CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING, CONTEXT_ITEM_ID, CONTEXT_REQUEST, CONTEXT_RESPONSE, CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND, CONTEXT_RESPONSE_ERROR, CONTEXT_RESPONSE_FILTERED, CONTEXT_RESPONSE_VOTE } from '../common/chatContextKeys.js';
import { chatSubcommandLeader } from '../common/chatParserTypes.js';
import { ChatAgentVoteDirection, ChatAgentVoteDownReason } from '../common/chatService.js';
import { isRequestVM, isResponseVM } from '../common/chatViewModel.js';
import { getNWords } from '../common/chatWordCounter.js';
import { CodeBlockModelCollection } from '../common/codeBlockModelCollection.js';
import { MarkUnhelpfulActionId } from './actions/chatTitleActions.js';
import { GeneratingPhrase } from './chat.js';
import { ChatAgentHover, getChatAgentHoverOptions } from './chatAgentHover.js';
import { ChatAttachmentsContentPart } from './chatContentParts/chatAttachmentsContentPart.js';
import { ChatCodeCitationContentPart } from './chatContentParts/chatCodeCitationContentPart.js';
import { ChatCommandButtonContentPart } from './chatContentParts/chatCommandContentPart.js';
import { ChatConfirmationContentPart } from './chatContentParts/chatConfirmationContentPart.js';
import { ChatMarkdownContentPart, EditorPool } from './chatContentParts/chatMarkdownContentPart.js';
import { ChatProgressContentPart } from './chatContentParts/chatProgressContentPart.js';
import { ChatCollapsibleListContentPart, CollapsibleListPool } from './chatContentParts/chatReferencesContentPart.js';
import { ChatTaskContentPart } from './chatContentParts/chatTaskContentPart.js';
import { ChatTextEditContentPart, DiffEditorPool } from './chatContentParts/chatTextEditContentPart.js';
import { ChatToolInvocationPart } from './chatContentParts/chatToolInvocationPart.js';
import { ChatTreeContentPart, TreePool } from './chatContentParts/chatTreeContentPart.js';
import { ChatWarningContentPart } from './chatContentParts/chatWarningContentPart.js';
import { ChatMarkdownDecorationsRenderer } from './chatMarkdownDecorationsRenderer.js';
import { ChatMarkdownRenderer } from './chatMarkdownRenderer.js';
import { ChatEditorOptions } from './chatOptions.js';
import { ChatCodeBlockContentProvider } from './codeBlockPart.js';
const $ = dom.$;
const forceVerboseLayoutTracing = false;
let ChatListItemRenderer = class ChatListItemRenderer extends Disposable {
    static { ChatListItemRenderer_1 = this; }
    static { this.ID = 'item'; }
    constructor(editorOptions, rendererOptions, delegate, codeBlockModelCollection, overflowWidgetsDomNode, instantiationService, configService, logService, contextKeyService, themeService, commandService, hoverService) {
        super();
        this.rendererOptions = rendererOptions;
        this.delegate = delegate;
        this.codeBlockModelCollection = codeBlockModelCollection;
        this.instantiationService = instantiationService;
        this.logService = logService;
        this.contextKeyService = contextKeyService;
        this.themeService = themeService;
        this.commandService = commandService;
        this.hoverService = hoverService;
        this.codeBlocksByResponseId = new Map();
        this.codeBlocksByEditorUri = new ResourceMap();
        this.fileTreesByResponseId = new Map();
        this.focusedFileTreesByResponseId = new Map();
        this._onDidClickFollowup = this._register(new Emitter());
        this.onDidClickFollowup = this._onDidClickFollowup.event;
        this._onDidClickRerunWithAgentOrCommandDetection = new Emitter();
        this.onDidClickRerunWithAgentOrCommandDetection = this._onDidClickRerunWithAgentOrCommandDetection.event;
        this._onDidChangeItemHeight = this._register(new Emitter());
        this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
        this._currentLayoutWidth = 0;
        this._isVisible = true;
        this._onDidChangeVisibility = this._register(new Emitter());
        this.renderer = this._register(this.instantiationService.createInstance(ChatMarkdownRenderer, undefined));
        this.markdownDecorationsRenderer = this.instantiationService.createInstance(ChatMarkdownDecorationsRenderer);
        this._editorPool = this._register(this.instantiationService.createInstance(EditorPool, editorOptions, delegate, overflowWidgetsDomNode));
        this._diffEditorPool = this._register(this.instantiationService.createInstance(DiffEditorPool, editorOptions, delegate, overflowWidgetsDomNode));
        this._treePool = this._register(this.instantiationService.createInstance(TreePool, this._onDidChangeVisibility.event));
        this._contentReferencesListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, undefined, undefined));
        this._register(this.instantiationService.createInstance(ChatCodeBlockContentProvider));
    }
    get templateId() {
        return ChatListItemRenderer_1.ID;
    }
    editorsInUse() {
        return this._editorPool.inUse();
    }
    traceLayout(method, message) {
        if (forceVerboseLayoutTracing) {
            this.logService.info(`ChatListItemRenderer#${method}: ${message}`);
        }
        else {
            this.logService.trace(`ChatListItemRenderer#${method}: ${message}`);
        }
    }
    getProgressiveRenderRate(element) {
        if (element.isComplete) {
            return 80;
        }
        if (element.contentUpdateTimings && element.contentUpdateTimings.impliedWordLoadRate) {
            const minRate = 5;
            const maxRate = 80;
            const rate = element.contentUpdateTimings.impliedWordLoadRate;
            return clamp(rate, minRate, maxRate);
        }
        return 8;
    }
    getCodeBlockInfosForResponse(response) {
        const codeBlocks = this.codeBlocksByResponseId.get(response.id);
        return codeBlocks ?? [];
    }
    getCodeBlockInfoForEditor(uri) {
        return this.codeBlocksByEditorUri.get(uri);
    }
    getFileTreeInfosForResponse(response) {
        const fileTrees = this.fileTreesByResponseId.get(response.id);
        return fileTrees ?? [];
    }
    getLastFocusedFileTreeForResponse(response) {
        const fileTrees = this.fileTreesByResponseId.get(response.id);
        const lastFocusedFileTreeIndex = this.focusedFileTreesByResponseId.get(response.id);
        if (fileTrees?.length && lastFocusedFileTreeIndex !== undefined && lastFocusedFileTreeIndex < fileTrees.length) {
            return fileTrees[lastFocusedFileTreeIndex];
        }
        return undefined;
    }
    setVisible(visible) {
        this._isVisible = visible;
        this._onDidChangeVisibility.fire(visible);
    }
    layout(width) {
        this._currentLayoutWidth = width - (this.rendererOptions.noPadding ? 0 : 40);
        for (const editor of this._editorPool.inUse()) {
            editor.layout(this._currentLayoutWidth);
        }
        for (const diffEditor of this._diffEditorPool.inUse()) {
            diffEditor.layout(this._currentLayoutWidth);
        }
    }
    renderTemplate(container) {
        const templateDisposables = new DisposableStore();
        const rowContainer = dom.append(container, $('.interactive-item-container'));
        if (this.rendererOptions.renderStyle === 'compact') {
            rowContainer.classList.add('interactive-item-compact');
        }
        if (this.rendererOptions.noPadding) {
            rowContainer.classList.add('no-padding');
        }
        let headerParent = rowContainer;
        let valueParent = rowContainer;
        let detailContainerParent;
        let toolbarParent;
        if (this.rendererOptions.renderStyle === 'minimal') {
            rowContainer.classList.add('interactive-item-compact');
            rowContainer.classList.add('minimal');
            const lhsContainer = dom.append(rowContainer, $('.column.left'));
            const rhsContainer = dom.append(rowContainer, $('.column.right'));
            headerParent = lhsContainer;
            detailContainerParent = rhsContainer;
            valueParent = rhsContainer;
            toolbarParent = dom.append(rowContainer, $('.header'));
        }
        const header = dom.append(headerParent, $('.header'));
        const user = dom.append(header, $('.user'));
        user.tabIndex = 0;
        user.role = 'toolbar';
        const avatarContainer = dom.append(user, $('.avatar-container'));
        const username = dom.append(user, $('h3.username'));
        const detailContainer = dom.append(detailContainerParent ?? user, $('span.detail-container'));
        const detail = dom.append(detailContainer, $('span.detail'));
        dom.append(detailContainer, $('span.chat-animated-ellipsis'));
        const value = dom.append(valueParent, $('.value'));
        const elementDisposables = new DisposableStore();
        const contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(rowContainer));
        const scopedInstantiationService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
        let titleToolbar;
        if (this.rendererOptions.noHeader) {
            header.classList.add('hidden');
        }
        else {
            titleToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, toolbarParent ?? header, MenuId.ChatMessageTitle, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                toolbarOptions: {
                    shouldInlineSubmenu: submenu => submenu.actions.length <= 1
                },
            }));
        }
        const footerToolbarContainer = dom.append(rowContainer, $('.chat-footer-toolbar'));
        const footerToolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, footerToolbarContainer, MenuId.ChatMessageFooter, {
            eventDebounceDelay: 0,
            menuOptions: { shouldForwardArgs: true },
            toolbarOptions: { shouldInlineSubmenu: submenu => submenu.actions.length <= 1 },
            actionViewItemProvider: (action, options) => {
                if (action instanceof MenuItemAction && action.item.id === MarkUnhelpfulActionId) {
                    return scopedInstantiationService.createInstance(ChatVoteDownButton, action, options);
                }
                return createActionViewItem(scopedInstantiationService, action, options);
            }
        }));
        const agentHover = templateDisposables.add(this.instantiationService.createInstance(ChatAgentHover));
        const hoverContent = () => {
            if (isResponseVM(template.currentElement) && template.currentElement.agent && !template.currentElement.agent.isDefault) {
                agentHover.setAgent(template.currentElement.agent.id);
                return agentHover.domNode;
            }
            return undefined;
        };
        const hoverOptions = getChatAgentHoverOptions(() => isResponseVM(template.currentElement) ? template.currentElement.agent : undefined, this.commandService);
        templateDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('element'), user, hoverContent, hoverOptions));
        templateDisposables.add(dom.addDisposableListener(user, dom.EventType.KEY_DOWN, e => {
            const ev = new StandardKeyboardEvent(e);
            if (ev.equals(10) || ev.equals(3)) {
                const content = hoverContent();
                if (content) {
                    this.hoverService.showHover({ content, target: user, trapFocus: true, actions: hoverOptions.actions }, true);
                }
            }
            else if (ev.equals(9)) {
                this.hoverService.hideHover();
            }
        }));
        const template = { avatarContainer, username, detail, value, rowContainer, elementDisposables, templateDisposables, contextKeyService, instantiationService: scopedInstantiationService, agentHover, titleToolbar, footerToolbar };
        return template;
    }
    renderElement(node, index, templateData) {
        this.renderChatTreeItem(node.element, index, templateData);
    }
    renderChatTreeItem(element, index, templateData) {
        templateData.currentElement = element;
        const kind = isRequestVM(element) ? 'request' :
            isResponseVM(element) ? 'response' :
                'welcome';
        this.traceLayout('renderElement', `${kind}, index=${index}`);
        CONTEXT_RESPONSE.bindTo(templateData.contextKeyService).set(isResponseVM(element));
        CONTEXT_ITEM_ID.bindTo(templateData.contextKeyService).set(element.id);
        CONTEXT_REQUEST.bindTo(templateData.contextKeyService).set(isRequestVM(element));
        CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND.bindTo(templateData.contextKeyService).set(isResponseVM(element) && element.agentOrSlashCommandDetected);
        if (isResponseVM(element)) {
            CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING.bindTo(templateData.contextKeyService).set(!!element.agent?.metadata.supportIssueReporting);
            CONTEXT_RESPONSE_VOTE.bindTo(templateData.contextKeyService).set(element.vote === ChatAgentVoteDirection.Up ? 'up' : element.vote === ChatAgentVoteDirection.Down ? 'down' : '');
        }
        else {
            CONTEXT_RESPONSE_VOTE.bindTo(templateData.contextKeyService).set('');
        }
        if (templateData.titleToolbar) {
            templateData.titleToolbar.context = element;
        }
        templateData.footerToolbar.context = element;
        CONTEXT_RESPONSE_ERROR.bindTo(templateData.contextKeyService).set(isResponseVM(element) && !!element.errorDetails);
        const isFiltered = !!(isResponseVM(element) && element.errorDetails?.responseIsFiltered);
        CONTEXT_RESPONSE_FILTERED.bindTo(templateData.contextKeyService).set(isFiltered);
        templateData.rowContainer.classList.toggle('interactive-request', isRequestVM(element));
        templateData.rowContainer.classList.toggle('interactive-response', isResponseVM(element));
        templateData.rowContainer.classList.toggle('show-detail-progress', isResponseVM(element) && !element.isComplete && !element.progressMessages.length);
        templateData.username.textContent = element.username;
        if (!this.rendererOptions.noHeader) {
            this.renderAvatar(element, templateData);
        }
        dom.clearNode(templateData.detail);
        if (isResponseVM(element)) {
            this.renderDetail(element, templateData);
        }
        if (isRequestVM(element) && element.confirmation) {
            this.renderConfirmationAction(element, templateData);
        }
        if (isResponseVM(element) && index === this.delegate.getListLength() - 1 && (!element.isComplete || element.renderData) && element.response.value.length) {
            this.traceLayout('renderElement', `start progressive render, index=${index}`);
            const timer = templateData.elementDisposables.add(new dom.WindowIntervalTimer());
            const runProgressiveRender = (initial) => {
                try {
                    if (this.doNextProgressiveRender(element, index, templateData, !!initial)) {
                        timer.cancel();
                    }
                }
                catch (err) {
                    timer.cancel();
                    this.logService.error(err);
                }
            };
            timer.cancelAndSet(runProgressiveRender, 50, dom.getWindow(templateData.rowContainer));
            runProgressiveRender(true);
        }
        else if (isResponseVM(element)) {
            this.basicRenderElement(element, index, templateData);
        }
        else if (isRequestVM(element)) {
            this.basicRenderElement(element, index, templateData);
        }
    }
    renderDetail(element, templateData) {
        templateData.elementDisposables.add(autorun(reader => {
            this._renderDetail(element, templateData);
        }));
    }
    _renderDetail(element, templateData) {
        dom.clearNode(templateData.detail);
        if (element.agentOrSlashCommandDetected) {
            const msg = element.slashCommand ? localize('usedAgentSlashCommand', "used {0} [[(rerun without)]]", `${chatSubcommandLeader}${element.slashCommand.name}`) : localize('usedAgent', "[[(rerun without)]]");
            dom.reset(templateData.detail, renderFormattedText(msg, {
                className: 'agentOrSlashCommandDetected',
                inline: true,
                actionHandler: {
                    disposables: templateData.elementDisposables,
                    callback: (content) => {
                        this._onDidClickRerunWithAgentOrCommandDetection.fire(element);
                    },
                }
            }));
        }
        else if (!element.isComplete) {
            templateData.detail.textContent = GeneratingPhrase;
        }
    }
    renderConfirmationAction(element, templateData) {
        dom.clearNode(templateData.detail);
        if (element.confirmation) {
            templateData.detail.textContent = localize('chatConfirmationAction', 'selected "{0}"', element.confirmation);
        }
    }
    renderAvatar(element, templateData) {
        const icon = isResponseVM(element) ?
            this.getAgentIcon(element.agent?.metadata) :
            (element.avatarIcon ?? Codicon.account);
        if (icon instanceof URI) {
            const avatarIcon = dom.$('img.icon');
            avatarIcon.src = FileAccess.uriToBrowserUri(icon).toString(true);
            templateData.avatarContainer.replaceChildren(dom.$('.avatar', undefined, avatarIcon));
        }
        else {
            const avatarIcon = dom.$(ThemeIcon.asCSSSelector(icon));
            templateData.avatarContainer.replaceChildren(dom.$('.avatar.codicon-avatar', undefined, avatarIcon));
        }
    }
    getAgentIcon(agent) {
        if (agent?.themeIcon) {
            return agent.themeIcon;
        }
        else if (agent?.iconDark && this.themeService.getColorTheme().type === ColorScheme.DARK) {
            return agent.iconDark;
        }
        else if (agent?.icon) {
            return agent.icon;
        }
        else {
            return Codicon.copilot;
        }
    }
    basicRenderElement(element, index, templateData) {
        templateData.rowContainer.classList.toggle('chat-response-loading', isResponseVM(element) && !element.isComplete);
        let value = [];
        if (isRequestVM(element) && !element.confirmation) {
            const markdown = 'message' in element.message ?
                element.message.message :
                this.markdownDecorationsRenderer.convertParsedRequestToMarkdown(element.message);
            value = [{ content: new MarkdownString(markdown), kind: 'markdownContent' }];
        }
        else if (isResponseVM(element)) {
            if (element.contentReferences.length) {
                value.push({ kind: 'references', references: element.contentReferences });
            }
            value.push(...annotateSpecialMarkdownContent(element.response.value));
            if (element.codeCitations.length) {
                value.push({ kind: 'codeCitations', citations: element.codeCitations });
            }
        }
        dom.clearNode(templateData.value);
        if (isResponseVM(element)) {
            this.renderDetail(element, templateData);
        }
        const isFiltered = !!(isResponseVM(element) && element.errorDetails?.responseIsFiltered);
        const parts = [];
        if (!isFiltered) {
            value.forEach((data, index) => {
                const context = {
                    element,
                    contentIndex: index,
                    content: value,
                    preceedingContentParts: parts,
                };
                const newPart = this.renderChatContentPart(data, templateData, context);
                if (newPart) {
                    templateData.value.appendChild(newPart.domNode);
                    parts.push(newPart);
                }
            });
        }
        if (templateData.renderedParts) {
            dispose(templateData.renderedParts);
        }
        templateData.renderedParts = parts;
        if (!isFiltered) {
            if (isRequestVM(element) && element.variables.length) {
                const newPart = this.renderAttachments(element.variables, element.contentReferences, templateData);
                if (newPart) {
                    templateData.value.appendChild(newPart.domNode);
                    templateData.elementDisposables.add(newPart);
                }
            }
        }
        if (isResponseVM(element) && element.errorDetails?.message) {
            const renderedError = this.instantiationService.createInstance(ChatWarningContentPart, element.errorDetails.responseIsFiltered ? 'info' : 'error', new MarkdownString(element.errorDetails.message), this.renderer);
            templateData.elementDisposables.add(renderedError);
            templateData.value.appendChild(renderedError.domNode);
        }
        const newHeight = templateData.rowContainer.offsetHeight;
        const fireEvent = !element.currentRenderedHeight || element.currentRenderedHeight !== newHeight;
        element.currentRenderedHeight = newHeight;
        if (fireEvent) {
            const disposable = templateData.elementDisposables.add(dom.scheduleAtNextAnimationFrame(dom.getWindow(templateData.value), () => {
                element.currentRenderedHeight = templateData.rowContainer.offsetHeight;
                disposable.dispose();
                this._onDidChangeItemHeight.fire({ element, height: element.currentRenderedHeight });
            }));
        }
    }
    updateItemHeight(templateData) {
        if (!templateData.currentElement) {
            return;
        }
        const newHeight = templateData.rowContainer.offsetHeight;
        templateData.currentElement.currentRenderedHeight = newHeight;
        this._onDidChangeItemHeight.fire({ element: templateData.currentElement, height: newHeight });
    }
    doNextProgressiveRender(element, index, templateData, isInRenderElement) {
        if (!this._isVisible) {
            return true;
        }
        if (element.isCanceled) {
            this.traceLayout('doNextProgressiveRender', `canceled, index=${index}`);
            element.renderData = undefined;
            this.basicRenderElement(element, index, templateData);
            return true;
        }
        templateData.rowContainer.classList.toggle('chat-response-loading', true);
        let isFullyRendered = false;
        this.traceLayout('doNextProgressiveRender', `START progressive render, index=${index}, renderData=${JSON.stringify(element.renderData)}`);
        const contentForThisTurn = this.getNextProgressiveRenderContent(element);
        const partsToRender = this.diff(templateData.renderedParts ?? [], contentForThisTurn, element);
        isFullyRendered = partsToRender.every(part => part === null);
        if (isFullyRendered) {
            if (element.isComplete) {
                this.traceLayout('doNextProgressiveRender', `END progressive render, index=${index} and clearing renderData, response is complete`);
                element.renderData = undefined;
                this.basicRenderElement(element, index, templateData);
                return true;
            }
            this.traceLayout('doNextProgressiveRender', 'caught up with the stream- no new content to render');
            return true;
        }
        this.traceLayout('doNextProgressiveRender', `doing progressive render, ${partsToRender.length} parts to render`);
        this.renderChatContentDiff(partsToRender, contentForThisTurn, element, templateData);
        const height = templateData.rowContainer.offsetHeight;
        element.currentRenderedHeight = height;
        if (!isInRenderElement) {
            this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
        }
        return false;
    }
    renderChatContentDiff(partsToRender, contentForThisTurn, element, templateData) {
        const renderedParts = templateData.renderedParts ?? [];
        templateData.renderedParts = renderedParts;
        partsToRender.forEach((partToRender, index) => {
            if (!partToRender) {
                return;
            }
            const alreadyRenderedPart = templateData.renderedParts?.[index];
            if (alreadyRenderedPart) {
                alreadyRenderedPart.dispose();
            }
            const preceedingContentParts = renderedParts.slice(0, index);
            const context = {
                element,
                content: contentForThisTurn,
                preceedingContentParts,
                contentIndex: index,
            };
            const newPart = this.renderChatContentPart(partToRender, templateData, context);
            if (newPart) {
                if (alreadyRenderedPart) {
                    try {
                        alreadyRenderedPart.domNode.replaceWith(newPart.domNode);
                    }
                    catch (err) {
                        this.logService.error('ChatListItemRenderer#renderChatContentDiff: error replacing part', err);
                    }
                }
                else {
                    templateData.value.appendChild(newPart.domNode);
                }
                renderedParts[index] = newPart;
            }
            else if (alreadyRenderedPart) {
                alreadyRenderedPart.domNode.remove();
            }
        });
    }
    getNextProgressiveRenderContent(element) {
        const data = this.getDataForProgressiveRender(element);
        const renderableResponse = annotateSpecialMarkdownContent(element.response.value);
        this.traceLayout('getNextProgressiveRenderContent', `Want to render ${data.numWordsToRender} at ${data.rate} words/s, counting...`);
        let numNeededWords = data.numWordsToRender;
        const partsToRender = [];
        if (element.contentReferences.length) {
            partsToRender.push({ kind: 'references', references: element.contentReferences });
        }
        for (let i = 0; i < renderableResponse.length; i++) {
            const part = renderableResponse[i];
            if (numNeededWords <= 0) {
                break;
            }
            if (part.kind === 'markdownContent') {
                const wordCountResult = getNWords(part.content.value, numNeededWords);
                if (wordCountResult.isFullString) {
                    partsToRender.push(part);
                }
                else {
                    partsToRender.push({ kind: 'markdownContent', content: new MarkdownString(wordCountResult.value, part.content) });
                }
                this.traceLayout('getNextProgressiveRenderContent', `  Chunk ${i}: Want to render ${numNeededWords} words and found ${wordCountResult.returnedWordCount} words. Total words in chunk: ${wordCountResult.totalWordCount}`);
                numNeededWords -= wordCountResult.returnedWordCount;
            }
            else {
                partsToRender.push(part);
            }
        }
        const lastWordCount = element.contentUpdateTimings?.lastWordCount ?? 0;
        const newRenderedWordCount = data.numWordsToRender - numNeededWords;
        const bufferWords = lastWordCount - newRenderedWordCount;
        this.traceLayout('getNextProgressiveRenderContent', `Want to render ${data.numWordsToRender} words. Rendering ${newRenderedWordCount} words. Buffer: ${bufferWords} words`);
        if (newRenderedWordCount > 0 && newRenderedWordCount !== element.renderData?.renderedWordCount) {
            element.renderData = { lastRenderTime: Date.now(), renderedWordCount: newRenderedWordCount, renderedParts: partsToRender };
        }
        return partsToRender;
    }
    getDataForProgressiveRender(element) {
        const renderData = element.renderData ?? { lastRenderTime: 0, renderedWordCount: 0 };
        const rate = this.getProgressiveRenderRate(element);
        const numWordsToRender = renderData.lastRenderTime === 0 ?
            1 :
            renderData.renderedWordCount +
                Math.floor((Date.now() - renderData.lastRenderTime) / 1000 * rate);
        return {
            numWordsToRender,
            rate
        };
    }
    diff(renderedParts, contentToRender, element) {
        const diff = [];
        for (let i = 0; i < contentToRender.length; i++) {
            const content = contentToRender[i];
            const renderedPart = renderedParts[i];
            if (!renderedPart || !renderedPart.hasSameContent(content, contentToRender.slice(i + 1), element)) {
                diff.push(content);
            }
            else {
                diff.push(null);
            }
        }
        return diff;
    }
    renderChatContentPart(content, templateData, context) {
        if (content.kind === 'treeData') {
            return this.renderTreeData(content, templateData, context);
        }
        else if (content.kind === 'progressMessage') {
            return this.instantiationService.createInstance(ChatProgressContentPart, content, this.renderer, context);
        }
        else if (content.kind === 'progressTask') {
            return this.renderProgressTask(content, templateData, context);
        }
        else if (content.kind === 'command') {
            return this.instantiationService.createInstance(ChatCommandButtonContentPart, content, context);
        }
        else if (content.kind === 'textEditGroup') {
            return this.renderTextEdit(context, content, templateData);
        }
        else if (content.kind === 'confirmation') {
            return this.renderConfirmation(context, content, templateData);
        }
        else if (content.kind === 'warning') {
            return this.instantiationService.createInstance(ChatWarningContentPart, 'warning', content.content, this.renderer);
        }
        else if (content.kind === 'markdownContent') {
            return this.renderMarkdown(content.content, templateData, context);
        }
        else if (content.kind === 'references') {
            return this.renderContentReferencesListData(content, undefined, context, templateData);
        }
        else if (content.kind === 'codeCitations') {
            return this.renderCodeCitationsListData(content, context, templateData);
        }
        else if (content.kind === 'toolInvocation' || content.kind === 'toolInvocationSerialized') {
            return this.renderToolInvocation(content, context, templateData);
        }
        return undefined;
    }
    renderTreeData(content, templateData, context) {
        const data = content.treeData;
        const treeDataIndex = context.preceedingContentParts.filter(part => part instanceof ChatTreeContentPart).length;
        const treePart = this.instantiationService.createInstance(ChatTreeContentPart, data, context.element, this._treePool, treeDataIndex);
        treePart.addDisposable(treePart.onDidChangeHeight(() => {
            this.updateItemHeight(templateData);
        }));
        if (isResponseVM(context.element)) {
            const fileTreeFocusInfo = {
                treeDataId: data.uri.toString(),
                treeIndex: treeDataIndex,
                focus() {
                    treePart.domFocus();
                }
            };
            treePart.addDisposable(treePart.onDidFocus(() => {
                this.focusedFileTreesByResponseId.set(context.element.id, fileTreeFocusInfo.treeIndex);
            }));
            const fileTrees = this.fileTreesByResponseId.get(context.element.id) ?? [];
            fileTrees.push(fileTreeFocusInfo);
            this.fileTreesByResponseId.set(context.element.id, distinct(fileTrees, (v) => v.treeDataId));
            treePart.addDisposable(toDisposable(() => this.fileTreesByResponseId.set(context.element.id, fileTrees.filter(v => v.treeDataId !== data.uri.toString()))));
        }
        return treePart;
    }
    renderContentReferencesListData(references, labelOverride, context, templateData) {
        const referencesPart = this.instantiationService.createInstance(ChatCollapsibleListContentPart, references.references, labelOverride, context.element, this._contentReferencesListPool);
        referencesPart.addDisposable(referencesPart.onDidChangeHeight(() => {
            this.updateItemHeight(templateData);
        }));
        return referencesPart;
    }
    renderCodeCitationsListData(citations, context, templateData) {
        const citationsPart = this.instantiationService.createInstance(ChatCodeCitationContentPart, citations, context);
        return citationsPart;
    }
    renderToolInvocation(toolInvocation, context, templateData) {
        const part = this.instantiationService.createInstance(ChatToolInvocationPart, toolInvocation, context, this.renderer);
        part.addDisposable(part.onDidChangeHeight(() => {
            this.updateItemHeight(templateData);
        }));
        return part;
    }
    renderProgressTask(task, templateData, context) {
        if (!isResponseVM(context.element)) {
            return;
        }
        const taskPart = this.instantiationService.createInstance(ChatTaskContentPart, task, this._contentReferencesListPool, this.renderer, context);
        taskPart.addDisposable(taskPart.onDidChangeHeight(() => {
            this.updateItemHeight(templateData);
        }));
        return taskPart;
    }
    renderConfirmation(context, confirmation, templateData) {
        const part = this.instantiationService.createInstance(ChatConfirmationContentPart, confirmation, context);
        part.addDisposable(part.onDidChangeHeight(() => this.updateItemHeight(templateData)));
        return part;
    }
    renderAttachments(variables, contentReferences, templateData) {
        return this.instantiationService.createInstance(ChatAttachmentsContentPart, variables, contentReferences, undefined);
    }
    renderTextEdit(context, chatTextEdit, templateData) {
        const textEditPart = this.instantiationService.createInstance(ChatTextEditContentPart, chatTextEdit, context, this.rendererOptions, this._diffEditorPool, this._currentLayoutWidth);
        textEditPart.addDisposable(textEditPart.onDidChangeHeight(() => {
            textEditPart.layout(this._currentLayoutWidth);
            this.updateItemHeight(templateData);
        }));
        return textEditPart;
    }
    renderMarkdown(markdown, templateData, context) {
        const element = context.element;
        const fillInIncompleteTokens = isResponseVM(element) && (!element.isComplete || element.isCanceled || element.errorDetails?.responseIsFiltered || element.errorDetails?.responseIsIncomplete || !!element.renderData);
        const codeBlockStartIndex = context.preceedingContentParts.reduce((acc, part) => acc + (part instanceof ChatMarkdownContentPart ? part.codeblocks.length : 0), 0);
        const markdownPart = this.instantiationService.createInstance(ChatMarkdownContentPart, markdown, context, this._editorPool, fillInIncompleteTokens, codeBlockStartIndex, this.renderer, this._currentLayoutWidth, this.codeBlockModelCollection, this.rendererOptions);
        const markdownPartId = markdownPart.id;
        markdownPart.addDisposable(markdownPart.onDidChangeHeight(() => {
            markdownPart.layout(this._currentLayoutWidth);
            this.updateItemHeight(templateData);
        }));
        const codeBlocksByResponseId = this.codeBlocksByResponseId.get(element.id) ?? [];
        this.codeBlocksByResponseId.set(element.id, codeBlocksByResponseId);
        markdownPart.addDisposable(toDisposable(() => {
            const codeBlocksByResponseId = this.codeBlocksByResponseId.get(element.id);
            if (codeBlocksByResponseId) {
                markdownPart.codeblocks.forEach((info, i) => {
                    const codeblock = codeBlocksByResponseId[codeBlockStartIndex + i];
                    if (codeblock?.ownerMarkdownPartId === markdownPartId) {
                        delete codeBlocksByResponseId[codeBlockStartIndex + i];
                    }
                });
            }
        }));
        markdownPart.codeblocks.forEach((info, i) => {
            codeBlocksByResponseId[codeBlockStartIndex + i] = info;
            if (info.uri) {
                const uri = info.uri;
                this.codeBlocksByEditorUri.set(uri, info);
                markdownPart.addDisposable(toDisposable(() => {
                    const codeblock = this.codeBlocksByEditorUri.get(uri);
                    if (codeblock?.ownerMarkdownPartId === markdownPartId) {
                        this.codeBlocksByEditorUri.delete(uri);
                    }
                }));
            }
        });
        return markdownPart;
    }
    disposeElement(node, index, templateData) {
        this.traceLayout('disposeElement', `Disposing element, index=${index}`);
        if (templateData.renderedParts) {
            try {
                dispose(coalesce(templateData.renderedParts));
                templateData.renderedParts = undefined;
                dom.clearNode(templateData.value);
            }
            catch (err) {
                throw err;
            }
        }
        templateData.currentElement = undefined;
        templateData.elementDisposables.clear();
    }
    disposeTemplate(templateData) {
        templateData.templateDisposables.dispose();
    }
};
ChatListItemRenderer = ChatListItemRenderer_1 = __decorate([
    __param(5, IInstantiationService),
    __param(6, IConfigurationService),
    __param(7, ILogService),
    __param(8, IContextKeyService),
    __param(9, IThemeService),
    __param(10, ICommandService),
    __param(11, IHoverService),
    __metadata("design:paramtypes", [ChatEditorOptions, Object, Object, CodeBlockModelCollection, Object, Object, Object, Object, Object, Object, Object, Object])
], ChatListItemRenderer);
export { ChatListItemRenderer };
let ChatListDelegate = class ChatListDelegate {
    constructor(defaultElementHeight, logService) {
        this.defaultElementHeight = defaultElementHeight;
        this.logService = logService;
    }
    _traceLayout(method, message) {
        if (forceVerboseLayoutTracing) {
            this.logService.info(`ChatListDelegate#${method}: ${message}`);
        }
        else {
            this.logService.trace(`ChatListDelegate#${method}: ${message}`);
        }
    }
    getHeight(element) {
        const kind = isRequestVM(element) ? 'request' : 'response';
        const height = ('currentRenderedHeight' in element ? element.currentRenderedHeight : undefined) ?? this.defaultElementHeight;
        this._traceLayout('getHeight', `${kind}, height=${height}`);
        return height;
    }
    getTemplateId(element) {
        return ChatListItemRenderer.ID;
    }
    hasDynamicHeight(element) {
        return true;
    }
};
ChatListDelegate = __decorate([
    __param(1, ILogService),
    __metadata("design:paramtypes", [Number, Object])
], ChatListDelegate);
export { ChatListDelegate };
const voteDownDetailLabels = {
    [ChatAgentVoteDownReason.IncorrectCode]: localize('incorrectCode', "Suggested incorrect code"),
    [ChatAgentVoteDownReason.DidNotFollowInstructions]: localize('didNotFollowInstructions', "Didn't follow instructions"),
    [ChatAgentVoteDownReason.MissingContext]: localize('missingContext', "Missing context"),
    [ChatAgentVoteDownReason.OffensiveOrUnsafe]: localize('offensiveOrUnsafe', "Offensive or unsafe"),
    [ChatAgentVoteDownReason.PoorlyWrittenOrFormatted]: localize('poorlyWrittenOrFormatted', "Poorly written or formatted"),
    [ChatAgentVoteDownReason.RefusedAValidRequest]: localize('refusedAValidRequest', "Refused a valid request"),
    [ChatAgentVoteDownReason.IncompleteCode]: localize('incompleteCode', "Incomplete code"),
    [ChatAgentVoteDownReason.WillReportIssue]: localize('reportIssue', "Report an issue"),
    [ChatAgentVoteDownReason.Other]: localize('other', "Other"),
};
let ChatVoteDownButton = class ChatVoteDownButton extends DropdownMenuActionViewItem {
    constructor(action, options, commandService, issueService, logService, contextMenuService) {
        super(action, { getActions: () => this.getActions(), }, contextMenuService, {
            ...options,
            classNames: ThemeIcon.asClassNameArray(Codicon.thumbsdown),
        });
        this.commandService = commandService;
        this.issueService = issueService;
        this.logService = logService;
    }
    getActions() {
        return [
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.IncorrectCode),
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.DidNotFollowInstructions),
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.IncompleteCode),
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.MissingContext),
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.PoorlyWrittenOrFormatted),
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.RefusedAValidRequest),
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.OffensiveOrUnsafe),
            this.getVoteDownDetailAction(ChatAgentVoteDownReason.Other),
            {
                id: 'reportIssue',
                label: voteDownDetailLabels[ChatAgentVoteDownReason.WillReportIssue],
                tooltip: '',
                enabled: true,
                class: undefined,
                run: async (context) => {
                    if (!isResponseVM(context)) {
                        this.logService.error('ChatVoteDownButton#run: invalid context');
                        return;
                    }
                    await this.commandService.executeCommand(MarkUnhelpfulActionId, context, ChatAgentVoteDownReason.WillReportIssue);
                    await this.issueService.openReporter({ extensionId: context.agent?.extensionId.value });
                }
            }
        ];
    }
    render(container) {
        super.render(container);
        this.element?.classList.toggle('checked', this.action.checked);
    }
    getVoteDownDetailAction(reason) {
        const label = voteDownDetailLabels[reason];
        return {
            id: MarkUnhelpfulActionId,
            label,
            tooltip: '',
            enabled: true,
            checked: this._context.voteDownReason === reason,
            class: undefined,
            run: async (context) => {
                if (!isResponseVM(context)) {
                    this.logService.error('ChatVoteDownButton#getVoteDownDetailAction: invalid context');
                    return;
                }
                await this.commandService.executeCommand(MarkUnhelpfulActionId, context, reason);
            }
        };
    }
};
ChatVoteDownButton = __decorate([
    __param(2, ICommandService),
    __param(3, IWorkbenchIssueService),
    __param(4, ILogService),
    __param(5, IContextMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ChatVoteDownButton);
export { ChatVoteDownButton };
