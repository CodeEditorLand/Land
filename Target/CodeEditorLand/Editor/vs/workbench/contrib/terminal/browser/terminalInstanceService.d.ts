import { ITerminalInstance, ITerminalInstanceService } from './terminal.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IShellLaunchConfig, ITerminalBackend, ITerminalProfile, TerminalLocation } from '../../../../platform/terminal/common/terminal.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { URI } from '../../../../base/common/uri.js';
import { Event } from '../../../../base/common/event.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
export declare class TerminalInstanceService extends Disposable implements ITerminalInstanceService {
    private readonly _instantiationService;
    private readonly _contextKeyService;
    _serviceBrand: undefined;
    private _terminalShellTypeContextKey;
    private _backendRegistration;
    private readonly _onDidCreateInstance;
    get onDidCreateInstance(): Event<ITerminalInstance>;
    private readonly _onDidRegisterBackend;
    get onDidRegisterBackend(): Event<ITerminalBackend>;
    constructor(_instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, environmentService: IWorkbenchEnvironmentService);
    createInstance(profile: ITerminalProfile, target: TerminalLocation): ITerminalInstance;
    createInstance(shellLaunchConfig: IShellLaunchConfig, target: TerminalLocation): ITerminalInstance;
    convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile?: IShellLaunchConfig | ITerminalProfile, cwd?: string | URI): IShellLaunchConfig;
    getBackend(remoteAuthority?: string): Promise<ITerminalBackend | undefined>;
    getRegisteredBackends(): IterableIterator<ITerminalBackend>;
    didRegisterBackend(backend: ITerminalBackend): void;
}
