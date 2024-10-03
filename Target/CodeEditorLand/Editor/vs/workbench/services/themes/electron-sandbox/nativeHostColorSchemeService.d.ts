import { INativeHostService } from '../../../../platform/native/common/native.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IHostColorSchemeService } from '../common/hostColorSchemeService.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class NativeHostColorSchemeService extends Disposable implements IHostColorSchemeService {
    private readonly nativeHostService;
    private storageService;
    static readonly STORAGE_KEY = "HostColorSchemeData";
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeColorScheme;
    readonly onDidChangeColorScheme: import("../../../workbench.web.main.internal.js").Event<void>;
    dark: boolean;
    highContrast: boolean;
    constructor(nativeHostService: INativeHostService, environmentService: INativeWorkbenchEnvironmentService, storageService: IStorageService);
    private getStoredValue;
    private update;
}
