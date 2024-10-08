import { IActivityService, IActivity } from '../common/activity.js';
import { IDisposable, Disposable } from '../../../../base/common/lifecycle.js';
import { IViewDescriptorService, ViewContainer } from '../../../common/views.js';
import { Event } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ActivityService extends Disposable implements IActivityService {
    private readonly viewDescriptorService;
    private readonly instantiationService;
    _serviceBrand: undefined;
    private readonly viewActivities;
    private readonly _onDidChangeActivity;
    readonly onDidChangeActivity: Event<string | ViewContainer>;
    private readonly viewContainerActivities;
    private readonly globalActivities;
    constructor(viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService);
    showViewContainerActivity(viewContainerId: string, activity: IActivity): IDisposable;
    getViewContainerActivities(viewContainerId: string): IActivity[];
    showViewActivity(viewId: string, activity: IActivity): IDisposable;
    showAccountsActivity(activity: IActivity): IDisposable;
    showGlobalActivity(activity: IActivity): IDisposable;
    getActivity(id: string): IActivity[];
    private showActivity;
}
