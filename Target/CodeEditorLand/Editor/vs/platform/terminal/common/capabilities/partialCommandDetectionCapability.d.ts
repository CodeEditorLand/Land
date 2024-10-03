import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IPartialCommandDetectionCapability, TerminalCapability } from './capabilities.js';
import type { IMarker, Terminal } from '@xterm/headless';
export declare class PartialCommandDetectionCapability extends DisposableStore implements IPartialCommandDetectionCapability {
    private readonly _terminal;
    readonly type = TerminalCapability.PartialCommandDetection;
    private readonly _commands;
    get commands(): readonly IMarker[];
    private readonly _onCommandFinished;
    readonly onCommandFinished: import("../../../../workbench/workbench.web.main.internal.js").Event<IMarker>;
    constructor(_terminal: Terminal);
    private _onData;
    private _onEnter;
    private _clearCommandsInViewport;
}
