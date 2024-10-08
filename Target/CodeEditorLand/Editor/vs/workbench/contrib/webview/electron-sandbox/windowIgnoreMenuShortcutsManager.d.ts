import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
export declare class WindowIgnoreMenuShortcutsManager {
    private readonly _nativeHostService;
    private readonly _isUsingNativeTitleBars;
    private readonly _webviewMainService;
    constructor(configurationService: IConfigurationService, mainProcessService: IMainProcessService, _nativeHostService: INativeHostService);
    didFocus(): void;
    didBlur(): void;
    private get _shouldToggleMenuShortcutsEnablement();
    protected setIgnoreMenuShortcuts(value: boolean): void;
}
