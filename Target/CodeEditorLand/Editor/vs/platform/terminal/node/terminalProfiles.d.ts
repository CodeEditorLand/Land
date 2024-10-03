import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ILogService } from '../../log/common/log.js';
import { ITerminalExecutable, ITerminalProfile, ITerminalProfileSource } from '../common/terminal.js';
export declare function detectAvailableProfiles(profiles: unknown, defaultProfile: unknown, includeDetectedProfiles: boolean, configurationService: IConfigurationService, shellEnv?: typeof process.env, fsProvider?: IFsProvider, logService?: ILogService, variableResolver?: (text: string[]) => Promise<string[]>, testPwshSourcePaths?: string[]): Promise<ITerminalProfile[]>;
export interface IFsProvider {
    existsFile(path: string): Promise<boolean>;
    readFile(path: string): Promise<Buffer>;
}
export type IUnresolvedTerminalProfile = ITerminalExecutable | ITerminalProfileSource | null;
