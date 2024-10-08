import { OperatingSystem } from './platform.js';
import { URI } from './uri.js';
export interface IPathLabelFormatting {
    /**
     * The OS the path label is from to produce a label
     * that matches OS expectations.
     */
    readonly os: OperatingSystem;
    /**
     * Whether to add a `~` when the path is in the
     * user home directory.
     *
     * Note: this only applies to Linux, macOS but not
     * Windows.
     */
    readonly tildify?: IUserHomeProvider;
    /**
     * Whether to convert to a relative path if the path
     * is within any of the opened workspace folders.
     */
    readonly relative?: IRelativePathProvider;
}
export interface IRelativePathProvider {
    /**
     * Whether to not add a prefix when in multi-root workspace.
     */
    readonly noPrefix?: boolean;
    getWorkspace(): {
        folders: {
            uri: URI;
            name?: string;
        }[];
    };
    getWorkspaceFolder(resource: URI): {
        uri: URI;
        name?: string;
    } | null;
}
export interface IUserHomeProvider {
    userHome: URI;
}
export declare function getPathLabel(resource: URI, formatting: IPathLabelFormatting): string;
export declare function normalizeDriveLetter(path: string, isWindowsOS?: boolean): string;
export declare function tildify(path: string, userHome: string, os?: OperatingSystem): string;
export declare function untildify(path: string, userHome: string): string;
export declare function shorten(paths: string[], pathSeparator?: string): string[];
export interface ISeparator {
    label: string;
}
/**
 * Helper to insert values for specific template variables into the string. E.g. "this $(is) a $(template)" can be
 * passed to this function together with an object that maps "is" and "template" to strings to have them replaced.
 * @param value string to which template is applied
 * @param values the values of the templates to use
 */
export declare function template(template: string, values?: {
    [key: string]: string | ISeparator | undefined | null;
}): string;
/**
 * Handles mnemonics for menu items. Depending on OS:
 * - Windows: Supported via & character (replace && with &)
 * -   Linux: Supported via & character (replace && with &)
 * -   macOS: Unsupported (replace && with empty string)
 */
export declare function mnemonicMenuLabel(label: string, forceDisableMnemonics?: boolean): string;
/**
 * Handles mnemonics for buttons. Depending on OS:
 * - Windows: Supported via & character (replace && with & and & with && for escaping)
 * -   Linux: Supported via _ character (replace && with _)
 * -   macOS: Unsupported (replace && with empty string)
 */
export declare function mnemonicButtonLabel(label: string, forceDisableMnemonics?: boolean): string;
export declare function unmnemonicLabel(label: string): string;
/**
 * Splits a recent label in name and parent path, supporting both '/' and '\' and workspace suffixes.
 * If the location is remote, the remote name is included in the name part.
 */
export declare function splitRecentLabel(recentLabel: string): {
    name: string;
    parentPath: string;
};
