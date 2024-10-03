import { ISettableObservable } from './base.js';
import { IDebugNameData } from './debugName.js';
import { EqualityComparer } from './commonFacade/deps.js';
export declare function observableValueOpts<T, TChange = void>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
    lazy?: boolean;
}, initialValue: T): ISettableObservable<T, TChange>;
