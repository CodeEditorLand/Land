import { IV8InspectProfilingService, IV8Profile } from '../common/profiling.js';
export declare class InspectProfilingService implements IV8InspectProfilingService {
    _serviceBrand: undefined;
    private readonly _sessions;
    startProfiling(options: {
        host: string;
        port: number;
    }): Promise<string>;
    stopProfiling(sessionId: string): Promise<IV8Profile>;
}
