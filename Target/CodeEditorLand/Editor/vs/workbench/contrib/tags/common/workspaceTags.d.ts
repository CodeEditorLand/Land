import { WorkbenchState, IWorkspace } from '../../../../platform/workspace/common/workspace.js';
import { URI } from '../../../../base/common/uri.js';
export type Tags = {
    [index: string]: boolean | number | string | undefined;
};
export declare const IWorkspaceTagsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceTagsService>;
export interface IWorkspaceTagsService {
    readonly _serviceBrand: undefined;
    getTags(): Promise<Tags>;
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
}
export declare function getHashedRemotesFromConfig(text: string, stripEndingDotGit: boolean | undefined, sha1Hex: (str: string) => Promise<string>): Promise<string[]>;
