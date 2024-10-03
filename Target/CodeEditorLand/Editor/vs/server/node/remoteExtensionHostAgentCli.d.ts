import { ServerParsedArgs } from './serverEnvironmentService.js';
import { OptionDescriptions } from '../../platform/environment/node/argv.js';
export declare function run(args: ServerParsedArgs, REMOTE_DATA_FOLDER: string, optionDescriptions: OptionDescriptions<ServerParsedArgs>): Promise<void>;
