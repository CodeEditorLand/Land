import { ILogService } from '../../log/common/log.js';
import { IStateService } from '../../state/node/state.js';
export declare function resolveMachineId(stateService: IStateService, logService: ILogService): Promise<string>;
export declare function resolveSqmId(stateService: IStateService, logService: ILogService): Promise<string>;
export declare function resolvedevDeviceId(stateService: IStateService, logService: ILogService): Promise<string>;
