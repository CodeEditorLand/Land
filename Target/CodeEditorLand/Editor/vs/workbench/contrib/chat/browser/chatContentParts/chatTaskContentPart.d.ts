import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { CollapsibleListPool } from './chatReferencesContentPart.js';
import { IChatProgressRenderableResponseContent } from '../../common/chatModel.js';
import { IChatTask } from '../../common/chatService.js';
export declare class ChatTaskContentPart extends Disposable implements IChatContentPart {
    private readonly task;
    readonly domNode: HTMLElement;
    readonly onDidChangeHeight: Event<void>;
    constructor(task: IChatTask, contentReferencesListPool: CollapsibleListPool, renderer: MarkdownRenderer, context: IChatContentPartRenderContext, instantiationService: IInstantiationService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
