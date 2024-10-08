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
    /**
     * Allows to enforce use of custom dialog even in native environments.
     */
    readonly custom?: boolean | ICustomDialogOptions;
}
export interface IConfirmDialogArgs {
    readonly confirmation: IConfirmation;
}
export interface IConfirmation extends IBaseDialogOptions {
    /**
     * If not provided, defaults to `Yes`.
     */
    readonly primaryButton?: string;
    /**
     * If not provided, defaults to `Cancel`.
     */
    readonly cancelButton?: string;
}
export interface IConfirmationResult extends ICheckboxResult {
    /**
     * Will be true if the dialog was confirmed with the primary button pressed.
     */
    readonly confirmed: boolean;
}
export interface IInputDialogArgs {
    readonly input: IInput;
}
export interface IInput extends IConfirmation {
    readonly inputs: IInputElement[];
    /**
     * If not provided, defaults to `Ok`.
     */
    readonly primaryButton?: string;
}
export interface IInputElement {
    readonly type?: 'text' | 'password';
    readonly value?: string;
    readonly placeholder?: string;
}
export interface IInputResult extends IConfirmationResult {
    /**
     * Values for the input fields as provided by the user or `undefined` if none.
     */
    readonly values?: string[];
}
export interface IPromptDialogArgs {
    readonly prompt: IPrompt<unknown>;
}
export interface IPromptBaseButton<T> {
    /**
     * @returns the result of the prompt button will be returned
     * as result from the `prompt()` call.
     */
    run(checkbox: ICheckboxResult): T | Promise<T>;
}
export interface IPromptButton<T> extends IPromptBaseButton<T> {
    readonly label: string;
}
export interface IPromptCancelButton<T> extends IPromptBaseButton<T> {
    /**
     * The cancel button to show in the prompt. Defaults to
     * `Cancel` if not provided.
     */
    readonly label?: string;
}
export interface IPrompt<T> extends IBaseDialogOptions {
    /**
     * The buttons to show in the prompt. Defaults to `OK`
     * if no buttons or cancel button is provided.
     */
    readonly buttons?: IPromptButton<T>[];
    /**
     * The cancel button to show in the prompt. Defaults to
     * `Cancel` if set to `true`.
     */
    readonly cancelButton?: IPromptCancelButton<T> | true | string;
}
export interface IPromptWithCustomCancel<T> extends IPrompt<T> {
    readonly cancelButton: IPromptCancelButton<T>;
}
export interface IPromptWithDefaultCancel<T> extends IPrompt<T> {
    readonly cancelButton: true | string;
}
export interface IPromptResult<T> extends ICheckboxResult {
    /**
     * The result of the `IPromptButton` that was pressed or `undefined` if none.
     */
    readonly result?: T;
}
export interface IPromptResultWithCancel<T> extends IPromptResult<T> {
    readonly result: T;
}
export interface IAsyncPromptResult<T> extends ICheckboxResult {
    /**
     * The result of the `IPromptButton` that was pressed or `undefined` if none.
     */
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
    /**
     * This will only be defined if the confirmation was created
     * with the checkbox option defined.
     */
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
    /**
     * A human-readable string for the dialog title
     */
    title?: string;
    /**
     * The resource the dialog shows when opened.
     */
    defaultUri?: URI;
    /**
     * A set of file filters that are used by the dialog. Each entry is a human readable label,
     * like "TypeScript", and an array of extensions.
     */
    filters?: FileFilter[];
    /**
     * A human-readable string for the ok button
     */
    readonly saveLabel?: string;
    /**
     * Specifies a list of schemas for the file systems the user can save to. If not specified, uses the schema of the defaultURI or, if also not specified,
     * the schema of the current window.
     */
    availableFileSystems?: readonly string[];
}
export interface IOpenDialogOptions {
    /**
     * A human-readable string for the dialog title
     */
    readonly title?: string;
    /**
     * The resource the dialog shows when opened.
     */
    defaultUri?: URI;
    /**
     * A human-readable string for the open button.
     */
    readonly openLabel?: string;
    /**
     * Allow to select files, defaults to `true`.
     */
    canSelectFiles?: boolean;
    /**
     * Allow to select folders, defaults to `false`.
     */
    canSelectFolders?: boolean;
    /**
     * Allow to select many files or folders.
     */
    readonly canSelectMany?: boolean;
    /**
     * A set of file filters that are used by the dialog. Each entry is a human readable label,
     * like "TypeScript", and an array of extensions.
     */
    filters?: FileFilter[];
    /**
     * Specifies a list of schemas for the file systems the user can load from. If not specified, uses the schema of the defaultURI or, if also not available,
     * the schema of the current window.
     */
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
/**
 * A handler to bring up modal dialogs.
 */
export interface IDialogHandler {
    /**
     * Ask the user for confirmation with a modal dialog.
     */
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    /**
     * Prompt the user with a modal dialog.
     */
    prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>>;
    /**
     * Present a modal dialog to the user asking for input.
     */
    input(input: IInput): Promise<IInputResult>;
    /**
     * Present the about dialog to the user.
     */
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
/**
 * A service to bring up modal dialogs.
 *
 * Note: use the `INotificationService.prompt()` method for a non-modal way to ask
 * the user for input.
 */
export interface IDialogService {
    readonly _serviceBrand: undefined;
    /**
     * An event that fires when a dialog is about to show.
     */
    onWillShowDialog: Event<void>;
    /**
     * An event that fires when a dialog did show (closed).
     */
    onDidShowDialog: Event<void>;
    /**
     * Ask the user for confirmation with a modal dialog.
     */
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    /**
     * Prompt the user with a modal dialog. Provides a bit
     * more control over the dialog compared to the simpler
     * `confirm` method. Specifically, allows to show more
     * than 2 buttons and makes it easier to just show a
     * message to the user.
     *
     * @returns a promise that resolves to the `T` result
     * from the provided `IPromptButton<T>` or `undefined`.
     */
    prompt<T>(prompt: IPromptWithCustomCancel<T>): Promise<IPromptResultWithCancel<T>>;
    prompt<T>(prompt: IPromptWithDefaultCancel<T>): Promise<IPromptResult<T>>;
    prompt<T>(prompt: IPrompt<T>): Promise<IPromptResult<T>>;
    /**
     * Present a modal dialog to the user asking for input.
     */
    input(input: IInput): Promise<IInputResult>;
    /**
     * Show a modal info dialog.
     */
    info(message: string, detail?: string): Promise<void>;
    /**
     * Show a modal warning dialog.
     */
    warn(message: string, detail?: string): Promise<void>;
    /**
     * Show a modal error dialog.
     */
    error(message: string, detail?: string): Promise<void>;
    /**
     * Present the about dialog to the user.
     */
    about(): Promise<void>;
}
export declare const IFileDialogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IFileDialogService>;
/**
 * A service to bring up file dialogs.
 */
export interface IFileDialogService {
    readonly _serviceBrand: undefined;
    /**
     * The default path for a new file based on previously used files.
     * @param schemeFilter The scheme of the file path. If no filter given, the scheme of the current window is used.
     * Falls back to user home in the absence of enough information to find a better URI.
     */
    defaultFilePath(schemeFilter?: string): Promise<URI>;
    /**
     * The default path for a new folder based on previously used folders.
     * @param schemeFilter The scheme of the folder path. If no filter given, the scheme of the current window is used.
     * Falls back to user home in the absence of enough information to find a better URI.
     */
    defaultFolderPath(schemeFilter?: string): Promise<URI>;
    /**
     * The default path for a new workspace based on previously used workspaces.
     * @param schemeFilter The scheme of the workspace path. If no filter given, the scheme of the current window is used.
     * Falls back to user home in the absence of enough information to find a better URI.
     */
    defaultWorkspacePath(schemeFilter?: string): Promise<URI>;
    /**
     * Shows a file-folder selection dialog and opens the selected entry.
     */
    pickFileFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
     * Shows a file selection dialog and opens the selected entry.
     */
    pickFileAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
     * Shows a folder selection dialog and opens the selected entry.
     */
    pickFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
     * Shows a workspace selection dialog and opens the selected entry.
     */
    pickWorkspaceAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
     * Shows a save file dialog and save the file at the chosen file URI.
     */
    pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined>;
    /**
     * The preferred folder path to open the dialog at.
     * @param schemeFilter The scheme of the file path. If no filter given, the scheme of the current window is used.
     * Falls back to user home in the absence of a setting.
     */
    preferredHome(schemeFilter?: string): Promise<URI>;
    /**
     * Shows a save file dialog and returns the chosen file URI.
     */
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
    /**
     * Shows a confirm dialog for saving 1-N files.
     */
    showSaveConfirm(fileNamesOrResources: (string | URI)[]): Promise<ConfirmResult>;
    /**
     * Shows a open file dialog and returns the chosen file URI.
     */
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
    /**
     * OS massaged message box options.
     */
    readonly options: MessageBoxOptions;
    /**
     * Since the massaged result of the message box options potentially
     * changes the order of buttons, we have to keep a map of these
     * changes so that we can still return the correct index to the caller.
     */
    readonly buttonIndeces: number[];
}
/**
 * A utility method to ensure the options for the message box dialog
 * are using properties that are consistent across all platforms and
 * specific to the platform where necessary.
 */
export declare function massageMessageBoxOptions(options: MessageBoxOptions, productService: IProductService): IMassagedMessageBoxOptions;
