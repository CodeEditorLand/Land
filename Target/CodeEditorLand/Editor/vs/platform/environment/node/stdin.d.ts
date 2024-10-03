export declare function hasStdinWithoutTty(): boolean;
export declare function stdinDataListener(durationinMs: number): Promise<boolean>;
export declare function getStdinFilePath(): string;
export declare function readFromStdin(targetPath: string, verbose: boolean, onEnd?: Function): Promise<void>;
