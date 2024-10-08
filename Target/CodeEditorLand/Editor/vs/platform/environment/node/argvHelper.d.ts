import { IProcessEnvironment } from '../../../base/common/platform.js';
import { NativeParsedArgs } from '../common/argv.js';
/**
 * Use this to parse raw code process.argv such as: `Electron . --verbose --wait`
 */
export declare function parseMainProcessArgv(processArgv: string[]): NativeParsedArgs;
/**
 * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
 */
export declare function parseCLIProcessArgv(processArgv: string[]): NativeParsedArgs;
export declare function addArg(argv: string[], ...args: string[]): string[];
export declare function isLaunchedFromCli(env: IProcessEnvironment): boolean;
