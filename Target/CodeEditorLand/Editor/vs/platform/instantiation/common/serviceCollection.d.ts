import { ServiceIdentifier } from './instantiation.js';
import { SyncDescriptor } from './descriptors.js';
export declare class ServiceCollection {
    private _entries;
    constructor(...entries: [ServiceIdentifier<any>, any][]);
    set<T>(id: ServiceIdentifier<T>, instanceOrDescriptor: T | SyncDescriptor<T>): T | SyncDescriptor<T>;
    has(id: ServiceIdentifier<any>): boolean;
    get<T>(id: ServiceIdentifier<T>): T | SyncDescriptor<T>;
}
