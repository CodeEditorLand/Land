import { Client as MessagePortClient } from '../common/ipc.mp.js';
export class Client extends MessagePortClient {
    constructor(port, clientId) {
        super(port, clientId);
    }
}
