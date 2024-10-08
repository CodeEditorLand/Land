import { Disposable } from '../../../base/common/lifecycle.js';
import { ICodeMapperService } from '../../contrib/chat/common/chatCodeMapperService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { ICodeMapperProgressDto, MainThreadCodeMapperShape } from '../common/extHost.protocol.js';
export declare class MainThreadChatCodemapper extends Disposable implements MainThreadCodeMapperShape {
    private readonly codeMapperService;
    private providers;
    private readonly _proxy;
    private static _requestHandlePool;
    private _responseMap;
    constructor(extHostContext: IExtHostContext, codeMapperService: ICodeMapperService);
    $registerCodeMapperProvider(handle: number): void;
    $unregisterCodeMapperProvider(handle: number): void;
    $handleProgress(requestId: string, data: ICodeMapperProgressDto): Promise<void>;
}
