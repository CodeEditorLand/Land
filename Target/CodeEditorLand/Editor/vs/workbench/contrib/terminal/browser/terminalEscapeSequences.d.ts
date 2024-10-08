/**
 * VS Code-specific shell integration sequences. Some of these are based on common alternatives like
 * those pioneered in FinalTerm. The decision to move to entirely custom sequences was to try to
 * improve reliability and prevent the possibility of applications confusing the terminal.
 */
export declare const enum VSCodeOscPt {
    /**
     * The start of the prompt, this is expected to always appear at the start of a line.
     * Based on FinalTerm's `OSC 133 ; A ST`.
     */
    PromptStart = "A",
    /**
     * The start of a command, ie. where the user inputs their command.
     * Based on FinalTerm's `OSC 133 ; B ST`.
     */
    CommandStart = "B",
    /**
     * Sent just before the command output begins.
     * Based on FinalTerm's `OSC 133 ; C ST`.
     */
    CommandExecuted = "C",
    /**
     * Sent just after a command has finished. The exit code is optional, when not specified it
     * means no command was run (ie. enter on empty prompt or ctrl+c).
     * Based on FinalTerm's `OSC 133 ; D [; <ExitCode>] ST`.
     */
    CommandFinished = "D",
    /**
     * Explicitly set the command line. This helps workaround problems with conpty not having a
     * passthrough mode by providing an option on Windows to send the command that was run. With
     * this sequence there's no need for the guessing based on the unreliable cursor positions that
     * would otherwise be required.
     */
    CommandLine = "E",
    /**
     * Similar to prompt start but for line continuations.
     */
    ContinuationStart = "F",
    /**
     * Similar to command start but for line continuations.
     */
    ContinuationEnd = "G",
    /**
     * The start of the right prompt.
     */
    RightPromptStart = "H",
    /**
     * The end of the right prompt.
     */
    RightPromptEnd = "I",
    /**
     * Set an arbitrary property: `OSC 633 ; P ; <Property>=<Value> ST`, only known properties will
     * be handled.
     */
    Property = "P"
}
export declare const enum VSCodeOscProperty {
    Task = "Task",
    Cwd = "Cwd"
}
/**
 * ITerm sequences
 */
export declare const enum ITermOscPt {
    /**
     * Based on ITerm's `OSC 1337 ; SetMark` sets a mark on the scrollbar
     */
    SetMark = "SetMark"
}
export declare function VSCodeSequence(osc: VSCodeOscPt, data?: string | VSCodeOscProperty): string;
export declare function ITermSequence(osc: ITermOscPt, data?: string): string;
