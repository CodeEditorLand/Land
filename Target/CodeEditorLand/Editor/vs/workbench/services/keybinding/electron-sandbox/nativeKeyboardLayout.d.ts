import { Disposable } from '../../../../base/common/lifecycle.js';
import { IKeyboardLayoutInfo, IKeyboardLayoutService, IKeyboardMapping } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
import { IKeyboardMapper } from '../../../../platform/keyboardLayout/common/keyboardMapper.js';
import { IKeyboardEvent } from '../../../../platform/keybinding/common/keybinding.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INativeKeyboardLayoutService } from './nativeKeyboardLayoutService.js';
export declare class KeyboardLayoutService extends Disposable implements IKeyboardLayoutService {
    private readonly _nativeKeyboardLayoutService;
    private readonly _configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: import("../../../workbench.web.main.internal.js").Event<void>;
    private _keyboardMapper;
    constructor(_nativeKeyboardLayoutService: INativeKeyboardLayoutService, _configurationService: IConfigurationService);
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getKeyboardMapper(): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
