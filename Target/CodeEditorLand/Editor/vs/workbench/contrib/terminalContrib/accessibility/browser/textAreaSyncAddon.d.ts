import type { ITerminalAddon, Terminal } from '@xterm/xterm';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITerminalCapabilityStore } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
export declare class TextAreaSyncAddon extends Disposable implements ITerminalAddon {
    private readonly _capabilities;
    private readonly _accessibilityService;
    private readonly _configurationService;
    private readonly _logService;
    private _terminal;
    private readonly _listeners;
    activate(terminal: Terminal): void;
    constructor(_capabilities: ITerminalCapabilityStore, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService, _logService: ITerminalLogService);
    private _refreshListeners;
    private _shouldBeActive;
    private _sync;
}
