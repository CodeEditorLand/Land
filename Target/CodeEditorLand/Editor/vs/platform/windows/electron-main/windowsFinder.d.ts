import { URI } from '../../../base/common/uri.js';
import { ICodeWindow } from '../../window/electron-main/window.js';
import { IResolvedWorkspace, IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare function findWindowOnFile(windows: ICodeWindow[], fileUri: URI, localWorkspaceResolver: (workspace: IWorkspaceIdentifier) => Promise<IResolvedWorkspace | undefined>): Promise<ICodeWindow | undefined>;
export declare function findWindowOnWorkspaceOrFolder(windows: ICodeWindow[], folderOrWorkspaceConfigUri: URI): ICodeWindow | undefined;
export declare function findWindowOnExtensionDevelopmentPath(windows: ICodeWindow[], extensionDevelopmentPaths: string[]): ICodeWindow | undefined;
