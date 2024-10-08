import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProfileAnalysisWorkerService } from '../../../../platform/profiling/electron-sandbox/profileAnalysisWorkerService.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { ITimerService } from '../../../services/timer/browser/timerService.js';
export declare class RendererProfiling {
    private readonly _environmentService;
    private readonly _fileService;
    private readonly _logService;
    private _observer?;
    constructor(_environmentService: INativeWorkbenchEnvironmentService, _fileService: IFileService, _logService: ILogService, nativeHostService: INativeHostService, timerService: ITimerService, configService: IConfigurationService, profileAnalysisService: IProfileAnalysisWorkerService);
    dispose(): void;
    private _store;
}
