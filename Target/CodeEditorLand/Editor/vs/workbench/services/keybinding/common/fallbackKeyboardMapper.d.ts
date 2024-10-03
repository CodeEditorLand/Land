import { ResolvedKeybinding, Keybinding } from '../../../../base/common/keybindings.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { IKeyboardEvent } from '../../../../platform/keybinding/common/keybinding.js';
import { IKeyboardMapper } from '../../../../platform/keyboardLayout/common/keyboardMapper.js';
export declare class FallbackKeyboardMapper implements IKeyboardMapper {
    private readonly _mapAltGrToCtrlAlt;
    private readonly _OS;
    constructor(_mapAltGrToCtrlAlt: boolean, _OS: OperatingSystem);
    dumpDebugInfo(): string;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
}
