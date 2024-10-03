import { Disposable } from '../../../../../base/common/lifecycle.js';
import { INotebookRendererMessagingService, IScopedRendererMessaging } from '../../common/notebookRendererMessagingService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
type MessageToSend = {
    editorId: string;
    rendererId: string;
    message: unknown;
};
export declare class NotebookRendererMessagingService extends Disposable implements INotebookRendererMessagingService {
    private readonly extensionService;
    _serviceBrand: undefined;
    private readonly activations;
    private readonly scopedMessaging;
    private readonly postMessageEmitter;
    readonly onShouldPostMessage: import("../../../../workbench.web.main.internal.js").Event<MessageToSend>;
    constructor(extensionService: IExtensionService);
    receiveMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
    prepare(rendererId: string): void;
    getScoped(editorId: string): IScopedRendererMessaging;
    private postMessage;
}
export {};
