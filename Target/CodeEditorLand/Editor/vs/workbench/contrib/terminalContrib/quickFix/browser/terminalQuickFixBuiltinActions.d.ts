import { ITerminalQuickFixInternalOptions } from './quickFix.js';
export declare const GitCommandLineRegex: RegExp;
export declare const GitFastForwardPullOutputRegex: RegExp;
export declare const GitPushCommandLineRegex: RegExp;
export declare const GitTwoDashesRegex: RegExp;
export declare const GitSimilarOutputRegex: RegExp;
export declare const FreePortOutputRegex: RegExp;
export declare const GitPushOutputRegex: RegExp;
export declare const GitCreatePrOutputRegex: RegExp;
export declare const PwshGeneralErrorOutputRegex: RegExp;
export declare const PwshUnixCommandNotFoundErrorOutputRegex: RegExp;
export declare const enum QuickFixSource {
    Builtin = "builtin"
}
export declare function gitSimilar(): ITerminalQuickFixInternalOptions;
export declare function gitFastForwardPull(): ITerminalQuickFixInternalOptions;
export declare function gitTwoDashes(): ITerminalQuickFixInternalOptions;
export declare function freePort(runCallback: (port: string, commandLine: string) => Promise<void>): ITerminalQuickFixInternalOptions;
export declare function gitPushSetUpstream(): ITerminalQuickFixInternalOptions;
export declare function gitCreatePr(): ITerminalQuickFixInternalOptions;
export declare function pwshGeneralError(): ITerminalQuickFixInternalOptions;
export declare function pwshUnixCommandNotFoundError(): ITerminalQuickFixInternalOptions;
