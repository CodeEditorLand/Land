import { ILink } from '../../../../editor/common/languages.js';
import { URI } from '../../../../base/common/uri.js';
import { IRequestHandler, IWorkerServer } from '../../../../base/common/worker/simpleWorker.js';
export interface IResourceCreator {
    toResource: (folderRelativePath: string) => URI | null;
}
export declare class OutputLinkComputer implements IRequestHandler {
    _requestHandlerBrand: any;
    private readonly workerTextModelSyncServer;
    private patterns;
    constructor(workerServer: IWorkerServer);
    $setWorkspaceFolders(workspaceFolders: string[]): void;
    private computePatterns;
    private getModel;
    $computeLinks(uri: string): ILink[];
    static createPatterns(workspaceFolder: URI): RegExp[];
    /**
     * Detect links. Made static to allow for tests.
     */
    static detectLinks(line: string, lineIndex: number, patterns: RegExp[], resourceCreator: IResourceCreator): ILink[];
}
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): OutputLinkComputer;
