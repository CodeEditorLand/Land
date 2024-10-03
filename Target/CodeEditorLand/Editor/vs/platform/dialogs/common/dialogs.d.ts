import { Event } from '../../../base/common/event.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import Severity from '../../../base/common/severity.js';
import { URI } from '../../../base/common/uri.js';
import { ITelemetryData } from '../../telemetry/common/telemetry.js';
import { MessageBoxOptions } from '../../../base/parts/sandbox/common/electronTypes.js';
import { IProductService } from '../../product/common/productService.js';
export interface IDialogArgs {
    readonly confirmArgs?: IConfirmDialogArgs;
    readonly inputArgs?: IInputDialogArgs;
    readonly promptArgs?: IPromptDialogArgs;
}
export interface IBaseDialogOptions {
    readonly type?: Severity | DialogType;
    readonly title?: string;
    readonly message: string;
    readonly detail?: string;
    readonly checkbox?: ICheckbox;
    readonly custom?: boolean | ICustomDialogOptions;
}
export interface IConfirmDialogArgs {
    readonly confirmation: IConfirmation;
}
export interface IConfirmation extends IBaseDialogOptions {
    readonly primaryButton?: string;
    readonly cancelButton?: string;
}
export interface IConfirmationResult extends ICheckboxResult {
    readonly confirmed: boolean;
}
export interface IInputDialogArgs {
    readonly input: IInput;
}
export interface IInput extends IConfirmation {
    readonly inputs: IInputElement[];
    readonly primaryButton?: string;
}
export interface IInputElement {
    readonly type?: 'text' | 'password';
    readonly value?: string;
    readonly placeholder?: string;
}
export interface IInputResult extends IConfirmationResult {
    readonly values?: string[];
}
export interface IPromptDialogArgs {
    readonly prompt: IPrompt<unknown>;
}
export interface IPromptBaseButton<T> {
    run(checkbox: ICheckboxResult): T | Promise<T>;
}
export interface IPromptButton<T> extends IPromptBaseButton<T> {
    readonly label: string;
}
export interface IPromptCancelButton<T> extends IPromptBaseButton<T> {
    readonly label?: string;
}
export interface IPrompt<T> extends IBaseDialogOptions {
    readonly buttons?: IPromptButton<T>[];
    readonly cancelButton?: IPromptCancelButton<T> | true | string;
}
export interface IPromptWithCustomCancel<T> extends IPrompt<T> {
    readonly cancelButton: IPromptCancelButton<T>;
}
export interface IPromptWithDefaultCancel<T> extends IPrompt<T> {
    readonly cancelButton: true | string;
}
export interface IPromptResult<T> extends ICheckboxResult {
    readonly result?: T;
}
export interface IPromptResultWithCancel<T> extends IPromptResult<T> {
    readonly result: T;
}
export interface IAsyncPromptResult<T> extends ICheckboxResult {
    readonly result?: Promise<T>;
}
export interface IAsyncPromptResultWithCancel<T> extends IAsyncPromptResult<T> {
    readonly result: Promise<T>;
}
export type IDialogResult = IConfirmationResult | IInputResult | IAsyncPromptResult<unknown>;
export type DialogType = 'none' | 'info' | 'error' | 'question' | 'warning';
export interface ICheckbox {
    readonly label: string;
    readonly checked?: boolean;
}
export interface ICheckboxResult {
    readonly checkboxChecked?: boolean;
}
export interface IPickAndOpenOptions {
    readonly forceNewWindow?: boolean;
    defaultUri?: URI;
    readonly telemetryExtraData?: ITelemetryData;
    availableFileSystems?: string[];
    remoteAuthority?: string | null;
}
export interface FileFilter {
    readonly extensions: string[];
    readonly name: string;
}
export interface ISaveDialogOptions {
    title?: string;
    defaultUri?: URI;
    filters?: FileFilter[];
    readonly saveLabel?: string;
    availableFileSystems?: readonly string[];
}
export interface IOpenDialogOptions {
    readonly title?: string;
    defaultUri?: URI;
    readonly openLabel?: string;
    canSelectFiles?: boolean;
    canSelectFolders?: boolean;
    readonly canSelectMany?: boolean;
    filters?: FileFilter[];
    availableFileSystems?: readonly string[];
}
export declare const IDialogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDialogService>;
export interface ICustomDialogOptions {
    readonly buttonDetails?: string[];
    readonly markdownDetails?: ICustomDialogMarkdown[];
    readonly classes?: string[];
    readonly icon?: ThemeIcon;
    readonly disableCloseAction?: boolean;
}
export interface ICustomDialogMarkdown {
    readonly markdown: IMarkdownString;
    readonly classes?: string[];
}
export interface IDialogHandler {
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>>;
    input(input: IInput): Promise<IInputResult>;
    about(): Promise<void>;
}
export declare abstract class AbstractDialogHandler implements IDialogHandler {
    protected getConfirmationButtons(dialog: IConfirmation): string[];
    protected getPromptButtons(dialog: IPrompt<unknown>): string[];
    protected getInputButtons(dialog: IInput): string[];
    private getButtons;
    protected getDialogType(type: Severity | DialogType | undefined): DialogType | undefined;
    protected getPromptResult<T>(prompt: IPrompt<T>, buttonIndex: number, checkboxChecked: boolean | undefined): IAsyncPromptResult<T>;
    abstract confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    abstract input(input: IInput): Promise<IInputResult>;
    abstract prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>>;
    abstract about(): Promise<void>;
}
export interface IDialogService {
    readonly _serviceBrand: undefined;
    onWillShowDialog: Event<void>;
    onDidShowDialog: Event<void>;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    prompt<T>(prompt: IPromptWithCustomCancel<T>): Promise<IPromptResultWithCancel<T>>;
    prompt<T>(prompt: IPromptWithDefaultCancel<T>): Promise<IPromptResult<T>>;
    prompt<T>(prompt: IPrompt<T>): Promise<IPromptResult<T>>;
    input(input: IInput): Promise<IInputResult>;
    info(message: string, detail?: string): Promise<void>;
    warn(message: string, detail?: string): Promise<void>;
    error(message: string, detail?: string): Promise<void>;
    about(): Promise<void>;
}
export declare const IFileDialogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IFileDialogService>;
export interface IFileDialogService {
    readonly _serviceBrand: undefined;
    defaultFilePath(schemeFilter?: string): Promise<URI>;
    defaultFolderPath(schemeFilter?: string): Promise<URI>;
    defaultWorkspacePath(schemeFilter?: string): Promise<URI>;
    pickFileFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFileAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickWorkspaceAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined>;
    preferredHome(schemeFilter?: string): Promise<URI>;
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
    showSaveConfirm(fileNamesOrResources: (string | URI)[]): Promise<ConfirmResult>;
    showOpenDialog(options: IOpenDialogOptions): Promise<URI[] | undefined>;
}
export declare const enum ConfirmResult {
    SAVE = 0,
    DONT_SAVE = 1,
    CANCEL = 2
}
export declare function getFileNamesMessage(fileNamesOrResources: readonly (string | URI)[]): string;
export interface INativeOpenDialogOptions {
    readonly forceNewWindow?: boolean;
    readonly defaultPath?: string;
    readonly telemetryEventName?: string;
    readonly telemetryExtraData?: ITelemetryData;
}
export interface IMassagedMessageBoxOptions {
    readonly options: MessageBoxOptions;
    readonly buttonIndeces: number[];
}
export declare function massageMessageBoxOptions(options: MessageBoxOptions, productService: IProductService): IMassagedMessageBoxOptions;
