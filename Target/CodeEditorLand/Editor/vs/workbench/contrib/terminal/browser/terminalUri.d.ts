import { URI } from '../../../../base/common/uri.js';
import { ITerminalInstance } from './terminal.js';
export declare function parseTerminalUri(resource: URI): ITerminalIdentifier;
export declare function getTerminalUri(workspaceId: string, instanceId: number, title?: string): URI;
export interface ITerminalIdentifier {
    workspaceId: string;
    instanceId: number | undefined;
}
export interface IPartialDragEvent {
    dataTransfer: Pick<DataTransfer, 'getData'> | null;
}
export declare function getTerminalResourcesFromDragEvent(event: IPartialDragEvent): URI[] | undefined;
export declare function getInstanceFromResource<T extends Pick<ITerminalInstance, 'resource'>>(instances: T[], resource: URI | undefined): T | undefined;
