import { SyncDescriptor } from './descriptors.js';
import { BrandedService, ServiceIdentifier } from './instantiation.js';
export declare const enum InstantiationType {
    /**
     * Instantiate this service as soon as a consumer depends on it. _Note_ that this
     * is more costly as some upfront work is done that is likely not needed
     */
    Eager = 0,
    /**
     * Instantiate this service as soon as a consumer uses it. This is the _better_
     * way of registering a service.
     */
    Delayed = 1
}
export declare function registerSingleton<T, Services extends BrandedService[]>(id: ServiceIdentifier<T>, ctor: new (...services: Services) => T, supportsDelayedInstantiation: InstantiationType): void;
export declare function registerSingleton<T, Services extends BrandedService[]>(id: ServiceIdentifier<T>, descriptor: SyncDescriptor<any>): void;
export declare function getSingletonServiceDescriptors(): [ServiceIdentifier<any>, SyncDescriptor<any>][];
