import { ViewEventHandler } from './viewEventHandler.js';
import { ViewEvent } from './viewEvents.js';
import { IContentSizeChangedEvent } from './editorCommon.js';
import { Selection } from './core/selection.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { CursorChangeReason } from './cursorEvents.js';
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent } from './textModelEvents.js';
export declare class ViewModelEventDispatcher extends Disposable {
    private readonly _onEvent;
    readonly onEvent: import("../../workbench/workbench.web.main.internal.js").Event<OutgoingViewModelEvent>;
    private readonly _eventHandlers;
    private _viewEventQueue;
    private _isConsumingViewEventQueue;
    private _collector;
    private _collectorCnt;
    private _outgoingEvents;
    constructor();
    emitOutgoingEvent(e: OutgoingViewModelEvent): void;
    private _addOutgoingEvent;
    private _emitOutgoingEvents;
    addViewEventHandler(eventHandler: ViewEventHandler): void;
    removeViewEventHandler(eventHandler: ViewEventHandler): void;
    beginEmitViewEvents(): ViewModelEventsCollector;
    endEmitViewEvents(): void;
    emitSingleViewEvent(event: ViewEvent): void;
    private _emitMany;
    private _consumeViewEventQueue;
    private _doConsumeQueue;
}
export declare class ViewModelEventsCollector {
    readonly viewEvents: ViewEvent[];
    readonly outgoingEvents: OutgoingViewModelEvent[];
    constructor();
    emitViewEvent(event: ViewEvent): void;
    emitOutgoingEvent(e: OutgoingViewModelEvent): void;
}
export type OutgoingViewModelEvent = (ContentSizeChangedEvent | FocusChangedEvent | ScrollChangedEvent | ViewZonesChangedEvent | HiddenAreasChangedEvent | ReadOnlyEditAttemptEvent | CursorStateChangedEvent | ModelDecorationsChangedEvent | ModelLanguageChangedEvent | ModelLanguageConfigurationChangedEvent | ModelContentChangedEvent | ModelOptionsChangedEvent | ModelTokensChangedEvent);
export declare const enum OutgoingViewModelEventKind {
    ContentSizeChanged = 0,
    FocusChanged = 1,
    ScrollChanged = 2,
    ViewZonesChanged = 3,
    HiddenAreasChanged = 4,
    ReadOnlyEditAttempt = 5,
    CursorStateChanged = 6,
    ModelDecorationsChanged = 7,
    ModelLanguageChanged = 8,
    ModelLanguageConfigurationChanged = 9,
    ModelContentChanged = 10,
    ModelOptionsChanged = 11,
    ModelTokensChanged = 12
}
export declare class ContentSizeChangedEvent implements IContentSizeChangedEvent {
    readonly kind = OutgoingViewModelEventKind.ContentSizeChanged;
    private readonly _oldContentWidth;
    private readonly _oldContentHeight;
    readonly contentWidth: number;
    readonly contentHeight: number;
    readonly contentWidthChanged: boolean;
    readonly contentHeightChanged: boolean;
    constructor(oldContentWidth: number, oldContentHeight: number, contentWidth: number, contentHeight: number);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class FocusChangedEvent {
    readonly kind = OutgoingViewModelEventKind.FocusChanged;
    readonly oldHasFocus: boolean;
    readonly hasFocus: boolean;
    constructor(oldHasFocus: boolean, hasFocus: boolean);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ScrollChangedEvent {
    readonly kind = OutgoingViewModelEventKind.ScrollChanged;
    private readonly _oldScrollWidth;
    private readonly _oldScrollLeft;
    private readonly _oldScrollHeight;
    private readonly _oldScrollTop;
    readonly scrollWidth: number;
    readonly scrollLeft: number;
    readonly scrollHeight: number;
    readonly scrollTop: number;
    readonly scrollWidthChanged: boolean;
    readonly scrollLeftChanged: boolean;
    readonly scrollHeightChanged: boolean;
    readonly scrollTopChanged: boolean;
    constructor(oldScrollWidth: number, oldScrollLeft: number, oldScrollHeight: number, oldScrollTop: number, scrollWidth: number, scrollLeft: number, scrollHeight: number, scrollTop: number);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ViewZonesChangedEvent {
    readonly kind = OutgoingViewModelEventKind.ViewZonesChanged;
    constructor();
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class HiddenAreasChangedEvent {
    readonly kind = OutgoingViewModelEventKind.HiddenAreasChanged;
    constructor();
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class CursorStateChangedEvent {
    readonly kind = OutgoingViewModelEventKind.CursorStateChanged;
    readonly oldSelections: Selection[] | null;
    readonly selections: Selection[];
    readonly oldModelVersionId: number;
    readonly modelVersionId: number;
    readonly source: string;
    readonly reason: CursorChangeReason;
    readonly reachedMaxCursorCount: boolean;
    constructor(oldSelections: Selection[] | null, selections: Selection[], oldModelVersionId: number, modelVersionId: number, source: string, reason: CursorChangeReason, reachedMaxCursorCount: boolean);
    private static _selectionsAreEqual;
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ReadOnlyEditAttemptEvent {
    readonly kind = OutgoingViewModelEventKind.ReadOnlyEditAttempt;
    constructor();
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ModelDecorationsChangedEvent {
    readonly event: IModelDecorationsChangedEvent;
    readonly kind = OutgoingViewModelEventKind.ModelDecorationsChanged;
    constructor(event: IModelDecorationsChangedEvent);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ModelLanguageChangedEvent {
    readonly event: IModelLanguageChangedEvent;
    readonly kind = OutgoingViewModelEventKind.ModelLanguageChanged;
    constructor(event: IModelLanguageChangedEvent);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ModelLanguageConfigurationChangedEvent {
    readonly event: IModelLanguageConfigurationChangedEvent;
    readonly kind = OutgoingViewModelEventKind.ModelLanguageConfigurationChanged;
    constructor(event: IModelLanguageConfigurationChangedEvent);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ModelContentChangedEvent {
    readonly event: IModelContentChangedEvent;
    readonly kind = OutgoingViewModelEventKind.ModelContentChanged;
    constructor(event: IModelContentChangedEvent);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ModelOptionsChangedEvent {
    readonly event: IModelOptionsChangedEvent;
    readonly kind = OutgoingViewModelEventKind.ModelOptionsChanged;
    constructor(event: IModelOptionsChangedEvent);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
export declare class ModelTokensChangedEvent {
    readonly event: IModelTokensChangedEvent;
    readonly kind = OutgoingViewModelEventKind.ModelTokensChanged;
    constructor(event: IModelTokensChangedEvent);
    isNoOp(): boolean;
    attemptToMerge(other: OutgoingViewModelEvent): OutgoingViewModelEvent | null;
}
