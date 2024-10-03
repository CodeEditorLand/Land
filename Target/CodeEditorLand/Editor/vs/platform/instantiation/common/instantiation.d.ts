import { DisposableStore } from '../../../base/common/lifecycle.js';
import * as descriptors from './descriptors.js';
import { ServiceCollection } from './serviceCollection.js';
export declare namespace _util {
    const serviceIds: Map<string, ServiceIdentifier<any>>;
    const DI_TARGET = "$di$target";
    const DI_DEPENDENCIES = "$di$dependencies";
    function getServiceDependencies(ctor: any): {
        id: ServiceIdentifier<any>;
        index: number;
    }[];
}
export type BrandedService = {
    _serviceBrand: undefined;
};
export interface IConstructorSignature<T, Args extends any[] = []> {
    new <Services extends BrandedService[]>(...args: [...Args, ...Services]): T;
}
export interface ServicesAccessor {
    get<T>(id: ServiceIdentifier<T>): T;
}
export declare const IInstantiationService: ServiceIdentifier<IInstantiationService>;
export type GetLeadingNonServiceArgs<TArgs extends any[]> = TArgs extends [] ? [] : TArgs extends [...infer TFirst, BrandedService] ? GetLeadingNonServiceArgs<TFirst> : TArgs;
export interface IInstantiationService {
    readonly _serviceBrand: undefined;
    createInstance<T>(descriptor: descriptors.SyncDescriptor0<T>): T;
    createInstance<Ctor extends new (...args: any[]) => unknown, R extends InstanceType<Ctor>>(ctor: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;
    invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R;
    createChild(services: ServiceCollection, store?: DisposableStore): IInstantiationService;
    dispose(): void;
}
export interface ServiceIdentifier<T> {
    (...args: any[]): void;
    type: T;
}
export declare function createDecorator<T>(serviceId: string): ServiceIdentifier<T>;
export declare function refineServiceDecorator<T1, T extends T1>(serviceIdentifier: ServiceIdentifier<T1>): ServiceIdentifier<T>;
