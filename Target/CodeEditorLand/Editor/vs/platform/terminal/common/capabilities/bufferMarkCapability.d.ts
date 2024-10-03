import { Disposable } from '../../../../base/common/lifecycle.js';
import { IBufferMarkCapability, TerminalCapability, IMarkProperties } from './capabilities.js';
import type { IMarker, Terminal } from '@xterm/headless';
export declare class BufferMarkCapability extends Disposable implements IBufferMarkCapability {
    private readonly _terminal;
    readonly type = TerminalCapability.BufferMarkDetection;
    private _idToMarkerMap;
    private _anonymousMarkers;
    private readonly _onMarkAdded;
    readonly onMarkAdded: import("../../../../workbench/workbench.web.main.internal.js").Event<IMarkProperties>;
    constructor(_terminal: Terminal);
    markers(): IterableIterator<IMarker>;
    addMark(properties?: IMarkProperties): void;
    getMark(id: string): IMarker | undefined;
}
