export interface IPowerShellExeDetails {
    readonly displayName: string;
    readonly exePath: string;
}
/**
 * Iterates through PowerShell installations on the machine according
 * to configuration passed in through the constructor.
 * PowerShell items returned by this object are verified
 * to exist on the filesystem.
 */
export declare function enumeratePowerShellInstallations(): AsyncIterable<IPowerShellExeDetails>;
/**
* Returns the first available PowerShell executable found in the search order.
*/
export declare function getFirstAvailablePowerShellInstallation(): Promise<IPowerShellExeDetails | null>;
