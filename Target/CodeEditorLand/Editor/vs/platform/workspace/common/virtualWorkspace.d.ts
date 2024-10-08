import { URI } from '../../../base/common/uri.js';
import { IWorkspace } from './workspace.js';
export declare function isVirtualResource(resource: URI): boolean;
export declare function getVirtualWorkspaceLocation(workspace: IWorkspace): {
    scheme: string;
    authority: string;
} | undefined;
export declare function getVirtualWorkspaceScheme(workspace: IWorkspace): string | undefined;
export declare function getVirtualWorkspaceAuthority(workspace: IWorkspace): string | undefined;
export declare function isVirtualWorkspace(workspace: IWorkspace): boolean;
