import { ICommandService } from '../../../platform/commands/common/commands.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
import { MainThreadCommandsShape } from '../common/extHost.protocol.js';
export declare class MainThreadCommands implements MainThreadCommandsShape {
    private readonly _commandService;
    private readonly _extensionService;
    private readonly _commandRegistrations;
    private readonly _generateCommandsDocumentationRegistration;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _commandService: ICommandService, _extensionService: IExtensionService);
    dispose(): void;
    private _generateCommandsDocumentation;
    $registerCommand(id: string): void;
    $unregisterCommand(id: string): void;
    $fireCommandActivationEvent(id: string): void;
    $executeCommand<T>(id: string, args: any[] | SerializableObjectWithBuffers<any[]>, retry: boolean): Promise<T | undefined>;
    $getCommands(): Promise<string[]>;
}
