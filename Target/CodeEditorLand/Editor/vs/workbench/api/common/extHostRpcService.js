import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
export const IExtHostRpcService = createDecorator('IExtHostRpcService');
export class ExtHostRpcService {
    constructor(rpcProtocol) {
        this.getProxy = rpcProtocol.getProxy.bind(rpcProtocol);
        this.set = rpcProtocol.set.bind(rpcProtocol);
        this.dispose = rpcProtocol.dispose.bind(rpcProtocol);
        this.assertRegistered = rpcProtocol.assertRegistered.bind(rpcProtocol);
        this.drain = rpcProtocol.drain.bind(rpcProtocol);
    }
}
