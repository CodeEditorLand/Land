import { ICodeEditor, IDiffEditor } from './editorBrowser.js';
import { Position } from '../common/core/position.js';
import { IEditorContribution, IDiffEditorContribution } from '../common/editorCommon.js';
import { ITextModel } from '../common/model.js';
import { MenuId, Action2 } from '../../platform/actions/common/actions.js';
import { ICommandMetadata } from '../../platform/commands/common/commands.js';
import { ContextKeyExpression } from '../../platform/contextkey/common/contextkey.js';
import { ServicesAccessor as InstantiationServicesAccessor, BrandedService, IConstructorSignature } from '../../platform/instantiation/common/instantiation.js';
import { IKeybindings } from '../../platform/keybinding/common/keybindingsRegistry.js';
import { ThemeIcon } from '../../base/common/themables.js';
import { IDisposable } from '../../base/common/lifecycle.js';
export type ServicesAccessor = InstantiationServicesAccessor;
export type EditorContributionCtor = IConstructorSignature<IEditorContribution, [ICodeEditor]>;
export type DiffEditorContributionCtor = IConstructorSignature<IDiffEditorContribution, [IDiffEditor]>;
export declare const enum EditorContributionInstantiation {
    Eager = 0,
    AfterFirstRender = 1,
    BeforeFirstInteraction = 2,
    Eventually = 3,
    Lazy = 4
}
export interface IEditorContributionDescription {
    readonly id: string;
    readonly ctor: EditorContributionCtor;
    readonly instantiation: EditorContributionInstantiation;
}
export interface IDiffEditorContributionDescription {
    id: string;
    ctor: DiffEditorContributionCtor;
}
export interface ICommandKeybindingsOptions extends IKeybindings {
    kbExpr?: ContextKeyExpression | null;
    weight: number;
    args?: any;
}
export interface ICommandMenuOptions {
    menuId: MenuId;
    group: string;
    order: number;
    when?: ContextKeyExpression;
    title: string;
    icon?: ThemeIcon;
}
export interface ICommandOptions {
    id: string;
    precondition: ContextKeyExpression | undefined;
    kbOpts?: ICommandKeybindingsOptions | ICommandKeybindingsOptions[];
    metadata?: ICommandMetadata;
    menuOpts?: ICommandMenuOptions | ICommandMenuOptions[];
}
export declare abstract class Command {
    readonly id: string;
    readonly precondition: ContextKeyExpression | undefined;
    private readonly _kbOpts;
    private readonly _menuOpts;
    readonly metadata: ICommandMetadata | undefined;
    constructor(opts: ICommandOptions);
    register(): void;
    private _registerMenuItem;
    abstract runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
}
export type CommandImplementation = (accessor: ServicesAccessor, args: unknown) => boolean | Promise<void>;
export declare class MultiCommand extends Command {
    private readonly _implementations;
    addImplementation(priority: number, name: string, implementation: CommandImplementation, when?: ContextKeyExpression): IDisposable;
    runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
}
export declare class ProxyCommand extends Command {
    private readonly command;
    constructor(command: Command, opts: ICommandOptions);
    runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
}
export interface IContributionCommandOptions<T> extends ICommandOptions {
    handler: (controller: T, args: any) => void;
}
export interface EditorControllerCommand<T extends IEditorContribution> {
    new (opts: IContributionCommandOptions<T>): EditorCommand;
}
export declare abstract class EditorCommand extends Command {
    static bindToContribution<T extends IEditorContribution>(controllerGetter: (editor: ICodeEditor) => T | null): EditorControllerCommand<T>;
    static runEditorCommand(accessor: ServicesAccessor, args: any, precondition: ContextKeyExpression | undefined, runner: (accessor: ServicesAccessor | null, editor: ICodeEditor, args: any) => void | Promise<void>): void | Promise<void>;
    runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
    abstract runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args: any): void | Promise<void>;
}
export interface IEditorActionContextMenuOptions {
    group: string;
    order: number;
    when?: ContextKeyExpression;
    menuId?: MenuId;
}
export interface IActionOptions extends ICommandOptions {
    label: string;
    alias: string;
    contextMenuOpts?: IEditorActionContextMenuOptions | IEditorActionContextMenuOptions[];
}
export declare abstract class EditorAction extends EditorCommand {
    private static convertOptions;
    readonly label: string;
    readonly alias: string;
    constructor(opts: IActionOptions);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void | Promise<void>;
    protected reportTelemetry(accessor: ServicesAccessor, editor: ICodeEditor): void;
    abstract run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void | Promise<void>;
}
export type EditorActionImplementation = (accessor: ServicesAccessor, editor: ICodeEditor, args: any) => boolean | Promise<void>;
export declare class MultiEditorAction extends EditorAction {
    private readonly _implementations;
    addImplementation(priority: number, implementation: EditorActionImplementation): IDisposable;
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void | Promise<void>;
}
export declare abstract class EditorAction2 extends Action2 {
    run(accessor: ServicesAccessor, ...args: any[]): any;
    abstract runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: any[]): any;
}
export declare function registerModelAndPositionCommand(id: string, handler: (accessor: ServicesAccessor, model: ITextModel, position: Position, ...args: any[]) => any): void;
export declare function registerEditorCommand<T extends EditorCommand>(editorCommand: T): T;
export declare function registerEditorAction<T extends EditorAction>(ctor: {
    new (): T;
}): T;
export declare function registerMultiEditorAction<T extends MultiEditorAction>(action: T): T;
export declare function registerInstantiatedEditorAction(editorAction: EditorAction): void;
export declare function registerEditorContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (editor: ICodeEditor, ...services: Services): IEditorContribution;
}, instantiation: EditorContributionInstantiation): void;
export declare function registerDiffEditorContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (editor: IDiffEditor, ...services: Services): IEditorContribution;
}): void;
export declare namespace EditorExtensionsRegistry {
    function getEditorCommand(commandId: string): EditorCommand;
    function getEditorActions(): Iterable<EditorAction>;
    function getEditorContributions(): IEditorContributionDescription[];
    function getSomeEditorContributions(ids: string[]): IEditorContributionDescription[];
    function getDiffEditorContributions(): IDiffEditorContributionDescription[];
}
export declare const UndoCommand: MultiCommand;
export declare const RedoCommand: MultiCommand;
export declare const SelectAllCommand: MultiCommand;
