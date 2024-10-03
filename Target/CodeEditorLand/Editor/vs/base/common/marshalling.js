import { VSBuffer } from './buffer.js';
import { URI } from './uri.js';
export function stringify(obj) {
    return JSON.stringify(obj, replacer);
}
export function parse(text) {
    let data = JSON.parse(text);
    data = revive(data);
    return data;
}
function replacer(key, value) {
    if (value instanceof RegExp) {
        return {
            $mid: 2,
            source: value.source,
            flags: value.flags,
        };
    }
    return value;
}
export function revive(obj, depth = 0) {
    if (!obj || depth > 200) {
        return obj;
    }
    if (typeof obj === 'object') {
        switch (obj.$mid) {
            case 1: return URI.revive(obj);
            case 2: return new RegExp(obj.source, obj.flags);
            case 17: return new Date(obj.source);
        }
        if (obj instanceof VSBuffer
            || obj instanceof Uint8Array) {
            return obj;
        }
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; ++i) {
                obj[i] = revive(obj[i], depth + 1);
            }
        }
        else {
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    obj[key] = revive(obj[key], depth + 1);
                }
            }
        }
    }
    return obj;
}
