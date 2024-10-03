import { Disposable } from '../../../../base/common/lifecycle.js';
import * as languages from '../../../../editor/common/languages.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { CommentMenus } from './commentMenus.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
export declare class CommentThreadHeader<T = IRange> extends Disposable {
    private _delegate;
    private _commentMenus;
    private _commentThread;
    private _contextKeyService;
    private instantiationService;
    private _contextMenuService;
    private _headElement;
    private _headingLabel;
    private _actionbarWidget;
    private _collapseAction;
    constructor(container: HTMLElement, _delegate: {
        collapse: () => void;
    }, _commentMenus: CommentMenus, _commentThread: languages.CommentThread<T>, _contextKeyService: IContextKeyService, instantiationService: IInstantiationService, _contextMenuService: IContextMenuService);
    protected _fillHead(): void;
    private setActionBarActions;
    updateCommentThread(commentThread: languages.CommentThread<T>): void;
    createThreadLabel(): void;
    updateHeight(headHeight: number): void;
    private onContextMenu;
}
