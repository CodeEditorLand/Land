import type { IShellLaunchConfig } from './terminal.js';
/**
 * Aggressively escape non-windows paths to prepare for being sent to a shell. This will do some
 * escaping inaccurately to be careful about possible script injection via the file path. For
 * example, we're trying to prevent this sort of attack: `/foo/file$(echo evil)`.
 */
export declare function escapeNonWindowsPath(path: string): string;
/**
 * Collapses the user's home directory into `~` if it exists within the path, this gives a shorter
 * path that is more suitable within the context of a terminal.
 */
export declare function collapseTildePath(path: string | undefined, userHome: string | undefined, separator: string): string;
/**
 * Sanitizes a cwd string, removing any wrapping quotes and making the Windows drive letter
 * uppercase.
 * @param cwd The directory to sanitize.
 */
export declare function sanitizeCwd(cwd: string): string;
/**
 * Determines whether the given shell launch config should use the environment variable collection.
 * @param slc The shell launch config to check.
 */
export declare function shouldUseEnvironmentVariableCollection(slc: IShellLaunchConfig): boolean;
