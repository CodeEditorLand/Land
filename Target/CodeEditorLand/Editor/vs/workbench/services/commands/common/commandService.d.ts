import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommandService, ICommandEvent } from '../../../../platform/commands/common/commands.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class CommandService extends Disposable implements ICommandService {
    private readonly _instantiationService;
    private readonly _extensionService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _extensionHostIsReady;
    private _starActivation;
    private readonly _onWillExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    private readonly _onDidExecuteCommand;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(_instantiationService: IInstantiationService, _extensionService: IExtensionService, _logService: ILogService);
    private _activateStar;
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
    private _tryExecuteCommand;
}
