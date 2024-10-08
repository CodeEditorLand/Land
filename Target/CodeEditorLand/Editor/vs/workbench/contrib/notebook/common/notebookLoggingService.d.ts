export declare const INotebookLoggingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookLoggingService>;
export interface INotebookLoggingService {
    readonly _serviceBrand: undefined;
    info(category: string, output: string): void;
    warn(category: string, output: string): void;
    error(category: string, output: string): void;
    debug(category: string, output: string): void;
}
