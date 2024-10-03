import { Stats } from 'fs';
import { URI } from '../../../base/common/uri.js';
import { IEmptyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare const NON_EMPTY_WORKSPACE_ID_LENGTH: number;
export declare function getWorkspaceIdentifier(configPath: URI): IWorkspaceIdentifier;
export declare function getSingleFolderWorkspaceIdentifier(folderUri: URI): ISingleFolderWorkspaceIdentifier | undefined;
export declare function getSingleFolderWorkspaceIdentifier(folderUri: URI, folderStat: Stats): ISingleFolderWorkspaceIdentifier;
export declare function createEmptyWorkspaceIdentifier(): IEmptyWorkspaceIdentifier;
