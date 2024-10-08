import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { IChatMessage } from './languageModels.js';
import { IChatFollowup, IChatProgress, IChatResponseProgressFileTreeData } from './chatService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ChatAgentLocation } from './chatAgents.js';
export interface IChatSlashData {
    command: string;
    detail: string;
    sortText?: string;
    /**
     * Whether the command should execute as soon
     * as it is entered. Defaults to `false`.
     */
    executeImmediately?: boolean;
    locations: ChatAgentLocation[];
}
export interface IChatSlashFragment {
    content: string | {
        treeData: IChatResponseProgressFileTreeData;
    };
}
export type IChatSlashCallback = {
    (prompt: string, progress: IProgress<IChatProgress>, history: IChatMessage[], location: ChatAgentLocation, token: CancellationToken): Promise<{
        followUp: IChatFollowup[];
    } | void>;
};
export declare const IChatSlashCommandService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatSlashCommandService>;
/**
 * This currently only exists to drive /clear and /help
 */
export interface IChatSlashCommandService {
    _serviceBrand: undefined;
    readonly onDidChangeCommands: Event<void>;
    registerSlashCommand(data: IChatSlashData, command: IChatSlashCallback): IDisposable;
    executeCommand(id: string, prompt: string, progress: IProgress<IChatProgress>, history: IChatMessage[], location: ChatAgentLocation, token: CancellationToken): Promise<{
        followUp: IChatFollowup[];
    } | void>;
    getCommands(location: ChatAgentLocation): Array<IChatSlashData>;
    hasCommand(id: string): boolean;
}
export declare class ChatSlashCommandService extends Disposable implements IChatSlashCommandService {
    private readonly _extensionService;
    _serviceBrand: undefined;
    private readonly _commands;
    private readonly _onDidChangeCommands;
    readonly onDidChangeCommands: Event<void>;
    constructor(_extensionService: IExtensionService);
    dispose(): void;
    registerSlashCommand(data: IChatSlashData, command: IChatSlashCallback): IDisposable;
    getCommands(location: ChatAgentLocation): Array<IChatSlashData>;
    hasCommand(id: string): boolean;
    executeCommand(id: string, prompt: string, progress: IProgress<IChatProgress>, history: IChatMessage[], location: ChatAgentLocation, token: CancellationToken): Promise<{
        followUp: IChatFollowup[];
    } | void>;
}
