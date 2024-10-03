import { Disposable } from '../../../../base/common/lifecycle.js';
import { ISCMService, ISCMViewService } from '../common/scm.js';
import { IActivityService } from '../../../services/activity/common/activity.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ITitleService } from '../../../services/title/browser/titleService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
export declare class SCMActiveRepositoryController extends Disposable implements IWorkbenchContribution {
    private readonly activityService;
    private readonly configurationService;
    private readonly contextKeyService;
    private readonly scmService;
    private readonly scmViewService;
    private readonly statusbarService;
    private readonly titleService;
    private readonly _countBadgeConfig;
    private readonly _repositories;
    private readonly _activeRepositoryHistoryItemRefName;
    private readonly _countBadgeRepositories;
    private readonly _countBadge;
    private _activeRepositoryNameContextKey;
    private _activeRepositoryBranchNameContextKey;
    constructor(activityService: IActivityService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, scmService: ISCMService, scmViewService: ISCMViewService, statusbarService: IStatusbarService, titleService: ITitleService);
    private _getRepositoryResourceCount;
    private _updateActivityCountBadge;
    private _updateStatusBar;
    private _updateActiveRepositoryContextKeys;
}
export declare class SCMActiveResourceContextKeyController extends Disposable implements IWorkbenchContribution {
    private readonly scmService;
    private readonly uriIdentityService;
    private readonly _repositories;
    private readonly _onDidRepositoryChange;
    constructor(editorGroupsService: IEditorGroupsService, scmService: ISCMService, uriIdentityService: IUriIdentityService);
    private _getEditorHasChanges;
    private _getEditorRepositoryId;
    dispose(): void;
}
