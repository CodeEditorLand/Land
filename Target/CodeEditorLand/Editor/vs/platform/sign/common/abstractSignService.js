/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class AbstractSignService {
    constructor() {
        this.validators = new Map();
    }
    static { this._nextId = 1; }
    async createNewMessage(value) {
        try {
            const validator = await this.getValidator();
            if (validator) {
                const id = String(AbstractSignService._nextId++);
                this.validators.set(id, validator);
                return {
                    id: id,
                    data: validator.createNewMessage(value)
                };
            }
        }
        catch (e) {
            // ignore errors silently
        }
        return { id: '', data: value };
    }
    async validate(message, value) {
        if (!message.id) {
            return true;
        }
        const validator = this.validators.get(message.id);
        if (!validator) {
            return false;
        }
        this.validators.delete(message.id);
        try {
            return (validator.validate(value) === 'ok');
        }
        catch (e) {
            // ignore errors silently
            return false;
        }
        finally {
            validator.dispose?.();
        }
    }
    async sign(value) {
        try {
            return await this.signValue(value);
        }
        catch (e) {
            // ignore errors silently
        }
        return value;
    }
}
