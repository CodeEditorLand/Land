import { UriComponents } from '../../../../../../base/common/uri.js';
import { IWorkerServer, IWorkerClient } from '../../../../../../base/common/worker/simpleWorker.js';
import { StateDeltas } from './textMateTokenizationWorker.worker.js';
export declare abstract class TextMateWorkerHost {
    static CHANNEL_NAME: string;
    static getChannel(workerServer: IWorkerServer): TextMateWorkerHost;
    static setChannel(workerClient: IWorkerClient<any>, obj: TextMateWorkerHost): void;
    abstract $readFile(_resource: UriComponents): Promise<string>;
    abstract $setTokensAndStates(controllerId: number, versionId: number, tokens: Uint8Array, lineEndStateDeltas: StateDeltas[]): Promise<void>;
    abstract $reportTokenizationTime(timeMs: number, languageId: string, sourceExtensionId: string | undefined, lineLength: number, isRandomSample: boolean): void;
}
