import { URI } from '../../../../base/common/uri.js';
import { JSONPath } from '../../../../base/common/json.js';
export declare const IJSONEditingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IJSONEditingService>;
export declare const enum JSONEditingErrorCode {
    /**
     * Error when trying to write to a file that contains JSON errors.
     */
    ERROR_INVALID_FILE = 0
}
export declare class JSONEditingError extends Error {
    code: JSONEditingErrorCode;
    constructor(message: string, code: JSONEditingErrorCode);
}
export interface IJSONValue {
    path: JSONPath;
    value: any;
}
export interface IJSONEditingService {
    readonly _serviceBrand: undefined;
    write(resource: URI, values: IJSONValue[], save: boolean): Promise<void>;
}
