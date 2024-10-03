import { OffsetRange } from '../core/offsetRange.js';
export class TokenArray {
    static create(tokenInfo) {
        return new TokenArray(tokenInfo);
    }
    constructor(_tokenInfo) {
        this._tokenInfo = _tokenInfo;
    }
    forEach(cb) {
        let lengthSum = 0;
        for (const tokenInfo of this._tokenInfo) {
            const range = new OffsetRange(lengthSum, lengthSum + tokenInfo.length);
            cb(range, tokenInfo);
            lengthSum += tokenInfo.length;
        }
    }
    slice(range) {
        const result = [];
        let lengthSum = 0;
        for (const tokenInfo of this._tokenInfo) {
            const tokenStart = lengthSum;
            const tokenEndEx = tokenStart + tokenInfo.length;
            if (tokenEndEx > range.start) {
                if (tokenStart >= range.endExclusive) {
                    break;
                }
                const deltaBefore = Math.max(0, range.start - tokenStart);
                const deltaAfter = Math.max(0, tokenEndEx - range.endExclusive);
                result.push(new TokenInfo(tokenInfo.length - deltaBefore - deltaAfter, tokenInfo.metadata));
            }
            lengthSum += tokenInfo.length;
        }
        return TokenArray.create(result);
    }
}
export class TokenInfo {
    constructor(length, metadata) {
        this.length = length;
        this.metadata = metadata;
    }
}
export class TokenArrayBuilder {
    constructor() {
        this._tokens = [];
    }
    add(length, metadata) {
        this._tokens.push(new TokenInfo(length, metadata));
    }
    build() {
        return TokenArray.create(this._tokens);
    }
}
