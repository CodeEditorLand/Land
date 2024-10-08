import { ResolvedKeybinding } from '../../../base/common/keybindings.js';
import { ContextKeyExpression } from '../../contextkey/common/contextkey.js';
export declare class ResolvedKeybindingItem {
    _resolvedKeybindingItemBrand: void;
    readonly resolvedKeybinding: ResolvedKeybinding | undefined;
    readonly chords: string[];
    readonly bubble: boolean;
    readonly command: string | null;
    readonly commandArgs: any;
    readonly when: ContextKeyExpression | undefined;
    readonly isDefault: boolean;
    readonly extensionId: string | null;
    readonly isBuiltinExtension: boolean;
    constructor(resolvedKeybinding: ResolvedKeybinding | undefined, command: string | null, commandArgs: any, when: ContextKeyExpression | undefined, isDefault: boolean, extensionId: string | null, isBuiltinExtension: boolean);
}
export declare function toEmptyArrayIfContainsNull<T>(arr: (T | null)[]): T[];
