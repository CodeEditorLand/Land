import { ILogService } from '../../log/common/log.js';
import { IStateReadService } from '../../state/node/state.js';
export declare function resolveMachineId(stateService: IStateReadService, logService: ILogService): Promise<string>;
export declare function resolveSqmId(stateService: IStateReadService, logService: ILogService): Promise<string>;
export declare function resolvedevDeviceId(stateService: IStateReadService, logService: ILogService): Promise<string>;
