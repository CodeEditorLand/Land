import type { IShellLaunchConfig } from './terminal.js';
export declare function escapeNonWindowsPath(path: string): string;
export declare function collapseTildePath(path: string | undefined, userHome: string | undefined, separator: string): string;
export declare function sanitizeCwd(cwd: string): string;
export declare function shouldUseEnvironmentVariableCollection(slc: IShellLaunchConfig): boolean;
