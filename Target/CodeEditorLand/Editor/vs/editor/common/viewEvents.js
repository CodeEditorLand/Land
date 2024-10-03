export class ViewCompositionStartEvent {
    constructor() {
        this.type = 0;
    }
}
export class ViewCompositionEndEvent {
    constructor() {
        this.type = 1;
    }
}
export class ViewConfigurationChangedEvent {
    constructor(source) {
        this.type = 2;
        this._source = source;
    }
    hasChanged(id) {
        return this._source.hasChanged(id);
    }
}
export class ViewCursorStateChangedEvent {
    constructor(selections, modelSelections, reason) {
        this.selections = selections;
        this.modelSelections = modelSelections;
        this.reason = reason;
        this.type = 3;
    }
}
export class ViewDecorationsChangedEvent {
    constructor(source) {
        this.type = 4;
        if (source) {
            this.affectsMinimap = source.affectsMinimap;
            this.affectsOverviewRuler = source.affectsOverviewRuler;
            this.affectsGlyphMargin = source.affectsGlyphMargin;
            this.affectsLineNumber = source.affectsLineNumber;
        }
        else {
            this.affectsMinimap = true;
            this.affectsOverviewRuler = true;
            this.affectsGlyphMargin = true;
            this.affectsLineNumber = true;
        }
    }
}
export class ViewFlushedEvent {
    constructor() {
        this.type = 5;
    }
}
export class ViewFocusChangedEvent {
    constructor(isFocused) {
        this.type = 6;
        this.isFocused = isFocused;
    }
}
export class ViewLanguageConfigurationEvent {
    constructor() {
        this.type = 7;
    }
}
export class ViewLineMappingChangedEvent {
    constructor() {
        this.type = 8;
    }
}
export class ViewLinesChangedEvent {
    constructor(fromLineNumber, count) {
        this.fromLineNumber = fromLineNumber;
        this.count = count;
        this.type = 9;
    }
}
export class ViewLinesDeletedEvent {
    constructor(fromLineNumber, toLineNumber) {
        this.type = 10;
        this.fromLineNumber = fromLineNumber;
        this.toLineNumber = toLineNumber;
    }
}
export class ViewLinesInsertedEvent {
    constructor(fromLineNumber, toLineNumber) {
        this.type = 11;
        this.fromLineNumber = fromLineNumber;
        this.toLineNumber = toLineNumber;
    }
}
export class ViewRevealRangeRequestEvent {
    constructor(source, minimalReveal, range, selections, verticalType, revealHorizontal, scrollType) {
        this.source = source;
        this.minimalReveal = minimalReveal;
        this.range = range;
        this.selections = selections;
        this.verticalType = verticalType;
        this.revealHorizontal = revealHorizontal;
        this.scrollType = scrollType;
        this.type = 12;
    }
}
export class ViewScrollChangedEvent {
    constructor(source) {
        this.type = 13;
        this.scrollWidth = source.scrollWidth;
        this.scrollLeft = source.scrollLeft;
        this.scrollHeight = source.scrollHeight;
        this.scrollTop = source.scrollTop;
        this.scrollWidthChanged = source.scrollWidthChanged;
        this.scrollLeftChanged = source.scrollLeftChanged;
        this.scrollHeightChanged = source.scrollHeightChanged;
        this.scrollTopChanged = source.scrollTopChanged;
    }
}
export class ViewThemeChangedEvent {
    constructor(theme) {
        this.theme = theme;
        this.type = 14;
    }
}
export class ViewTokensChangedEvent {
    constructor(ranges) {
        this.type = 15;
        this.ranges = ranges;
    }
}
export class ViewTokensColorsChangedEvent {
    constructor() {
        this.type = 16;
    }
}
export class ViewZonesChangedEvent {
    constructor() {
        this.type = 17;
    }
}
