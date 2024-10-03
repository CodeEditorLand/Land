import { OperatingSystem } from './platform.js';
import { URI } from './uri.js';
export interface IPathLabelFormatting {
    readonly os: OperatingSystem;
    readonly tildify?: IUserHomeProvider;
    readonly relative?: IRelativePathProvider;
}
export interface IRelativePathProvider {
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
export declare function template(template: string, values?: {
    [key: string]: string | ISeparator | undefined | null;
}): string;
export declare function mnemonicMenuLabel(label: string, forceDisableMnemonics?: boolean): string;
export declare function mnemonicButtonLabel(label: string, forceDisableMnemonics?: boolean): string;
export declare function unmnemonicLabel(label: string): string;
export declare function splitRecentLabel(recentLabel: string): {
    name: string;
    parentPath: string;
};
