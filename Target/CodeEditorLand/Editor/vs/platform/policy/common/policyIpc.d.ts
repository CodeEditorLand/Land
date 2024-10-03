import { IStringDictionary } from '../../../base/common/collections.js';
import { Event } from '../../../base/common/event.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { AbstractPolicyService, IPolicyService, PolicyDefinition, PolicyValue } from './policy.js';
export declare class PolicyChannel implements IServerChannel {
    private service;
    private readonly disposables;
    constructor(service: IPolicyService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
    dispose(): void;
}
export declare class PolicyChannelClient extends AbstractPolicyService implements IPolicyService {
    private readonly channel;
    constructor(policiesData: IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }>, channel: IChannel);
    protected _updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void>;
}
