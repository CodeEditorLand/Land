import { Keybinding } from '../../../../base/common/keybindings.js';
import { ContextKeyExpression } from '../../../../platform/contextkey/common/contextkey.js';
import { ResolvedKeybindingItem } from '../../../../platform/keybinding/common/resolvedKeybindingItem.js';
export interface IUserKeybindingItem {
    keybinding: Keybinding | null;
    command: string | null;
    commandArgs?: any;
    when: ContextKeyExpression | undefined;
    _sourceKey: string | undefined;
}
export declare class KeybindingIO {
    static writeKeybindingItem(out: OutputBuilder, item: ResolvedKeybindingItem): void;
    static readUserKeybindingItem(input: Object): IUserKeybindingItem;
}
export declare class OutputBuilder {
    private _lines;
    private _currentLine;
    write(str: string): void;
    writeLine(str?: string): void;
    toString(): string;
}
