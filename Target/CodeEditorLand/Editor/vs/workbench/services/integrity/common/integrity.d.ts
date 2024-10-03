import { URI } from '../../../../base/common/uri.js';
export declare const IIntegrityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IIntegrityService>;
export interface ChecksumPair {
    uri: URI;
    actual: string;
    expected: string;
    isPure: boolean;
}
export interface IntegrityTestResult {
    isPure: boolean;
    proof: ChecksumPair[];
}
export interface IIntegrityService {
    readonly _serviceBrand: undefined;
    isPure(): Promise<IntegrityTestResult>;
}
