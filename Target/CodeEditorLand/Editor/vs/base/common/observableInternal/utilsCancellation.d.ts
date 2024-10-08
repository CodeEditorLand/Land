import { IReader, IObservable } from './base.js';
import { CancellationToken } from './commonFacade/cancellation.js';
/**
 * Resolves the promise when the observables state matches the predicate.
 */
export declare function waitForState<T>(observable: IObservable<T | null | undefined>): Promise<T>;
export declare function waitForState<T, TState extends T>(observable: IObservable<T>, predicate: (state: T) => state is TState, isError?: (state: T) => boolean | unknown | undefined, cancellationToken?: CancellationToken): Promise<TState>;
export declare function waitForState<T>(observable: IObservable<T>, predicate: (state: T) => boolean, isError?: (state: T) => boolean | unknown | undefined, cancellationToken?: CancellationToken): Promise<T>;
export declare function derivedWithCancellationToken<T>(computeFn: (reader: IReader, cancellationToken: CancellationToken) => T): IObservable<T>;
export declare function derivedWithCancellationToken<T>(owner: object, computeFn: (reader: IReader, cancellationToken: CancellationToken) => T): IObservable<T>;
