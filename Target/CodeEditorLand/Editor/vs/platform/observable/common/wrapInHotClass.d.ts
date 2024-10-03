import { IDisposable } from '../../../base/common/lifecycle.js';
import { IObservable } from '../../../base/common/observable.js';
import { BrandedService, GetLeadingNonServiceArgs } from '../../instantiation/common/instantiation.js';
export declare function hotClassGetOriginalInstance<T>(value: T): T;
export declare function wrapInHotClass0<TArgs extends BrandedService[]>(clazz: IObservable<Result<TArgs>>): Result<GetLeadingNonServiceArgs<TArgs>>;
type Result<TArgs extends any[]> = new (...args: TArgs) => IDisposable;
export declare function wrapInHotClass1<TArgs extends [any, ...BrandedService[]]>(clazz: IObservable<Result<TArgs>>): Result<GetLeadingNonServiceArgs<TArgs>>;
export {};
