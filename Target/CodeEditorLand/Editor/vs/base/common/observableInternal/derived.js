import { BaseObservable, _setDerivedOpts, } from './base.js';
import { DebugNameData } from './debugName.js';
import { DisposableStore, assertFn, onBugIndicatingError, strictEquals } from './commonFacade/deps.js';
import { getLogger } from './logging.js';
export function derived(computeFnOrOwner, computeFn) {
    if (computeFn !== undefined) {
        return new Derived(new DebugNameData(computeFnOrOwner, undefined, computeFn), computeFn, undefined, undefined, undefined, strictEquals);
    }
    return new Derived(new DebugNameData(undefined, undefined, computeFnOrOwner), computeFnOrOwner, undefined, undefined, undefined, strictEquals);
}
export function derivedWithSetter(owner, computeFn, setter) {
    return new DerivedWithSetter(new DebugNameData(owner, undefined, computeFn), computeFn, undefined, undefined, undefined, strictEquals, setter);
}
export function derivedOpts(options, computeFn) {
    return new Derived(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn), computeFn, undefined, undefined, options.onLastObserverRemoved, options.equalsFn ?? strictEquals);
}
_setDerivedOpts(derivedOpts);
export function derivedHandleChanges(options, computeFn) {
    return new Derived(new DebugNameData(options.owner, options.debugName, undefined), computeFn, options.createEmptyChangeSummary, options.handleChange, undefined, options.equalityComparer ?? strictEquals);
}
export function derivedWithStore(computeFnOrOwner, computeFnOrUndefined) {
    let computeFn;
    let owner;
    if (computeFnOrUndefined === undefined) {
        computeFn = computeFnOrOwner;
        owner = undefined;
    }
    else {
        owner = computeFnOrOwner;
        computeFn = computeFnOrUndefined;
    }
    const store = new DisposableStore();
    return new Derived(new DebugNameData(owner, undefined, computeFn), r => {
        store.clear();
        return computeFn(r, store);
    }, undefined, undefined, () => store.dispose(), strictEquals);
}
export function derivedDisposable(computeFnOrOwner, computeFnOrUndefined) {
    let computeFn;
    let owner;
    if (computeFnOrUndefined === undefined) {
        computeFn = computeFnOrOwner;
        owner = undefined;
    }
    else {
        owner = computeFnOrOwner;
        computeFn = computeFnOrUndefined;
    }
    let store = undefined;
    return new Derived(new DebugNameData(owner, undefined, computeFn), r => {
        if (!store) {
            store = new DisposableStore();
        }
        else {
            store.clear();
        }
        const result = computeFn(r);
        if (result) {
            store.add(result);
        }
        return result;
    }, undefined, undefined, () => {
        if (store) {
            store.dispose();
            store = undefined;
        }
    }, strictEquals);
}
export class Derived extends BaseObservable {
    get debugName() {
        return this._debugNameData.getDebugName(this) ?? '(anonymous)';
    }
    constructor(_debugNameData, _computeFn, createChangeSummary, _handleChange, _handleLastObserverRemoved = undefined, _equalityComparator) {
        super();
        this._debugNameData = _debugNameData;
        this._computeFn = _computeFn;
        this.createChangeSummary = createChangeSummary;
        this._handleChange = _handleChange;
        this._handleLastObserverRemoved = _handleLastObserverRemoved;
        this._equalityComparator = _equalityComparator;
        this.state = 0;
        this.value = undefined;
        this.updateCount = 0;
        this.dependencies = new Set();
        this.dependenciesToBeRemoved = new Set();
        this.changeSummary = undefined;
        this.changeSummary = this.createChangeSummary?.();
        getLogger()?.handleDerivedCreated(this);
    }
    onLastObserverRemoved() {
        this.state = 0;
        this.value = undefined;
        for (const d of this.dependencies) {
            d.removeObserver(this);
        }
        this.dependencies.clear();
        this._handleLastObserverRemoved?.();
    }
    get() {
        if (this.observers.size === 0) {
            const result = this._computeFn(this, this.createChangeSummary?.());
            this.onLastObserverRemoved();
            return result;
        }
        else {
            do {
                if (this.state === 1) {
                    for (const d of this.dependencies) {
                        d.reportChanges();
                        if (this.state === 2) {
                            break;
                        }
                    }
                }
                if (this.state === 1) {
                    this.state = 3;
                }
                this._recomputeIfNeeded();
            } while (this.state !== 3);
            return this.value;
        }
    }
    _recomputeIfNeeded() {
        if (this.state === 3) {
            return;
        }
        const emptySet = this.dependenciesToBeRemoved;
        this.dependenciesToBeRemoved = this.dependencies;
        this.dependencies = emptySet;
        const hadValue = this.state !== 0;
        const oldValue = this.value;
        this.state = 3;
        let didChange = false;
        try {
            const changeSummary = this.changeSummary;
            this.changeSummary = this.createChangeSummary?.();
            try {
                this.value = this._computeFn(this, changeSummary);
            }
            finally {
                for (const o of this.dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this.dependenciesToBeRemoved.clear();
            }
            didChange = hadValue && !(this._equalityComparator(oldValue, this.value));
            getLogger()?.handleDerivedRecomputed(this, {
                oldValue,
                newValue: this.value,
                change: undefined,
                didChange,
                hadValue,
            });
        }
        catch (e) {
            onBugIndicatingError(e);
        }
        if (didChange) {
            for (const r of this.observers) {
                r.handleChange(this, undefined);
            }
        }
    }
    toString() {
        return `LazyDerived<${this.debugName}>`;
    }
    beginUpdate(_observable) {
        this.updateCount++;
        const propagateBeginUpdate = this.updateCount === 1;
        if (this.state === 3) {
            this.state = 1;
            if (!propagateBeginUpdate) {
                for (const r of this.observers) {
                    r.handlePossibleChange(this);
                }
            }
        }
        if (propagateBeginUpdate) {
            for (const r of this.observers) {
                r.beginUpdate(this);
            }
        }
    }
    endUpdate(_observable) {
        this.updateCount--;
        if (this.updateCount === 0) {
            const observers = [...this.observers];
            for (const r of observers) {
                r.endUpdate(this);
            }
        }
        assertFn(() => this.updateCount >= 0);
    }
    handlePossibleChange(observable) {
        if (this.state === 3 && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
            this.state = 1;
            for (const r of this.observers) {
                r.handlePossibleChange(this);
            }
        }
    }
    handleChange(observable, change) {
        if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
            let shouldReact = false;
            try {
                shouldReact = this._handleChange ? this._handleChange({
                    changedObservable: observable,
                    change,
                    didChange: (o) => o === observable,
                }, this.changeSummary) : true;
            }
            catch (e) {
                onBugIndicatingError(e);
            }
            const wasUpToDate = this.state === 3;
            if (shouldReact && (this.state === 1 || wasUpToDate)) {
                this.state = 2;
                if (wasUpToDate) {
                    for (const r of this.observers) {
                        r.handlePossibleChange(this);
                    }
                }
            }
        }
    }
    readObservable(observable) {
        observable.addObserver(this);
        const value = observable.get();
        this.dependencies.add(observable);
        this.dependenciesToBeRemoved.delete(observable);
        return value;
    }
    addObserver(observer) {
        const shouldCallBeginUpdate = !this.observers.has(observer) && this.updateCount > 0;
        super.addObserver(observer);
        if (shouldCallBeginUpdate) {
            observer.beginUpdate(this);
        }
    }
    removeObserver(observer) {
        const shouldCallEndUpdate = this.observers.has(observer) && this.updateCount > 0;
        super.removeObserver(observer);
        if (shouldCallEndUpdate) {
            observer.endUpdate(this);
        }
    }
}
export class DerivedWithSetter extends Derived {
    constructor(debugNameData, computeFn, createChangeSummary, handleChange, handleLastObserverRemoved = undefined, equalityComparator, set) {
        super(debugNameData, computeFn, createChangeSummary, handleChange, handleLastObserverRemoved, equalityComparator);
        this.set = set;
    }
}
