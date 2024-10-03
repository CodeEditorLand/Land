import { Action } from '../../../../base/common/actions.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITerminalProfile } from '../../../../platform/terminal/common/terminal.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { IDetachedTerminalInstance, ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalInstance, ITerminalInstanceService, ITerminalService, IXtermTerminal } from './terminal.js';
import { ITerminalProfileResolverService, ITerminalProfileService } from '../common/terminal.js';
export declare const switchTerminalActionViewItemSeparator = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";
export declare const switchTerminalShowTabsTitle: string;
export interface WorkspaceFolderCwdPair {
    folder: IWorkspaceFolder;
    cwd: URI;
    isAbsolute: boolean;
    isOverridden: boolean;
}
export declare function getCwdForSplit(instance: ITerminalInstance, folders: IWorkspaceFolder[] | undefined, commandService: ICommandService, configService: ITerminalConfigurationService): Promise<string | URI | undefined>;
export declare const terminalSendSequenceCommand: (accessor: ServicesAccessor, args: unknown) => Promise<void>;
export declare class TerminalLaunchHelpAction extends Action {
    private readonly _openerService;
    constructor(_openerService: IOpenerService);
    run(): Promise<void>;
}
export declare function registerTerminalAction(options: IAction2Options & {
    run: (c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown, args2?: unknown) => void | Promise<unknown>;
}): IDisposable;
export declare function registerContextualInstanceAction(options: IAction2Options & {
    activeInstanceType?: 'view' | 'editor';
    run: (instance: ITerminalInstance, c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown) => void | Promise<unknown>;
    runAfter?: (instances: ITerminalInstance[], c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown) => void | Promise<unknown>;
}): IDisposable;
export declare function registerActiveInstanceAction(options: IAction2Options & {
    run: (activeInstance: ITerminalInstance, c: ITerminalServicesCollection, accessor: ServicesAccessor, args?: unknown) => void | Promise<unknown>;
}): IDisposable;
export declare function registerActiveXtermAction(options: IAction2Options & {
    run: (activeTerminal: IXtermTerminal, accessor: ServicesAccessor, instance: ITerminalInstance | IDetachedTerminalInstance, args?: unknown) => void | Promise<unknown>;
}): IDisposable;
export interface ITerminalServicesCollection {
    service: ITerminalService;
    configService: ITerminalConfigurationService;
    groupService: ITerminalGroupService;
    instanceService: ITerminalInstanceService;
    editorService: ITerminalEditorService;
    profileService: ITerminalProfileService;
    profileResolverService: ITerminalProfileResolverService;
}
export declare function registerTerminalActions(): void;
export declare function validateTerminalName(name: string): {
    content: string;
    severity: Severity;
} | null;
export declare function refreshTerminalActions(detectedProfiles: ITerminalProfile[]): IDisposable;
export declare function shrinkWorkspaceFolderCwdPairs(pairs: WorkspaceFolderCwdPair[]): WorkspaceFolderCwdPair[];
