import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { ICommonMenubarService, IMenubarData } from '../common/menubar.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export declare const IMenubarMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMenubarMainService>;
export interface IMenubarMainService extends ICommonMenubarService {
    readonly _serviceBrand: undefined;
}
export declare class MenubarMainService extends Disposable implements IMenubarMainService {
    private readonly instantiationService;
    private readonly lifecycleMainService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly menubar;
    constructor(instantiationService: IInstantiationService, lifecycleMainService: ILifecycleMainService, logService: ILogService);
    private installMenuBarAfterWindowOpen;
    updateMenubar(windowId: number, menus: IMenubarData): Promise<void>;
}
