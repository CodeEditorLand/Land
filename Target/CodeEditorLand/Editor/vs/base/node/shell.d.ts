import * as platform from '../common/platform.js';
/**
 * Gets the detected default shell for the _system_, not to be confused with VS Code's _default_
 * shell that the terminal uses by default.
 * @param os The platform to detect the shell of.
 */
export declare function getSystemShell(os: platform.OperatingSystem, env: platform.IProcessEnvironment): Promise<string>;
