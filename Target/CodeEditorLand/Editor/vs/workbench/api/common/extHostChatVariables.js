import { onUnexpectedExternalError } from '../../../base/common/errors.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { MainContext } from './extHost.protocol.js';
import * as typeConvert from './extHostTypeConverters.js';
import * as extHostTypes from './extHostTypes.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
export class ExtHostChatVariables {
    static { this._idPool = 0; }
    constructor(mainContext) {
        this._resolver = new Map();
        this._proxy = mainContext.getProxy(MainContext.MainThreadChatVariables);
    }
    async $resolveVariable(handle, requestId, messageText, token) {
        const item = this._resolver.get(handle);
        if (!item) {
            return undefined;
        }
        try {
            if (item.resolver.resolve2) {
                checkProposedApiEnabled(item.extension, 'chatParticipantAdditions');
                const stream = new ChatVariableResolverResponseStream(requestId, this._proxy);
                const value = await item.resolver.resolve2(item.data.name, { prompt: messageText }, stream.apiObject, token);
                if (value && value[0]) {
                    return value[0].value;
                }
            }
            else {
                const value = await item.resolver.resolve(item.data.name, { prompt: messageText }, token);
                if (value && value[0]) {
                    return value[0].value;
                }
            }
        }
        catch (err) {
            onUnexpectedExternalError(err);
        }
        return undefined;
    }
    registerVariableResolver(extension, id, name, userDescription, modelDescription, isSlow, resolver, fullName, themeIconId) {
        const handle = ExtHostChatVariables._idPool++;
        const icon = themeIconId ? ThemeIcon.fromId(themeIconId) : undefined;
        this._resolver.set(handle, { extension, data: { id, name, description: userDescription, modelDescription, icon }, resolver: resolver });
        this._proxy.$registerVariable(handle, { id, name, description: userDescription, modelDescription, isSlow, fullName, icon });
        return toDisposable(() => {
            this._resolver.delete(handle);
            this._proxy.$unregisterVariable(handle);
        });
    }
}
class ChatVariableResolverResponseStream {
    constructor(_requestId, _proxy) {
        this._requestId = _requestId;
        this._proxy = _proxy;
        this._isClosed = false;
    }
    close() {
        this._isClosed = true;
    }
    get apiObject() {
        if (!this._apiObject) {
            const that = this;
            function throwIfDone(source) {
                if (that._isClosed) {
                    const err = new Error('Response stream has been closed');
                    Error.captureStackTrace(err, source);
                    throw err;
                }
            }
            const _report = (progress) => {
                this._proxy.$handleProgressChunk(this._requestId, progress);
            };
            this._apiObject = {
                progress(value) {
                    throwIfDone(this.progress);
                    const part = new extHostTypes.ChatResponseProgressPart(value);
                    const dto = typeConvert.ChatResponseProgressPart.from(part);
                    _report(dto);
                    return this;
                },
                reference(value) {
                    throwIfDone(this.reference);
                    const part = new extHostTypes.ChatResponseReferencePart(value);
                    const dto = typeConvert.ChatResponseReferencePart.from(part);
                    _report(dto);
                    return this;
                },
                push(part) {
                    throwIfDone(this.push);
                    if (part instanceof extHostTypes.ChatResponseReferencePart) {
                        _report(typeConvert.ChatResponseReferencePart.from(part));
                    }
                    else if (part instanceof extHostTypes.ChatResponseProgressPart) {
                        _report(typeConvert.ChatResponseProgressPart.from(part));
                    }
                    return this;
                }
            };
        }
        return this._apiObject;
    }
}
