import { IDisposable } from '../../../base/common/lifecycle.js';
import { BrandedService, GetLeadingNonServiceArgs } from '../../instantiation/common/instantiation.js';
/**
 * Wrap a class in a reloadable wrapper.
 * When the wrapper is created, the original class is created.
 * When the original class changes, the instance is re-created.
*/
export declare function wrapInReloadableClass0<TArgs extends BrandedService[]>(getClass: () => Result<TArgs>): Result<GetLeadingNonServiceArgs<TArgs>>;
type Result<TArgs extends any[]> = new (...args: TArgs) => IDisposable;
/**
 * Wrap a class in a reloadable wrapper.
 * When the wrapper is created, the original class is created.
 * When the original class changes, the instance is re-created.
*/
export declare function wrapInReloadableClass1<TArgs extends [any, ...BrandedService[]]>(getClass: () => Result<TArgs>): Result<GetLeadingNonServiceArgs<TArgs>>;
export {};
