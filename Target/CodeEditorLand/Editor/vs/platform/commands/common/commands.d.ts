import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { TypeConstraint } from '../../../base/common/types.js';
import { ILocalizedString } from '../../action/common/action.js';
import { ServicesAccessor } from '../../instantiation/common/instantiation.js';
export declare const ICommandService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ICommandService>;
export interface ICommandEvent {
    commandId: string;
    args: any[];
}
export interface ICommandService {
    readonly _serviceBrand: undefined;
    onWillExecuteCommand: Event<ICommandEvent>;
    onDidExecuteCommand: Event<ICommandEvent>;
    executeCommand<T = any>(commandId: string, ...args: any[]): Promise<T | undefined>;
}
export type ICommandsMap = Map<string, ICommand>;
export interface ICommandHandler {
    (accessor: ServicesAccessor, ...args: any[]): void;
}
export interface ICommand {
    id: string;
    handler: ICommandHandler;
    metadata?: ICommandMetadata | null;
}
export interface ICommandMetadata {
    /**
     * NOTE: Please use an ILocalizedString. string is in the type for backcompat for now.
     * A short summary of what the command does. This will be used in:
     * - API commands
     * - when showing keybindings that have no other UX
     * - when searching for commands in the Command Palette
     */
    readonly description: ILocalizedString | string;
    readonly args?: ReadonlyArray<{
        readonly name: string;
        readonly isOptional?: boolean;
        readonly description?: string;
        readonly constraint?: TypeConstraint;
        readonly schema?: IJSONSchema;
    }>;
    readonly returns?: string;
}
export interface ICommandRegistry {
    onDidRegisterCommand: Event<string>;
    registerCommand(id: string, command: ICommandHandler): IDisposable;
    registerCommand(command: ICommand): IDisposable;
    registerCommandAlias(oldId: string, newId: string): IDisposable;
    getCommand(id: string): ICommand | undefined;
    getCommands(): ICommandsMap;
}
export declare const CommandsRegistry: ICommandRegistry;
