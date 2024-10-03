var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CustomEditorLabelService_1;
import { Emitter } from '../../../../base/common/event.js';
import { parse as parseGlob } from '../../../../base/common/glob.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isAbsolute, parse as parsePath, dirname } from '../../../../base/common/path.js';
import { dirname as resourceDirname, relativePath as getRelativePath } from '../../../../base/common/resources.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { MRUCache } from '../../../../base/common/map.js';
let CustomEditorLabelService = class CustomEditorLabelService extends Disposable {
    static { CustomEditorLabelService_1 = this; }
    static { this.SETTING_ID_PATTERNS = 'workbench.editor.customLabels.patterns'; }
    static { this.SETTING_ID_ENABLED = 'workbench.editor.customLabels.enabled'; }
    constructor(configurationService, workspaceContextService) {
        super();
        this.configurationService = configurationService;
        this.workspaceContextService = workspaceContextService;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.patterns = [];
        this.enabled = true;
        this.cache = new MRUCache(1000);
        this._templateRegexValidation = /[a-zA-Z0-9]/;
        this._parsedTemplateExpression = /\$\{(dirname|filename|extname|extname\((?<extnameN>[-+]?\d+)\)|dirname\((?<dirnameN>[-+]?\d+)\))\}/g;
        this._filenameCaptureExpression = /(?<filename>^\.*[^.]*)/;
        this.storeEnablementState();
        this.storeCustomPatterns();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(CustomEditorLabelService_1.SETTING_ID_ENABLED)) {
                const oldEnablement = this.enabled;
                this.storeEnablementState();
                if (oldEnablement !== this.enabled && this.patterns.length > 0) {
                    this._onDidChange.fire();
                }
            }
            else if (e.affectsConfiguration(CustomEditorLabelService_1.SETTING_ID_PATTERNS)) {
                this.cache.clear();
                this.storeCustomPatterns();
                this._onDidChange.fire();
            }
        }));
    }
    storeEnablementState() {
        this.enabled = this.configurationService.getValue(CustomEditorLabelService_1.SETTING_ID_ENABLED);
    }
    storeCustomPatterns() {
        this.patterns = [];
        const customLabelPatterns = this.configurationService.getValue(CustomEditorLabelService_1.SETTING_ID_PATTERNS);
        for (const pattern in customLabelPatterns) {
            const template = customLabelPatterns[pattern];
            if (!this._templateRegexValidation.test(template)) {
                continue;
            }
            const isAbsolutePath = isAbsolute(pattern);
            const parsedPattern = parseGlob(pattern);
            this.patterns.push({ pattern, template, isAbsolutePath, parsedPattern });
        }
        this.patterns.sort((a, b) => this.patternWeight(b.pattern) - this.patternWeight(a.pattern));
    }
    patternWeight(pattern) {
        let weight = 0;
        for (const fragment of pattern.split('/')) {
            if (fragment === '**') {
                weight += 1;
            }
            else if (fragment === '*') {
                weight += 10;
            }
            else if (fragment.includes('*') || fragment.includes('?')) {
                weight += 50;
            }
            else if (fragment !== '') {
                weight += 100;
            }
        }
        return weight;
    }
    getName(resource) {
        if (!this.enabled || this.patterns.length === 0) {
            return undefined;
        }
        const key = resource.toString();
        const cached = this.cache.get(key);
        if (cached !== undefined) {
            return cached ?? undefined;
        }
        const result = this.applyPatterns(resource);
        this.cache.set(key, result ?? null);
        return result;
    }
    applyPatterns(resource) {
        const root = this.workspaceContextService.getWorkspaceFolder(resource);
        let relativePath;
        for (const pattern of this.patterns) {
            let relevantPath;
            if (root && !pattern.isAbsolutePath) {
                if (!relativePath) {
                    relativePath = getRelativePath(resourceDirname(root.uri), resource) ?? resource.path;
                }
                relevantPath = relativePath;
            }
            else {
                relevantPath = resource.path;
            }
            if (pattern.parsedPattern(relevantPath)) {
                return this.applyTemplate(pattern.template, resource, relevantPath);
            }
        }
        return undefined;
    }
    applyTemplate(template, resource, relevantPath) {
        let parsedPath;
        return template.replace(this._parsedTemplateExpression, (match, variable, ...args) => {
            parsedPath = parsedPath ?? parsePath(resource.path);
            const { dirnameN = '0', extnameN = '0' } = args.pop();
            if (variable === 'filename') {
                const { filename } = this._filenameCaptureExpression.exec(parsedPath.base)?.groups ?? {};
                if (filename) {
                    return filename;
                }
            }
            else if (variable === 'extname') {
                const extension = this.getExtnames(parsedPath.base);
                if (extension) {
                    return extension;
                }
            }
            else if (variable.startsWith('extname')) {
                const n = parseInt(extnameN);
                const nthExtname = this.getNthExtname(parsedPath.base, n);
                if (nthExtname) {
                    return nthExtname;
                }
            }
            else if (variable.startsWith('dirname')) {
                const n = parseInt(dirnameN);
                const nthDir = this.getNthDirname(dirname(relevantPath), n);
                if (nthDir) {
                    return nthDir;
                }
            }
            return match;
        });
    }
    removeLeadingDot(path) {
        let withoutLeadingDot = path;
        while (withoutLeadingDot.startsWith('.')) {
            withoutLeadingDot = withoutLeadingDot.slice(1);
        }
        return withoutLeadingDot;
    }
    getNthDirname(path, n) {
        path = path.startsWith('/') ? path.slice(1) : path;
        const pathFragments = path.split('/');
        return this.getNthFragment(pathFragments, n);
    }
    getExtnames(fullFileName) {
        return this.removeLeadingDot(fullFileName).split('.').slice(1).join('.');
    }
    getNthExtname(fullFileName, n) {
        const extensionNameFragments = this.removeLeadingDot(fullFileName).split('.');
        extensionNameFragments.shift();
        return this.getNthFragment(extensionNameFragments, n);
    }
    getNthFragment(fragments, n) {
        const length = fragments.length;
        let nth;
        if (n < 0) {
            nth = Math.abs(n) - 1;
        }
        else {
            nth = length - n - 1;
        }
        const nthFragment = fragments[nth];
        if (nthFragment === undefined || nthFragment === '') {
            return undefined;
        }
        return nthFragment;
    }
};
CustomEditorLabelService = CustomEditorLabelService_1 = __decorate([
    __param(0, IConfigurationService),
    __param(1, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object])
], CustomEditorLabelService);
export { CustomEditorLabelService };
export const ICustomEditorLabelService = createDecorator('ICustomEditorLabelService');
registerSingleton(ICustomEditorLabelService, CustomEditorLabelService, 1);
