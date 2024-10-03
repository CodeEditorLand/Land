import { IListVirtualDelegate, IListRenderer } from '../../../../base/browser/ui/list/list.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IActionRunner } from '../../../../base/common/actions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { DisposableStore, Disposable } from '../../../../base/common/lifecycle.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { INotificationViewItem } from '../../../common/notifications.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ProgressBar } from '../../../../base/browser/ui/progressbar/progressbar.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare class NotificationsListDelegate implements IListVirtualDelegate<INotificationViewItem> {
    private static readonly ROW_HEIGHT;
    private static readonly LINE_HEIGHT;
    private offsetHelper;
    constructor(container: HTMLElement);
    private createOffsetHelper;
    getHeight(notification: INotificationViewItem): number;
    private computePreferredHeight;
    getTemplateId(element: INotificationViewItem): string;
}
export interface INotificationTemplateData {
    container: HTMLElement;
    toDispose: DisposableStore;
    mainRow: HTMLElement;
    icon: HTMLElement;
    message: HTMLElement;
    toolbar: ActionBar;
    detailsRow: HTMLElement;
    source: HTMLElement;
    buttonsContainer: HTMLElement;
    progress: ProgressBar;
    renderer: NotificationTemplateRenderer;
}
export declare class NotificationRenderer implements IListRenderer<INotificationViewItem, INotificationTemplateData> {
    private actionRunner;
    private readonly contextMenuService;
    private readonly instantiationService;
    private readonly notificationService;
    static readonly TEMPLATE_ID = "notification";
    constructor(actionRunner: IActionRunner, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, notificationService: INotificationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): INotificationTemplateData;
    renderElement(notification: INotificationViewItem, index: number, data: INotificationTemplateData): void;
    disposeTemplate(templateData: INotificationTemplateData): void;
}
export declare class NotificationTemplateRenderer extends Disposable {
    private template;
    private actionRunner;
    private readonly openerService;
    private readonly instantiationService;
    private readonly keybindingService;
    private readonly contextMenuService;
    private readonly hoverService;
    private static closeNotificationAction;
    private static expandNotificationAction;
    private static collapseNotificationAction;
    private static readonly SEVERITIES;
    private readonly inputDisposables;
    constructor(template: INotificationTemplateData, actionRunner: IActionRunner, openerService: IOpenerService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, hoverService: IHoverService);
    setInput(notification: INotificationViewItem): void;
    private render;
    private renderSeverity;
    private renderMessage;
    private renderSecondaryActions;
    private renderSource;
    private renderButtons;
    private renderProgress;
    private toSeverityIcon;
    private getKeybindingLabel;
}
