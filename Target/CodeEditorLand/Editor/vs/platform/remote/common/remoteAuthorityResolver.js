/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ErrorNoTelemetry } from '../../../base/common/errors.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IRemoteAuthorityResolverService = createDecorator('remoteAuthorityResolverService');
export class ManagedRemoteConnection {
    constructor(id) {
        this.id = id;
        this.type = 1 /* RemoteConnectionType.Managed */;
    }
    toString() {
        return `Managed(${this.id})`;
    }
}
export class WebSocketRemoteConnection {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.type = 0 /* RemoteConnectionType.WebSocket */;
    }
    toString() {
        return `WebSocket(${this.host}:${this.port})`;
    }
}
export var RemoteAuthorityResolverErrorCode;
(function (RemoteAuthorityResolverErrorCode) {
    RemoteAuthorityResolverErrorCode["Unknown"] = "Unknown";
    RemoteAuthorityResolverErrorCode["NotAvailable"] = "NotAvailable";
    RemoteAuthorityResolverErrorCode["TemporarilyNotAvailable"] = "TemporarilyNotAvailable";
    RemoteAuthorityResolverErrorCode["NoResolverFound"] = "NoResolverFound";
    RemoteAuthorityResolverErrorCode["InvalidAuthority"] = "InvalidAuthority";
})(RemoteAuthorityResolverErrorCode || (RemoteAuthorityResolverErrorCode = {}));
export class RemoteAuthorityResolverError extends ErrorNoTelemetry {
    static isNotAvailable(err) {
        return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.NotAvailable;
    }
    static isTemporarilyNotAvailable(err) {
        return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable;
    }
    static isNoResolverFound(err) {
        return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.NoResolverFound;
    }
    static isInvalidAuthority(err) {
        return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.InvalidAuthority;
    }
    static isHandled(err) {
        return (err instanceof RemoteAuthorityResolverError) && err.isHandled;
    }
    constructor(message, code = RemoteAuthorityResolverErrorCode.Unknown, detail) {
        super(message);
        this._message = message;
        this._code = code;
        this._detail = detail;
        this.isHandled = (code === RemoteAuthorityResolverErrorCode.NotAvailable) && detail === true;
        // workaround when extending builtin objects and when compiling to ES5, see:
        // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
    }
}
export function getRemoteAuthorityPrefix(remoteAuthority) {
    const plusIndex = remoteAuthority.indexOf('+');
    if (plusIndex === -1) {
        return remoteAuthority;
    }
    return remoteAuthority.substring(0, plusIndex);
}
