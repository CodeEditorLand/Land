import * as dom from '../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IContextKeyService, IScopedContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { ChatEditorInput } from './chatEditorInput.js';
import { IExportableChatData, ISerializableChatData } from '../common/chatModel.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
export interface IChatEditorOptions extends IEditorOptions {
    target?: {
        sessionId: string;
    } | {
        data: IExportableChatData | ISerializableChatData;
    };
}
export declare class ChatEditor extends EditorPane {
    private readonly instantiationService;
    private readonly storageService;
    private readonly contextKeyService;
    private widget;
    private _scopedContextKeyService;
    get scopedContextKeyService(): IScopedContextKeyService;
    private _memento;
    private _viewState;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, instantiationService: IInstantiationService, storageService: IStorageService, contextKeyService: IContextKeyService);
    private clear;
    protected createEditor(parent: HTMLElement): void;
    protected setEditorVisible(visible: boolean): void;
    focus(): void;
    clearInput(): void;
    setInput(input: ChatEditorInput, options: IChatEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private updateModel;
    protected saveState(): void;
    getViewState(): object | undefined;
    layout(dimension: dom.Dimension, position?: dom.IDomPosition | undefined): void;
}
