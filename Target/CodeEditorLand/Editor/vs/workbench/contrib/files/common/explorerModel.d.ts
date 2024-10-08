import { URI } from '../../../../base/common/uri.js';
import { IFileStat, IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { SortOrder } from './files.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
export declare class ExplorerModel implements IDisposable {
    private readonly contextService;
    private readonly uriIdentityService;
    private _roots;
    private _listener;
    private readonly _onDidChangeRoots;
    constructor(contextService: IWorkspaceContextService, uriIdentityService: IUriIdentityService, fileService: IFileService, configService: IConfigurationService, filesConfigService: IFilesConfigurationService);
    get roots(): ExplorerItem[];
    get onDidChangeRoots(): Event<void>;
    /**
     * Returns an array of child stat from this stat that matches with the provided path.
     * Starts matching from the first root.
     * Will return empty array in case the FileStat does not exist.
     */
    findAll(resource: URI): ExplorerItem[];
    /**
     * Returns a FileStat that matches the passed resource.
     * In case multiple FileStat are matching the resource (same folder opened multiple times) returns the FileStat that has the closest root.
     * Will return undefined in case the FileStat does not exist.
     */
    findClosest(resource: URI): ExplorerItem | null;
    dispose(): void;
}
export declare class ExplorerItem {
    resource: URI;
    private readonly fileService;
    private readonly configService;
    private readonly filesConfigService;
    private _parent;
    private _isDirectory?;
    private _isSymbolicLink?;
    private _readonly?;
    private _locked?;
    private _name;
    private _mtime?;
    private _unknown;
    _isDirectoryResolved: boolean;
    error: Error | undefined;
    private _isExcluded;
    nestedParent: ExplorerItem | undefined;
    nestedChildren: ExplorerItem[] | undefined;
    constructor(resource: URI, fileService: IFileService, configService: IConfigurationService, filesConfigService: IFilesConfigurationService, _parent: ExplorerItem | undefined, _isDirectory?: boolean | undefined, _isSymbolicLink?: boolean | undefined, _readonly?: boolean | undefined, _locked?: boolean | undefined, _name?: string, _mtime?: number | undefined, _unknown?: boolean);
    get isExcluded(): boolean;
    set isExcluded(value: boolean);
    hasChildren(filter: (stat: ExplorerItem) => boolean): boolean;
    get hasNests(): boolean;
    get isDirectoryResolved(): boolean;
    get isSymbolicLink(): boolean;
    get isDirectory(): boolean;
    get isReadonly(): boolean | IMarkdownString;
    get mtime(): number | undefined;
    get name(): string;
    get isUnknown(): boolean;
    get parent(): ExplorerItem | undefined;
    get root(): ExplorerItem;
    get children(): Map<string, ExplorerItem>;
    private updateName;
    getId(): string;
    toString(): string;
    get isRoot(): boolean;
    static create(fileService: IFileService, configService: IConfigurationService, filesConfigService: IFilesConfigurationService, raw: IFileStat, parent: ExplorerItem | undefined, resolveTo?: readonly URI[]): ExplorerItem;
    /**
     * Merges the stat which was resolved from the disk with the local stat by copying over properties
     * and children. The merge will only consider resolved stat elements to avoid overwriting data which
     * exists locally.
     */
    static mergeLocalWithDisk(disk: ExplorerItem, local: ExplorerItem): void;
    /**
     * Adds a child element to this folder.
     */
    addChild(child: ExplorerItem): void;
    getChild(name: string): ExplorerItem | undefined;
    fetchChildren(sortOrder: SortOrder): ExplorerItem[] | Promise<ExplorerItem[]>;
    private _fileNester;
    private get fileNester();
    /**
     * Removes a child element from this folder.
     */
    removeChild(child: ExplorerItem): void;
    forgetChildren(): void;
    private getPlatformAwareName;
    /**
     * Moves this element under a new parent element.
     */
    move(newParent: ExplorerItem): void;
    private updateResource;
    /**
     * Tells this stat that it was renamed. This requires changes to all children of this stat (if any)
     * so that the path property can be updated properly.
     */
    rename(renamedStat: {
        name: string;
        mtime?: number;
    }): void;
    /**
     * Returns a child stat from this stat that matches with the provided path.
     * Will return "null" in case the child does not exist.
     */
    find(resource: URI): ExplorerItem | null;
    private findByPath;
}
export declare class NewExplorerItem extends ExplorerItem {
    constructor(fileService: IFileService, configService: IConfigurationService, filesConfigService: IFilesConfigurationService, parent: ExplorerItem, isDirectory: boolean);
}
