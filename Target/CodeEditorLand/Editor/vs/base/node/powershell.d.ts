export interface IPowerShellExeDetails {
    readonly displayName: string;
    readonly exePath: string;
}
export declare function enumeratePowerShellInstallations(): AsyncIterable<IPowerShellExeDetails>;
export declare function getFirstAvailablePowerShellInstallation(): Promise<IPowerShellExeDetails | null>;
