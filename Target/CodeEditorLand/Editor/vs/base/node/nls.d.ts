import type { INLSConfiguration } from '../../nls.js';
export interface IResolveNLSConfigurationContext {
    readonly nlsMetadataPath: string;
    readonly userDataPath: string;
    readonly commit: string | undefined;
    readonly userLocale: string;
    readonly osLocale: string;
}
export declare function resolveNLSConfiguration({ userLocale, osLocale, userDataPath, commit, nlsMetadataPath }: IResolveNLSConfigurationContext): Promise<INLSConfiguration>;
