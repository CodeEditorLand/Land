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
import * as fs from 'fs';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { basename, dirname, join } from '../../../../base/common/path.js';
import { Promises } from '../../../../base/node/pfs.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
let CodeCacheCleaner = class CodeCacheCleaner extends Disposable {
    constructor(currentCodeCachePath, productService, logService) {
        super();
        this.productService = productService;
        this.logService = logService;
        this._DataMaxAge = this.productService.quality !== 'stable'
            ? 1000 * 60 * 60 * 24 * 7
            : 1000 * 60 * 60 * 24 * 30 * 3;
        if (currentCodeCachePath) {
            const scheduler = this._register(new RunOnceScheduler(() => {
                this.cleanUpCodeCaches(currentCodeCachePath);
            }, 30 * 1000));
            scheduler.schedule();
        }
    }
    async cleanUpCodeCaches(currentCodeCachePath) {
        this.logService.trace('[code cache cleanup]: Starting to clean up old code cache folders.');
        try {
            const now = Date.now();
            const codeCacheRootPath = dirname(currentCodeCachePath);
            const currentCodeCache = basename(currentCodeCachePath);
            const codeCaches = await Promises.readdir(codeCacheRootPath);
            await Promise.all(codeCaches.map(async (codeCache) => {
                if (codeCache === currentCodeCache) {
                    return;
                }
                const codeCacheEntryPath = join(codeCacheRootPath, codeCache);
                const codeCacheEntryStat = await fs.promises.stat(codeCacheEntryPath);
                if (codeCacheEntryStat.isDirectory() && (now - codeCacheEntryStat.mtime.getTime()) > this._DataMaxAge) {
                    this.logService.trace(`[code cache cleanup]: Removing code cache folder ${codeCache}.`);
                    return Promises.rm(codeCacheEntryPath);
                }
            }));
        }
        catch (error) {
            onUnexpectedError(error);
        }
    }
};
CodeCacheCleaner = __decorate([
    __param(1, IProductService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], CodeCacheCleaner);
export { CodeCacheCleaner };
