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
    /** A nice workbench hover */
    Rich = 0,
    /**
     * Basic browser hover
     * @deprecated Consumers should adopt `rich` by propagating disposables appropriately
     */
    Basic = 1,
    /** No hover */
    None = 2
}
/** Store implies HoverBehavior=rich */
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
    /**
     * Matches and handles web urls, absolute and relative file links in the string provided.
     * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/>.
     * 'onclick' event is attached to all anchored links that opens them in the editor.
     * When splitLines is true, each line of the text, even if it contains no links, is wrapped in a <span>
     * and added as a child of the returned <span>.
     * If a `hoverBehavior` is passed, hovers may be added using the workbench hover service.
     * This should be preferred for new code where hovers are desirable.
     */
    linkify(text: string, splitLines?: boolean, workspaceFolder?: IWorkspaceFolder, includeFulltext?: boolean, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
    private _linkify;
    /**
     * Linkifies a location reference.
     */
    linkifyLocation(text: string, locationReference: number, session: IDebugSession, hoverBehavior?: DebugLinkHoverBehaviorTypeData): HTMLElement;
    /**
     * Makes an {@link ILinkDetector} that links everything in the output to the
     * reference if they don't have other explicit links.
     */
    makeReferencedLinkDetector(locationReference: number, session: IDebugSession): ILinkDetector;
    private createWebLink;
    private createPathLink;
    private createLink;
    private decorateLink;
    private detectLinks;
}
