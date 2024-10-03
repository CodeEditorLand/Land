import './commentsEditorContribution.js';
import { ICommentService } from './commentService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IActivityService } from '../../../services/activity/common/activity.js';
export declare class UnresolvedCommentsBadge extends Disposable implements IWorkbenchContribution {
    private readonly _commentService;
    private readonly activityService;
    private readonly activity;
    private totalUnresolved;
    constructor(_commentService: ICommentService, activityService: IActivityService);
    private onAllCommentsChanged;
    private onCommentsUpdated;
    private updateBadge;
}
