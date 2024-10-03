import { isWindows } from '../../../base/common/platform.js';
import { EnvironmentVariableMutatorType } from './environmentVariable.js';
const mutatorTypeToLabelMap = new Map([
    [EnvironmentVariableMutatorType.Append, 'APPEND'],
    [EnvironmentVariableMutatorType.Prepend, 'PREPEND'],
    [EnvironmentVariableMutatorType.Replace, 'REPLACE']
]);
export class MergedEnvironmentVariableCollection {
    constructor(collections) {
        this.collections = collections;
        this.map = new Map();
        this.descriptionMap = new Map();
        collections.forEach((collection, extensionIdentifier) => {
            this.populateDescriptionMap(collection, extensionIdentifier);
            const it = collection.map.entries();
            let next = it.next();
            while (!next.done) {
                const mutator = next.value[1];
                const key = next.value[0];
                let entry = this.map.get(key);
                if (!entry) {
                    entry = [];
                    this.map.set(key, entry);
                }
                if (entry.length > 0 && entry[0].type === EnvironmentVariableMutatorType.Replace) {
                    next = it.next();
                    continue;
                }
                const extensionMutator = {
                    extensionIdentifier,
                    value: mutator.value,
                    type: mutator.type,
                    scope: mutator.scope,
                    variable: mutator.variable,
                    options: mutator.options
                };
                if (!extensionMutator.scope) {
                    delete extensionMutator.scope;
                }
                entry.unshift(extensionMutator);
                next = it.next();
            }
        });
    }
    async applyToProcessEnvironment(env, scope, variableResolver) {
        let lowerToActualVariableNames;
        if (isWindows) {
            lowerToActualVariableNames = {};
            Object.keys(env).forEach(e => lowerToActualVariableNames[e.toLowerCase()] = e);
        }
        for (const [variable, mutators] of this.getVariableMap(scope)) {
            const actualVariable = isWindows ? lowerToActualVariableNames[variable.toLowerCase()] || variable : variable;
            for (const mutator of mutators) {
                const value = variableResolver ? await variableResolver(mutator.value) : mutator.value;
                if (mutator.options?.applyAtProcessCreation ?? true) {
                    switch (mutator.type) {
                        case EnvironmentVariableMutatorType.Append:
                            env[actualVariable] = (env[actualVariable] || '') + value;
                            break;
                        case EnvironmentVariableMutatorType.Prepend:
                            env[actualVariable] = value + (env[actualVariable] || '');
                            break;
                        case EnvironmentVariableMutatorType.Replace:
                            env[actualVariable] = value;
                            break;
                    }
                }
                if (mutator.options?.applyAtShellIntegration ?? false) {
                    const key = `VSCODE_ENV_${mutatorTypeToLabelMap.get(mutator.type)}`;
                    env[key] = (env[key] ? env[key] + ':' : '') + variable + '=' + this._encodeColons(value);
                }
            }
        }
    }
    _encodeColons(value) {
        return value.replaceAll(':', '\\x3a');
    }
    diff(other, scope) {
        const added = new Map();
        const changed = new Map();
        const removed = new Map();
        other.getVariableMap(scope).forEach((otherMutators, variable) => {
            const currentMutators = this.getVariableMap(scope).get(variable);
            const result = getMissingMutatorsFromArray(otherMutators, currentMutators);
            if (result) {
                added.set(variable, result);
            }
        });
        this.getVariableMap(scope).forEach((currentMutators, variable) => {
            const otherMutators = other.getVariableMap(scope).get(variable);
            const result = getMissingMutatorsFromArray(currentMutators, otherMutators);
            if (result) {
                removed.set(variable, result);
            }
        });
        this.getVariableMap(scope).forEach((currentMutators, variable) => {
            const otherMutators = other.getVariableMap(scope).get(variable);
            const result = getChangedMutatorsFromArray(currentMutators, otherMutators);
            if (result) {
                changed.set(variable, result);
            }
        });
        if (added.size === 0 && changed.size === 0 && removed.size === 0) {
            return undefined;
        }
        return { added, changed, removed };
    }
    getVariableMap(scope) {
        const result = new Map();
        for (const mutators of this.map.values()) {
            const filteredMutators = mutators.filter(m => filterScope(m, scope));
            if (filteredMutators.length > 0) {
                result.set(filteredMutators[0].variable, filteredMutators);
            }
        }
        return result;
    }
    getDescriptionMap(scope) {
        const result = new Map();
        for (const mutators of this.descriptionMap.values()) {
            const filteredMutators = mutators.filter(m => filterScope(m, scope, true));
            for (const mutator of filteredMutators) {
                result.set(mutator.extensionIdentifier, mutator.description);
            }
        }
        return result;
    }
    populateDescriptionMap(collection, extensionIdentifier) {
        if (!collection.descriptionMap) {
            return;
        }
        const it = collection.descriptionMap.entries();
        let next = it.next();
        while (!next.done) {
            const mutator = next.value[1];
            const key = next.value[0];
            let entry = this.descriptionMap.get(key);
            if (!entry) {
                entry = [];
                this.descriptionMap.set(key, entry);
            }
            const extensionMutator = {
                extensionIdentifier,
                scope: mutator.scope,
                description: mutator.description
            };
            if (!extensionMutator.scope) {
                delete extensionMutator.scope;
            }
            entry.push(extensionMutator);
            next = it.next();
        }
    }
}
function filterScope(mutator, scope, strictFilter = false) {
    if (!mutator.scope) {
        if (strictFilter) {
            return scope === mutator.scope;
        }
        return true;
    }
    if (mutator.scope.workspaceFolder && scope?.workspaceFolder && mutator.scope.workspaceFolder.index === scope.workspaceFolder.index) {
        return true;
    }
    return false;
}
function getMissingMutatorsFromArray(current, other) {
    if (!other) {
        return current;
    }
    const otherMutatorExtensions = new Set();
    other.forEach(m => otherMutatorExtensions.add(m.extensionIdentifier));
    const result = [];
    current.forEach(mutator => {
        if (!otherMutatorExtensions.has(mutator.extensionIdentifier)) {
            result.push(mutator);
        }
    });
    return result.length === 0 ? undefined : result;
}
function getChangedMutatorsFromArray(current, other) {
    if (!other) {
        return undefined;
    }
    const otherMutatorExtensions = new Map();
    other.forEach(m => otherMutatorExtensions.set(m.extensionIdentifier, m));
    const result = [];
    current.forEach(mutator => {
        const otherMutator = otherMutatorExtensions.get(mutator.extensionIdentifier);
        if (otherMutator && (mutator.type !== otherMutator.type || mutator.value !== otherMutator.value || mutator.scope?.workspaceFolder?.index !== otherMutator.scope?.workspaceFolder?.index)) {
            result.push(otherMutator);
        }
    });
    return result.length === 0 ? undefined : result;
}
