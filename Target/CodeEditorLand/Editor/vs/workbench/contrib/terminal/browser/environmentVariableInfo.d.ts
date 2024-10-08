import { IEnvironmentVariableInfo } from '../common/environmentVariable.js';
import { ITerminalStatus } from '../common/terminal.js';
import { ITerminalService } from './terminal.js';
import { EnvironmentVariableScope, IMergedEnvironmentVariableCollection, IMergedEnvironmentVariableCollectionDiff } from '../../../../platform/terminal/common/environmentVariable.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
export declare class EnvironmentVariableInfoStale implements IEnvironmentVariableInfo {
    private readonly _diff;
    private readonly _terminalId;
    private readonly _collection;
    private readonly _terminalService;
    private readonly _extensionService;
    readonly requiresAction = true;
    constructor(_diff: IMergedEnvironmentVariableCollectionDiff, _terminalId: number, _collection: IMergedEnvironmentVariableCollection, _terminalService: ITerminalService, _extensionService: IExtensionService);
    private _getInfo;
    private _getActions;
    getStatus(scope: EnvironmentVariableScope | undefined): ITerminalStatus;
}
export declare class EnvironmentVariableInfoChangesActive implements IEnvironmentVariableInfo {
    private readonly _collection;
    private readonly _commandService;
    private readonly _extensionService;
    readonly requiresAction = false;
    constructor(_collection: IMergedEnvironmentVariableCollection, _commandService: ICommandService, _extensionService: IExtensionService);
    private _getInfo;
    private _getActions;
    getStatus(scope: EnvironmentVariableScope | undefined): ITerminalStatus;
}
