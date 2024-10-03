var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { URI } from '../../../../base/common/uri.js';
import { isEqual } from '../../../../base/common/extpath.js';
import { posix } from '../../../../base/common/path.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { rtrim, startsWithIgnoreCase, equalsIgnoreCase } from '../../../../base/common/strings.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { dispose } from '../../../../base/common/lifecycle.js';
import { memoize } from '../../../../base/common/decorators.js';
import { Emitter } from '../../../../base/common/event.js';
import { joinPath, isEqualOrParent, basenameOrAuthority } from '../../../../base/common/resources.js';
import { ExplorerFileNestingTrie } from './explorerFileNestingTrie.js';
import { assertIsDefined } from '../../../../base/common/types.js';
export class ExplorerModel {
    constructor(contextService, uriIdentityService, fileService, configService, filesConfigService) {
        this.contextService = contextService;
        this.uriIdentityService = uriIdentityService;
        this._onDidChangeRoots = new Emitter();
        const setRoots = () => this._roots = this.contextService.getWorkspace().folders
            .map(folder => new ExplorerItem(folder.uri, fileService, configService, filesConfigService, undefined, true, false, false, false, folder.name));
        setRoots();
        this._listener = this.contextService.onDidChangeWorkspaceFolders(() => {
            setRoots();
            this._onDidChangeRoots.fire();
        });
    }
    get roots() {
        return this._roots;
    }
    get onDidChangeRoots() {
        return this._onDidChangeRoots.event;
    }
    findAll(resource) {
        return coalesce(this.roots.map(root => root.find(resource)));
    }
    findClosest(resource) {
        const folder = this.contextService.getWorkspaceFolder(resource);
        if (folder) {
            const root = this.roots.find(r => this.uriIdentityService.extUri.isEqual(r.resource, folder.uri));
            if (root) {
                return root.find(resource);
            }
        }
        return null;
    }
    dispose() {
        dispose(this._listener);
    }
}
export class ExplorerItem {
    constructor(resource, fileService, configService, filesConfigService, _parent, _isDirectory, _isSymbolicLink, _readonly, _locked, _name = basenameOrAuthority(resource), _mtime, _unknown = false) {
        this.resource = resource;
        this.fileService = fileService;
        this.configService = configService;
        this.filesConfigService = filesConfigService;
        this._parent = _parent;
        this._isDirectory = _isDirectory;
        this._isSymbolicLink = _isSymbolicLink;
        this._readonly = _readonly;
        this._locked = _locked;
        this._name = _name;
        this._mtime = _mtime;
        this._unknown = _unknown;
        this.error = undefined;
        this._isExcluded = false;
        this._isDirectoryResolved = false;
    }
    get isExcluded() {
        if (this._isExcluded) {
            return true;
        }
        if (!this._parent) {
            return false;
        }
        return this._parent.isExcluded;
    }
    set isExcluded(value) {
        this._isExcluded = value;
    }
    hasChildren(filter) {
        if (this.hasNests) {
            return this.nestedChildren?.some(c => filter(c)) ?? false;
        }
        else {
            return this.isDirectory;
        }
    }
    get hasNests() {
        return !!(this.nestedChildren?.length);
    }
    get isDirectoryResolved() {
        return this._isDirectoryResolved;
    }
    get isSymbolicLink() {
        return !!this._isSymbolicLink;
    }
    get isDirectory() {
        return !!this._isDirectory;
    }
    get isReadonly() {
        return this.filesConfigService.isReadonly(this.resource, { resource: this.resource, name: this.name, readonly: this._readonly, locked: this._locked });
    }
    get mtime() {
        return this._mtime;
    }
    get name() {
        return this._name;
    }
    get isUnknown() {
        return this._unknown;
    }
    get parent() {
        return this._parent;
    }
    get root() {
        if (!this._parent) {
            return this;
        }
        return this._parent.root;
    }
    get children() {
        return new Map();
    }
    updateName(value) {
        this._parent?.removeChild(this);
        this._name = value;
        this._parent?.addChild(this);
    }
    getId() {
        return this.root.resource.toString() + '::' + this.resource.toString();
    }
    toString() {
        return `ExplorerItem: ${this.name}`;
    }
    get isRoot() {
        return this === this.root;
    }
    static create(fileService, configService, filesConfigService, raw, parent, resolveTo) {
        const stat = new ExplorerItem(raw.resource, fileService, configService, filesConfigService, parent, raw.isDirectory, raw.isSymbolicLink, raw.readonly, raw.locked, raw.name, raw.mtime, !raw.isFile && !raw.isDirectory);
        if (stat.isDirectory) {
            stat._isDirectoryResolved = !!raw.children || (!!resolveTo && resolveTo.some((r) => {
                return isEqualOrParent(r, stat.resource);
            }));
            if (raw.children) {
                for (let i = 0, len = raw.children.length; i < len; i++) {
                    const child = ExplorerItem.create(fileService, configService, filesConfigService, raw.children[i], stat, resolveTo);
                    stat.addChild(child);
                }
            }
        }
        return stat;
    }
    static mergeLocalWithDisk(disk, local) {
        if (disk.resource.toString() !== local.resource.toString()) {
            return;
        }
        const mergingDirectories = disk.isDirectory || local.isDirectory;
        if (mergingDirectories && local._isDirectoryResolved && !disk._isDirectoryResolved) {
            return;
        }
        local.resource = disk.resource;
        if (!local.isRoot) {
            local.updateName(disk.name);
        }
        local._isDirectory = disk.isDirectory;
        local._mtime = disk.mtime;
        local._isDirectoryResolved = disk._isDirectoryResolved;
        local._isSymbolicLink = disk.isSymbolicLink;
        local.error = disk.error;
        if (mergingDirectories && disk._isDirectoryResolved) {
            const oldLocalChildren = new ResourceMap();
            local.children.forEach(child => {
                oldLocalChildren.set(child.resource, child);
            });
            local.children.clear();
            disk.children.forEach(diskChild => {
                const formerLocalChild = oldLocalChildren.get(diskChild.resource);
                if (formerLocalChild) {
                    ExplorerItem.mergeLocalWithDisk(diskChild, formerLocalChild);
                    local.addChild(formerLocalChild);
                    oldLocalChildren.delete(diskChild.resource);
                }
                else {
                    local.addChild(diskChild);
                }
            });
            oldLocalChildren.forEach(oldChild => {
                if (oldChild instanceof NewExplorerItem) {
                    local.addChild(oldChild);
                }
            });
        }
    }
    addChild(child) {
        child._parent = this;
        child.updateResource(false);
        this.children.set(this.getPlatformAwareName(child.name), child);
    }
    getChild(name) {
        return this.children.get(this.getPlatformAwareName(name));
    }
    fetchChildren(sortOrder) {
        const nestingConfig = this.configService.getValue({ resource: this.root.resource }).explorer.fileNesting;
        if (nestingConfig.enabled && this.nestedChildren) {
            return this.nestedChildren;
        }
        return (async () => {
            if (!this._isDirectoryResolved) {
                const resolveMetadata = sortOrder === "modified";
                this.error = undefined;
                try {
                    const stat = await this.fileService.resolve(this.resource, { resolveSingleChildDescendants: true, resolveMetadata });
                    const resolved = ExplorerItem.create(this.fileService, this.configService, this.filesConfigService, stat, this);
                    ExplorerItem.mergeLocalWithDisk(resolved, this);
                }
                catch (e) {
                    this.error = e;
                    throw e;
                }
                this._isDirectoryResolved = true;
            }
            const items = [];
            if (nestingConfig.enabled) {
                const fileChildren = [];
                const dirChildren = [];
                for (const child of this.children.entries()) {
                    child[1].nestedParent = undefined;
                    if (child[1].isDirectory) {
                        dirChildren.push(child);
                    }
                    else {
                        fileChildren.push(child);
                    }
                }
                const nested = this.fileNester.nest(fileChildren.map(([name]) => name), this.getPlatformAwareName(this.name));
                for (const [fileEntryName, fileEntryItem] of fileChildren) {
                    const nestedItems = nested.get(fileEntryName);
                    if (nestedItems !== undefined) {
                        fileEntryItem.nestedChildren = [];
                        for (const name of nestedItems.keys()) {
                            const child = assertIsDefined(this.children.get(name));
                            fileEntryItem.nestedChildren.push(child);
                            child.nestedParent = fileEntryItem;
                        }
                        items.push(fileEntryItem);
                    }
                    else {
                        fileEntryItem.nestedChildren = undefined;
                    }
                }
                for (const [_, dirEntryItem] of dirChildren.values()) {
                    items.push(dirEntryItem);
                }
            }
            else {
                this.children.forEach(child => {
                    items.push(child);
                });
            }
            return items;
        })();
    }
    get fileNester() {
        if (!this.root._fileNester) {
            const nestingConfig = this.configService.getValue({ resource: this.root.resource }).explorer.fileNesting;
            const patterns = Object.entries(nestingConfig.patterns)
                .filter(entry => typeof (entry[0]) === 'string' && typeof (entry[1]) === 'string' && entry[0] && entry[1])
                .map(([parentPattern, childrenPatterns]) => [
                this.getPlatformAwareName(parentPattern.trim()),
                childrenPatterns.split(',').map(p => this.getPlatformAwareName(p.trim().replace(/\u200b/g, '').trim()))
                    .filter(p => p !== '')
            ]);
            this.root._fileNester = new ExplorerFileNestingTrie(patterns);
        }
        return this.root._fileNester;
    }
    removeChild(child) {
        this.nestedChildren = undefined;
        this.children.delete(this.getPlatformAwareName(child.name));
    }
    forgetChildren() {
        this.children.clear();
        this.nestedChildren = undefined;
        this._isDirectoryResolved = false;
        this._fileNester = undefined;
    }
    getPlatformAwareName(name) {
        return this.fileService.hasCapability(this.resource, 1024) ? name : name.toLowerCase();
    }
    move(newParent) {
        this.nestedParent?.removeChild(this);
        this._parent?.removeChild(this);
        newParent.removeChild(this);
        newParent.addChild(this);
        this.updateResource(true);
    }
    updateResource(recursive) {
        if (this._parent) {
            this.resource = joinPath(this._parent.resource, this.name);
        }
        if (recursive) {
            if (this.isDirectory) {
                this.children.forEach(child => {
                    child.updateResource(true);
                });
            }
        }
    }
    rename(renamedStat) {
        this.updateName(renamedStat.name);
        this._mtime = renamedStat.mtime;
        this.updateResource(true);
    }
    find(resource) {
        const ignoreCase = !this.fileService.hasCapability(resource, 1024);
        if (resource && this.resource.scheme === resource.scheme && equalsIgnoreCase(this.resource.authority, resource.authority) &&
            (ignoreCase ? startsWithIgnoreCase(resource.path, this.resource.path) : resource.path.startsWith(this.resource.path))) {
            return this.findByPath(rtrim(resource.path, posix.sep), this.resource.path.length, ignoreCase);
        }
        return null;
    }
    findByPath(path, index, ignoreCase) {
        if (isEqual(rtrim(this.resource.path, posix.sep), path, ignoreCase)) {
            return this;
        }
        if (this.isDirectory) {
            while (index < path.length && path[index] === posix.sep) {
                index++;
            }
            let indexOfNextSep = path.indexOf(posix.sep, index);
            if (indexOfNextSep === -1) {
                indexOfNextSep = path.length;
            }
            const name = path.substring(index, indexOfNextSep);
            const child = this.children.get(this.getPlatformAwareName(name));
            if (child) {
                return child.findByPath(path, indexOfNextSep, ignoreCase);
            }
        }
        return null;
    }
}
__decorate([
    memoize,
    __metadata("design:type", Map),
    __metadata("design:paramtypes", [])
], ExplorerItem.prototype, "children", null);
export class NewExplorerItem extends ExplorerItem {
    constructor(fileService, configService, filesConfigService, parent, isDirectory) {
        super(URI.file(''), fileService, configService, filesConfigService, parent, isDirectory);
        this._isDirectoryResolved = true;
    }
}
