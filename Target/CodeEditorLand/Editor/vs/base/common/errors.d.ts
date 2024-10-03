export interface ErrorListenerCallback {
    (error: any): void;
}
export interface ErrorListenerUnbind {
    (): void;
}
export declare class ErrorHandler {
    private unexpectedErrorHandler;
    private listeners;
    constructor();
    addListener(listener: ErrorListenerCallback): ErrorListenerUnbind;
    private emit;
    private _removeListener;
    setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
    getUnexpectedErrorHandler(): (e: any) => void;
    onUnexpectedError(e: any): void;
    onUnexpectedExternalError(e: any): void;
}
export declare const errorHandler: ErrorHandler;
export declare function setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
export declare function isSigPipeError(e: unknown): e is Error;
export declare function onBugIndicatingError(e: any): undefined;
export declare function onUnexpectedError(e: any): undefined;
export declare function onUnexpectedExternalError(e: any): undefined;
export interface SerializedError {
    readonly $isError: true;
    readonly name: string;
    readonly message: string;
    readonly stack: string;
    readonly noTelemetry: boolean;
}
export declare function transformErrorForSerialization(error: Error): SerializedError;
export declare function transformErrorForSerialization(error: any): any;
export declare function transformErrorFromSerialization(data: SerializedError): Error;
export interface V8CallSite {
    getThis(): unknown;
    getTypeName(): string | null;
    getFunction(): Function | undefined;
    getFunctionName(): string | null;
    getMethodName(): string | null;
    getFileName(): string | null;
    getLineNumber(): number | null;
    getColumnNumber(): number | null;
    getEvalOrigin(): string | undefined;
    isToplevel(): boolean;
    isEval(): boolean;
    isNative(): boolean;
    isConstructor(): boolean;
    toString(): string;
}
export declare function isCancellationError(error: any): boolean;
export declare class CancellationError extends Error {
    constructor();
}
export declare function canceled(): Error;
export declare function illegalArgument(name?: string): Error;
export declare function illegalState(name?: string): Error;
export declare class ReadonlyError extends TypeError {
    constructor(name?: string);
}
export declare function getErrorMessage(err: any): string;
export declare class NotImplementedError extends Error {
    constructor(message?: string);
}
export declare class NotSupportedError extends Error {
    constructor(message?: string);
}
export declare class ExpectedError extends Error {
    readonly isExpected = true;
}
export declare class ErrorNoTelemetry extends Error {
    readonly name: string;
    constructor(msg?: string);
    static fromError(err: Error): ErrorNoTelemetry;
    static isErrorNoTelemetry(err: Error): err is ErrorNoTelemetry;
}
export declare class BugIndicatingError extends Error {
    constructor(message?: string);
}
