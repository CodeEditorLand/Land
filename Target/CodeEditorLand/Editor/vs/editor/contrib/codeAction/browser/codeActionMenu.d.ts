import '../../../../base/browser/ui/codicons/codiconStyles.js';
import { ResolvedKeybinding } from '../../../../base/common/keybindings.js';
import { CodeAction } from '../../../common/languages.js';
import { CodeActionItem } from '../common/types.js';
import '../../symbolIcons/browser/symbolIcons.js';
import { IActionListItem } from '../../../../platform/actionWidget/browser/actionList.js';
export declare function toMenuItems(inputCodeActions: readonly CodeActionItem[], showHeaders: boolean, keybindingResolver: (action: CodeAction) => ResolvedKeybinding | undefined): IActionListItem<CodeActionItem>[];
