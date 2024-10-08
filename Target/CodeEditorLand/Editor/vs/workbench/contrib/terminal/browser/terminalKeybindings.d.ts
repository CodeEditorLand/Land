import { ContextKeyExpression } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindings } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
export declare function registerSendSequenceKeybinding(text: string, rule: {
    when?: ContextKeyExpression;
} & IKeybindings): void;
