import { DebugNameData } from './debugName.js';
import { assertFn, DisposableStore, markAsDisposed, onBugIndicatingError, toDisposable, trackDisposable } from './commonFacade/deps.js';
import { getLogger } from './logging.js';
export function autorun(fn) {
    return new AutorunObserver(new DebugNameData(undefined, undefined, fn), fn, undefined, undefined);
}
export function autorunOpts(options, fn) {
    return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, undefined, undefined);
}
export function autorunHandleChanges(options, fn) {
    return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, options.createEmptyChangeSummary, options.handleChange);
}
export function autorunWithStoreHandleChanges(options, fn) {
    const store = new DisposableStore();
    const disposable = autorunHandleChanges({
        owner: options.owner,
        debugName: options.debugName,
        debugReferenceFn: options.debugReferenceFn ?? fn,
        createEmptyChangeSummary: options.createEmptyChangeSummary,
        handleChange: options.handleChange,
    }, (reader, changeSummary) => {
        store.clear();
        fn(reader, changeSummary, store);
    });
    return toDisposable(() => {
        disposable.dispose();
        store.dispose();
    });
}
export function autorunWithStore(fn) {
    const store = new DisposableStore();
    const disposable = autorunOpts({
        owner: undefined,
        debugName: undefined,
        debugReferenceFn: fn,
    }, reader => {
        store.clear();
        fn(reader, store);
    });
    return toDisposable(() => {
        disposable.dispose();
        store.dispose();
    });
}
export function autorunDelta(observable, handler) {
    let _lastValue;
    return autorunOpts({ debugReferenceFn: handler }, (reader) => {
        const newValue = observable.read(reader);
        const lastValue = _lastValue;
        _lastValue = newValue;
        handler({ lastValue, newValue });
    });
}
export class AutorunObserver {
    get debugName() {
        return this._debugNameData.getDebugName(this) ?? '(anonymous)';
    }
    constructor(_debugNameData, _runFn, createChangeSummary, _handleChange) {
        this._debugNameData = _debugNameData;
        this._runFn = _runFn;
        this.createChangeSummary = createChangeSummary;
        this._handleChange = _handleChange;
        this.state = 2;
        this.updateCount = 0;
        this.disposed = false;
        this.dependencies = new Set();
        this.dependenciesToBeRemoved = new Set();
        this.changeSummary = this.createChangeSummary?.();
        getLogger()?.handleAutorunCreated(this);
        this._runIfNeeded();
        trackDisposable(this);
    }
    dispose() {
        this.disposed = true;
        for (const o of this.dependencies) {
            o.removeObserver(this);
        }
        this.dependencies.clear();
        markAsDisposed(this);
    }
    _runIfNeeded() {
        if (this.state === 3) {
            return;
        }
        const emptySet = this.dependenciesToBeRemoved;
        this.dependenciesToBeRemoved = this.dependencies;
        this.dependencies = emptySet;
        this.state = 3;
        const isDisposed = this.disposed;
        try {
            if (!isDisposed) {
                getLogger()?.handleAutorunTriggered(this);
                const changeSummary = this.changeSummary;
                try {
                    this.changeSummary = this.createChangeSummary?.();
                    this._runFn(this, changeSummary);
                }
                catch (e) {
                    onBugIndicatingError(e);
                }
            }
        }
        finally {
            if (!isDisposed) {
                getLogger()?.handleAutorunFinished(this);
            }
            for (const o of this.dependenciesToBeRemoved) {
                o.removeObserver(this);
            }
            this.dependenciesToBeRemoved.clear();
        }
    }
    toString() {
        return `Autorun<${this.debugName}>`;
    }
    beginUpdate() {
        if (this.state === 3) {
            this.state = 1;
        }
        this.updateCount++;
    }
    endUpdate() {
        try {
            if (this.updateCount === 1) {
                do {
                    if (this.state === 1) {
                        this.state = 3;
                        for (const d of this.dependencies) {
                            d.reportChanges();
                            if (this.state === 2) {
                                break;
                            }
                        }
                    }
                    this._runIfNeeded();
                } while (this.state !== 3);
            }
        }
        finally {
            this.updateCount--;
        }
        assertFn(() => this.updateCount >= 0);
    }
    handlePossibleChange(observable) {
        if (this.state === 3 && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
            this.state = 1;
        }
    }
    handleChange(observable, change) {
        if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
            try {
                const shouldReact = this._handleChange ? this._handleChange({
                    changedObservable: observable,
                    change,
                    didChange: (o) => o === observable,
                }, this.changeSummary) : true;
                if (shouldReact) {
                    this.state = 2;
                }
            }
            catch (e) {
                onBugIndicatingError(e);
            }
        }
    }
    readObservable(observable) {
        if (this.disposed) {
            return observable.get();
        }
        observable.addObserver(this);
        const value = observable.get();
        this.dependencies.add(observable);
        this.dependenciesToBeRemoved.delete(observable);
        return value;
    }
}
(function (autorun) {
    autorun.Observer = AutorunObserver;
})(autorun || (autorun = {}));
