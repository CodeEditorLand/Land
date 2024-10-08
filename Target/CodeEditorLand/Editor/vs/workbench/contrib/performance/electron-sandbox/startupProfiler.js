/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { localize } from '../../../../nls.js';
import { dirname, basename } from '../../../../base/common/resources.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { PerfviewContrib } from '../browser/perfviewEditor.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { URI } from '../../../../base/common/uri.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
let StartupProfiler = class StartupProfiler {
    constructor(_dialogService, _environmentService, _textModelResolverService, _clipboardService, lifecycleService, extensionService, _openerService, _nativeHostService, _productService, _fileService, _labelService) {
        this._dialogService = _dialogService;
        this._environmentService = _environmentService;
        this._textModelResolverService = _textModelResolverService;
        this._clipboardService = _clipboardService;
        this._openerService = _openerService;
        this._nativeHostService = _nativeHostService;
        this._productService = _productService;
        this._fileService = _fileService;
        this._labelService = _labelService;
        // wait for everything to be ready
        Promise.all([
            lifecycleService.when(4 /* LifecyclePhase.Eventually */),
            extensionService.whenInstalledExtensionsRegistered()
        ]).then(() => {
            this._stopProfiling();
        });
    }
    _stopProfiling() {
        if (!this._environmentService.args['prof-startup-prefix']) {
            return;
        }
        const profileFilenamePrefix = URI.file(this._environmentService.args['prof-startup-prefix']);
        const dir = dirname(profileFilenamePrefix);
        const prefix = basename(profileFilenamePrefix);
        const removeArgs = ['--prof-startup'];
        const markerFile = this._fileService.readFile(profileFilenamePrefix).then(value => removeArgs.push(...value.toString().split('|')))
            .then(() => this._fileService.del(profileFilenamePrefix, { recursive: true })) // (1) delete the file to tell the main process to stop profiling
            .then(() => new Promise(resolve => {
            const check = () => {
                this._fileService.exists(profileFilenamePrefix).then(exists => {
                    if (exists) {
                        resolve();
                    }
                    else {
                        setTimeout(check, 500);
                    }
                });
            };
            check();
        }))
            .then(() => this._fileService.del(profileFilenamePrefix, { recursive: true })); // (3) finally delete the file again
        markerFile.then(() => {
            return this._fileService.resolve(dir).then(stat => {
                return (stat.children ? stat.children.filter(value => value.resource.path.includes(prefix)) : []).map(stat => stat.resource);
            });
        }).then(files => {
            const profileFiles = files.reduce((prev, cur) => `${prev}${this._labelService.getUriLabel(cur)}\n`, '\n');
            return this._dialogService.confirm({
                type: 'info',
                message: localize('prof.message', "Successfully created profiles."),
                detail: localize('prof.detail', "Please create an issue and manually attach the following files:\n{0}", profileFiles),
                primaryButton: localize({ key: 'prof.restartAndFileIssue', comment: ['&& denotes a mnemonic'] }, "&&Create Issue and Restart"),
                cancelButton: localize('prof.restart', "Restart")
            }).then(res => {
                if (res.confirmed) {
                    Promise.all([
                        this._nativeHostService.showItemInFolder(files[0].fsPath),
                        this._createPerfIssue(files.map(file => basename(file)))
                    ]).then(() => {
                        // keep window stable until restart is selected
                        return this._dialogService.confirm({
                            type: 'info',
                            message: localize('prof.thanks', "Thanks for helping us."),
                            detail: localize('prof.detail.restart', "A final restart is required to continue to use '{0}'. Again, thank you for your contribution.", this._productService.nameLong),
                            primaryButton: localize({ key: 'prof.restart.button', comment: ['&& denotes a mnemonic'] }, "&&Restart")
                        }).then(res => {
                            // now we are ready to restart
                            if (res.confirmed) {
                                this._nativeHostService.relaunch({ removeArgs });
                            }
                        });
                    });
                }
                else {
                    // simply restart
                    this._nativeHostService.relaunch({ removeArgs });
                }
            });
        });
    }
    async _createPerfIssue(files) {
        const reportIssueUrl = this._productService.reportIssueUrl;
        if (!reportIssueUrl) {
            return;
        }
        const contrib = PerfviewContrib.get();
        const ref = await this._textModelResolverService.createModelReference(contrib.getInputUri());
        try {
            await this._clipboardService.writeText(ref.object.textEditorModel.getValue());
        }
        finally {
            ref.dispose();
        }
        const body = `
1. :warning: We have copied additional data to your clipboard. Make sure to **paste** here. :warning:
1. :warning: Make sure to **attach** these files from your *home*-directory: :warning:\n${files.map(file => `-\`${file}\``).join('\n')}
`;
        const baseUrl = reportIssueUrl;
        const queryStringPrefix = baseUrl.indexOf('?') === -1 ? '?' : '&';
        this._openerService.open(URI.parse(`${baseUrl}${queryStringPrefix}body=${encodeURIComponent(body)}`));
    }
};
StartupProfiler = __decorate([
    __param(0, IDialogService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, ITextModelService),
    __param(3, IClipboardService),
    __param(4, ILifecycleService),
    __param(5, IExtensionService),
    __param(6, IOpenerService),
    __param(7, INativeHostService),
    __param(8, IProductService),
    __param(9, IFileService),
    __param(10, ILabelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], StartupProfiler);
export { StartupProfiler };
