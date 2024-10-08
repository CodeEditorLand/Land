import { IChatResponseViewModel } from '../../common/chatViewModel.js';
import { ICodeBlockActionContext, ICodeCompareBlockActionContext } from '../codeBlockPart.js';
export interface IChatCodeBlockActionContext extends ICodeBlockActionContext {
    element: IChatResponseViewModel;
}
export declare function isCodeBlockActionContext(thing: unknown): thing is ICodeBlockActionContext;
export declare function isCodeCompareBlockActionContext(thing: unknown): thing is ICodeCompareBlockActionContext;
export declare function registerChatCodeBlockActions(): void;
export declare function registerChatCodeCompareBlockActions(): void;
