import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
export declare const ISharedProcessLifecycleService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISharedProcessLifecycleService>;
export interface ISharedProcessLifecycleService {
    readonly _serviceBrand: undefined;
    /**
     * An event for when the application will shutdown
     */
    readonly onWillShutdown: Event<void>;
}
export declare class SharedProcessLifecycleService extends Disposable implements ISharedProcessLifecycleService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<void>;
    constructor(logService: ILogService);
    fireOnWillShutdown(): void;
}
