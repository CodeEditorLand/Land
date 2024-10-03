import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IExtensionRecommendationReason } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
export type GalleryExtensionRecommendation = {
    readonly extension: string;
    readonly reason: IExtensionRecommendationReason;
};
export type ResourceExtensionRecommendation = {
    readonly extension: URI;
    readonly reason: IExtensionRecommendationReason;
};
export type ExtensionRecommendation = GalleryExtensionRecommendation | ResourceExtensionRecommendation;
export declare abstract class ExtensionRecommendations extends Disposable {
    readonly abstract recommendations: ReadonlyArray<ExtensionRecommendation>;
    protected abstract doActivate(): Promise<void>;
    private _activationPromise;
    get activated(): boolean;
    activate(): Promise<void>;
}
