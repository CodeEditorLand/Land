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
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ITimerService } from '../../../services/timer/browser/timerService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { StartupTimings } from '../browser/startupTimings.js';
import { coalesce } from '../../../../base/common/arrays.js';
let NativeStartupTimings = class NativeStartupTimings extends StartupTimings {
    constructor(_fileService, _timerService, _nativeHostService, editorService, paneCompositeService, _telemetryService, lifecycleService, updateService, _environmentService, _productService, workspaceTrustService) {
        super(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService);
        this._fileService = _fileService;
        this._timerService = _timerService;
        this._nativeHostService = _nativeHostService;
        this._telemetryService = _telemetryService;
        this._environmentService = _environmentService;
        this._productService = _productService;
        this._report().catch(onUnexpectedError);
    }
    async _report() {
        const standardStartupError = await this._isStandardStartup();
        this._appendStartupTimes(standardStartupError).catch(onUnexpectedError);
    }
    async _appendStartupTimes(standardStartupError) {
        const appendTo = this._environmentService.args['prof-append-timers'];
        const durationMarkers = this._environmentService.args['prof-duration-markers'];
        const durationMarkersFile = this._environmentService.args['prof-duration-markers-file'];
        if (!appendTo && !durationMarkers) {
            return;
        }
        try {
            await Promise.all([
                this._timerService.whenReady(),
                timeout(15000),
            ]);
            const perfBaseline = await this._timerService.perfBaseline;
            const heapStatistics = await this._resolveStartupHeapStatistics();
            if (heapStatistics) {
                this._telemetryLogHeapStatistics(heapStatistics);
            }
            if (appendTo) {
                const content = coalesce([
                    this._timerService.startupMetrics.ellapsed,
                    this._productService.nameShort,
                    (this._productService.commit || '').slice(0, 10) || '0000000000',
                    this._telemetryService.sessionId,
                    standardStartupError === undefined ? 'standard_start' : `NO_standard_start : ${standardStartupError}`,
                    `${String(perfBaseline).padStart(4, '0')}ms`,
                    heapStatistics ? this._printStartupHeapStatistics(heapStatistics) : undefined
                ]).join('\t') + '\n';
                await this._appendContent(URI.file(appendTo), content);
            }
            if (durationMarkers?.length) {
                const durations = [];
                for (const durationMarker of durationMarkers) {
                    let duration = 0;
                    if (durationMarker === 'ellapsed') {
                        duration = this._timerService.startupMetrics.ellapsed;
                    }
                    else if (durationMarker.indexOf('-') !== -1) {
                        const markers = durationMarker.split('-');
                        if (markers.length === 2) {
                            duration = this._timerService.getDuration(markers[0], markers[1]);
                        }
                    }
                    if (duration) {
                        durations.push(durationMarker);
                        durations.push(`${duration}`);
                    }
                }
                const durationsContent = `${durations.join('\t')}\n`;
                if (durationMarkersFile) {
                    await this._appendContent(URI.file(durationMarkersFile), durationsContent);
                }
                else {
                    console.log(durationsContent);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            this._nativeHostService.exit(0);
        }
    }
    async _isStandardStartup() {
        const windowCount = await this._nativeHostService.getWindowCount();
        if (windowCount !== 1) {
            return `Expected window count : 1, Actual : ${windowCount}`;
        }
        return super._isStandardStartup();
    }
    async _appendContent(file, content) {
        const chunks = [];
        if (await this._fileService.exists(file)) {
            chunks.push((await this._fileService.readFile(file)).value);
        }
        chunks.push(VSBuffer.fromString(content));
        await this._fileService.writeFile(file, VSBuffer.concat(chunks));
    }
    async _resolveStartupHeapStatistics() {
        if (!this._environmentService.args['enable-tracing'] ||
            !this._environmentService.args['trace-startup-file'] ||
            this._environmentService.args['trace-startup-format'] !== 'json' ||
            !this._environmentService.args['trace-startup-duration']) {
            return undefined;
        }
        const windowProcessId = await this._nativeHostService.getProcessId();
        const used = performance.memory?.usedJSHeapSize ?? 0;
        let minorGCs = 0;
        let majorGCs = 0;
        let garbage = 0;
        let duration = 0;
        try {
            const traceContents = JSON.parse((await this._fileService.readFile(URI.file(this._environmentService.args['trace-startup-file']))).value.toString());
            for (const event of traceContents.traceEvents) {
                if (event.pid !== windowProcessId) {
                    continue;
                }
                switch (event.name) {
                    case 'MinorGC':
                        minorGCs++;
                        break;
                    case 'MajorGC':
                        majorGCs++;
                        break;
                    case 'V8.GCFinalizeMC':
                    case 'V8.GCScavenger':
                        duration += event.dur;
                        break;
                }
                if (event.name === 'MajorGC' || event.name === 'MinorGC') {
                    if (typeof event.args?.usedHeapSizeAfter === 'number' && typeof event.args.usedHeapSizeBefore === 'number') {
                        garbage += (event.args.usedHeapSizeBefore - event.args.usedHeapSizeAfter);
                    }
                }
            }
            return { minorGCs, majorGCs, used, garbage, duration: Math.round(duration / 1000) };
        }
        catch (error) {
            console.error(error);
        }
        return undefined;
    }
    _telemetryLogHeapStatistics({ used, garbage, majorGCs, minorGCs, duration }) {
        this._telemetryService.publicLog2('startupHeapStatistics', {
            heapUsed: used,
            heapGarbage: garbage,
            majorGCs,
            minorGCs,
            gcsDuration: duration
        });
    }
    _printStartupHeapStatistics({ used, garbage, majorGCs, minorGCs, duration }) {
        const MB = 1024 * 1024;
        return `Heap: ${Math.round(used / MB)}MB (used) ${Math.round(garbage / MB)}MB (garbage) ${majorGCs} (MajorGC) ${minorGCs} (MinorGC) ${duration}ms (GC duration)`;
    }
};
NativeStartupTimings = __decorate([
    __param(0, IFileService),
    __param(1, ITimerService),
    __param(2, INativeHostService),
    __param(3, IEditorService),
    __param(4, IPaneCompositePartService),
    __param(5, ITelemetryService),
    __param(6, ILifecycleService),
    __param(7, IUpdateService),
    __param(8, INativeWorkbenchEnvironmentService),
    __param(9, IProductService),
    __param(10, IWorkspaceTrustManagementService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeStartupTimings);
export { NativeStartupTimings };
