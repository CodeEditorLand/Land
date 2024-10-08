/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from './buffer.js';
import { URI } from './uri.js';
function toJSON(uri) {
    return uri.toJSON();
}
export class URITransformer {
    constructor(uriTransformer) {
        this._uriTransformer = uriTransformer;
    }
    transformIncoming(uri) {
        const result = this._uriTransformer.transformIncoming(uri);
        return (result === uri ? uri : toJSON(URI.from(result)));
    }
    transformOutgoing(uri) {
        const result = this._uriTransformer.transformOutgoing(uri);
        return (result === uri ? uri : toJSON(URI.from(result)));
    }
    transformOutgoingURI(uri) {
        const result = this._uriTransformer.transformOutgoing(uri);
        return (result === uri ? uri : URI.from(result));
    }
    transformOutgoingScheme(scheme) {
        return this._uriTransformer.transformOutgoingScheme(scheme);
    }
}
export const DefaultURITransformer = new class {
    transformIncoming(uri) {
        return uri;
    }
    transformOutgoing(uri) {
        return uri;
    }
    transformOutgoingURI(uri) {
        return uri;
    }
    transformOutgoingScheme(scheme) {
        return scheme;
    }
};
function _transformOutgoingURIs(obj, transformer, depth) {
    if (!obj || depth > 200) {
        return null;
    }
    if (typeof obj === 'object') {
        if (obj instanceof URI) {
            return transformer.transformOutgoing(obj);
        }
        // walk object (or array)
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const r = _transformOutgoingURIs(obj[key], transformer, depth + 1);
                if (r !== null) {
                    obj[key] = r;
                }
            }
        }
    }
    return null;
}
export function transformOutgoingURIs(obj, transformer) {
    const result = _transformOutgoingURIs(obj, transformer, 0);
    if (result === null) {
        // no change
        return obj;
    }
    return result;
}
function _transformIncomingURIs(obj, transformer, revive, depth) {
    if (!obj || depth > 200) {
        return null;
    }
    if (typeof obj === 'object') {
        if (obj.$mid === 1 /* MarshalledId.Uri */) {
            return revive ? URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
        }
        if (obj instanceof VSBuffer) {
            return null;
        }
        // walk object (or array)
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const r = _transformIncomingURIs(obj[key], transformer, revive, depth + 1);
                if (r !== null) {
                    obj[key] = r;
                }
            }
        }
    }
    return null;
}
export function transformIncomingURIs(obj, transformer) {
    const result = _transformIncomingURIs(obj, transformer, false, 0);
    if (result === null) {
        // no change
        return obj;
    }
    return result;
}
export function transformAndReviveIncomingURIs(obj, transformer) {
    const result = _transformIncomingURIs(obj, transformer, true, 0);
    if (result === null) {
        // no change
        return obj;
    }
    return result;
}
