import { BrandedService, IConstructorSignature } from '../../platform/instantiation/common/instantiation.js';
/**
 * A feature that will be loaded when the first code editor is constructed and disposed when the system shuts down.
 */
export interface IEditorFeature {
}
export type EditorFeatureCtor = IConstructorSignature<IEditorFeature>;
/**
 * Registers an editor feature. Editor features will be instantiated only once, as soon as
 * the first code editor is instantiated.
 */
export declare function registerEditorFeature<Services extends BrandedService[]>(ctor: {
    new (...services: Services): IEditorFeature;
}): void;
export declare function getEditorFeatures(): Iterable<EditorFeatureCtor>;
