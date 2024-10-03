export declare const LANGUAGE_DEFAULT = "en";
export interface IProcessEnvironment {
    [key: string]: string | undefined;
}
export interface INodeProcess {
    platform: string;
    arch: string;
    env: IProcessEnvironment;
    versions?: {
        node?: string;
        electron?: string;
        chrome?: string;
    };
    type?: string;
    cwd: () => string;
}
export declare const enum Platform {
    Web = 0,
    Mac = 1,
    Linux = 2,
    Windows = 3
}
export type PlatformName = 'Web' | 'Windows' | 'Mac' | 'Linux';
export declare function PlatformToString(platform: Platform): PlatformName;
export declare const isWindows: boolean;
export declare const isMacintosh: boolean;
export declare const isLinux: boolean;
export declare const isLinuxSnap: boolean;
export declare const isNative: boolean;
export declare const isElectron: boolean;
export declare const isWeb: boolean;
export declare const isWebWorker: boolean;
export declare const webWorkerOrigin: any;
export declare const isIOS: boolean;
export declare const isMobile: boolean;
export declare const isCI: boolean;
export declare const platform: Platform;
export declare const userAgent: string | undefined;
export declare const language: string;
export declare namespace Language {
    function value(): string;
    function isDefaultVariant(): boolean;
    function isDefault(): boolean;
}
export declare const locale: string | undefined;
export declare const platformLocale: string;
export declare const translationsConfigFile: string | undefined;
export declare const setTimeout0IsFaster: boolean;
export declare const setTimeout0: (callback: () => void) => void;
export declare const enum OperatingSystem {
    Windows = 1,
    Macintosh = 2,
    Linux = 3
}
export declare const OS: OperatingSystem;
export declare function isLittleEndian(): boolean;
export declare const isChrome: boolean;
export declare const isFirefox: boolean;
export declare const isSafari: boolean;
export declare const isEdge: boolean;
export declare const isAndroid: boolean;
export declare function isBigSurOrNewer(osVersion: string): boolean;
