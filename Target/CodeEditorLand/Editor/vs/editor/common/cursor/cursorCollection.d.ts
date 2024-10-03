import { CursorState, PartialCursorState } from '../cursorCommon.js';
import { CursorContext } from './cursorContext.js';
import { Position } from '../core/position.js';
import { ISelection, Selection } from '../core/selection.js';
export declare class CursorCollection {
    private context;
    private cursors;
    private lastAddedCursorIndex;
    constructor(context: CursorContext);
    dispose(): void;
    startTrackingSelections(): void;
    stopTrackingSelections(): void;
    updateContext(context: CursorContext): void;
    ensureValidState(): void;
    readSelectionFromMarkers(): Selection[];
    getAll(): CursorState[];
    getViewPositions(): Position[];
    getTopMostViewPosition(): Position;
    getBottomMostViewPosition(): Position;
    getSelections(): Selection[];
    getViewSelections(): Selection[];
    setSelections(selections: ISelection[]): void;
    getPrimaryCursor(): CursorState;
    setStates(states: PartialCursorState[] | null): void;
    private _setSecondaryStates;
    killSecondaryCursors(): void;
    private _addSecondaryCursor;
    getLastAddedCursorIndex(): number;
    private _removeSecondaryCursor;
    normalize(): void;
}
