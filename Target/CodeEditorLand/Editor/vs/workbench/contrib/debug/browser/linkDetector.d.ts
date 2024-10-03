import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITunnelService } from '../../../../platform/tunnel/common/tunnel.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { IDebugSession } from '../common/debug.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
export declare const enum DebugLinkHoverBehavior {
    Rich = 0,
    Basic = 1,
    None = 2
}
export type DebugLinkHoverBehaviorTypeData = {
    type: DebugLinkHoverBehavior.None | DebugLinkHoverBehavior.Basic;
} | {
    type: DebugLinkHoverBehavior.Rich;
    store: DisposableStore;
};
export interface ILinkDetector {
    linkify(text: string, splitLines?: boolean, workspaceFolder?: IWorkspaceFolder, includeFulltext?: boolean, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
    linkifyLocation(text: string, locationReference: number, session: IDebugSession, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
}
export declare class LinkDetector implements ILinkDetector {
    private readonly editorService;
    private readonly fileService;
    private readonly openerService;
    private readonly pathService;
    private readonly tunnelService;
    private readonly environmentService;
    private readonly configurationService;
    private readonly hoverService;
    constructor(editorService: IEditorService, fileService: IFileService, openerService: IOpenerService, pathService: IPathService, tunnelService: ITunnelService, environmentService: IWorkbenchEnvironmentService, configurationService: IConfigurationService, hoverService: IHoverService);
    linkify(text: string, splitLines?: boolean, workspaceFolder?: IWorkspaceFolder, includeFulltext?: boolean, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
    private _linkify;
    linkifyLocation(text: string, locationReference: number, session: IDebugSession, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
    makeReferencedLinkDetector(locationReference: number, session: IDebugSession): ILinkDetector;
    private createWebLink;
    private createPathLink;
    private createLink;
    private decorateLink;
    private detectLinks;
}
