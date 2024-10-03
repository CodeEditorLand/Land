import { IDisposable } from '../../../base/common/lifecycle.js';
import { BrandedService, GetLeadingNonServiceArgs } from '../../instantiation/common/instantiation.js';
export declare function wrapInReloadableClass0<TArgs extends BrandedService[]>(getClass: () => Result<TArgs>): Result<GetLeadingNonServiceArgs<TArgs>>;
type Result<TArgs extends any[]> = new (...args: TArgs) => IDisposable;
export declare function wrapInReloadableClass1<TArgs extends [any, ...BrandedService[]]>(getClass: () => Result<TArgs>): Result<GetLeadingNonServiceArgs<TArgs>>;
export {};
