import { IContextMenuDelegate } from '../../../base/browser/contextmenu.js';
import { IContextViewService } from './contextView.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { INotificationService } from '../../notification/common/notification.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export interface IContextMenuHandlerOptions {
    blockMouse: boolean;
}
export declare class ContextMenuHandler {
    private contextViewService;
    private telemetryService;
    private notificationService;
    private keybindingService;
    private focusToReturn;
    private lastContainer;
    private block;
    private blockDisposable;
    private options;
    constructor(contextViewService: IContextViewService, telemetryService: ITelemetryService, notificationService: INotificationService, keybindingService: IKeybindingService);
    configure(options: IContextMenuHandlerOptions): void;
    showContextMenu(delegate: IContextMenuDelegate): void;
    private onActionRun;
    private onDidActionRun;
}
