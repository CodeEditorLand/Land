import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ChatTreeItem } from '../chat.js';
import { IChatRendererContent } from '../../common/chatViewModel.js';
export interface IChatContentPart extends IDisposable {
    domNode: HTMLElement;
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
}
export interface IChatContentPartRenderContext {
    element: ChatTreeItem;
    content: ReadonlyArray<IChatRendererContent>;
    contentIndex: number;
    preceedingContentParts: ReadonlyArray<IChatContentPart>;
}
