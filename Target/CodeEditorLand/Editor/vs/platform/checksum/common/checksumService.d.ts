import { URI } from '../../../base/common/uri.js';
export declare const IChecksumService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IChecksumService>;
export interface IChecksumService {
    readonly _serviceBrand: undefined;
    checksum(resource: URI): Promise<string>;
}
