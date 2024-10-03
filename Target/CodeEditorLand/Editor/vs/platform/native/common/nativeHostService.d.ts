import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
import { INativeHostService } from './native.js';
export declare class NativeHostService implements INativeHostService {
    readonly windowId: number;
    readonly _serviceBrand: undefined;
    constructor(windowId: number, mainProcessService: IMainProcessService);
}
