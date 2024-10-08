import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { WorkbenchCompressibleAsyncDataTree } from '../../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ChatTreeItem } from '../chat.js';
import { IDisposableReference } from './chatCollections.js';
import { IChatContentPart } from './chatContentParts.js';
import { IChatProgressRenderableResponseContent } from '../../common/chatModel.js';
import { IChatResponseProgressFileTreeData } from '../../common/chatService.js';
export declare class ChatTreeContentPart extends Disposable implements IChatContentPart {
    private readonly openerService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    readonly onDidFocus: Event<void>;
    private tree;
    constructor(data: IChatResponseProgressFileTreeData, element: ChatTreeItem, treePool: TreePool, treeDataIndex: number, openerService: IOpenerService);
    domFocus(): void;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
export declare class TreePool extends Disposable {
    private _onDidChangeVisibility;
    private readonly instantiationService;
    private readonly configService;
    private readonly themeService;
    private _pool;
    get inUse(): ReadonlySet<WorkbenchCompressibleAsyncDataTree<IChatResponseProgressFileTreeData, IChatResponseProgressFileTreeData, void>>;
    constructor(_onDidChangeVisibility: Event<boolean>, instantiationService: IInstantiationService, configService: IConfigurationService, themeService: IThemeService);
    private treeFactory;
    get(): IDisposableReference<WorkbenchCompressibleAsyncDataTree<IChatResponseProgressFileTreeData, IChatResponseProgressFileTreeData, void>>;
}
