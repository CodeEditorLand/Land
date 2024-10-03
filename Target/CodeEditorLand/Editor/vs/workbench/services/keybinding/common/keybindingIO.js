import { KeybindingParser } from '../../../../base/common/keybindingParser.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
export class KeybindingIO {
    static writeKeybindingItem(out, item) {
        if (!item.resolvedKeybinding) {
            return;
        }
        const quotedSerializedKeybinding = JSON.stringify(item.resolvedKeybinding.getUserSettingsLabel());
        out.write(`{ "key": ${rightPaddedString(quotedSerializedKeybinding + ',', 25)} "command": `);
        const quotedSerializedWhen = item.when ? JSON.stringify(item.when.serialize()) : '';
        const quotedSerializeCommand = JSON.stringify(item.command);
        if (quotedSerializedWhen.length > 0) {
            out.write(`${quotedSerializeCommand},`);
            out.writeLine();
            out.write(`                                     "when": ${quotedSerializedWhen}`);
        }
        else {
            out.write(`${quotedSerializeCommand}`);
        }
        if (item.commandArgs) {
            out.write(',');
            out.writeLine();
            out.write(`                                     "args": ${JSON.stringify(item.commandArgs)}`);
        }
        out.write(' }');
    }
    static readUserKeybindingItem(input) {
        const keybinding = 'key' in input && typeof input.key === 'string'
            ? KeybindingParser.parseKeybinding(input.key)
            : null;
        const when = 'when' in input && typeof input.when === 'string'
            ? ContextKeyExpr.deserialize(input.when)
            : undefined;
        const command = 'command' in input && typeof input.command === 'string'
            ? input.command
            : null;
        const commandArgs = 'args' in input && typeof input.args !== 'undefined'
            ? input.args
            : undefined;
        return {
            keybinding,
            command,
            commandArgs,
            when,
            _sourceKey: 'key' in input && typeof input.key === 'string' ? input.key : undefined,
        };
    }
}
function rightPaddedString(str, minChars) {
    if (str.length < minChars) {
        return str + (new Array(minChars - str.length).join(' '));
    }
    return str;
}
export class OutputBuilder {
    constructor() {
        this._lines = [];
        this._currentLine = '';
    }
    write(str) {
        this._currentLine += str;
    }
    writeLine(str = '') {
        this._lines.push(this._currentLine + str);
        this._currentLine = '';
    }
    toString() {
        this.writeLine();
        return this._lines.join('\n');
    }
}
