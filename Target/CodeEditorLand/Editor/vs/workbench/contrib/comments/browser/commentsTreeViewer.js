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
import * as dom from '../../../../base/browser/dom.js';
import * as nls from '../../../../nls.js';
import { renderMarkdown } from '../../../../base/browser/markdownRenderer.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ResourceLabels } from '../../../browser/labels.js';
import { CommentNode, ResourceWithCommentThreads } from '../common/commentModel.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IListService, WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TimestampWidget } from './timestamp.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { commentViewThreadStateColorVar, getCommentThreadStateIconColor } from './commentColors.js';
import { CommentThreadApplicability, CommentThreadState } from '../../../../editor/common/languages.js';
import { FilterOptions } from './commentsFilterOptions.js';
import { basename } from '../../../../base/common/resources.js';
import { openLinkFromMarkdown } from '../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { CommentsModel } from './commentsModel.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { createActionViewItem, createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export const COMMENTS_VIEW_ID = 'workbench.panel.comments';
export const COMMENTS_VIEW_STORAGE_ID = 'Comments';
export const COMMENTS_VIEW_TITLE = nls.localize2('comments.view.title', "Comments");
class CommentsModelVirtualDelegate {
    static { this.RESOURCE_ID = 'resource-with-comments'; }
    static { this.COMMENT_ID = 'comment-node'; }
    getHeight(element) {
        if ((element instanceof CommentNode) && element.hasReply()) {
            return 44;
        }
        return 22;
    }
    getTemplateId(element) {
        if (element instanceof ResourceWithCommentThreads) {
            return CommentsModelVirtualDelegate.RESOURCE_ID;
        }
        if (element instanceof CommentNode) {
            return CommentsModelVirtualDelegate.COMMENT_ID;
        }
        return '';
    }
}
export class ResourceWithCommentsRenderer {
    constructor(labels) {
        this.labels = labels;
        this.templateId = 'resource-with-comments';
    }
    renderTemplate(container) {
        const labelContainer = dom.append(container, dom.$('.resource-container'));
        const resourceLabel = this.labels.create(labelContainer);
        const separator = dom.append(labelContainer, dom.$('.separator'));
        const owner = labelContainer.appendChild(dom.$('.owner'));
        return { resourceLabel, owner, separator };
    }
    renderElement(node, index, templateData, height) {
        templateData.resourceLabel.setFile(node.element.resource);
        templateData.separator.innerText = '\u00b7';
        if (node.element.ownerLabel) {
            templateData.owner.innerText = node.element.ownerLabel;
            templateData.separator.style.display = 'inline';
        }
        else {
            templateData.owner.innerText = '';
            templateData.separator.style.display = 'none';
        }
    }
    disposeTemplate(templateData) {
        templateData.resourceLabel.dispose();
    }
}
let CommentsMenus = class CommentsMenus {
    constructor(menuService) {
        this.menuService = menuService;
    }
    getResourceActions(element) {
        const actions = this.getActions(MenuId.CommentsViewThreadActions, element);
        return { actions: actions.primary };
    }
    getResourceContextActions(element) {
        return this.getActions(MenuId.CommentsViewThreadActions, element).secondary;
    }
    setContextKeyService(service) {
        this.contextKeyService = service;
    }
    getActions(menuId, element) {
        if (!this.contextKeyService) {
            return { primary: [], secondary: [] };
        }
        const overlay = [
            ['commentController', element.owner],
            ['resourceScheme', element.resource.scheme],
            ['commentThread', element.contextValue],
            ['canReply', element.thread.canReply]
        ];
        const contextKeyService = this.contextKeyService.createOverlay(overlay);
        const menu = this.menuService.getMenuActions(menuId, contextKeyService, { shouldForwardArgs: true });
        const primary = [];
        const secondary = [];
        const result = { primary, secondary, menu };
        createAndFillInContextMenuActions(menu, result, 'inline');
        return result;
    }
    dispose() {
        this.contextKeyService = undefined;
    }
};
CommentsMenus = __decorate([
    __param(0, IMenuService),
    __metadata("design:paramtypes", [Object])
], CommentsMenus);
export { CommentsMenus };
let CommentNodeRenderer = class CommentNodeRenderer {
    constructor(actionViewItemProvider, menus, openerService, configurationService, hoverService, themeService) {
        this.actionViewItemProvider = actionViewItemProvider;
        this.menus = menus;
        this.openerService = openerService;
        this.configurationService = configurationService;
        this.hoverService = hoverService;
        this.themeService = themeService;
        this.templateId = 'comment-node';
    }
    renderTemplate(container) {
        const threadContainer = dom.append(container, dom.$('.comment-thread-container'));
        const metadataContainer = dom.append(threadContainer, dom.$('.comment-metadata-container'));
        const metadata = dom.append(metadataContainer, dom.$('.comment-metadata'));
        const threadMetadata = {
            icon: dom.append(metadata, dom.$('.icon')),
            userNames: dom.append(metadata, dom.$('.user')),
            timestamp: new TimestampWidget(this.configurationService, this.hoverService, dom.append(metadata, dom.$('.timestamp-container'))),
            relevance: dom.append(metadata, dom.$('.relevance')),
            separator: dom.append(metadata, dom.$('.separator')),
            commentPreview: dom.append(metadata, dom.$('.text')),
            range: dom.append(metadata, dom.$('.range'))
        };
        threadMetadata.separator.innerText = '\u00b7';
        const actionsContainer = dom.append(metadataContainer, dom.$('.actions'));
        const actionBar = new ActionBar(actionsContainer, {
            actionViewItemProvider: this.actionViewItemProvider
        });
        const snippetContainer = dom.append(threadContainer, dom.$('.comment-snippet-container'));
        const repliesMetadata = {
            container: snippetContainer,
            icon: dom.append(snippetContainer, dom.$('.icon')),
            count: dom.append(snippetContainer, dom.$('.count')),
            lastReplyDetail: dom.append(snippetContainer, dom.$('.reply-detail')),
            separator: dom.append(snippetContainer, dom.$('.separator')),
            timestamp: new TimestampWidget(this.configurationService, this.hoverService, dom.append(snippetContainer, dom.$('.timestamp-container'))),
        };
        repliesMetadata.separator.innerText = '\u00b7';
        repliesMetadata.icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.indent));
        const disposables = [threadMetadata.timestamp, repliesMetadata.timestamp];
        return { threadMetadata, repliesMetadata, actionBar, disposables };
    }
    getCountString(commentCount) {
        if (commentCount > 2) {
            return nls.localize('commentsCountReplies', "{0} replies", commentCount - 1);
        }
        else if (commentCount === 2) {
            return nls.localize('commentsCountReply', "1 reply");
        }
        else {
            return nls.localize('commentCount', "1 comment");
        }
    }
    getRenderedComment(commentBody, disposables) {
        const renderedComment = renderMarkdown(commentBody, {
            inline: true,
            actionHandler: {
                callback: (link) => openLinkFromMarkdown(this.openerService, link, commentBody.isTrusted),
                disposables: disposables
            }
        });
        const images = renderedComment.element.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const textDescription = dom.$('');
            textDescription.textContent = image.alt ? nls.localize('imageWithLabel', "Image: {0}", image.alt) : nls.localize('image', "Image");
            image.parentNode.replaceChild(textDescription, image);
        }
        while ((renderedComment.element.children.length > 1) && (renderedComment.element.firstElementChild?.tagName === 'HR')) {
            renderedComment.element.removeChild(renderedComment.element.firstElementChild);
        }
        return renderedComment;
    }
    getIcon(threadState) {
        if (threadState === CommentThreadState.Unresolved) {
            return Codicon.commentUnresolved;
        }
        else {
            return Codicon.comment;
        }
    }
    renderElement(node, index, templateData, height) {
        templateData.actionBar.clear();
        const commentCount = node.element.replies.length + 1;
        if (node.element.threadRelevance === CommentThreadApplicability.Outdated) {
            templateData.threadMetadata.relevance.style.display = '';
            templateData.threadMetadata.relevance.innerText = nls.localize('outdated', "Outdated");
            templateData.threadMetadata.separator.style.display = 'none';
        }
        else {
            templateData.threadMetadata.relevance.innerText = '';
            templateData.threadMetadata.relevance.style.display = 'none';
            templateData.threadMetadata.separator.style.display = '';
        }
        templateData.threadMetadata.icon.classList.remove(...Array.from(templateData.threadMetadata.icon.classList.values())
            .filter(value => value.startsWith('codicon')));
        templateData.threadMetadata.icon.classList.add(...ThemeIcon.asClassNameArray(this.getIcon(node.element.threadState)));
        if (node.element.threadState !== undefined) {
            const color = this.getCommentThreadWidgetStateColor(node.element.threadState, this.themeService.getColorTheme());
            templateData.threadMetadata.icon.style.setProperty(commentViewThreadStateColorVar, `${color}`);
            templateData.threadMetadata.icon.style.color = `var(${commentViewThreadStateColorVar})`;
        }
        templateData.threadMetadata.userNames.textContent = node.element.comment.userName;
        templateData.threadMetadata.timestamp.setTimestamp(node.element.comment.timestamp ? new Date(node.element.comment.timestamp) : undefined);
        const originalComment = node.element;
        templateData.threadMetadata.commentPreview.innerText = '';
        templateData.threadMetadata.commentPreview.style.height = '22px';
        if (typeof originalComment.comment.body === 'string') {
            templateData.threadMetadata.commentPreview.innerText = originalComment.comment.body;
        }
        else {
            const disposables = new DisposableStore();
            templateData.disposables.push(disposables);
            const renderedComment = this.getRenderedComment(originalComment.comment.body, disposables);
            templateData.disposables.push(renderedComment);
            templateData.threadMetadata.commentPreview.appendChild(renderedComment.element.firstElementChild ?? renderedComment.element);
            templateData.disposables.push(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), templateData.threadMetadata.commentPreview, renderedComment.element.textContent ?? ''));
        }
        if (node.element.range) {
            if (node.element.range.startLineNumber === node.element.range.endLineNumber) {
                templateData.threadMetadata.range.textContent = nls.localize('commentLine', "[Ln {0}]", node.element.range.startLineNumber);
            }
            else {
                templateData.threadMetadata.range.textContent = nls.localize('commentRange', "[Ln {0}-{1}]", node.element.range.startLineNumber, node.element.range.endLineNumber);
            }
        }
        const menuActions = this.menus.getResourceActions(node.element);
        templateData.actionBar.push(menuActions.actions, { icon: true, label: false });
        templateData.actionBar.context = {
            commentControlHandle: node.element.controllerHandle,
            commentThreadHandle: node.element.threadHandle,
            $mid: 7 /* MarshalledId.CommentThread */
        };
        if (!node.element.hasReply()) {
            templateData.repliesMetadata.container.style.display = 'none';
            return;
        }
        templateData.repliesMetadata.container.style.display = '';
        templateData.repliesMetadata.count.textContent = this.getCountString(commentCount);
        const lastComment = node.element.replies[node.element.replies.length - 1].comment;
        templateData.repliesMetadata.lastReplyDetail.textContent = nls.localize('lastReplyFrom', "Last reply from {0}", lastComment.userName);
        templateData.repliesMetadata.timestamp.setTimestamp(lastComment.timestamp ? new Date(lastComment.timestamp) : undefined);
    }
    getCommentThreadWidgetStateColor(state, theme) {
        return (state !== undefined) ? getCommentThreadStateIconColor(state, theme) : undefined;
    }
    disposeTemplate(templateData) {
        templateData.disposables.forEach(disposeable => disposeable.dispose());
        templateData.actionBar.dispose();
    }
};
CommentNodeRenderer = __decorate([
    __param(2, IOpenerService),
    __param(3, IConfigurationService),
    __param(4, IHoverService),
    __param(5, IThemeService),
    __metadata("design:paramtypes", [Function, CommentsMenus, Object, Object, Object, Object])
], CommentNodeRenderer);
export { CommentNodeRenderer };
export class Filter {
    constructor(options) {
        this.options = options;
    }
    filter(element, parentVisibility) {
        if (this.options.filter === '' && this.options.showResolved && this.options.showUnresolved) {
            return 1 /* TreeVisibility.Visible */;
        }
        if (element instanceof ResourceWithCommentThreads) {
            return this.filterResourceMarkers(element);
        }
        else {
            return this.filterCommentNode(element, parentVisibility);
        }
    }
    filterResourceMarkers(resourceMarkers) {
        // Filter by text. Do not apply negated filters on resources instead use exclude patterns
        if (this.options.textFilter.text && !this.options.textFilter.negate) {
            const uriMatches = FilterOptions._filter(this.options.textFilter.text, basename(resourceMarkers.resource));
            if (uriMatches) {
                return { visibility: true, data: { type: 0 /* FilterDataType.Resource */, uriMatches: uriMatches || [] } };
            }
        }
        return 2 /* TreeVisibility.Recurse */;
    }
    filterCommentNode(comment, parentVisibility) {
        const matchesResolvedState = (comment.threadState === undefined) || (this.options.showResolved && CommentThreadState.Resolved === comment.threadState) ||
            (this.options.showUnresolved && CommentThreadState.Unresolved === comment.threadState);
        if (!matchesResolvedState) {
            return false;
        }
        if (!this.options.textFilter.text) {
            return true;
        }
        const textMatches = 
        // Check body of comment for value
        FilterOptions._messageFilter(this.options.textFilter.text, typeof comment.comment.body === 'string' ? comment.comment.body : comment.comment.body.value)
            // Check first user for value
            || FilterOptions._messageFilter(this.options.textFilter.text, comment.comment.userName)
            // Check all replies for value
            || comment.replies.map(reply => {
                // Check user for value
                return FilterOptions._messageFilter(this.options.textFilter.text, reply.comment.userName)
                    // Check body of reply for value
                    || FilterOptions._messageFilter(this.options.textFilter.text, typeof reply.comment.body === 'string' ? reply.comment.body : reply.comment.body.value);
            }).filter(value => !!value).flat();
        // Matched and not negated
        if (textMatches.length && !this.options.textFilter.negate) {
            return { visibility: true, data: { type: 1 /* FilterDataType.Comment */, textMatches } };
        }
        // Matched and negated - exclude it only if parent visibility is not set
        if (textMatches.length && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return false;
        }
        // Not matched and negated - include it only if parent visibility is not set
        if ((textMatches.length === 0) && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return true;
        }
        return parentVisibility;
    }
}
let CommentsList = class CommentsList extends WorkbenchObjectTree {
    constructor(labels, container, options, contextKeyService, listService, instantiationService, configurationService, contextMenuService, keybindingService) {
        const delegate = new CommentsModelVirtualDelegate();
        const actionViewItemProvider = createActionViewItem.bind(undefined, instantiationService);
        const menus = instantiationService.createInstance(CommentsMenus);
        menus.setContextKeyService(contextKeyService);
        const renderers = [
            instantiationService.createInstance(ResourceWithCommentsRenderer, labels),
            instantiationService.createInstance(CommentNodeRenderer, actionViewItemProvider, menus)
        ];
        super('CommentsTree', container, delegate, renderers, {
            accessibilityProvider: options.accessibilityProvider,
            identityProvider: {
                getId: (element) => {
                    if (element instanceof CommentsModel) {
                        return 'root';
                    }
                    if (element instanceof ResourceWithCommentThreads) {
                        return `${element.uniqueOwner}-${element.id}`;
                    }
                    if (element instanceof CommentNode) {
                        return `${element.uniqueOwner}-${element.resource.toString()}-${element.threadId}-${element.comment.uniqueIdInThread}` + (element.isRoot ? '-root' : '');
                    }
                    return '';
                }
            },
            expandOnlyOnTwistieClick: true,
            collapseByDefault: false,
            overrideStyles: options.overrideStyles,
            filter: options.filter,
            sorter: options.sorter,
            findWidgetEnabled: false,
            multipleSelectionSupport: false,
        }, instantiationService, contextKeyService, listService, configurationService);
        this.contextMenuService = contextMenuService;
        this.keybindingService = keybindingService;
        this.menus = menus;
        this.disposables.add(this.onContextMenu(e => this.commentsOnContextMenu(e)));
    }
    commentsOnContextMenu(treeEvent) {
        const node = treeEvent.element;
        if (!(node instanceof CommentNode)) {
            return;
        }
        const event = treeEvent.browserEvent;
        event.preventDefault();
        event.stopPropagation();
        this.setFocus([node]);
        const actions = this.menus.getResourceContextActions(node);
        if (!actions.length) {
            return;
        }
        this.contextMenuService.showContextMenu({
            getAnchor: () => treeEvent.anchor,
            getActions: () => actions,
            getActionViewItem: (action) => {
                const keybinding = this.keybindingService.lookupKeybinding(action.id);
                if (keybinding) {
                    return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                }
                return undefined;
            },
            onHide: (wasCancelled) => {
                if (wasCancelled) {
                    this.domFocus();
                }
            },
            getActionsContext: () => ({
                commentControlHandle: node.controllerHandle,
                commentThreadHandle: node.threadHandle,
                $mid: 7 /* MarshalledId.CommentThread */,
                thread: node.thread
            })
        });
    }
    filterComments() {
        this.refilter();
    }
    getVisibleItemCount() {
        let filtered = 0;
        const root = this.getNode();
        for (const resourceNode of root.children) {
            for (const commentNode of resourceNode.children) {
                if (commentNode.visible && resourceNode.visible) {
                    filtered++;
                }
            }
        }
        return filtered;
    }
};
CommentsList = __decorate([
    __param(3, IContextKeyService),
    __param(4, IListService),
    __param(5, IInstantiationService),
    __param(6, IConfigurationService),
    __param(7, IContextMenuService),
    __param(8, IKeybindingService),
    __metadata("design:paramtypes", [ResourceLabels,
        HTMLElement, Object, Object, Object, Object, Object, Object, Object])
], CommentsList);
export { CommentsList };
