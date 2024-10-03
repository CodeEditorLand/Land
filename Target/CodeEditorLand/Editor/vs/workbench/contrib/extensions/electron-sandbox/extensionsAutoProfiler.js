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
import { timeout } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Schemas } from '../../../../base/common/network.js';
import { joinPath } from '../../../../base/common/resources.js';
import { TernarySearchTree } from '../../../../base/common/ternarySearchTree.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ExtensionIdentifier, ExtensionIdentifierSet } from '../../../../platform/extensions/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService, NotificationPriority, Severity } from '../../../../platform/notification/common/notification.js';
import { IProfileAnalysisWorkerService } from '../../../../platform/profiling/electron-sandbox/profileAnalysisWorkerService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { RuntimeExtensionsInput } from '../common/runtimeExtensionsInput.js';
import { createSlowExtensionAction } from './extensionsSlowActions.js';
import { IExtensionHostProfileService } from './runtimeExtensionsEditor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ExtensionHostProfiler } from '../../../services/extensions/electron-sandbox/extensionHostProfiler.js';
import { ITimerService } from '../../../services/timer/browser/timerService.js';
let ExtensionsAutoProfiler = class ExtensionsAutoProfiler {
    constructor(_extensionService, _extensionProfileService, _telemetryService, _logService, _notificationService, _editorService, _instantiationService, _environmentServie, _profileAnalysisService, _configService, _fileService, timerService) {
        this._extensionService = _extensionService;
        this._extensionProfileService = _extensionProfileService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._notificationService = _notificationService;
        this._editorService = _editorService;
        this._instantiationService = _instantiationService;
        this._environmentServie = _environmentServie;
        this._profileAnalysisService = _profileAnalysisService;
        this._configService = _configService;
        this._fileService = _fileService;
        this._blame = new ExtensionIdentifierSet();
        this._perfBaseline = -1;
        timerService.perfBaseline.then(value => {
            if (value < 0) {
                return;
            }
            this._perfBaseline = value;
            this._unresponsiveListener = _extensionService.onDidChangeResponsiveChange(this._onDidChangeResponsiveChange, this);
        });
    }
    dispose() {
        this._unresponsiveListener?.dispose();
        this._session?.dispose(true);
    }
    async _onDidChangeResponsiveChange(event) {
        if (event.extensionHostKind !== 1) {
            return;
        }
        const listener = await event.getInspectListener(true);
        if (!listener) {
            return;
        }
        if (event.isResponsive && this._session) {
            this._session.cancel();
            this._logService.info('UNRESPONSIVE extension host: received responsive event and cancelling profiling session');
        }
        else if (!event.isResponsive && !this._session) {
            const cts = new CancellationTokenSource();
            this._session = cts;
            let session;
            try {
                session = await this._instantiationService.createInstance(ExtensionHostProfiler, listener.host, listener.port).start();
            }
            catch (err) {
                this._session = undefined;
                return;
            }
            this._logService.info('UNRESPONSIVE extension host: starting to profile NOW');
            try {
                await timeout(5e3, cts.token);
            }
            catch {
            }
            try {
                this._processCpuProfile(await session.stop());
            }
            catch (err) {
                onUnexpectedError(err);
            }
            finally {
                this._session = undefined;
            }
        }
    }
    async _processCpuProfile(profile) {
        await this._extensionService.whenInstalledExtensionsRegistered();
        if (this._configService.getValue('application.experimental.rendererProfiling')) {
            const searchTree = TernarySearchTree.forUris();
            searchTree.fill(this._extensionService.extensions.map(e => [e.extensionLocation, e]));
            await this._profileAnalysisService.analyseBottomUp(profile.data, url => searchTree.findSubstr(URI.parse(url))?.identifier.value ?? '<<not-found>>', this._perfBaseline, false);
        }
        const categories = this._extensionService.extensions
            .filter(e => e.extensionLocation.scheme === Schemas.file)
            .map(e => [e.extensionLocation, ExtensionIdentifier.toKey(e.identifier)]);
        const data = await this._profileAnalysisService.analyseByLocation(profile.data, categories);
        let overall = 0;
        let top = '';
        let topAggregated = -1;
        for (const [category, aggregated] of data) {
            overall += aggregated;
            if (aggregated > topAggregated) {
                topAggregated = aggregated;
                top = category;
            }
        }
        const topPercentage = topAggregated / (overall / 100);
        const extension = await this._extensionService.getExtension(top);
        if (!extension) {
            return;
        }
        const sessionId = generateUuid();
        const path = joinPath(this._environmentServie.tmpDir, `exthost-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
        await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(profile.data)));
        this._logService.warn(`UNRESPONSIVE extension host: '${top}' took ${topPercentage}% of ${topAggregated / 1e3}ms, saved PROFILE here: '${path}'`);
        this._telemetryService.publicLog2('exthostunresponsive', {
            sessionId,
            duration: overall,
            data: data.map(tuple => tuple[0]).flat(),
            id: ExtensionIdentifier.toKey(extension.identifier),
        });
        this._extensionProfileService.setUnresponsiveProfile(extension.identifier, profile);
        if (!(topPercentage >= 95 && topAggregated >= 5e6)) {
            return;
        }
        const action = await this._instantiationService.invokeFunction(createSlowExtensionAction, extension, profile);
        if (!action) {
            return;
        }
        if (this._blame.has(extension.identifier) || this._blame.size >= 3) {
            return;
        }
        this._blame.add(extension.identifier);
        this._notificationService.prompt(Severity.Warning, localize('unresponsive-exthost', "The extension '{0}' took a very long time to complete its last operation and it has prevented other extensions from running.", extension.displayName || extension.name), [{
                label: localize('show', 'Show Extensions'),
                run: () => this._editorService.openEditor(RuntimeExtensionsInput.instance, { pinned: true })
            },
            action
        ], { priority: NotificationPriority.SILENT });
    }
};
ExtensionsAutoProfiler = __decorate([
    __param(0, IExtensionService),
    __param(1, IExtensionHostProfileService),
    __param(2, ITelemetryService),
    __param(3, ILogService),
    __param(4, INotificationService),
    __param(5, IEditorService),
    __param(6, IInstantiationService),
    __param(7, INativeWorkbenchEnvironmentService),
    __param(8, IProfileAnalysisWorkerService),
    __param(9, IConfigurationService),
    __param(10, IFileService),
    __param(11, ITimerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExtensionsAutoProfiler);
export { ExtensionsAutoProfiler };
