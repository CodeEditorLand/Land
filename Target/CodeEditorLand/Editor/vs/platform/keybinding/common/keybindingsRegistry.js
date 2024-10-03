import { decodeKeybinding } from '../../../base/common/keybindings.js';
import { OS } from '../../../base/common/platform.js';
import { CommandsRegistry } from '../../commands/common/commands.js';
import { Registry } from '../../registry/common/platform.js';
import { combinedDisposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { LinkedList } from '../../../base/common/linkedList.js';
class KeybindingsRegistryImpl {
    constructor() {
        this._coreKeybindings = new LinkedList();
        this._extensionKeybindings = [];
        this._cachedMergedKeybindings = null;
    }
    static bindToCurrentPlatform(kb) {
        if (OS === 1) {
            if (kb && kb.win) {
                return kb.win;
            }
        }
        else if (OS === 2) {
            if (kb && kb.mac) {
                return kb.mac;
            }
        }
        else {
            if (kb && kb.linux) {
                return kb.linux;
            }
        }
        return kb;
    }
    registerKeybindingRule(rule) {
        const actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);
        const result = new DisposableStore();
        if (actualKb && actualKb.primary) {
            const kk = decodeKeybinding(actualKb.primary, OS);
            if (kk) {
                result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, 0, rule.when));
            }
        }
        if (actualKb && Array.isArray(actualKb.secondary)) {
            for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
                const k = actualKb.secondary[i];
                const kk = decodeKeybinding(k, OS);
                if (kk) {
                    result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, -i - 1, rule.when));
                }
            }
        }
        return result;
    }
    setExtensionKeybindings(rules) {
        const result = [];
        let keybindingsLen = 0;
        for (const rule of rules) {
            if (rule.keybinding) {
                result[keybindingsLen++] = {
                    keybinding: rule.keybinding,
                    command: rule.id,
                    commandArgs: rule.args,
                    when: rule.when,
                    weight1: rule.weight,
                    weight2: 0,
                    extensionId: rule.extensionId || null,
                    isBuiltinExtension: rule.isBuiltinExtension || false
                };
            }
        }
        this._extensionKeybindings = result;
        this._cachedMergedKeybindings = null;
    }
    registerCommandAndKeybindingRule(desc) {
        return combinedDisposable(this.registerKeybindingRule(desc), CommandsRegistry.registerCommand(desc));
    }
    _registerDefaultKeybinding(keybinding, commandId, commandArgs, weight1, weight2, when) {
        const remove = this._coreKeybindings.push({
            keybinding: keybinding,
            command: commandId,
            commandArgs: commandArgs,
            when: when,
            weight1: weight1,
            weight2: weight2,
            extensionId: null,
            isBuiltinExtension: false
        });
        this._cachedMergedKeybindings = null;
        return toDisposable(() => {
            remove();
            this._cachedMergedKeybindings = null;
        });
    }
    getDefaultKeybindings() {
        if (!this._cachedMergedKeybindings) {
            this._cachedMergedKeybindings = Array.from(this._coreKeybindings).concat(this._extensionKeybindings);
            this._cachedMergedKeybindings.sort(sorter);
        }
        return this._cachedMergedKeybindings.slice(0);
    }
}
export const KeybindingsRegistry = new KeybindingsRegistryImpl();
export const Extensions = {
    EditorModes: 'platform.keybindingsRegistry'
};
Registry.add(Extensions.EditorModes, KeybindingsRegistry);
function sorter(a, b) {
    if (a.weight1 !== b.weight1) {
        return a.weight1 - b.weight1;
    }
    if (a.command && b.command) {
        if (a.command < b.command) {
            return -1;
        }
        if (a.command > b.command) {
            return 1;
        }
    }
    return a.weight2 - b.weight2;
}
