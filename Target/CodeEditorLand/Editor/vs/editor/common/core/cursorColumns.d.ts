export declare class CursorColumns {
    private static _nextVisibleColumn;
    static visibleColumnFromColumn(lineContent: string, column: number, tabSize: number): number;
    static toStatusbarColumn(lineContent: string, column: number, tabSize: number): number;
    static columnFromVisibleColumn(lineContent: string, visibleColumn: number, tabSize: number): number;
    static nextRenderTabStop(visibleColumn: number, tabSize: number): number;
    static nextIndentTabStop(visibleColumn: number, indentSize: number): number;
    static prevRenderTabStop(column: number, tabSize: number): number;
    static prevIndentTabStop(column: number, indentSize: number): number;
}
