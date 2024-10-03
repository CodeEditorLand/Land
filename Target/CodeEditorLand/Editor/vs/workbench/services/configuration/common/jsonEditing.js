import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const IJSONEditingService = createDecorator('jsonEditingService');
export class JSONEditingError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
