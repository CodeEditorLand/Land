import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../common/chatService.js';
import { IChatRendererContent } from '../../common/chatViewModel.js';
import { ChatTreeItem } from '../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
export declare class ChatToolInvocationPart extends Disposable implements IChatContentPart {
    readonly domNode: HTMLElement;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../workbench.web.main.internal.js").Event<void>;
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, renderer: MarkdownRenderer, instantiationService: IInstantiationService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    addDisposable(disposable: IDisposable): void;
}
