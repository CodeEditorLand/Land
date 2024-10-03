import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { AbstractInlineChatAction, setHoldForSpeech } from '../browser/inlineChatActions.js';
import { disposableTimeout } from '../../../../base/common/async.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { StartVoiceChatAction, StopListeningAction, VOICE_KEY_HOLD_THRESHOLD } from '../../chat/electron-sandbox/actions/voiceChatActions.js';
import { CTX_INLINE_CHAT_VISIBLE } from '../common/inlineChat.js';
import { HasSpeechProvider, ISpeechService } from '../../speech/common/speechService.js';
import { localize2 } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export class HoldToSpeak extends AbstractInlineChatAction {
    constructor() {
        super({
            id: 'inlineChat.holdForSpeech',
            precondition: ContextKeyExpr.and(HasSpeechProvider, CTX_INLINE_CHAT_VISIBLE),
            title: localize2('holdForSpeech', "Hold for Speech"),
            keybinding: {
                when: EditorContextKeys.textInputFocus,
                weight: 200,
                primary: 2048 | 39,
            },
        });
    }
    runInlineChatCommand(accessor, ctrl, editor, ...args) {
        holdForSpeech(accessor, ctrl, this);
    }
}
function holdForSpeech(accessor, ctrl, action) {
    const configService = accessor.get(IConfigurationService);
    const speechService = accessor.get(ISpeechService);
    const keybindingService = accessor.get(IKeybindingService);
    const commandService = accessor.get(ICommandService);
    if (!configService.getValue("inlineChat.holdToSpeech" || !speechService.hasSpeechProvider)) {
        return;
    }
    const holdMode = keybindingService.enableKeybindingHoldMode(action.desc.id);
    if (!holdMode) {
        return;
    }
    let listening = false;
    const handle = disposableTimeout(() => {
        commandService.executeCommand(StartVoiceChatAction.ID, { voice: { disableTimeout: true } });
        listening = true;
    }, VOICE_KEY_HOLD_THRESHOLD);
    holdMode.finally(() => {
        if (listening) {
            commandService.executeCommand(StopListeningAction.ID).finally(() => {
                ctrl.acceptInput();
            });
        }
        handle.dispose();
    });
}
setHoldForSpeech(holdForSpeech);
