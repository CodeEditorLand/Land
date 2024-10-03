import { VSBuffer } from '../../../../base/common/buffer.js';
import { IReadonlyVSDataTransfer } from '../../../../base/common/dataTransfer.js';
export declare class DataTransferFileCache {
    private requestIdPool;
    private readonly dataTransferFiles;
    add(dataTransfer: IReadonlyVSDataTransfer): {
        id: number;
        dispose: () => void;
    };
    resolveFileData(requestId: number, dataItemId: string): Promise<VSBuffer>;
    dispose(): void;
}
