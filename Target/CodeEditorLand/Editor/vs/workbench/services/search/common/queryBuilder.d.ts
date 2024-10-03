import * as glob from '../../../../base/common/glob.js';
import { URI, URI as uri, UriComponents } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService, IWorkspaceFolderData } from '../../../../platform/workspace/common/workspace.js';
import { IEditorGroupsService } from '../../editor/common/editorGroupsService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IAITextQuery, IFileQuery, IPatternInfo, ITextQuery, ITextSearchPreviewOptions } from './search.js';
import { GlobPattern } from './searchExtTypes.js';
export interface ISearchPathPattern {
    searchPath: uri;
    pattern?: glob.IExpression;
}
type ISearchPathPatternBuilder = string | string[];
export interface ISearchPatternBuilder<U extends UriComponents> {
    uri?: U;
    pattern: ISearchPathPatternBuilder;
}
export declare function isISearchPatternBuilder<U extends UriComponents>(object: ISearchPatternBuilder<U> | ISearchPathPatternBuilder): object is ISearchPatternBuilder<U>;
export declare function globPatternToISearchPatternBuilder(globPattern: GlobPattern): ISearchPatternBuilder<URI>;
export interface ISearchPathsInfo {
    searchPaths?: ISearchPathPattern[];
    pattern?: glob.IExpression;
}
interface ICommonQueryBuilderOptions<U extends UriComponents = URI> {
    _reason?: string;
    excludePattern?: ISearchPatternBuilder<U>[];
    includePattern?: ISearchPathPatternBuilder;
    extraFileResources?: U[];
    expandPatterns?: boolean;
    maxResults?: number;
    maxFileSize?: number;
    disregardIgnoreFiles?: boolean;
    disregardGlobalIgnoreFiles?: boolean;
    disregardParentIgnoreFiles?: boolean;
    disregardExcludeSettings?: boolean;
    disregardSearchExcludeSettings?: boolean;
    ignoreSymlinks?: boolean;
    onlyOpenEditors?: boolean;
    onlyFileScheme?: boolean;
}
export interface IFileQueryBuilderOptions<U extends UriComponents = URI> extends ICommonQueryBuilderOptions<U> {
    filePattern?: string;
    exists?: boolean;
    sortByScore?: boolean;
    cacheKey?: string;
    shouldGlobSearch?: boolean;
}
export interface ITextQueryBuilderOptions<U extends UriComponents = URI> extends ICommonQueryBuilderOptions<U> {
    previewOptions?: ITextSearchPreviewOptions;
    fileEncoding?: string;
    surroundingContext?: number;
    isSmartCase?: boolean;
    notebookSearchConfig?: {
        includeMarkupInput: boolean;
        includeMarkupPreview: boolean;
        includeCodeInput: boolean;
        includeOutput: boolean;
    };
}
export declare class QueryBuilder {
    private readonly configurationService;
    private readonly workspaceContextService;
    private readonly editorGroupsService;
    private readonly logService;
    private readonly pathService;
    private readonly uriIdentityService;
    constructor(configurationService: IConfigurationService, workspaceContextService: IWorkspaceContextService, editorGroupsService: IEditorGroupsService, logService: ILogService, pathService: IPathService, uriIdentityService: IUriIdentityService);
    aiText(contentPattern: string, folderResources?: uri[], options?: ITextQueryBuilderOptions): IAITextQuery;
    text(contentPattern: IPatternInfo, folderResources?: uri[], options?: ITextQueryBuilderOptions): ITextQuery;
    private getContentPattern;
    file(folders: (IWorkspaceFolderData | URI)[], options?: IFileQueryBuilderOptions): IFileQuery;
    private handleIncludeExclude;
    private commonQuery;
    private commonQueryFromFileList;
    private isCaseSensitive;
    private isMultiline;
    parseSearchPaths(pattern: string | string[]): ISearchPathsInfo;
    private getExcludesForFolder;
    private expandSearchPathPatterns;
    private expandOneSearchPath;
    private resolveOneSearchPathPattern;
    private getFolderQueryForSearchPath;
    private getFolderQueryForRoot;
}
export declare function resolveResourcesForSearchIncludes(resources: URI[], contextService: IWorkspaceContextService): string[];
export {};
