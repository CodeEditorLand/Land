import { Registry } from '../../../../platform/registry/common/platform.js';
export function registerTerminalContribution(id, ctor, canRunInDetachedTerminals = false) {
    TerminalContributionRegistry.INSTANCE.registerTerminalContribution({ id, ctor, canRunInDetachedTerminals });
}
export var TerminalExtensionsRegistry;
(function (TerminalExtensionsRegistry) {
    function getTerminalContributions() {
        return TerminalContributionRegistry.INSTANCE.getTerminalContributions();
    }
    TerminalExtensionsRegistry.getTerminalContributions = getTerminalContributions;
})(TerminalExtensionsRegistry || (TerminalExtensionsRegistry = {}));
class TerminalContributionRegistry {
    static { this.INSTANCE = new TerminalContributionRegistry(); }
    constructor() {
        this._terminalContributions = [];
    }
    registerTerminalContribution(description) {
        this._terminalContributions.push(description);
    }
    getTerminalContributions() {
        return this._terminalContributions.slice(0);
    }
}
Registry.add("terminal.contributions", TerminalContributionRegistry.INSTANCE);
