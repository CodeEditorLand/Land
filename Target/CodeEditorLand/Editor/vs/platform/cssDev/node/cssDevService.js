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
import { spawn } from 'child_process';
import { relative } from 'path';
import { FileAccess } from '../../../base/common/network.js';
import { StopWatch } from '../../../base/common/stopwatch.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
export const ICSSDevelopmentService = createDecorator('ICSSDevelopmentService');
let CSSDevelopmentService = class CSSDevelopmentService {
    constructor(envService, logService) {
        this.envService = envService;
        this.logService = logService;
    }
    get isEnabled() {
        return !this.envService.isBuilt;
    }
    getCssModules() {
        this._cssModules ??= this.computeCssModules();
        return this._cssModules;
    }
    async computeCssModules() {
        if (!this.isEnabled) {
            return [];
        }
        const rg = await import('@vscode/ripgrep');
        return await new Promise((resolve) => {
            const sw = StopWatch.create();
            const chunks = [];
            const decoder = new TextDecoder();
            const basePath = FileAccess.asFileUri('').fsPath;
            const process = spawn(rg.rgPath, ['-g', '**/*.css', '--files', '--no-ignore', basePath], {});
            process.stdout.on('data', data => {
                const chunk = decoder.decode(data, { stream: true });
                chunks.push(chunk.split('\n').filter(Boolean));
            });
            process.on('error', err => {
                this.logService.error('[CSS_DEV] FAILED to compute CSS data', err);
                resolve([]);
            });
            process.on('close', () => {
                const result = chunks.flat().map(path => relative(basePath, path).replace(/\\/g, '/')).filter(Boolean).sort();
                resolve(result);
                this.logService.info(`[CSS_DEV] DONE, ${result.length} css modules (${Math.round(sw.elapsed())}ms)`);
            });
        });
    }
};
CSSDevelopmentService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], CSSDevelopmentService);
export { CSSDevelopmentService };
