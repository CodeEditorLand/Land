/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isObject } from './types.js';
class Verifier {
    constructor(defaultValue) {
        this.defaultValue = defaultValue;
    }
    verify(value) {
        if (!this.isType(value)) {
            return this.defaultValue;
        }
        return value;
    }
}
export class BooleanVerifier extends Verifier {
    isType(value) {
        return typeof value === 'boolean';
    }
}
export class NumberVerifier extends Verifier {
    isType(value) {
        return typeof value === 'number';
    }
}
export class SetVerifier extends Verifier {
    isType(value) {
        return value instanceof Set;
    }
}
export class EnumVerifier extends Verifier {
    constructor(defaultValue, allowedValues) {
        super(defaultValue);
        this.allowedValues = allowedValues;
    }
    isType(value) {
        return this.allowedValues.includes(value);
    }
}
export class ObjectVerifier extends Verifier {
    constructor(defaultValue, verifier) {
        super(defaultValue);
        this.verifier = verifier;
    }
    verify(value) {
        if (!this.isType(value)) {
            return this.defaultValue;
        }
        return verifyObject(this.verifier, value);
    }
    isType(value) {
        return isObject(value);
    }
}
export function verifyObject(verifiers, value) {
    const result = Object.create(null);
    for (const key in verifiers) {
        if (Object.hasOwnProperty.call(verifiers, key)) {
            const verifier = verifiers[key];
            result[key] = verifier.verify(value[key]);
        }
    }
    return result;
}
