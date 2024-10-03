import { localize } from '../../../../nls.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { CHAT_PROVIDER_ID } from '../common/chatParticipantContribTypes.js';
export const IChatWidgetService = createDecorator('chatWidgetService');
export async function showChatView(viewsService) {
    return (await viewsService.openView(CHAT_VIEW_ID))?.widget;
}
export async function showEditsView(viewsService) {
    return (await viewsService.openView(EDITS_VIEW_ID))?.widget;
}
export const IQuickChatService = createDecorator('quickChatService');
export const IChatAccessibilityService = createDecorator('chatAccessibilityService');
export const IChatCodeBlockContextProviderService = createDecorator('chatCodeBlockContextProviderService');
export const GeneratingPhrase = localize('generating', "Generating");
export const CHAT_VIEW_ID = `workbench.panel.chat.view.${CHAT_PROVIDER_ID}`;
export const EDITS_VIEW_ID = 'workbench.panel.chat.view.edits';
