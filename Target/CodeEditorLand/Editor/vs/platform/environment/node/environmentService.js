import { homedir, tmpdir } from 'os';
import { AbstractNativeEnvironmentService, parseDebugParams } from '../common/environmentService.js';
import { getUserDataPath } from './userDataPath.js';
export class NativeEnvironmentService extends AbstractNativeEnvironmentService {
    constructor(args, productService) {
        super(args, {
            homeDir: homedir(),
            tmpDir: tmpdir(),
            userDataDir: getUserDataPath(args, productService.nameShort)
        }, productService);
    }
}
export function parsePtyHostDebugPort(args, isBuilt) {
    return parseDebugParams(args['inspect-ptyhost'], args['inspect-brk-ptyhost'], 5877, isBuilt, args.extensionEnvironment);
}
export function parseSharedProcessDebugPort(args, isBuilt) {
    return parseDebugParams(args['inspect-sharedprocess'], args['inspect-brk-sharedprocess'], 5879, isBuilt, args.extensionEnvironment);
}
