export declare function hasChildProcesses(processId: number | undefined): Promise<boolean>;
export declare function prepareCommand(shell: string, args: string[], argsCanBeInterpretedByShell: boolean, cwd?: string, env?: {
    [key: string]: string | null;
}): string;
