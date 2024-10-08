import { IPartsSplash } from '../../../../platform/theme/common/themeService.js';
export declare const ISplashStorageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISplashStorageService>;
export interface ISplashStorageService {
    readonly _serviceBrand: undefined;
    saveWindowSplash(splash: IPartsSplash): Promise<void>;
}
