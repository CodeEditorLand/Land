import { Token, TokenizationResult, EncodedTokenizationResult } from '../languages.js';
export const NullState = new class {
    clone() {
        return this;
    }
    equals(other) {
        return (this === other);
    }
};
export function nullTokenize(languageId, state) {
    return new TokenizationResult([new Token(0, '', languageId)], state);
}
export function nullTokenizeEncoded(languageId, state) {
    const tokens = new Uint32Array(2);
    tokens[0] = 0;
    tokens[1] = ((languageId << 0)
        | (0 << 8)
        | (0 << 11)
        | (1 << 15)
        | (2 << 24)) >>> 0;
    return new EncodedTokenizationResult(tokens, state === null ? NullState : state);
}
