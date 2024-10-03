var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ArrayQueue, CompareResult } from '../../../../base/common/arrays.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { autorunOpts } from '../../../../base/common/observable.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export function setStyle(element, style) {
    Object.entries(style).forEach(([key, value]) => {
        element.style.setProperty(key, toSize(value));
    });
}
function toSize(value) {
    return typeof value === 'number' ? `${value}px` : value;
}
export function applyObservableDecorations(editor, decorations) {
    const d = new DisposableStore();
    let decorationIds = [];
    d.add(autorunOpts({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
        const d = decorations.read(reader);
        editor.changeDecorations(a => {
            decorationIds = a.deltaDecorations(decorationIds, d);
        });
    }));
    d.add({
        dispose: () => {
            editor.changeDecorations(a => {
                decorationIds = a.deltaDecorations(decorationIds, []);
            });
        }
    });
    return d;
}
export function* leftJoin(left, right, compare) {
    const rightQueue = new ArrayQueue(right);
    for (const leftElement of left) {
        rightQueue.takeWhile(rightElement => CompareResult.isGreaterThan(compare(leftElement, rightElement)));
        const equals = rightQueue.takeWhile(rightElement => CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
        yield { left: leftElement, rights: equals || [] };
    }
}
export function* join(left, right, compare) {
    const rightQueue = new ArrayQueue(right);
    for (const leftElement of left) {
        const skipped = rightQueue.takeWhile(rightElement => CompareResult.isGreaterThan(compare(leftElement, rightElement)));
        if (skipped) {
            yield { rights: skipped };
        }
        const equals = rightQueue.takeWhile(rightElement => CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
        yield { left: leftElement, rights: equals || [] };
    }
}
export function concatArrays(...arrays) {
    return [].concat(...arrays);
}
export function elementAtOrUndefined(arr, index) {
    return arr[index];
}
export function thenIfNotDisposed(promise, then) {
    let disposed = false;
    promise.then(() => {
        if (disposed) {
            return;
        }
        then();
    });
    return toDisposable(() => {
        disposed = true;
    });
}
export function setFields(obj, fields) {
    return Object.assign(obj, fields);
}
export function deepMerge(source1, source2) {
    const result = {};
    for (const key in source1) {
        result[key] = source1[key];
    }
    for (const key in source2) {
        const source2Value = source2[key];
        if (typeof result[key] === 'object' && source2Value && typeof source2Value === 'object') {
            result[key] = deepMerge(result[key], source2Value);
        }
        else {
            result[key] = source2Value;
        }
    }
    return result;
}
let PersistentStore = class PersistentStore {
    constructor(key, storageService) {
        this.key = key;
        this.storageService = storageService;
        this.hasValue = false;
        this.value = undefined;
    }
    get() {
        if (!this.hasValue) {
            const value = this.storageService.get(this.key, 0);
            if (value !== undefined) {
                try {
                    this.value = JSON.parse(value);
                }
                catch (e) {
                    onUnexpectedError(e);
                }
            }
            this.hasValue = true;
        }
        return this.value;
    }
    set(newValue) {
        this.value = newValue;
        this.storageService.store(this.key, JSON.stringify(this.value), 0, 0);
    }
};
PersistentStore = __decorate([
    __param(1, IStorageService),
    __metadata("design:paramtypes", [String, Object])
], PersistentStore);
export { PersistentStore };
