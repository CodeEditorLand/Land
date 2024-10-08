import { CancellationToken } from '../common/cancellation.js';
/**
 * Copied from: https://github.com/microsoft/vscode-node-debug/blob/master/src/node/pathUtilities.ts#L83
 *
 * Given an absolute, normalized, and existing file path 'realcase' returns the exact path that the file has on disk.
 * On a case insensitive file system, the returned path might differ from the original path by character casing.
 * On a case sensitive file system, the returned path will always be identical to the original path.
 * In case of errors, null is returned. But you cannot use this function to verify that a path exists.
 * realcaseSync does not handle '..' or '.' path segments and it does not take the locale into account.
 */
export declare function realcaseSync(path: string): string | null;
export declare function realcase(path: string, token?: CancellationToken): Promise<string | null>;
export declare function realpath(path: string): Promise<string>;
export declare function realpathSync(path: string): string;
