import { URI } from '../../../../../base/common/uri.js';
import { Event } from '../../../../../base/common/event.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IDecorationsProvider, IDecorationData } from '../../../../services/decorations/common/decorations.js';
import { ExplorerItem } from '../../common/explorerModel.js';
import { IExplorerService } from '../files.js';
export declare function provideDecorations(fileStat: ExplorerItem): IDecorationData | undefined;
export declare class ExplorerDecorationsProvider implements IDecorationsProvider {
    private explorerService;
    readonly label: string;
    private readonly _onDidChange;
    private readonly toDispose;
    constructor(explorerService: IExplorerService, contextService: IWorkspaceContextService);
    get onDidChange(): Event<URI[]>;
    provideDecorations(resource: URI): Promise<IDecorationData | undefined>;
    dispose(): void;
}
