import { URI } from '../../base/common/uri.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IExpression } from '../../base/common/glob.js';
import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { IConfigurationService, IConfigurationChangeEvent } from '../../platform/configuration/common/configuration.js';
export declare class ResourceGlobMatcher extends Disposable {
    private getExpression;
    private shouldUpdate;
    private readonly contextService;
    private readonly configurationService;
    private static readonly NO_FOLDER;
    private readonly _onExpressionChange;
    readonly onExpressionChange: import("../workbench.web.main.internal.js").Event<void>;
    private readonly mapFolderToParsedExpression;
    private readonly mapFolderToConfiguredExpression;
    constructor(getExpression: (folder?: URI) => IExpression | undefined, shouldUpdate: (event: IConfigurationChangeEvent) => boolean, contextService: IWorkspaceContextService, configurationService: IConfigurationService);
    private registerListeners;
    private updateExpressions;
    private doGetExpression;
    matches(resource: URI, hasSibling?: (name: string) => boolean): boolean;
    private uriToPath;
}
