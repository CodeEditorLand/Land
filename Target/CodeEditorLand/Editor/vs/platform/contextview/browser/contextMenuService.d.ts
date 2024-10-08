import { IContextMenuDelegate } from '../../../base/browser/contextmenu.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IMenuService } from '../../actions/common/actions.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { INotificationService } from '../../notification/common/notification.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IContextMenuHandlerOptions } from './contextMenuHandler.js';
import { IContextMenuMenuDelegate, IContextMenuService, IContextViewService } from './contextView.js';
export declare class ContextMenuService extends Disposable implements IContextMenuService {
    private readonly telemetryService;
    private readonly notificationService;
    private readonly contextViewService;
    private readonly keybindingService;
    private readonly menuService;
    private readonly contextKeyService;
    readonly _serviceBrand: undefined;
    private _contextMenuHandler;
    private get contextMenuHandler();
    private readonly _onDidShowContextMenu;
    readonly onDidShowContextMenu: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private readonly _onDidHideContextMenu;
    readonly onDidHideContextMenu: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    constructor(telemetryService: ITelemetryService, notificationService: INotificationService, contextViewService: IContextViewService, keybindingService: IKeybindingService, menuService: IMenuService, contextKeyService: IContextKeyService);
    configure(options: IContextMenuHandlerOptions): void;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
export declare namespace ContextMenuMenuDelegate {
    function transform(delegate: IContextMenuDelegate | IContextMenuMenuDelegate, menuService: IMenuService, globalContextKeyService: IContextKeyService): IContextMenuDelegate;
}
