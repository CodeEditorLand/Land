export function getKoreanAltChars(code) {
    const result = disassembleKorean(code);
    if (result && result.length > 0) {
        return new Uint32Array(result);
    }
    return undefined;
}
let codeBufferLength = 0;
const codeBuffer = new Uint32Array(10);
function disassembleKorean(code) {
    codeBufferLength = 0;
    getCodesFromArray(code, modernConsonants, 4352);
    if (codeBufferLength > 0) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    getCodesFromArray(code, modernVowels, 4449);
    if (codeBufferLength > 0) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    getCodesFromArray(code, modernFinalConsonants, 4520);
    if (codeBufferLength > 0) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    getCodesFromArray(code, compatibilityJamo, 12593);
    if (codeBufferLength) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    if (code >= 0xAC00 && code <= 0xD7A3) {
        const hangulIndex = code - 0xAC00;
        const vowelAndFinalConsonantProduct = hangulIndex % 588;
        const initialConsonantIndex = Math.floor(hangulIndex / 588);
        const vowelIndex = Math.floor(vowelAndFinalConsonantProduct / 28);
        const finalConsonantIndex = vowelAndFinalConsonantProduct % 28 - 1;
        if (initialConsonantIndex < modernConsonants.length) {
            getCodesFromArray(initialConsonantIndex, modernConsonants, 0);
        }
        else if (4352 + initialConsonantIndex - 12593 < compatibilityJamo.length) {
            getCodesFromArray(4352 + initialConsonantIndex, compatibilityJamo, 12593);
        }
        if (vowelIndex < modernVowels.length) {
            getCodesFromArray(vowelIndex, modernVowels, 0);
        }
        else if (4449 + vowelIndex - 12593 < compatibilityJamo.length) {
            getCodesFromArray(4449 + vowelIndex - 12593, compatibilityJamo, 12593);
        }
        if (finalConsonantIndex >= 0) {
            if (finalConsonantIndex < modernFinalConsonants.length) {
                getCodesFromArray(finalConsonantIndex, modernFinalConsonants, 0);
            }
            else if (4520 + finalConsonantIndex - 12593 < compatibilityJamo.length) {
                getCodesFromArray(4520 + finalConsonantIndex - 12593, compatibilityJamo, 12593);
            }
        }
        if (codeBufferLength > 0) {
            return codeBuffer.subarray(0, codeBufferLength);
        }
    }
    return undefined;
}
function getCodesFromArray(code, array, arrayStartIndex) {
    if (code >= arrayStartIndex && code < arrayStartIndex + array.length) {
        addCodesToBuffer(array[code - arrayStartIndex]);
    }
}
function addCodesToBuffer(codes) {
    if (codes === 0) {
        return;
    }
    codeBuffer[codeBufferLength++] = codes & 0xFF;
    if (codes >> 8) {
        codeBuffer[codeBufferLength++] = (codes >> 8) & 0xFF;
    }
    if (codes >> 16) {
        codeBuffer[codeBufferLength++] = (codes >> 16) & 0xFF;
    }
}
const modernConsonants = new Uint8Array([
    114,
    82,
    115,
    101,
    69,
    102,
    97,
    113,
    81,
    116,
    84,
    100,
    119,
    87,
    99,
    122,
    120,
    118,
    103,
]);
const modernVowels = new Uint16Array([
    107,
    111,
    105,
    79,
    106,
    112,
    117,
    80,
    104,
    27496,
    28520,
    27752,
    121,
    110,
    27246,
    28782,
    27758,
    98,
    109,
    27757,
    108,
]);
const modernFinalConsonants = new Uint16Array([
    114,
    82,
    29810,
    115,
    30579,
    26483,
    101,
    102,
    29286,
    24934,
    29030,
    29798,
    30822,
    30310,
    26470,
    97,
    113,
    29809,
    116,
    84,
    100,
    119,
    99,
    122,
    120,
    118,
    103,
]);
const compatibilityJamo = new Uint16Array([
    114,
    82,
    29810,
    115,
    30579,
    26483,
    101,
    69,
    102,
    29286,
    24934,
    29030,
    29798,
    30822,
    30310,
    26470,
    97,
    113,
    81,
    29809,
    116,
    84,
    100,
    119,
    87,
    99,
    122,
    120,
    118,
    103,
    107,
    111,
    105,
    79,
    106,
    112,
    117,
    80,
    104,
    27496,
    28520,
    27752,
    121,
    110,
    27246,
    28782,
    27758,
    98,
    109,
    27757,
    108,
]);
