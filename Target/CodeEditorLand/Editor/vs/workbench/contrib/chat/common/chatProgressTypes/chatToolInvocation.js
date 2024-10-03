import { DeferredPromise } from '../../../../../base/common/async.js';
export class ChatToolInvocation {
    get isComplete() {
        return this._isComplete;
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
        this._confirmDeferred = new DeferredPromise();
        if (!_confirmationMessages) {
            this._isConfirmed = true;
            this._confirmDeferred.complete(true);
        }
        this._confirmDeferred.p.then(confirmed => {
            this._isConfirmed = confirmed;
            this._confirmationMessages = undefined;
            if (!confirmed) {
                this.complete();
            }
        });
    }
    complete() {
        if (this._isComplete) {
            throw new Error('Invocation is already complete.');
        }
        this._isComplete = true;
    }
    get confirmationMessages() {
        return this._confirmationMessages;
    }
    toJSON() {
        return {
            kind: 'toolInvocationSerialized',
            invocationMessage: this.invocationMessage,
            isConfirmed: this._isConfirmed ?? false
        };
    }
}
