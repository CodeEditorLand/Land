var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { memoize } from '../../../base/common/decorators.js';
import { join } from '../../../base/common/path.js';
import { isLinux } from '../../../base/common/platform.js';
import { createStaticIPCHandle } from '../../../base/parts/ipc/node/ipc.net.js';
import { IEnvironmentService } from '../common/environment.js';
import { NativeEnvironmentService } from '../node/environmentService.js';
import { refineServiceDecorator } from '../../instantiation/common/instantiation.js';
export const IEnvironmentMainService = refineServiceDecorator(IEnvironmentService);
export class EnvironmentMainService extends NativeEnvironmentService {
    constructor() {
        super(...arguments);
        this._snapEnv = {};
    }
    get backupHome() { return join(this.userDataPath, 'Backups'); }
    get mainIPCHandle() { return createStaticIPCHandle(this.userDataPath, 'main', this.productService.version); }
    get mainLockfile() { return join(this.userDataPath, 'code.lock'); }
    get disableUpdates() { return !!this.args['disable-updates']; }
    get crossOriginIsolated() { return !!this.args['enable-coi']; }
    get codeCachePath() { return process.env['VSCODE_CODE_CACHE_PATH'] || undefined; }
    get useCodeCache() { return !!this.codeCachePath; }
    unsetSnapExportedVariables() {
        if (!isLinux) {
            return;
        }
        for (const key in process.env) {
            if (key.endsWith('_VSCODE_SNAP_ORIG')) {
                const originalKey = key.slice(0, -17);
                if (this._snapEnv[originalKey]) {
                    continue;
                }
                if (process.env[originalKey]) {
                    this._snapEnv[originalKey] = process.env[originalKey];
                }
                if (process.env[key]) {
                    process.env[originalKey] = process.env[key];
                }
                else {
                    delete process.env[originalKey];
                }
            }
        }
    }
    restoreSnapExportedVariables() {
        if (!isLinux) {
            return;
        }
        for (const key in this._snapEnv) {
            process.env[key] = this._snapEnv[key];
            delete this._snapEnv[key];
        }
    }
}
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], EnvironmentMainService.prototype, "backupHome", null);
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], EnvironmentMainService.prototype, "mainIPCHandle", null);
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], EnvironmentMainService.prototype, "mainLockfile", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], EnvironmentMainService.prototype, "disableUpdates", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], EnvironmentMainService.prototype, "crossOriginIsolated", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], EnvironmentMainService.prototype, "codeCachePath", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], EnvironmentMainService.prototype, "useCodeCache", null);
