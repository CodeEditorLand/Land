import { IDisposable } from '../../../base/common/lifecycle.js';
import { IObservable } from '../../../base/common/observable.js';
import { BrandedService, GetLeadingNonServiceArgs } from '../../instantiation/common/instantiation.js';
export declare function hotClassGetOriginalInstance<T>(value: T): T;
/**
 * Wrap a class in a reloadable wrapper.
 * When the wrapper is created, the original class is created.
 * When the original class changes, the instance is re-created.
*/
export declare function wrapInHotClass0<TArgs extends BrandedService[]>(clazz: IObservable<Result<TArgs>>): Result<GetLeadingNonServiceArgs<TArgs>>;
type Result<TArgs extends any[]> = new (...args: TArgs) => IDisposable;
/**
 * Wrap a class in a reloadable wrapper.
 * When the wrapper is created, the original class is created.
 * When the original class changes, the instance is re-created.
*/
export declare function wrapInHotClass1<TArgs extends [any, ...BrandedService[]]>(clazz: IObservable<Result<TArgs>>): Result<GetLeadingNonServiceArgs<TArgs>>;
export {};
