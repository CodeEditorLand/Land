import { NativeParsedArgs } from '../common/argv.js';
/**
 * Returns the user data path to use with some rules:
 * - respect portable mode
 * - respect VSCODE_APPDATA environment variable
 * - respect --user-data-dir CLI argument
 */
export declare function getUserDataPath(cliArgs: NativeParsedArgs, productName: string): string;
