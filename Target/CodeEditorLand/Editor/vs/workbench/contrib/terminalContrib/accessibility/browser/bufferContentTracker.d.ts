import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
import { IXtermTerminal } from '../../../terminal/browser/terminal.js';
import type { Terminal } from '@xterm/xterm';
export declare class BufferContentTracker extends Disposable {
    private readonly _xterm;
    private readonly _logService;
    private readonly _configurationService;
    private _lastCachedMarker;
    private _priorEditorViewportLineCount;
    private _lines;
    get lines(): string[];
    bufferToEditorLineMapping: Map<number, number>;
    constructor(_xterm: Pick<IXtermTerminal, 'getFont'> & {
        raw: Terminal;
    }, _logService: ITerminalLogService, _configurationService: IConfigurationService);
    reset(): void;
    update(): void;
    private _updateCachedContent;
    private _removeViewportContent;
    private _updateViewportContent;
}
