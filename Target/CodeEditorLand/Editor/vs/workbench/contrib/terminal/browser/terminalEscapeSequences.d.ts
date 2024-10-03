export declare const enum VSCodeOscPt {
    PromptStart = "A",
    CommandStart = "B",
    CommandExecuted = "C",
    CommandFinished = "D",
    CommandLine = "E",
    ContinuationStart = "F",
    ContinuationEnd = "G",
    RightPromptStart = "H",
    RightPromptEnd = "I",
    Property = "P"
}
export declare const enum VSCodeOscProperty {
    Task = "Task",
    Cwd = "Cwd"
}
export declare const enum ITermOscPt {
    SetMark = "SetMark"
}
export declare function VSCodeSequence(osc: VSCodeOscPt, data?: string | VSCodeOscProperty): string;
export declare function ITermSequence(osc: ITermOscPt, data?: string): string;
