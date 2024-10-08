/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ProgressLocation } from './extHostTypeConverters.js';
import { Progress } from '../../../platform/progress/common/progress.js';
import { CancellationTokenSource, CancellationToken } from '../../../base/common/cancellation.js';
import { throttle } from '../../../base/common/decorators.js';
import { onUnexpectedExternalError } from '../../../base/common/errors.js';
export class ExtHostProgress {
    constructor(proxy) {
        this._handles = 0;
        this._mapHandleToCancellationSource = new Map();
        this._proxy = proxy;
    }
    async withProgress(extension, options, task) {
        const handle = this._handles++;
        const { title, location, cancellable } = options;
        const source = { label: extension.displayName || extension.name, id: extension.identifier.value };
        this._proxy.$startProgress(handle, { location: ProgressLocation.from(location), title, source, cancellable }, !extension.isUnderDevelopment ? extension.identifier.value : undefined).catch(onUnexpectedExternalError);
        return this._withProgress(handle, task, !!cancellable);
    }
    _withProgress(handle, task, cancellable) {
        let source;
        if (cancellable) {
            source = new CancellationTokenSource();
            this._mapHandleToCancellationSource.set(handle, source);
        }
        const progressEnd = (handle) => {
            this._proxy.$progressEnd(handle);
            this._mapHandleToCancellationSource.delete(handle);
            source?.dispose();
        };
        let p;
        try {
            p = task(new ProgressCallback(this._proxy, handle), cancellable && source ? source.token : CancellationToken.None);
        }
        catch (err) {
            progressEnd(handle);
            throw err;
        }
        p.then(result => progressEnd(handle), err => progressEnd(handle));
        return p;
    }
    $acceptProgressCanceled(handle) {
        const source = this._mapHandleToCancellationSource.get(handle);
        if (source) {
            source.cancel();
            this._mapHandleToCancellationSource.delete(handle);
        }
    }
}
function mergeProgress(result, currentValue) {
    result.message = currentValue.message;
    if (typeof currentValue.increment === 'number') {
        if (typeof result.increment === 'number') {
            result.increment += currentValue.increment;
        }
        else {
            result.increment = currentValue.increment;
        }
    }
    return result;
}
class ProgressCallback extends Progress {
    constructor(_proxy, _handle) {
        super(p => this.throttledReport(p));
        this._proxy = _proxy;
        this._handle = _handle;
    }
    throttledReport(p) {
        this._proxy.$progressReport(this._handle, p);
    }
}
__decorate([
    throttle(100, (result, currentValue) => mergeProgress(result, currentValue), () => Object.create(null)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressCallback.prototype, "throttledReport", null);
