import { ITerminalService } from '../../terminal/browser/terminal.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IDebugService } from '../../debug/common/debug.js';
export declare class UrlFinder extends Disposable {
    private static readonly localUrlRegex;
    private static readonly extractPortRegex;
    private static readonly localPythonServerRegex;
    private static readonly excludeTerminals;
    private _onDidMatchLocalUrl;
    readonly onDidMatchLocalUrl: import("../../../workbench.web.main.internal.js").Event<{
        host: string;
        port: number;
    }>;
    private listeners;
    constructor(terminalService: ITerminalService, debugService: IDebugService);
    private registerTerminalInstance;
    private replPositions;
    private processNewReplElements;
    dispose(): void;
    private processData;
}
