import { LRUCache } from './map.js';
const nfcCache = new LRUCache(10000);
export function normalizeNFC(str) {
    return normalize(str, 'NFC', nfcCache);
}
const nfdCache = new LRUCache(10000);
export function normalizeNFD(str) {
    return normalize(str, 'NFD', nfdCache);
}
const nonAsciiCharactersPattern = /[^\u0000-\u0080]/;
function normalize(str, form, normalizedCache) {
    if (!str) {
        return str;
    }
    const cached = normalizedCache.get(str);
    if (cached) {
        return cached;
    }
    let res;
    if (nonAsciiCharactersPattern.test(str)) {
        res = str.normalize(form);
    }
    else {
        res = str;
    }
    normalizedCache.set(str, res);
    return res;
}
export const removeAccents = (function () {
    const regex = /[\u0300-\u036f]/g;
    return function (str) {
        return normalizeNFD(str).replace(regex, '');
    };
})();
