import { IDisposable } from '../../../base/common/lifecycle.js';
import { IObservable, IReader } from '../../../base/common/observable.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ContextKeyValue, IContextKeyService, RawContextKey } from '../../contextkey/common/contextkey.js';
/** Creates an observable update when a configuration key updates. */
export declare function observableConfigValue<T>(key: string, defaultValue: T, configurationService: IConfigurationService): IObservable<T>;
/** Update the configuration key with a value derived from observables. */
export declare function bindContextKey<T extends ContextKeyValue>(key: RawContextKey<T>, service: IContextKeyService, computeValue: (reader: IReader) => T): IDisposable;
