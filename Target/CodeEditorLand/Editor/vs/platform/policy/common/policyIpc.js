/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { AbstractPolicyService } from './policy.js';
export class PolicyChannel {
    constructor(service) {
        this.service = service;
        this.disposables = new DisposableStore();
    }
    listen(_, event) {
        switch (event) {
            case 'onDidChange': return Event.map(this.service.onDidChange, names => names.reduce((r, name) => ({ ...r, [name]: this.service.getPolicyValue(name) ?? null }), {}), this.disposables);
        }
        throw new Error(`Event not found: ${event}`);
    }
    call(_, command, arg) {
        switch (command) {
            case 'updatePolicyDefinitions': return this.service.updatePolicyDefinitions(arg);
        }
        throw new Error(`Call not found: ${command}`);
    }
    dispose() {
        this.disposables.dispose();
    }
}
export class PolicyChannelClient extends AbstractPolicyService {
    constructor(policiesData, channel) {
        super();
        this.channel = channel;
        for (const name in policiesData) {
            const { definition, value } = policiesData[name];
            this.policyDefinitions[name] = definition;
            if (value !== undefined) {
                this.policies.set(name, value);
            }
        }
        this.channel.listen('onDidChange')(policies => {
            for (const name in policies) {
                const value = policies[name];
                if (value === null) {
                    this.policies.delete(name);
                }
                else {
                    this.policies.set(name, value);
                }
            }
            this._onDidChange.fire(Object.keys(policies));
        });
    }
    async _updatePolicyDefinitions(policyDefinitions) {
        const result = await this.channel.call('updatePolicyDefinitions', policyDefinitions);
        for (const name in result) {
            this.policies.set(name, result[name]);
        }
    }
}
