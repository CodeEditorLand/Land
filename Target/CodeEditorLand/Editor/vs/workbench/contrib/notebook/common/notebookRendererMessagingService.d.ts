import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
export declare const INotebookRendererMessagingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookRendererMessagingService>;
export interface INotebookRendererMessagingService {
    readonly _serviceBrand: undefined;
    onShouldPostMessage: Event<{
        editorId: string;
        rendererId: string;
        message: unknown;
    }>;
    prepare(rendererId: string): void;
    getScoped(editorId: string): IScopedRendererMessaging;
    receiveMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
}
export interface IScopedRendererMessaging extends IDisposable {
    receiveMessageHandler?: (rendererId: string, message: unknown) => Promise<boolean>;
    postMessage(rendererId: string, message: unknown): void;
}
