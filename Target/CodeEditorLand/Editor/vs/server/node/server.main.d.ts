import * as net from 'net';
import { IServerAPI } from './remoteExtensionHostAgentServer.js';
export declare function spawnCli(): void;
export declare function createServer(address: string | net.AddressInfo | null): Promise<IServerAPI>;
