import { ResolvedKeybinding, Keybinding } from '../../../base/common/keybindings.js';
import { IKeyboardEvent } from '../../keybinding/common/keybinding.js';
export interface IKeyboardMapper {
    dumpDebugInfo(): string;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
}
export declare class CachedKeyboardMapper implements IKeyboardMapper {
    private _actual;
    private _cache;
    constructor(actual: IKeyboardMapper);
    dumpDebugInfo(): string;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
}
