import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IResourceLabel, ResourceLabels } from '../../../browser/labels.js';
import { CommentNode, ResourceWithCommentThreads } from '../common/commentModel.js';
import { ITreeFilter, ITreeNode, TreeFilterResult, TreeVisibility } from '../../../../base/browser/ui/tree/tree.js';
import { IListRenderer } from '../../../../base/browser/ui/list/list.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IListService, IWorkbenchAsyncDataTreeOptions, WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TimestampWidget } from './timestamp.js';
import { IMatch } from '../../../../base/common/filters.js';
import { FilterOptions } from './commentsFilterOptions.js';
import { IStyleOverride } from '../../../../platform/theme/browser/defaultStyles.js';
import { IListStyles } from '../../../../base/browser/ui/list/listWidget.js';
import { ILocalizedString } from '../../../../platform/action/common/action.js';
import { CommentsModel } from './commentsModel.js';
import { ActionBar, IActionViewItemProvider } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IAction } from '../../../../base/common/actions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare const COMMENTS_VIEW_ID = "workbench.panel.comments";
export declare const COMMENTS_VIEW_STORAGE_ID = "Comments";
export declare const COMMENTS_VIEW_TITLE: ILocalizedString;
interface IResourceTemplateData {
    resourceLabel: IResourceLabel;
    separator: HTMLElement;
    owner: HTMLElement;
}
interface ICommentThreadTemplateData {
    threadMetadata: {
        relevance: HTMLElement;
        icon: HTMLElement;
        userNames: HTMLSpanElement;
        timestamp: TimestampWidget;
        separator: HTMLElement;
        commentPreview: HTMLSpanElement;
        range: HTMLSpanElement;
    };
    repliesMetadata: {
        container: HTMLElement;
        icon: HTMLElement;
        count: HTMLSpanElement;
        lastReplyDetail: HTMLSpanElement;
        separator: HTMLElement;
        timestamp: TimestampWidget;
    };
    actionBar: ActionBar;
    disposables: IDisposable[];
}
export declare class ResourceWithCommentsRenderer implements IListRenderer<ITreeNode<ResourceWithCommentThreads>, IResourceTemplateData> {
    private labels;
    templateId: string;
    constructor(labels: ResourceLabels);
    renderTemplate(container: HTMLElement): {
        resourceLabel: IResourceLabel;
        owner: HTMLElement;
        separator: HTMLElement;
    };
    renderElement(node: ITreeNode<ResourceWithCommentThreads>, index: number, templateData: IResourceTemplateData, height: number | undefined): void;
    disposeTemplate(templateData: IResourceTemplateData): void;
}
export declare class CommentsMenus implements IDisposable {
    private readonly menuService;
    private contextKeyService;
    constructor(menuService: IMenuService);
    getResourceActions(element: CommentNode): {
        actions: IAction[];
    };
    getResourceContextActions(element: CommentNode): IAction[];
    setContextKeyService(service: IContextKeyService): void;
    private getActions;
    dispose(): void;
}
export declare class CommentNodeRenderer implements IListRenderer<ITreeNode<CommentNode>, ICommentThreadTemplateData> {
    private actionViewItemProvider;
    private menus;
    private readonly openerService;
    private readonly configurationService;
    private readonly hoverService;
    private themeService;
    templateId: string;
    constructor(actionViewItemProvider: IActionViewItemProvider, menus: CommentsMenus, openerService: IOpenerService, configurationService: IConfigurationService, hoverService: IHoverService, themeService: IThemeService);
    renderTemplate(container: HTMLElement): {
        threadMetadata: {
            icon: HTMLElement;
            userNames: HTMLElement;
            timestamp: TimestampWidget;
            relevance: HTMLElement;
            separator: HTMLElement;
            commentPreview: HTMLElement;
            range: HTMLElement;
        };
        repliesMetadata: {
            container: HTMLElement;
            icon: HTMLElement;
            count: HTMLElement;
            lastReplyDetail: HTMLElement;
            separator: HTMLElement;
            timestamp: TimestampWidget;
        };
        actionBar: ActionBar;
        disposables: TimestampWidget[];
    };
    private getCountString;
    private getRenderedComment;
    private getIcon;
    renderElement(node: ITreeNode<CommentNode>, index: number, templateData: ICommentThreadTemplateData, height: number | undefined): void;
    private getCommentThreadWidgetStateColor;
    disposeTemplate(templateData: ICommentThreadTemplateData): void;
}
export interface ICommentsListOptions extends IWorkbenchAsyncDataTreeOptions<any, any> {
    overrideStyles?: IStyleOverride<IListStyles>;
}
declare const enum FilterDataType {
    Resource = 0,
    Comment = 1
}
interface ResourceFilterData {
    type: FilterDataType.Resource;
    uriMatches: IMatch[];
}
interface CommentFilterData {
    type: FilterDataType.Comment;
    textMatches: IMatch[];
}
type FilterData = ResourceFilterData | CommentFilterData;
export declare class Filter implements ITreeFilter<ResourceWithCommentThreads | CommentNode, FilterData> {
    options: FilterOptions;
    constructor(options: FilterOptions);
    filter(element: ResourceWithCommentThreads | CommentNode, parentVisibility: TreeVisibility): TreeFilterResult<FilterData>;
    private filterResourceMarkers;
    private filterCommentNode;
}
export declare class CommentsList extends WorkbenchObjectTree<CommentsModel | ResourceWithCommentThreads | CommentNode, any> {
    private readonly contextMenuService;
    private readonly keybindingService;
    private readonly menus;
    constructor(labels: ResourceLabels, container: HTMLElement, options: ICommentsListOptions, contextKeyService: IContextKeyService, listService: IListService, instantiationService: IInstantiationService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService);
    private commentsOnContextMenu;
    filterComments(): void;
    getVisibleItemCount(): number;
}
export {};
