import './media/notificationsToasts.css';
import { INotificationsModel } from '../../../common/notifications.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { INotificationsToastController } from './notificationsCommands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IHostService } from '../../../services/host/browser/host.js';
export declare class NotificationsToasts extends Themable implements INotificationsToastController {
    private readonly container;
    private readonly model;
    private readonly instantiationService;
    private readonly layoutService;
    private readonly editorGroupService;
    private readonly contextKeyService;
    private readonly lifecycleService;
    private readonly hostService;
    private static readonly MAX_WIDTH;
    private static readonly MAX_NOTIFICATIONS;
    private static readonly PURGE_TIMEOUT;
    private static readonly SPAM_PROTECTION;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<void>;
    private _isVisible;
    get isVisible(): boolean;
    private notificationsToastsContainer;
    private workbenchDimensions;
    private isNotificationsCenterVisible;
    private readonly mapNotificationToToast;
    private readonly mapNotificationToDisposable;
    private readonly notificationsToastsVisibleContextKey;
    private readonly addedToastsIntervalCounter;
    constructor(container: HTMLElement, model: INotificationsModel, instantiationService: IInstantiationService, layoutService: IWorkbenchLayoutService, themeService: IThemeService, editorGroupService: IEditorGroupsService, contextKeyService: IContextKeyService, lifecycleService: ILifecycleService, hostService: IHostService);
    private registerListeners;
    private onDidChangeNotification;
    private addToast;
    private doAddToast;
    private purgeNotification;
    private removeToast;
    private removeToasts;
    private doHide;
    hide(): void;
    focus(): boolean;
    focusNext(): boolean;
    focusPrevious(): boolean;
    focusFirst(): boolean;
    focusLast(): boolean;
    update(isCenterVisible: boolean): void;
    updateStyles(): void;
    private getToasts;
    layout(dimension: Dimension | undefined): void;
    private computeMaxDimensions;
    private layoutLists;
    private layoutContainer;
    private updateToastVisibility;
    private isToastInDOM;
}
