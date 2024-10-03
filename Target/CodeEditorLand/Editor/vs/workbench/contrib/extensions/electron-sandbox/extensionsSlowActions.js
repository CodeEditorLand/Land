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
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Action } from '../../../../base/common/actions.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { localize } from '../../../../nls.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IRequestService, asText } from '../../../../platform/request/common/request.js';
import { joinPath } from '../../../../base/common/resources.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { Utils } from '../../../../platform/profiling/common/profiling.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
class RepoInfo {
    static fromExtension(desc) {
        let result;
        if (desc.bugs && typeof desc.bugs.url === 'string') {
            const base = URI.parse(desc.bugs.url);
            const match = /\/([^/]+)\/([^/]+)\/issues\/?$/.exec(desc.bugs.url);
            if (match) {
                result = {
                    base: base.with({ path: null, fragment: null, query: null }).toString(true),
                    owner: match[1],
                    repo: match[2]
                };
            }
        }
        if (!result && desc.repository && typeof desc.repository.url === 'string') {
            const base = URI.parse(desc.repository.url);
            const match = /\/([^/]+)\/([^/]+)(\.git)?$/.exec(desc.repository.url);
            if (match) {
                result = {
                    base: base.with({ path: null, fragment: null, query: null }).toString(true),
                    owner: match[1],
                    repo: match[2]
                };
            }
        }
        if (result && result.base.indexOf('github') === -1) {
            result = undefined;
        }
        return result;
    }
}
let SlowExtensionAction = class SlowExtensionAction extends Action {
    constructor(extension, profile, _instantiationService) {
        super('report.slow', localize('cmd.reportOrShow', "Performance Issue"), 'extension-action report-issue');
        this.extension = extension;
        this.profile = profile;
        this._instantiationService = _instantiationService;
        this.enabled = Boolean(RepoInfo.fromExtension(extension));
    }
    async run() {
        const action = await this._instantiationService.invokeFunction(createSlowExtensionAction, this.extension, this.profile);
        if (action) {
            await action.run();
        }
    }
};
SlowExtensionAction = __decorate([
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], SlowExtensionAction);
export { SlowExtensionAction };
export async function createSlowExtensionAction(accessor, extension, profile) {
    const info = RepoInfo.fromExtension(extension);
    if (!info) {
        return undefined;
    }
    const requestService = accessor.get(IRequestService);
    const instaService = accessor.get(IInstantiationService);
    const url = `https://api.github.com/search/issues?q=is:issue+state:open+in:title+repo:${info.owner}/${info.repo}+%22Extension+causes+high+cpu+load%22`;
    let res;
    try {
        res = await requestService.request({ url }, CancellationToken.None);
    }
    catch {
        return undefined;
    }
    const rawText = await asText(res);
    if (!rawText) {
        return undefined;
    }
    const data = JSON.parse(rawText);
    if (!data || typeof data.total_count !== 'number') {
        return undefined;
    }
    else if (data.total_count === 0) {
        return instaService.createInstance(ReportExtensionSlowAction, extension, info, profile);
    }
    else {
        return instaService.createInstance(ShowExtensionSlowAction, extension, info, profile);
    }
}
let ReportExtensionSlowAction = class ReportExtensionSlowAction extends Action {
    constructor(extension, repoInfo, profile, _dialogService, _openerService, _productService, _nativeHostService, _environmentService, _fileService) {
        super('report.slow', localize('cmd.report', "Report Issue"));
        this.extension = extension;
        this.repoInfo = repoInfo;
        this.profile = profile;
        this._dialogService = _dialogService;
        this._openerService = _openerService;
        this._productService = _productService;
        this._nativeHostService = _nativeHostService;
        this._environmentService = _environmentService;
        this._fileService = _fileService;
    }
    async run() {
        const data = Utils.rewriteAbsolutePaths(this.profile.data, 'pii_removed');
        const path = joinPath(this._environmentService.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
        await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(data, undefined, 4)));
        const os = await this._nativeHostService.getOSProperties();
        const title = encodeURIComponent('Extension causes high cpu load');
        const osVersion = `${os.type} ${os.arch} ${os.release}`;
        const message = `:warning: Make sure to **attach** this file from your *home*-directory:\n:warning:\`${path}\`\n\nFind more details here: https://github.com/microsoft/vscode/wiki/Explain-extension-causes-high-cpu-load`;
        const body = encodeURIComponent(`- Issue Type: \`Performance\`
- Extension Name: \`${this.extension.name}\`
- Extension Version: \`${this.extension.version}\`
- OS Version: \`${osVersion}\`
- VS Code version: \`${this._productService.version}\`\n\n${message}`);
        const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues/new/?body=${body}&title=${title}`;
        this._openerService.open(URI.parse(url));
        this._dialogService.info(localize('attach.title', "Did you attach the CPU-Profile?"), localize('attach.msg', "This is a reminder to make sure that you have not forgotten to attach '{0}' to the issue you have just created.", path.fsPath));
    }
};
ReportExtensionSlowAction = __decorate([
    __param(3, IDialogService),
    __param(4, IOpenerService),
    __param(5, IProductService),
    __param(6, INativeHostService),
    __param(7, INativeWorkbenchEnvironmentService),
    __param(8, IFileService),
    __metadata("design:paramtypes", [Object, RepoInfo, Object, Object, Object, Object, Object, Object, Object])
], ReportExtensionSlowAction);
let ShowExtensionSlowAction = class ShowExtensionSlowAction extends Action {
    constructor(extension, repoInfo, profile, _dialogService, _openerService, _environmentService, _fileService) {
        super('show.slow', localize('cmd.show', "Show Issues"));
        this.extension = extension;
        this.repoInfo = repoInfo;
        this.profile = profile;
        this._dialogService = _dialogService;
        this._openerService = _openerService;
        this._environmentService = _environmentService;
        this._fileService = _fileService;
    }
    async run() {
        const data = Utils.rewriteAbsolutePaths(this.profile.data, 'pii_removed');
        const path = joinPath(this._environmentService.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
        await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(data, undefined, 4)));
        const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues?utf8=✓&q=is%3Aissue+state%3Aopen+%22Extension+causes+high+cpu+load%22`;
        this._openerService.open(URI.parse(url));
        this._dialogService.info(localize('attach.title', "Did you attach the CPU-Profile?"), localize('attach.msg2', "This is a reminder to make sure that you have not forgotten to attach '{0}' to an existing performance issue.", path.fsPath));
    }
};
ShowExtensionSlowAction = __decorate([
    __param(3, IDialogService),
    __param(4, IOpenerService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, IFileService),
    __metadata("design:paramtypes", [Object, RepoInfo, Object, Object, Object, Object, Object])
], ShowExtensionSlowAction);
