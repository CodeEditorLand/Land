import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { process } from '../../../../base/parts/sandbox/electron-sandbox/globals.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
export const IShellEnvironmentService = createDecorator('shellEnvironmentService');
export class ShellEnvironmentService {
    getShellEnv() {
        return process.shellEnv();
    }
}
registerSingleton(IShellEnvironmentService, ShellEnvironmentService, 1);
