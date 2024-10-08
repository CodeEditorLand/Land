import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IView } from '../../../common/views.js';
import { CommentsFilters } from './commentsViewActions.js';
export declare const CommentsViewFilterFocusContextKey: RawContextKey<boolean>;
export interface ICommentsView extends IView {
    readonly filters: CommentsFilters;
    focusFilter(): void;
    clearFilterText(): void;
    getFilterStats(): {
        total: number;
        filtered: number;
    };
    collapseAll(): void;
}
