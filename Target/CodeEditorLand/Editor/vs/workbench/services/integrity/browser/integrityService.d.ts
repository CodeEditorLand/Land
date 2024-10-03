import { IIntegrityService, IntegrityTestResult } from '../common/integrity.js';
export declare class IntegrityService implements IIntegrityService {
    readonly _serviceBrand: undefined;
    isPure(): Promise<IntegrityTestResult>;
}
