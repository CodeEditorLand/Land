import { AbstractPolicyService, IPolicyService, PolicyDefinition } from '../common/policy.js';
import { IStringDictionary } from '../../../base/common/collections.js';
import { ILogService } from '../../log/common/log.js';
export declare class NativePolicyService extends AbstractPolicyService implements IPolicyService {
    private readonly logService;
    private readonly productName;
    private throttler;
    private readonly watcher;
    constructor(logService: ILogService, productName: string);
    protected _updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void>;
    private _onDidPolicyChange;
}
