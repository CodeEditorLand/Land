/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { DeferredPromise } from '../../../../../base/common/async.js';
export class ChatToolInvocation {
    get isComplete() {
        return this._isComplete;
    }
    get isCompleteDeferred() {
        return this._isCompleteDeferred;
    }
    get isCanceled() {
        return this._isCanceled;
    }
    get confirmed() {
        return this._confirmDeferred;
    }
    get isConfirmed() {
        return this._isConfirmed;
    }
    constructor(invocationMessage, _confirmationMessages) {
        this.invocationMessage = invocationMessage;
        this._confirmationMessages = _confirmationMessages;
        this.kind = 'toolInvocation';
        this._isComplete = false;
        this._isCompleteDeferred = new DeferredPromise();
        this._confirmDeferred = new DeferredPromise();
        if (!_confirmationMessages) {
            // No confirmation needed
            this._isConfirmed = true;
            this._confirmDeferred.complete(true);
        }
        this._confirmDeferred.p.then(confirmed => {
            this._isConfirmed = confirmed;
            this._confirmationMessages = undefined;
            if (!confirmed) {
                // Spinner -> check
                this._isCompleteDeferred.complete();
            }
        });
        this._isCompleteDeferred.p.then(() => {
            this._isComplete = true;
        });
    }
    get confirmationMessages() {
        return this._confirmationMessages;
    }
    toJSON() {
        return {
            kind: 'toolInvocationSerialized',
            invocationMessage: this.invocationMessage,
            isConfirmed: this._isConfirmed ?? false,
            isComplete: this._isComplete,
        };
    }
}
