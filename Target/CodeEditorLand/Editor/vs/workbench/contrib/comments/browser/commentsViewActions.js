import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { ContextKeyExpr, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { Emitter } from '../../../../base/common/event.js';
import { CommentsViewFilterFocusContextKey } from './comments.js';
import { MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ViewAction } from '../../../browser/parts/views/viewPane.js';
import { COMMENTS_VIEW_ID } from './commentsTreeViewer.js';
import { FocusedViewContext } from '../../../common/contextkeys.js';
import { viewFilterSubmenu } from '../../../browser/parts/views/viewFilter.js';
import { Codicon } from '../../../../base/common/codicons.js';
const CONTEXT_KEY_SHOW_RESOLVED = new RawContextKey('commentsView.showResolvedFilter', true);
const CONTEXT_KEY_SHOW_UNRESOLVED = new RawContextKey('commentsView.showUnResolvedFilter', true);
const CONTEXT_KEY_SORT_BY = new RawContextKey('commentsView.sortBy', "resourceAscending");
export class CommentsFilters extends Disposable {
    constructor(options, contextKeyService) {
        super();
        this.contextKeyService = contextKeyService;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._showUnresolved = CONTEXT_KEY_SHOW_UNRESOLVED.bindTo(this.contextKeyService);
        this._showResolved = CONTEXT_KEY_SHOW_RESOLVED.bindTo(this.contextKeyService);
        this._sortBy = CONTEXT_KEY_SORT_BY.bindTo(this.contextKeyService);
        this._showResolved.set(options.showResolved);
        this._showUnresolved.set(options.showUnresolved);
        this._sortBy.set(options.sortBy);
    }
    get showUnresolved() {
        return !!this._showUnresolved.get();
    }
    set showUnresolved(showUnresolved) {
        if (this._showUnresolved.get() !== showUnresolved) {
            this._showUnresolved.set(showUnresolved);
            this._onDidChange.fire({ showUnresolved: true });
        }
    }
    get showResolved() {
        return !!this._showResolved.get();
    }
    set showResolved(showResolved) {
        if (this._showResolved.get() !== showResolved) {
            this._showResolved.set(showResolved);
            this._onDidChange.fire({ showResolved: true });
        }
    }
    get sortBy() {
        return this._sortBy.get() ?? "resourceAscending";
    }
    set sortBy(sortBy) {
        if (this._sortBy.get() !== sortBy) {
            this._sortBy.set(sortBy);
            this._onDidChange.fire({ sortBy });
        }
    }
}
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: 'commentsFocusViewFromFilter',
            title: localize('focusCommentsList', "Focus Comments view"),
            keybinding: {
                when: CommentsViewFilterFocusContextKey,
                weight: 200,
                primary: 2048 | 18
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, commentsView) {
        commentsView.focus();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: 'commentsClearFilterText',
            title: localize('commentsClearFilterText', "Clear filter text"),
            keybinding: {
                when: CommentsViewFilterFocusContextKey,
                weight: 200,
                primary: 9
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, commentsView) {
        commentsView.clearFilterText();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: 'commentsFocusFilter',
            title: localize('focusCommentsFilter', "Focus comments filter"),
            keybinding: {
                when: FocusedViewContext.isEqualTo(COMMENTS_VIEW_ID),
                weight: 200,
                primary: 2048 | 36
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, commentsView) {
        commentsView.focusFilter();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleUnResolvedComments`,
            title: localize('toggle unresolved', "Show Unresolved"),
            category: localize('comments', "Comments"),
            toggled: {
                condition: CONTEXT_KEY_SHOW_UNRESOLVED,
                title: localize('unresolved', "Show Unresolved"),
            },
            menu: {
                id: viewFilterSubmenu,
                group: '1_filter',
                when: ContextKeyExpr.equals('view', COMMENTS_VIEW_ID),
                order: 1
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.showUnresolved = !view.filters.showUnresolved;
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleResolvedComments`,
            title: localize('toggle resolved', "Show Resolved"),
            category: localize('comments', "Comments"),
            toggled: {
                condition: CONTEXT_KEY_SHOW_RESOLVED,
                title: localize('resolved', "Show Resolved"),
            },
            menu: {
                id: viewFilterSubmenu,
                group: '1_filter',
                when: ContextKeyExpr.equals('view', COMMENTS_VIEW_ID),
                order: 1
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.showResolved = !view.filters.showResolved;
    }
});
const commentSortSubmenu = new MenuId('submenu.filter.commentSort');
MenuRegistry.appendMenuItem(viewFilterSubmenu, {
    submenu: commentSortSubmenu,
    title: localize('comment sorts', "Sort By"),
    group: '2_sort',
    icon: Codicon.history,
    when: ContextKeyExpr.equals('view', COMMENTS_VIEW_ID),
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleSortByUpdatedAt`,
            title: localize('toggle sorting by updated at', "Updated Time"),
            category: localize('comments', "Comments"),
            icon: Codicon.history,
            viewId: COMMENTS_VIEW_ID,
            toggled: {
                condition: ContextKeyExpr.equals(CONTEXT_KEY_SORT_BY.key, "updatedAtDescending"),
                title: localize('sorting by updated at', "Updated Time"),
            },
            menu: {
                id: commentSortSubmenu,
                group: 'navigation',
                order: 1,
                isHiddenByDefault: false,
            },
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.sortBy = "updatedAtDescending";
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleSortByResource`,
            title: localize('toggle sorting by resource', "Position in File"),
            category: localize('comments', "Comments"),
            icon: Codicon.history,
            viewId: COMMENTS_VIEW_ID,
            toggled: {
                condition: ContextKeyExpr.equals(CONTEXT_KEY_SORT_BY.key, "resourceAscending"),
                title: localize('sorting by position in file', "Position in File"),
            },
            menu: {
                id: commentSortSubmenu,
                group: 'navigation',
                order: 0,
                isHiddenByDefault: false,
            },
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.sortBy = "resourceAscending";
    }
});
