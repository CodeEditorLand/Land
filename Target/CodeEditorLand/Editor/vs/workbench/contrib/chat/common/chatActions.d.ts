import { MarshalledId } from '../../../../base/common/marshallingIds.js';
export interface IChatViewTitleActionContext {
    $mid: MarshalledId.ChatViewContext;
    sessionId: string;
}
export declare function isChatViewTitleActionContext(obj: unknown): obj is IChatViewTitleActionContext;
