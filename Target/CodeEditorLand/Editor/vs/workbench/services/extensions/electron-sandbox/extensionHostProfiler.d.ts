import { IExtensionService, ProfileSession } from '../common/extensions.js';
import { IV8InspectProfilingService } from '../../../../platform/profiling/common/profiling.js';
export declare class ExtensionHostProfiler {
    private readonly _host;
    private readonly _port;
    private readonly _extensionService;
    private readonly _profilingService;
    constructor(_host: string, _port: number, _extensionService: IExtensionService, _profilingService: IV8InspectProfilingService);
    start(): Promise<ProfileSession>;
    private _distill;
}
