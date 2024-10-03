import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogFile } from '../../../../platform/log/browser/log.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWindowDriver, IElement, ILocaleInfo, ILocalizedStrings } from '../common/driver.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
export declare class BrowserWindowDriver implements IWindowDriver {
    private readonly fileService;
    private readonly environmentService;
    private readonly lifecycleService;
    private readonly logService;
    constructor(fileService: IFileService, environmentService: IEnvironmentService, lifecycleService: ILifecycleService, logService: ILogService);
    getLogs(): Promise<ILogFile[]>;
    whenWorkbenchRestored(): Promise<void>;
    setValue(selector: string, text: string): Promise<void>;
    isActiveElement(selector: string): Promise<boolean>;
    getElements(selector: string, recursive: boolean): Promise<IElement[]>;
    private serializeElement;
    getElementXY(selector: string, xoffset?: number, yoffset?: number): Promise<{
        x: number;
        y: number;
    }>;
    typeInEditor(selector: string, text: string): Promise<void>;
    getTerminalBuffer(selector: string): Promise<string[]>;
    writeInTerminal(selector: string, text: string): Promise<void>;
    getLocaleInfo(): Promise<ILocaleInfo>;
    getLocalizedStrings(): Promise<ILocalizedStrings>;
    protected _getElementXY(selector: string, offset?: {
        x: number;
        y: number;
    }): Promise<{
        x: number;
        y: number;
    }>;
    exitApplication(): Promise<void>;
}
export declare function registerWindowDriver(instantiationService: IInstantiationService): void;
