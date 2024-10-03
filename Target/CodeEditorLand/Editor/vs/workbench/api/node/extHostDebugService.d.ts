import * as vscode from 'vscode';
import { ISignService } from '../../../platform/sign/common/sign.js';
import { AbstractDebugAdapter } from '../../contrib/debug/common/abstractDebugAdapter.js';
import { ExtensionDescriptionRegistry } from '../../services/extensions/common/extensionDescriptionRegistry.js';
import { IExtHostCommands } from '../common/extHostCommands.js';
import { IExtHostConfiguration } from '../common/extHostConfiguration.js';
import { ExtHostDebugServiceBase, ExtHostDebugSession } from '../common/extHostDebugService.js';
import { IExtHostEditorTabs } from '../common/extHostEditorTabs.js';
import { IExtHostExtensionService } from '../common/extHostExtensionService.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
import { IExtHostTerminalService } from '../common/extHostTerminalService.js';
import { IExtHostTesting } from '../common/extHostTesting.js';
import { DebugAdapterExecutable } from '../common/extHostTypes.js';
import { IExtHostVariableResolverProvider } from '../common/extHostVariableResolverService.js';
import { IExtHostWorkspace } from '../common/extHostWorkspace.js';
import { IExtHostTerminalShellIntegration } from '../common/extHostTerminalShellIntegration.js';
export declare class ExtHostDebugService extends ExtHostDebugServiceBase {
    private _terminalService;
    private _terminalShellIntegrationService;
    readonly _serviceBrand: undefined;
    private _integratedTerminalInstances;
    private _terminalDisposedListener;
    constructor(extHostRpcService: IExtHostRpcService, workspaceService: IExtHostWorkspace, extensionService: IExtHostExtensionService, configurationService: IExtHostConfiguration, _terminalService: IExtHostTerminalService, _terminalShellIntegrationService: IExtHostTerminalShellIntegration, editorTabs: IExtHostEditorTabs, variableResolver: IExtHostVariableResolverProvider, commands: IExtHostCommands, testing: IExtHostTesting);
    protected createDebugAdapter(adapter: vscode.DebugAdapterDescriptor, session: ExtHostDebugSession): AbstractDebugAdapter | undefined;
    protected daExecutableFromPackage(session: ExtHostDebugSession, extensionRegistry: ExtensionDescriptionRegistry): DebugAdapterExecutable | undefined;
    protected createSignService(): ISignService | undefined;
    $runInTerminal(args: DebugProtocol.RunInTerminalRequestArguments, sessionId: string): Promise<number | undefined>;
}
