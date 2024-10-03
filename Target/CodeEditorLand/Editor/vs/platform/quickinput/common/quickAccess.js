import { coalesce } from '../../../base/common/arrays.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { Registry } from '../../registry/common/platform.js';
export var DefaultQuickAccessFilterValue;
(function (DefaultQuickAccessFilterValue) {
    DefaultQuickAccessFilterValue[DefaultQuickAccessFilterValue["PRESERVE"] = 0] = "PRESERVE";
    DefaultQuickAccessFilterValue[DefaultQuickAccessFilterValue["LAST"] = 1] = "LAST";
})(DefaultQuickAccessFilterValue || (DefaultQuickAccessFilterValue = {}));
export const Extensions = {
    Quickaccess: 'workbench.contributions.quickaccess'
};
export class QuickAccessRegistry {
    constructor() {
        this.providers = [];
        this.defaultProvider = undefined;
    }
    registerQuickAccessProvider(provider) {
        if (provider.prefix.length === 0) {
            this.defaultProvider = provider;
        }
        else {
            this.providers.push(provider);
        }
        this.providers.sort((providerA, providerB) => providerB.prefix.length - providerA.prefix.length);
        return toDisposable(() => {
            this.providers.splice(this.providers.indexOf(provider), 1);
            if (this.defaultProvider === provider) {
                this.defaultProvider = undefined;
            }
        });
    }
    getQuickAccessProviders() {
        return coalesce([this.defaultProvider, ...this.providers]);
    }
    getQuickAccessProvider(prefix) {
        const result = prefix ? (this.providers.find(provider => prefix.startsWith(provider.prefix)) || undefined) : undefined;
        return result || this.defaultProvider;
    }
    clear() {
        const providers = [...this.providers];
        const defaultProvider = this.defaultProvider;
        this.providers = [];
        this.defaultProvider = undefined;
        return () => {
            this.providers = providers;
            this.defaultProvider = defaultProvider;
        };
    }
}
Registry.add(Extensions.Quickaccess, new QuickAccessRegistry());
