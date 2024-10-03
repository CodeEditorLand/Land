import { ScrollEvent } from '../../base/common/scrollable.js';
import { ConfigurationChangedEvent, EditorOption } from './config/editorOptions.js';
import { Range } from './core/range.js';
import { Selection } from './core/selection.js';
import { CursorChangeReason } from './cursorEvents.js';
import { ScrollType } from './editorCommon.js';
import { IModelDecorationsChangedEvent } from './textModelEvents.js';
import { IColorTheme } from '../../platform/theme/common/themeService.js';
export declare const enum ViewEventType {
    ViewCompositionStart = 0,
    ViewCompositionEnd = 1,
    ViewConfigurationChanged = 2,
    ViewCursorStateChanged = 3,
    ViewDecorationsChanged = 4,
    ViewFlushed = 5,
    ViewFocusChanged = 6,
    ViewLanguageConfigurationChanged = 7,
    ViewLineMappingChanged = 8,
    ViewLinesChanged = 9,
    ViewLinesDeleted = 10,
    ViewLinesInserted = 11,
    ViewRevealRangeRequest = 12,
    ViewScrollChanged = 13,
    ViewThemeChanged = 14,
    ViewTokensChanged = 15,
    ViewTokensColorsChanged = 16,
    ViewZonesChanged = 17
}
export declare class ViewCompositionStartEvent {
    readonly type = ViewEventType.ViewCompositionStart;
    constructor();
}
export declare class ViewCompositionEndEvent {
    readonly type = ViewEventType.ViewCompositionEnd;
    constructor();
}
export declare class ViewConfigurationChangedEvent {
    readonly type = ViewEventType.ViewConfigurationChanged;
    readonly _source: ConfigurationChangedEvent;
    constructor(source: ConfigurationChangedEvent);
    hasChanged(id: EditorOption): boolean;
}
export declare class ViewCursorStateChangedEvent {
    readonly selections: Selection[];
    readonly modelSelections: Selection[];
    readonly reason: CursorChangeReason;
    readonly type = ViewEventType.ViewCursorStateChanged;
    constructor(selections: Selection[], modelSelections: Selection[], reason: CursorChangeReason);
}
export declare class ViewDecorationsChangedEvent {
    readonly type = ViewEventType.ViewDecorationsChanged;
    readonly affectsMinimap: boolean;
    readonly affectsOverviewRuler: boolean;
    readonly affectsGlyphMargin: boolean;
    readonly affectsLineNumber: boolean;
    constructor(source: IModelDecorationsChangedEvent | null);
}
export declare class ViewFlushedEvent {
    readonly type = ViewEventType.ViewFlushed;
    constructor();
}
export declare class ViewFocusChangedEvent {
    readonly type = ViewEventType.ViewFocusChanged;
    readonly isFocused: boolean;
    constructor(isFocused: boolean);
}
export declare class ViewLanguageConfigurationEvent {
    readonly type = ViewEventType.ViewLanguageConfigurationChanged;
}
export declare class ViewLineMappingChangedEvent {
    readonly type = ViewEventType.ViewLineMappingChanged;
    constructor();
}
export declare class ViewLinesChangedEvent {
    readonly fromLineNumber: number;
    readonly count: number;
    readonly type = ViewEventType.ViewLinesChanged;
    constructor(fromLineNumber: number, count: number);
}
export declare class ViewLinesDeletedEvent {
    readonly type = ViewEventType.ViewLinesDeleted;
    readonly fromLineNumber: number;
    readonly toLineNumber: number;
    constructor(fromLineNumber: number, toLineNumber: number);
}
export declare class ViewLinesInsertedEvent {
    readonly type = ViewEventType.ViewLinesInserted;
    readonly fromLineNumber: number;
    readonly toLineNumber: number;
    constructor(fromLineNumber: number, toLineNumber: number);
}
export declare const enum VerticalRevealType {
    Simple = 0,
    Center = 1,
    CenterIfOutsideViewport = 2,
    Top = 3,
    Bottom = 4,
    NearTop = 5,
    NearTopIfOutsideViewport = 6
}
export declare class ViewRevealRangeRequestEvent {
    readonly source: string | null | undefined;
    readonly minimalReveal: boolean;
    readonly range: Range | null;
    readonly selections: Selection[] | null;
    readonly verticalType: VerticalRevealType;
    readonly revealHorizontal: boolean;
    readonly scrollType: ScrollType;
    readonly type = ViewEventType.ViewRevealRangeRequest;
    constructor(source: string | null | undefined, minimalReveal: boolean, range: Range | null, selections: Selection[] | null, verticalType: VerticalRevealType, revealHorizontal: boolean, scrollType: ScrollType);
}
export declare class ViewScrollChangedEvent {
    readonly type = ViewEventType.ViewScrollChanged;
    readonly scrollWidth: number;
    readonly scrollLeft: number;
    readonly scrollHeight: number;
    readonly scrollTop: number;
    readonly scrollWidthChanged: boolean;
    readonly scrollLeftChanged: boolean;
    readonly scrollHeightChanged: boolean;
    readonly scrollTopChanged: boolean;
    constructor(source: ScrollEvent);
}
export declare class ViewThemeChangedEvent {
    readonly theme: IColorTheme;
    readonly type = ViewEventType.ViewThemeChanged;
    constructor(theme: IColorTheme);
}
export declare class ViewTokensChangedEvent {
    readonly type = ViewEventType.ViewTokensChanged;
    readonly ranges: {
        readonly fromLineNumber: number;
        readonly toLineNumber: number;
    }[];
    constructor(ranges: {
        fromLineNumber: number;
        toLineNumber: number;
    }[]);
}
export declare class ViewTokensColorsChangedEvent {
    readonly type = ViewEventType.ViewTokensColorsChanged;
    constructor();
}
export declare class ViewZonesChangedEvent {
    readonly type = ViewEventType.ViewZonesChanged;
    constructor();
}
export type ViewEvent = (ViewCompositionStartEvent | ViewCompositionEndEvent | ViewConfigurationChangedEvent | ViewCursorStateChangedEvent | ViewDecorationsChangedEvent | ViewFlushedEvent | ViewFocusChangedEvent | ViewLanguageConfigurationEvent | ViewLineMappingChangedEvent | ViewLinesChangedEvent | ViewLinesDeletedEvent | ViewLinesInsertedEvent | ViewRevealRangeRequestEvent | ViewScrollChangedEvent | ViewThemeChangedEvent | ViewTokensChangedEvent | ViewTokensColorsChangedEvent | ViewZonesChangedEvent);
