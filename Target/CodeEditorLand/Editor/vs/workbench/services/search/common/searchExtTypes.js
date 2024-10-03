export class Position {
    constructor(line, character) {
        this.line = line;
        this.character = character;
    }
    isBefore(other) { return false; }
    isBeforeOrEqual(other) { return false; }
    isAfter(other) { return false; }
    isAfterOrEqual(other) { return false; }
    isEqual(other) { return false; }
    compareTo(other) { return 0; }
    translate(_, _2) { return new Position(0, 0); }
    with(_) { return new Position(0, 0); }
}
export class Range {
    constructor(startLine, startCol, endLine, endCol) {
        this.isEmpty = false;
        this.isSingleLine = false;
        this.start = new Position(startLine, startCol);
        this.end = new Position(endLine, endCol);
    }
    contains(positionOrRange) { return false; }
    isEqual(other) { return false; }
    intersection(range) { return undefined; }
    union(other) { return new Range(0, 0, 0, 0); }
    with(_) { return new Range(0, 0, 0, 0); }
}
export class TextSearchMatchNew {
    constructor(uri, ranges, previewText) {
        this.uri = uri;
        this.ranges = ranges;
        this.previewText = previewText;
    }
}
export class TextSearchContextNew {
    constructor(uri, text, lineNumber) {
        this.uri = uri;
        this.text = text;
        this.lineNumber = lineNumber;
    }
}
export var ExcludeSettingOptions;
(function (ExcludeSettingOptions) {
    ExcludeSettingOptions[ExcludeSettingOptions["None"] = 1] = "None";
    ExcludeSettingOptions[ExcludeSettingOptions["FilesExclude"] = 2] = "FilesExclude";
    ExcludeSettingOptions[ExcludeSettingOptions["SearchAndFilesExclude"] = 3] = "SearchAndFilesExclude";
})(ExcludeSettingOptions || (ExcludeSettingOptions = {}));
export var TextSearchCompleteMessageType;
(function (TextSearchCompleteMessageType) {
    TextSearchCompleteMessageType[TextSearchCompleteMessageType["Information"] = 1] = "Information";
    TextSearchCompleteMessageType[TextSearchCompleteMessageType["Warning"] = 2] = "Warning";
})(TextSearchCompleteMessageType || (TextSearchCompleteMessageType = {}));
