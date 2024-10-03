import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { KeymapInfo } from '../common/keymapInfo.js';
import { IKeyboardMapper } from '../../../../platform/keyboardLayout/common/keyboardMapper.js';
import { IKeyboardEvent } from '../../../../platform/keybinding/common/keybinding.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IKeyboardLayoutInfo, IKeyboardLayoutService, IKeyboardMapping } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
export declare class BrowserKeyboardMapperFactoryBase extends Disposable {
    private readonly _configurationService;
    protected _initialized: boolean;
    protected _keyboardMapper: IKeyboardMapper | null;
    private readonly _onDidChangeKeyboardMapper;
    readonly onDidChangeKeyboardMapper: Event<void>;
    protected _keymapInfos: KeymapInfo[];
    protected _mru: KeymapInfo[];
    private _activeKeymapInfo;
    private keyboardLayoutMapAllowed;
    get activeKeymap(): KeymapInfo | null;
    get keymapInfos(): KeymapInfo[];
    get activeKeyboardLayout(): IKeyboardLayoutInfo | null;
    get activeKeyMapping(): IKeyboardMapping | null;
    get keyboardLayouts(): IKeyboardLayoutInfo[];
    protected constructor(_configurationService: IConfigurationService);
    registerKeyboardLayout(layout: KeymapInfo): void;
    removeKeyboardLayout(layout: KeymapInfo): void;
    getMatchedKeymapInfo(keyMapping: IKeyboardMapping | null): {
        result: KeymapInfo;
        score: number;
    } | null;
    getUSStandardLayout(): KeymapInfo | null | undefined;
    isKeyMappingActive(keymap: IKeyboardMapping | null): boolean | null;
    setUSKeyboardLayout(): void;
    setActiveKeyMapping(keymap: IKeyboardMapping | null): void;
    setActiveKeymapInfo(keymapInfo: KeymapInfo): void;
    setLayoutFromBrowserAPI(): void;
    private _updateKeyboardLayoutAsync;
    getKeyboardMapper(): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
    setKeyboardLayout(layoutName: string): void;
    private _setKeyboardData;
    private static _createKeyboardMapper;
    private _validateCurrentKeyboardMapping;
    private _getBrowserKeyMapping;
}
export declare class BrowserKeyboardMapperFactory extends BrowserKeyboardMapperFactoryBase {
    constructor(configurationService: IConfigurationService, notificationService: INotificationService, storageService: IStorageService, commandService: ICommandService);
}
export declare class BrowserKeyboardLayoutService extends Disposable implements IKeyboardLayoutService {
    private configurationService;
    _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: Event<void>;
    private _userKeyboardLayout;
    private readonly _factory;
    private _keyboardLayoutMode;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, notificationService: INotificationService, storageService: IStorageService, commandService: ICommandService, configurationService: IConfigurationService);
    setUserKeyboardLayoutIfMatched(): void;
    getKeyboardMapper(): IKeyboardMapper;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getRawKeyboardMapping(): IKeyboardMapping | null;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
