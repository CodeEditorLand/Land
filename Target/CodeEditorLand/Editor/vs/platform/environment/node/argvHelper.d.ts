import { IProcessEnvironment } from '../../../base/common/platform.js';
import { NativeParsedArgs } from '../common/argv.js';
export declare function parseMainProcessArgv(processArgv: string[]): NativeParsedArgs;
export declare function parseCLIProcessArgv(processArgv: string[]): NativeParsedArgs;
export declare function addArg(argv: string[], ...args: string[]): string[];
export declare function isLaunchedFromCli(env: IProcessEnvironment): boolean;
