import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable, IReference } from '../../../../../base/common/lifecycle.js';
import { IResolvedTextEditorModel } from '../../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatListItemRendererOptions } from '../chat.js';
import { IDisposableReference } from './chatCollections.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatRendererDelegate } from '../chatListRenderer.js';
import { ChatEditorOptions } from '../chatOptions.js';
import { CodeCompareBlockPart } from '../codeBlockPart.js';
import { IChatProgressRenderableResponseContent, IChatTextEditGroup } from '../../common/chatModel.js';
import { IChatResponseViewModel } from '../../common/chatViewModel.js';
declare const ICodeCompareModelService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeCompareModelService>;
interface ICodeCompareModelService {
    _serviceBrand: undefined;
    createModel(response: IChatResponseViewModel, chatTextEdit: IChatTextEditGroup): Promise<IReference<{
        originalSha1: string;
        original: IResolvedTextEditorModel;
        modified: IResolvedTextEditorModel;
    }>>;
}
export declare class ChatTextEditContentPart extends Disposable implements IChatContentPart {
    private readonly codeCompareModelService;
    readonly domNode: HTMLElement;
    private readonly comparePart;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    constructor(chatTextEdit: IChatTextEditGroup, context: IChatContentPartRenderContext, rendererOptions: IChatListItemRendererOptions, diffEditorPool: DiffEditorPool, currentWidth: number, codeCompareModelService: ICodeCompareModelService);
    layout(width: number): void;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
export declare class DiffEditorPool extends Disposable {
    private readonly _pool;
    inUse(): Iterable<CodeCompareBlockPart>;
    constructor(options: ChatEditorOptions, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService);
    get(): IDisposableReference<CodeCompareBlockPart>;
}
export {};
