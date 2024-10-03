import { BrandedService, IConstructorSignature } from '../../platform/instantiation/common/instantiation.js';
export interface IEditorFeature {
}
export type EditorFeatureCtor = IConstructorSignature<IEditorFeature>;
export declare function registerEditorFeature<Services extends BrandedService[]>(ctor: {
    new (...services: Services): IEditorFeature;
}): void;
export declare function getEditorFeatures(): Iterable<EditorFeatureCtor>;
