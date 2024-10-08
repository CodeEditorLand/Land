import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
import { IXtermTerminal } from '../../../terminal/browser/terminal.js';
import type { Terminal } from '@xterm/xterm';
export declare class BufferContentTracker extends Disposable {
    private readonly _xterm;
    private readonly _configurationService;
    private readonly _logService;
    /**
     * Marks the last part of the buffer that was cached
     */
    private _lastCachedMarker;
    /**
     * The number of wrapped lines in the viewport when the last cached marker was set
     */
    private _priorEditorViewportLineCount;
    private _lines;
    get lines(): string[];
    bufferToEditorLineMapping: Map<number, number>;
    constructor(_xterm: Pick<IXtermTerminal, 'getFont'> & {
        raw: Terminal;
    }, _configurationService: IConfigurationService, _logService: ITerminalLogService);
    reset(): void;
    update(): void;
    private _updateCachedContent;
    private _removeViewportContent;
    private _updateViewportContent;
}
