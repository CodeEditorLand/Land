import { INotificationsModel } from '../../../common/notifications.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare class NotificationsAlerts extends Disposable {
    private readonly model;
    constructor(model: INotificationsModel);
    private registerListeners;
    private onDidChangeNotification;
    private triggerAriaAlert;
    private doTriggerAriaAlert;
}
