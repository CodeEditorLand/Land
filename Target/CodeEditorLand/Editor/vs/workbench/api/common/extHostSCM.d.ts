import { URI, UriComponents } from '../../../base/common/uri.js';
import { Event } from '../../../base/common/event.js';
import { ExtHostCommands } from './extHostCommands.js';
import { MainThreadSCMShape, IMainContext, ExtHostSCMShape, SCMHistoryItemDto, SCMHistoryItemChangeDto, SCMHistoryItemRefDto } from './extHost.protocol.js';
import type * as vscode from 'vscode';
import { ILogService } from '../../../platform/log/common/log.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { ExtHostDocuments } from './extHostDocuments.js';
export interface IValidateInput {
    (value: string, cursorPosition: number): vscode.ProviderResult<vscode.SourceControlInputBoxValidation | undefined | null>;
}
export declare class ExtHostSCMInputBox implements vscode.SourceControlInputBox {
    #private;
    private _extension;
    private _sourceControlHandle;
    private _documentUri;
    private _value;
    get value(): string;
    set value(value: string);
    private readonly _onDidChange;
    get onDidChange(): Event<string>;
    private _placeholder;
    get placeholder(): string;
    set placeholder(placeholder: string);
    private _validateInput;
    get validateInput(): IValidateInput | undefined;
    set validateInput(fn: IValidateInput | undefined);
    private _enabled;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    private _visible;
    get visible(): boolean;
    set visible(visible: boolean);
    get document(): vscode.TextDocument;
    constructor(_extension: IExtensionDescription, _extHostDocuments: ExtHostDocuments, proxy: MainThreadSCMShape, _sourceControlHandle: number, _documentUri: URI);
    showValidationMessage(message: string | vscode.MarkdownString, type: vscode.SourceControlInputBoxValidationType): void;
    $onInputBoxValueChange(value: string): void;
    private updateValue;
}
export declare class ExtHostSCM implements ExtHostSCMShape {
    private _commands;
    private _extHostDocuments;
    private readonly logService;
    private static _handlePool;
    private _proxy;
    private readonly _telemetry;
    private _sourceControls;
    private _sourceControlsByExtension;
    private readonly _onDidChangeActiveProvider;
    get onDidChangeActiveProvider(): Event<vscode.SourceControl>;
    private _selectedSourceControlHandle;
    constructor(mainContext: IMainContext, _commands: ExtHostCommands, _extHostDocuments: ExtHostDocuments, logService: ILogService);
    createSourceControl(extension: IExtensionDescription, id: string, label: string, rootUri: vscode.Uri | undefined): vscode.SourceControl;
    getLastInputBox(extension: IExtensionDescription): ExtHostSCMInputBox | undefined;
    $provideOriginalResource(sourceControlHandle: number, uriComponents: UriComponents, token: CancellationToken): Promise<UriComponents | null>;
    $onInputBoxValueChange(sourceControlHandle: number, value: string): Promise<void>;
    $executeResourceCommand(sourceControlHandle: number, groupHandle: number, handle: number, preserveFocus: boolean): Promise<void>;
    $validateInput(sourceControlHandle: number, value: string, cursorPosition: number): Promise<[string | IMarkdownString, number] | undefined>;
    $setSelectedSourceControl(selectedSourceControlHandle: number | undefined): Promise<void>;
    $resolveHistoryItemRefsCommonAncestor(sourceControlHandle: number, historyItemRefs: string[], token: CancellationToken): Promise<string | undefined>;
    $provideHistoryItemRefs(sourceControlHandle: number, historyItemRefs: string[] | undefined, token: CancellationToken): Promise<SCMHistoryItemRefDto[] | undefined>;
    $provideHistoryItems(sourceControlHandle: number, options: any, token: CancellationToken): Promise<SCMHistoryItemDto[] | undefined>;
    $provideHistoryItemChanges(sourceControlHandle: number, historyItemId: string, historyItemParentId: string | undefined, token: CancellationToken): Promise<SCMHistoryItemChangeDto[] | undefined>;
}
