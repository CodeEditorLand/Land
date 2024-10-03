import { IProcessEnvironment } from '../../../base/common/platform.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IShellLaunchConfig, ITerminalEnvironment, ITerminalProcessOptions } from '../common/terminal.js';
export declare function getWindowsBuildNumber(): number;
export declare function findExecutable(command: string, cwd?: string, paths?: string[], env?: IProcessEnvironment, exists?: (path: string) => Promise<boolean>): Promise<string | undefined>;
export interface IShellIntegrationConfigInjection {
    newArgs: string[] | undefined;
    envMixin?: IProcessEnvironment;
    filesToCopy?: {
        source: string;
        dest: string;
    }[];
}
export declare function getShellIntegrationInjection(shellLaunchConfig: IShellLaunchConfig, options: ITerminalProcessOptions, env: ITerminalEnvironment | undefined, logService: ILogService, productService: IProductService): IShellIntegrationConfigInjection | undefined;
