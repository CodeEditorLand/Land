const _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUUID(value) {
    return _UUIDPattern.test(value);
}
export const generateUuid = (function () {
    if (typeof crypto === 'object' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID.bind(crypto);
    }
    let getRandomValues;
    if (typeof crypto === 'object' && typeof crypto.getRandomValues === 'function') {
        getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    else {
        getRandomValues = function (bucket) {
            for (let i = 0; i < bucket.length; i++) {
                bucket[i] = Math.floor(Math.random() * 256);
            }
            return bucket;
        };
    }
    const _data = new Uint8Array(16);
    const _hex = [];
    for (let i = 0; i < 256; i++) {
        _hex.push(i.toString(16).padStart(2, '0'));
    }
    return function generateUuid() {
        getRandomValues(_data);
        _data[6] = (_data[6] & 0x0f) | 0x40;
        _data[8] = (_data[8] & 0x3f) | 0x80;
        let i = 0;
        let result = '';
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += '-';
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += '-';
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += '-';
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += '-';
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        return result;
    };
})();
