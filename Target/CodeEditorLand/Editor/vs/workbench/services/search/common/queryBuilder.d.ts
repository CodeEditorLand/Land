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
/**
 * One folder to search and a set of glob expressions that should be applied.
 */
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
/**
 * A set of search paths and a set of glob expressions that should be applied.
 */
export interface ISearchPathsInfo {
    searchPaths?: ISearchPathPattern[];
    pattern?: glob.IExpression;
}
interface ICommonQueryBuilderOptions<U extends UriComponents = URI> {
    _reason?: string;
    excludePattern?: ISearchPatternBuilder<U>[];
    includePattern?: ISearchPathPatternBuilder;
    extraFileResources?: U[];
    /** Parse the special ./ syntax supported by the searchview, and expand foo to ** /foo */
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
    /**
     * Adjusts input pattern for config
     */
    private getContentPattern;
    file(folders: (IWorkspaceFolderData | URI)[], options?: IFileQueryBuilderOptions): IFileQuery;
    private handleIncludeExclude;
    private commonQuery;
    private commonQueryFromFileList;
    /**
     * Resolve isCaseSensitive flag based on the query and the isSmartCase flag, for search providers that don't support smart case natively.
     */
    private isCaseSensitive;
    private isMultiline;
    /**
     * Take the includePattern as seen in the search viewlet, and split into components that look like searchPaths, and
     * glob patterns. Glob patterns are expanded from 'foo/bar' to '{foo/bar/**, **\/foo/bar}.
     *
     * Public for test.
     */
    parseSearchPaths(pattern: string | string[]): ISearchPathsInfo;
    private getExcludesForFolder;
    /**
     * Split search paths (./ or ../ or absolute paths in the includePatterns) into absolute paths and globs applied to those paths
     */
    private expandSearchPathPatterns;
    /**
     * Takes a searchPath like `./a/foo` or `../a/foo` and expands it to absolute paths for all the workspaces it matches.
     */
    private expandOneSearchPath;
    private resolveOneSearchPathPattern;
    private getFolderQueryForSearchPath;
    private getFolderQueryForRoot;
}
/**
 * Construct an include pattern from a list of folders uris to search in.
 */
export declare function resolveResourcesForSearchIncludes(resources: URI[], contextService: IWorkspaceContextService): string[];
export {};
