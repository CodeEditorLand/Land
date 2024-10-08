/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { InlineChatController } from './inlineChatController.js';
import * as InlineChatActions from './inlineChatActions.js';
import { CTX_INLINE_CHAT_EDITING, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, INLINE_CHAT_ID, MENU_INLINE_CHAT_WIDGET_STATUS } from '../common/inlineChat.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { InlineChatNotebookContribution } from './inlineChatNotebook.js';
import { registerWorkbenchContribution2, Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { InlineChatSavingServiceImpl } from './inlineChatSavingServiceImpl.js';
import { InlineChatAccessibleView } from './inlineChatAccessibleView.js';
import { IInlineChatSavingService } from './inlineChatSavingService.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
import { InlineChatEnabler, InlineChatSessionServiceImpl } from './inlineChatSessionServiceImpl.js';
import { AccessibleViewRegistry } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { CancelAction, SubmitAction } from '../../chat/browser/actions/chatExecuteActions.js';
import { localize } from '../../../../nls.js';
import { CONTEXT_CHAT_INPUT_HAS_TEXT } from '../../chat/common/chatContextKeys.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { InlineChatAccessibilityHelp } from './inlineChatAccessibilityHelp.js';
import { InlineChatExansionContextKey, InlineChatExpandLineAction } from './inlineChatCurrentLine.js';
// --- browser
registerSingleton(IInlineChatSessionService, InlineChatSessionServiceImpl, 1 /* InstantiationType.Delayed */);
registerSingleton(IInlineChatSavingService, InlineChatSavingServiceImpl, 1 /* InstantiationType.Delayed */);
registerEditorContribution(INLINE_CHAT_ID, InlineChatController, 0 /* EditorContributionInstantiation.Eager */); // EAGER because of notebook dispose/create of editors
registerEditorContribution(InlineChatExansionContextKey.Id, InlineChatExansionContextKey, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
registerAction2(InlineChatExpandLineAction);
// --- MENU special ---
const editActionMenuItem = {
    group: '0_main',
    order: 0,
    command: {
        id: SubmitAction.ID,
        title: localize('send.edit', "Edit Code"),
    },
    when: ContextKeyExpr.and(CONTEXT_CHAT_INPUT_HAS_TEXT, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(), CTX_INLINE_CHAT_EDITING),
};
const generateActionMenuItem = {
    group: '0_main',
    order: 0,
    command: {
        id: SubmitAction.ID,
        title: localize('send.generate', "Generate"),
    },
    when: ContextKeyExpr.and(CONTEXT_CHAT_INPUT_HAS_TEXT, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(), CTX_INLINE_CHAT_EDITING.toNegated()),
};
MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, editActionMenuItem);
MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, generateActionMenuItem);
const cancelActionMenuItem = {
    group: '0_main',
    order: 0,
    command: {
        id: CancelAction.ID,
        title: localize('cancel', "Cancel Request"),
        shortTitle: localize('cancelShort', "Cancel"),
    },
    when: ContextKeyExpr.and(CTX_INLINE_CHAT_REQUEST_IN_PROGRESS),
};
MenuRegistry.appendMenuItem(MENU_INLINE_CHAT_WIDGET_STATUS, cancelActionMenuItem);
// --- actions ---
registerAction2(InlineChatActions.StartSessionAction);
registerAction2(InlineChatActions.CloseAction);
registerAction2(InlineChatActions.ConfigureInlineChatAction);
registerAction2(InlineChatActions.UnstashSessionAction);
registerAction2(InlineChatActions.DiscardHunkAction);
registerAction2(InlineChatActions.RerunAction);
registerAction2(InlineChatActions.MoveToNextHunk);
registerAction2(InlineChatActions.MoveToPreviousHunk);
registerAction2(InlineChatActions.ArrowOutUpAction);
registerAction2(InlineChatActions.ArrowOutDownAction);
registerAction2(InlineChatActions.FocusInlineChat);
registerAction2(InlineChatActions.ViewInChatAction);
registerAction2(InlineChatActions.ToggleDiffForChange);
registerAction2(InlineChatActions.AcceptChanges);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(InlineChatNotebookContribution, 3 /* LifecyclePhase.Restored */);
registerWorkbenchContribution2(InlineChatEnabler.Id, InlineChatEnabler, 3 /* WorkbenchPhase.AfterRestored */);
AccessibleViewRegistry.register(new InlineChatAccessibleView());
AccessibleViewRegistry.register(new InlineChatAccessibilityHelp());
