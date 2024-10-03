import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { IChatContentPart } from './chatContentParts.js';
import { IChatProgressRenderableResponseContent } from '../../common/chatModel.js';
export declare class ChatWarningContentPart extends Disposable implements IChatContentPart {
    readonly domNode: HTMLElement;
    constructor(kind: 'info' | 'warning' | 'error', content: IMarkdownString, renderer: MarkdownRenderer);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
}
