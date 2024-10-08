import { Session } from './inlineChatSession.js';
export declare const IInlineChatSavingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInlineChatSavingService>;
export interface IInlineChatSavingService {
    _serviceBrand: undefined;
    markChanged(session: Session): void;
}
