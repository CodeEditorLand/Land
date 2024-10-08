/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
/**
 * The main match information for a {@link TextSearchResultNew}.
 */
export class TextSearchMatchNew {
    /**
     * @param uri The uri for the matching document.
     * @param ranges The ranges associated with this match.
     * @param previewText The text that is used to preview the match. The highlighted range in `previewText` is specified in `ranges`.
     */
    constructor(uri, ranges, previewText) {
        this.uri = uri;
        this.ranges = ranges;
        this.previewText = previewText;
    }
}
/**
 * The potential context information for a {@link TextSearchResultNew}.
 */
export class TextSearchContextNew {
    /**
     * @param uri The uri for the matching document.
     * @param text The line of context text.
     * @param lineNumber The line number of this line of context.
     */
    constructor(uri, text, lineNumber) {
        this.uri = uri;
        this.text = text;
        this.lineNumber = lineNumber;
    }
}
/**
 * Options for following search.exclude and files.exclude settings.
 */
export var ExcludeSettingOptions;
(function (ExcludeSettingOptions) {
    /*
     * Don't use any exclude settings.
     */
    ExcludeSettingOptions[ExcludeSettingOptions["None"] = 1] = "None";
    /*
     * Use:
     * - files.exclude setting
     */
    ExcludeSettingOptions[ExcludeSettingOptions["FilesExclude"] = 2] = "FilesExclude";
    /*
     * Use:
     * - files.exclude setting
     * - search.exclude setting
     */
    ExcludeSettingOptions[ExcludeSettingOptions["SearchAndFilesExclude"] = 3] = "SearchAndFilesExclude";
})(ExcludeSettingOptions || (ExcludeSettingOptions = {}));
export var TextSearchCompleteMessageType;
(function (TextSearchCompleteMessageType) {
    TextSearchCompleteMessageType[TextSearchCompleteMessageType["Information"] = 1] = "Information";
    TextSearchCompleteMessageType[TextSearchCompleteMessageType["Warning"] = 2] = "Warning";
})(TextSearchCompleteMessageType || (TextSearchCompleteMessageType = {}));
