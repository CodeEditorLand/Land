import { DefaultURITransformer } from '../../../base/common/uriIpc.js';
import { ProxyChannel } from '../../../base/parts/ipc/common/ipc.js';
import { Server as ChildProcessServer } from '../../../base/parts/ipc/node/ipc.cp.js';
import { Server as UtilityProcessServer } from '../../../base/parts/ipc/node/ipc.mp.js';
import { localize } from '../../../nls.js';
import { OPTIONS, parseArgs } from '../../environment/node/argv.js';
import { NativeEnvironmentService } from '../../environment/node/environmentService.js';
import { getLogLevel } from '../../log/common/log.js';
import { LoggerChannel } from '../../log/common/logIpc.js';
import { LogService } from '../../log/common/logService.js';
import { LoggerService } from '../../log/node/loggerService.js';
import product from '../../product/common/product.js';
import { TerminalIpcChannels } from '../common/terminal.js';
import { HeartbeatService } from './heartbeatService.js';
import { PtyService } from './ptyService.js';
import { isUtilityProcess } from '../../../base/parts/sandbox/node/electronTypes.js';
import { timeout } from '../../../base/common/async.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
startPtyHost();
async function startPtyHost() {
    const startupDelay = parseInt(process.env.VSCODE_STARTUP_DELAY ?? '0');
    const simulatedLatency = parseInt(process.env.VSCODE_LATENCY ?? '0');
    const reconnectConstants = {
        graceTime: parseInt(process.env.VSCODE_RECONNECT_GRACE_TIME || '0'),
        shortGraceTime: parseInt(process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME || '0'),
        scrollback: parseInt(process.env.VSCODE_RECONNECT_SCROLLBACK || '100')
    };
    delete process.env.VSCODE_RECONNECT_GRACE_TIME;
    delete process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME;
    delete process.env.VSCODE_RECONNECT_SCROLLBACK;
    delete process.env.VSCODE_LATENCY;
    delete process.env.VSCODE_STARTUP_DELAY;
    if (startupDelay) {
        await timeout(startupDelay);
    }
    const _isUtilityProcess = isUtilityProcess(process);
    let server;
    if (_isUtilityProcess) {
        server = new UtilityProcessServer();
    }
    else {
        server = new ChildProcessServer(TerminalIpcChannels.PtyHost);
    }
    const productService = { _serviceBrand: undefined, ...product };
    const environmentService = new NativeEnvironmentService(parseArgs(process.argv, OPTIONS), productService);
    const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
    server.registerChannel(TerminalIpcChannels.Logger, new LoggerChannel(loggerService, () => DefaultURITransformer));
    const logger = loggerService.createLogger('ptyhost', { name: localize('ptyHost', "Pty Host") });
    const logService = new LogService(logger);
    if (startupDelay) {
        logService.warn(`Pty Host startup is delayed ${startupDelay}ms`);
    }
    if (simulatedLatency) {
        logService.warn(`Pty host is simulating ${simulatedLatency}ms latency`);
    }
    const disposables = new DisposableStore();
    const heartbeatService = new HeartbeatService();
    server.registerChannel(TerminalIpcChannels.Heartbeat, ProxyChannel.fromService(heartbeatService, disposables));
    const ptyService = new PtyService(logService, productService, reconnectConstants, simulatedLatency);
    const ptyServiceChannel = ProxyChannel.fromService(ptyService, disposables);
    server.registerChannel(TerminalIpcChannels.PtyHost, ptyServiceChannel);
    if (_isUtilityProcess) {
        server.registerChannel(TerminalIpcChannels.PtyHostWindow, ptyServiceChannel);
    }
    process.once('exit', () => {
        logService.trace('Pty host exiting');
        logService.dispose();
        heartbeatService.dispose();
        ptyService.dispose();
    });
}
