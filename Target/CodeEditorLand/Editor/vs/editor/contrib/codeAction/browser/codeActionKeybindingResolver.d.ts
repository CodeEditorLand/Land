import { ResolvedKeybinding } from '../../../../base/common/keybindings.js';
import { CodeAction } from '../../../common/languages.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export declare class CodeActionKeybindingResolver {
    private readonly keybindingService;
    private static readonly codeActionCommands;
    constructor(keybindingService: IKeybindingService);
    getResolver(): (action: CodeAction) => ResolvedKeybinding | undefined;
    private bestKeybindingForCodeAction;
}
