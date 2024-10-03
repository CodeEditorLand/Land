import { SyncDescriptor } from './descriptors.js';
import { BrandedService, ServiceIdentifier } from './instantiation.js';
export declare const enum InstantiationType {
    Eager = 0,
    Delayed = 1
}
export declare function registerSingleton<T, Services extends BrandedService[]>(id: ServiceIdentifier<T>, ctor: new (...services: Services) => T, supportsDelayedInstantiation: InstantiationType): void;
export declare function registerSingleton<T, Services extends BrandedService[]>(id: ServiceIdentifier<T>, descriptor: SyncDescriptor<any>): void;
export declare function getSingletonServiceDescriptors(): [ServiceIdentifier<any>, SyncDescriptor<any>][];
