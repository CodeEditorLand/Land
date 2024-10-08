import electron from 'electron';
import { INativeOpenDialogOptions } from '../common/dialogs.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
export declare const IDialogMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDialogMainService>;
export interface IDialogMainService {
    readonly _serviceBrand: undefined;
    pickFileFolder(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    pickFolder(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    pickFile(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    pickWorkspace(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    showMessageBox(options: electron.MessageBoxOptions, window?: electron.BrowserWindow): Promise<electron.MessageBoxReturnValue>;
    showSaveDialog(options: electron.SaveDialogOptions, window?: electron.BrowserWindow): Promise<electron.SaveDialogReturnValue>;
    showOpenDialog(options: electron.OpenDialogOptions, window?: electron.BrowserWindow): Promise<electron.OpenDialogReturnValue>;
}
export declare class DialogMainService implements IDialogMainService {
    private readonly logService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    private readonly windowFileDialogLocks;
    private readonly windowDialogQueues;
    private readonly noWindowDialogueQueue;
    constructor(logService: ILogService, productService: IProductService);
    pickFileFolder(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    pickFolder(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    pickFile(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    pickWorkspace(options: INativeOpenDialogOptions, window?: electron.BrowserWindow): Promise<string[] | undefined>;
    private doPick;
    private getWindowDialogQueue;
    showMessageBox(rawOptions: electron.MessageBoxOptions, window?: electron.BrowserWindow): Promise<electron.MessageBoxReturnValue>;
    showSaveDialog(options: electron.SaveDialogOptions, window?: electron.BrowserWindow): Promise<electron.SaveDialogReturnValue>;
    private normalizePath;
    private normalizePaths;
    showOpenDialog(options: electron.OpenDialogOptions, window?: electron.BrowserWindow): Promise<electron.OpenDialogReturnValue>;
    private acquireFileDialogLock;
}
