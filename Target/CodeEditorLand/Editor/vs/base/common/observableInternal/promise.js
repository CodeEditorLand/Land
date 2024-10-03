import { observableValue, transaction } from './base.js';
import { derived } from './derived.js';
export class ObservableLazy {
    get cachedValue() { return this._value; }
    constructor(_computeValue) {
        this._computeValue = _computeValue;
        this._value = observableValue(this, undefined);
    }
    getValue() {
        let v = this._value.get();
        if (!v) {
            v = this._computeValue();
            this._value.set(v, undefined);
        }
        return v;
    }
}
export class ObservablePromise {
    static fromFn(fn) {
        return new ObservablePromise(fn());
    }
    constructor(promise) {
        this._value = observableValue(this, undefined);
        this.promiseResult = this._value;
        this.promise = promise.then(value => {
            transaction(tx => {
                this._value.set(new PromiseResult(value, undefined), tx);
            });
            return value;
        }, error => {
            transaction(tx => {
                this._value.set(new PromiseResult(undefined, error), tx);
            });
            throw error;
        });
    }
}
export class PromiseResult {
    constructor(data, error) {
        this.data = data;
        this.error = error;
    }
    getDataOrThrow() {
        if (this.error) {
            throw this.error;
        }
        return this.data;
    }
}
export class ObservableLazyPromise {
    constructor(_computePromise) {
        this._computePromise = _computePromise;
        this._lazyValue = new ObservableLazy(() => new ObservablePromise(this._computePromise()));
        this.cachedPromiseResult = derived(this, reader => this._lazyValue.cachedValue.read(reader)?.promiseResult.read(reader));
    }
    getPromise() {
        return this._lazyValue.getValue().promise;
    }
}
