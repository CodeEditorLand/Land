import { Event } from '../../../../base/common/event.js';
import { IProgressIndicator } from '../../../../platform/progress/common/progress.js';
import { IPaneComposite } from '../../../common/panecomposite.js';
import { IView, IViewPaneContainer, ViewContainer, ViewContainerLocation } from '../../../common/views.js';
export declare const IViewsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IViewsService>;
export interface IViewsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeViewContainerVisibility: Event<{
        id: string;
        visible: boolean;
        location: ViewContainerLocation;
    }>;
    isViewContainerVisible(id: string): boolean;
    isViewContainerActive(id: string): boolean;
    openViewContainer(id: string, focus?: boolean): Promise<IPaneComposite | null>;
    closeViewContainer(id: string): void;
    getVisibleViewContainer(location: ViewContainerLocation): ViewContainer | null;
    getActiveViewPaneContainerWithId(viewContainerId: string): IViewPaneContainer | null;
    getFocusedViewName(): string;
    readonly onDidChangeViewVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    readonly onDidChangeFocusedView: Event<void>;
    isViewVisible(id: string): boolean;
    openView<T extends IView>(id: string, focus?: boolean): Promise<T | null>;
    closeView(id: string): void;
    getActiveViewWithId<T extends IView>(id: string): T | null;
    getViewWithId<T extends IView>(id: string): T | null;
    getViewProgressIndicator(id: string): IProgressIndicator | undefined;
}
