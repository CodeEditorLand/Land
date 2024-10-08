import { IProcessEnvironment } from '../../../base/common/platform.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IShellLaunchConfig, ITerminalEnvironment, ITerminalProcessOptions } from '../common/terminal.js';
export declare function getWindowsBuildNumber(): number;
export declare function findExecutable(command: string, cwd?: string, paths?: string[], env?: IProcessEnvironment, exists?: (path: string) => Promise<boolean>): Promise<string | undefined>;
export interface IShellIntegrationConfigInjection {
    /**
     * A new set of arguments to use.
     */
    newArgs: string[] | undefined;
    /**
     * An optional environment to mixing to the real environment.
     */
    envMixin?: IProcessEnvironment;
    /**
     * An optional array of files to copy from `source` to `dest`.
     */
    filesToCopy?: {
        source: string;
        dest: string;
    }[];
}
/**
 * For a given shell launch config, returns arguments to replace and an optional environment to
 * mixin to the SLC's environment to enable shell integration. This must be run within the context
 * that creates the process to ensure accuracy. Returns undefined if shell integration cannot be
 * enabled.
 */
export declare function getShellIntegrationInjection(shellLaunchConfig: IShellLaunchConfig, options: ITerminalProcessOptions, env: ITerminalEnvironment | undefined, logService: ILogService, productService: IProductService): IShellIntegrationConfigInjection | undefined;
