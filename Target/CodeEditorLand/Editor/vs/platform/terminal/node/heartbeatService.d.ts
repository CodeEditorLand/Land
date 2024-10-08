import { Disposable } from '../../../base/common/lifecycle.js';
import { IHeartbeatService } from '../common/terminal.js';
export declare class HeartbeatService extends Disposable implements IHeartbeatService {
    private readonly _onBeat;
    readonly onBeat: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    constructor();
}
