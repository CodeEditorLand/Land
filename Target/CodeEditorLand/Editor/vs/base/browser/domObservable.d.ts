import { IDisposable } from '../common/lifecycle.js';
import { IObservable } from '../common/observable.js';
export declare function createStyleSheetFromObservable(css: IObservable<string>): IDisposable;
