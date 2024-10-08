import { IEnvironmentService } from '../../environment/common/environment.js';
import { ILogService } from '../../log/common/log.js';
export declare const ICSSDevelopmentService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ICSSDevelopmentService>;
export interface ICSSDevelopmentService {
    _serviceBrand: undefined;
    isEnabled: boolean;
    getCssModules(): Promise<string[]>;
}
export declare class CSSDevelopmentService implements ICSSDevelopmentService {
    private readonly envService;
    private readonly logService;
    _serviceBrand: undefined;
    private _cssModules?;
    constructor(envService: IEnvironmentService, logService: ILogService);
    get isEnabled(): boolean;
    getCssModules(): Promise<string[]>;
    private computeCssModules;
}
