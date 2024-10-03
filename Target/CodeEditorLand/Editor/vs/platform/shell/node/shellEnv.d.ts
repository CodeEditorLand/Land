import { IProcessEnvironment } from '../../../base/common/platform.js';
import { NativeParsedArgs } from '../../environment/common/argv.js';
import { ILogService } from '../../log/common/log.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
export declare function getResolvedShellEnv(configurationService: IConfigurationService, logService: ILogService, args: NativeParsedArgs, env: IProcessEnvironment): Promise<typeof process.env>;
