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
var PerfviewContrib_1, PerfviewInput_1;
import { localize } from '../../../../nls.js';
import { URI } from '../../../../base/common/uri.js';
import { TextResourceEditorInput } from '../../../common/editor/textResourceEditorInput.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { ILifecycleService, StartupKindToString } from '../../../services/lifecycle/common/lifecycle.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITimerService } from '../../../services/timer/browser/timerService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { dispose } from '../../../../base/common/lifecycle.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { writeTransientState } from '../../codeEditor/browser/toggleWordWrap.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ByteSize, IFileService } from '../../../../platform/files/common/files.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions, getWorkbenchContribution } from '../../../common/contributions.js';
import { ICustomEditorLabelService } from '../../../services/editor/common/customEditorLabelService.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
let PerfviewContrib = class PerfviewContrib {
    static { PerfviewContrib_1 = this; }
    static get() {
        return getWorkbenchContribution(PerfviewContrib_1.ID);
    }
    static { this.ID = 'workbench.contrib.perfview'; }
    constructor(_instaService, textModelResolverService) {
        this._instaService = _instaService;
        this._inputUri = URI.from({ scheme: 'perf', path: 'Startup Performance' });
        this._registration = textModelResolverService.registerTextModelContentProvider('perf', _instaService.createInstance(PerfModelContentProvider));
    }
    dispose() {
        this._registration.dispose();
    }
    getInputUri() {
        return this._inputUri;
    }
    getEditorInput() {
        return this._instaService.createInstance(PerfviewInput);
    }
};
PerfviewContrib = PerfviewContrib_1 = __decorate([
    __param(0, IInstantiationService),
    __param(1, ITextModelService),
    __metadata("design:paramtypes", [Object, Object])
], PerfviewContrib);
export { PerfviewContrib };
let PerfviewInput = class PerfviewInput extends TextResourceEditorInput {
    static { PerfviewInput_1 = this; }
    static { this.Id = 'PerfviewInput'; }
    get typeId() {
        return PerfviewInput_1.Id;
    }
    constructor(textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
        super(PerfviewContrib.get().getInputUri(), localize('name', "Startup Performance"), undefined, undefined, undefined, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    }
};
PerfviewInput = PerfviewInput_1 = __decorate([
    __param(0, ITextModelService),
    __param(1, ITextFileService),
    __param(2, IEditorService),
    __param(3, IFileService),
    __param(4, ILabelService),
    __param(5, IFilesConfigurationService),
    __param(6, ITextResourceConfigurationService),
    __param(7, ICustomEditorLabelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], PerfviewInput);
export { PerfviewInput };
let PerfModelContentProvider = class PerfModelContentProvider {
    constructor(_modelService, _languageService, _editorService, _lifecycleService, _timerService, _extensionService, _productService, _remoteAgentService, _terminalService) {
        this._modelService = _modelService;
        this._languageService = _languageService;
        this._editorService = _editorService;
        this._lifecycleService = _lifecycleService;
        this._timerService = _timerService;
        this._extensionService = _extensionService;
        this._productService = _productService;
        this._remoteAgentService = _remoteAgentService;
        this._terminalService = _terminalService;
        this._modelDisposables = [];
    }
    provideTextContent(resource) {
        if (!this._model || this._model.isDisposed()) {
            dispose(this._modelDisposables);
            const langId = this._languageService.createById('markdown');
            this._model = this._modelService.getModel(resource) || this._modelService.createModel('Loading...', langId, resource);
            this._modelDisposables.push(langId.onDidChange(e => {
                this._model?.setLanguage(e);
            }));
            this._modelDisposables.push(this._extensionService.onDidChangeExtensionsStatus(this._updateModel, this));
            writeTransientState(this._model, { wordWrapOverride: 'off' }, this._editorService);
        }
        this._updateModel();
        return Promise.resolve(this._model);
    }
    _updateModel() {
        Promise.all([
            this._timerService.whenReady(),
            this._lifecycleService.when(4),
            this._extensionService.whenInstalledExtensionsRegistered(),
            isWeb && !this._remoteAgentService.getConnection()?.remoteAuthority ? Promise.resolve() : this._terminalService.whenConnected
        ]).then(() => {
            if (this._model && !this._model.isDisposed()) {
                const md = new MarkdownBuilder();
                this._addSummary(md);
                md.blank();
                this._addSummaryTable(md);
                md.blank();
                this._addExtensionsTable(md);
                md.blank();
                this._addPerfMarksTable('Terminal Stats', md, this._timerService.getPerformanceMarks().find(e => e[0] === 'renderer')?.[1].filter(e => e.name.startsWith('code/terminal/')));
                md.blank();
                this._addWorkbenchContributionsPerfMarksTable(md);
                md.blank();
                this._addRawPerfMarks(md);
                md.blank();
                this._addResourceTimingStats(md);
                this._model.setValue(md.value);
            }
        });
    }
    _addSummary(md) {
        const metrics = this._timerService.startupMetrics;
        md.heading(2, 'System Info');
        md.li(`${this._productService.nameShort}: ${this._productService.version} (${this._productService.commit || '0000000'})`);
        md.li(`OS: ${metrics.platform}(${metrics.release})`);
        if (metrics.cpus) {
            md.li(`CPUs: ${metrics.cpus.model}(${metrics.cpus.count} x ${metrics.cpus.speed})`);
        }
        if (typeof metrics.totalmem === 'number' && typeof metrics.freemem === 'number') {
            md.li(`Memory(System): ${(metrics.totalmem / (ByteSize.GB)).toFixed(2)} GB(${(metrics.freemem / (ByteSize.GB)).toFixed(2)}GB free)`);
        }
        if (metrics.meminfo) {
            md.li(`Memory(Process): ${(metrics.meminfo.workingSetSize / ByteSize.KB).toFixed(2)} MB working set(${(metrics.meminfo.privateBytes / ByteSize.KB).toFixed(2)}MB private, ${(metrics.meminfo.sharedBytes / ByteSize.KB).toFixed(2)}MB shared)`);
        }
        md.li(`VM(likelihood): ${metrics.isVMLikelyhood}%`);
        md.li(`Initial Startup: ${metrics.initialStartup}`);
        md.li(`Has ${metrics.windowCount - 1} other windows`);
        md.li(`Screen Reader Active: ${metrics.hasAccessibilitySupport}`);
        md.li(`Empty Workspace: ${metrics.emptyWorkbench}`);
    }
    _addSummaryTable(md) {
        const metrics = this._timerService.startupMetrics;
        const contribTimings = Registry.as(WorkbenchExtensions.Workbench).timings;
        const table = [];
        table.push(['start => app.isReady', metrics.timers.ellapsedAppReady, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['nls:start => nls:end', metrics.timers.ellapsedNlsGeneration, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['import(main.bundle.js)', metrics.timers.ellapsedLoadMainBundle, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['start crash reporter', metrics.timers.ellapsedCrashReporter, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['serve main IPC handle', metrics.timers.ellapsedMainServer, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['create window', metrics.timers.ellapsedWindowCreate, '[main]', `initial startup: ${metrics.initialStartup}, ${metrics.initialStartup ? `state: ${metrics.timers.ellapsedWindowRestoreState}ms, widget: ${metrics.timers.ellapsedBrowserWindowCreate}ms, show: ${metrics.timers.ellapsedWindowMaximize}ms` : ''}`]);
        table.push(['app.isReady => window.loadUrl()', metrics.timers.ellapsedWindowLoad, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['window.loadUrl() => begin to import(workbench.desktop.main.js)', metrics.timers.ellapsedWindowLoadToRequire, '[main->renderer]', StartupKindToString(metrics.windowKind)]);
        table.push(['import(workbench.desktop.main.js)', metrics.timers.ellapsedRequire, '[renderer]', `cached data: ${(metrics.didUseCachedData ? 'YES' : 'NO')}`]);
        table.push(['wait for window config', metrics.timers.ellapsedWaitForWindowConfig, '[renderer]', undefined]);
        table.push(['init storage (global & workspace)', metrics.timers.ellapsedStorageInit, '[renderer]', undefined]);
        table.push(['init workspace service', metrics.timers.ellapsedWorkspaceServiceInit, '[renderer]', undefined]);
        if (isWeb) {
            table.push(['init settings and global state from settings sync service', metrics.timers.ellapsedRequiredUserDataInit, '[renderer]', undefined]);
            table.push(['init keybindings, snippets & extensions from settings sync service', metrics.timers.ellapsedOtherUserDataInit, '[renderer]', undefined]);
        }
        table.push(['register extensions & spawn extension host', metrics.timers.ellapsedExtensions, '[renderer]', undefined]);
        table.push(['restore viewlet', metrics.timers.ellapsedViewletRestore, '[renderer]', metrics.viewletId]);
        table.push(['restore panel', metrics.timers.ellapsedPanelRestore, '[renderer]', metrics.panelId]);
        table.push(['restore & resolve visible editors', metrics.timers.ellapsedEditorRestore, '[renderer]', `${metrics.editorIds.length}: ${metrics.editorIds.join(', ')}`]);
        table.push(['create workbench contributions', metrics.timers.ellapsedWorkbenchContributions, '[renderer]', `${(contribTimings.get(1)?.length ?? 0) + (contribTimings.get(1)?.length ?? 0)} blocking startup`]);
        table.push(['overall workbench load', metrics.timers.ellapsedWorkbench, '[renderer]', undefined]);
        table.push(['workbench ready', metrics.ellapsed, '[main->renderer]', undefined]);
        table.push(['renderer ready', metrics.timers.ellapsedRenderer, '[renderer]', undefined]);
        table.push(['shared process connection ready', metrics.timers.ellapsedSharedProcesConnected, '[renderer->sharedprocess]', undefined]);
        table.push(['extensions registered', metrics.timers.ellapsedExtensionsReady, '[renderer]', undefined]);
        md.heading(2, 'Performance Marks');
        md.table(['What', 'Duration', 'Process', 'Info'], table);
    }
    _addExtensionsTable(md) {
        const eager = [];
        const normal = [];
        const extensionsStatus = this._extensionService.getExtensionsStatus();
        for (const id in extensionsStatus) {
            const { activationTimes: times } = extensionsStatus[id];
            if (!times) {
                continue;
            }
            if (times.activationReason.startup) {
                eager.push([id, times.activationReason.startup, times.codeLoadingTime, times.activateCallTime, times.activateResolvedTime, times.activationReason.activationEvent, times.activationReason.extensionId.value]);
            }
            else {
                normal.push([id, times.activationReason.startup, times.codeLoadingTime, times.activateCallTime, times.activateResolvedTime, times.activationReason.activationEvent, times.activationReason.extensionId.value]);
            }
        }
        const table = eager.concat(normal);
        if (table.length > 0) {
            md.heading(2, 'Extension Activation Stats');
            md.table(['Extension', 'Eager', 'Load Code', 'Call Activate', 'Finish Activate', 'Event', 'By'], table);
        }
    }
    _addPerfMarksTable(name, md, marks) {
        if (!marks) {
            return;
        }
        const table = [];
        let lastStartTime = -1;
        let total = 0;
        for (const { name, startTime } of marks) {
            const delta = lastStartTime !== -1 ? startTime - lastStartTime : 0;
            total += delta;
            table.push([name, Math.round(startTime), Math.round(delta), Math.round(total)]);
            lastStartTime = startTime;
        }
        if (name) {
            md.heading(2, name);
        }
        md.table(['Name', 'Timestamp', 'Delta', 'Total'], table);
    }
    _addWorkbenchContributionsPerfMarksTable(md) {
        md.heading(2, 'Workbench Contributions Blocking Restore');
        const timings = Registry.as(WorkbenchExtensions.Workbench).timings;
        md.li(`Total (LifecyclePhase.Starting): ${timings.get(1)?.length} (${timings.get(1)?.reduce((p, c) => p + c[1], 0)}ms)`);
        md.li(`Total (LifecyclePhase.Ready): ${timings.get(2)?.length} (${timings.get(2)?.reduce((p, c) => p + c[1], 0)}ms)`);
        md.blank();
        const marks = this._timerService.getPerformanceMarks().find(e => e[0] === 'renderer')?.[1].filter(e => e.name.startsWith('code/willCreateWorkbenchContribution/1') ||
            e.name.startsWith('code/didCreateWorkbenchContribution/1') ||
            e.name.startsWith('code/willCreateWorkbenchContribution/2') ||
            e.name.startsWith('code/didCreateWorkbenchContribution/2'));
        this._addPerfMarksTable(undefined, md, marks);
    }
    _addRawPerfMarks(md) {
        for (const [source, marks] of this._timerService.getPerformanceMarks()) {
            md.heading(2, `Raw Perf Marks: ${source}`);
            md.value += '```\n';
            md.value += `Name\tTimestamp\tDelta\tTotal\n`;
            let lastStartTime = -1;
            let total = 0;
            for (const { name, startTime } of marks) {
                const delta = lastStartTime !== -1 ? startTime - lastStartTime : 0;
                total += delta;
                md.value += `${name}\t${startTime}\t${delta}\t${total}\n`;
                lastStartTime = startTime;
            }
            md.value += '```\n';
        }
    }
    _addResourceTimingStats(md) {
        const stats = performance.getEntriesByType('resource').map(entry => {
            return [entry.name, entry.duration];
        });
        if (!stats.length) {
            return;
        }
        md.heading(2, 'Resource Timing Stats');
        md.table(['Name', 'Duration'], stats);
    }
};
PerfModelContentProvider = __decorate([
    __param(0, IModelService),
    __param(1, ILanguageService),
    __param(2, ICodeEditorService),
    __param(3, ILifecycleService),
    __param(4, ITimerService),
    __param(5, IExtensionService),
    __param(6, IProductService),
    __param(7, IRemoteAgentService),
    __param(8, ITerminalService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], PerfModelContentProvider);
class MarkdownBuilder {
    constructor() {
        this.value = '';
    }
    heading(level, value) {
        this.value += `${'#'.repeat(level)} ${value}\n\n`;
        return this;
    }
    blank() {
        this.value += '\n';
        return this;
    }
    li(value) {
        this.value += `* ${value}\n`;
        return this;
    }
    table(header, rows) {
        this.value += this.toMarkdownTable(header, rows);
    }
    toMarkdownTable(header, rows) {
        let result = '';
        const lengths = [];
        header.forEach((cell, ci) => {
            lengths[ci] = cell.length;
        });
        rows.forEach(row => {
            row.forEach((cell, ci) => {
                if (typeof cell === 'undefined') {
                    cell = row[ci] = '-';
                }
                const len = cell.toString().length;
                lengths[ci] = Math.max(len, lengths[ci]);
            });
        });
        header.forEach((cell, ci) => { result += `| ${cell + ' '.repeat(lengths[ci] - cell.toString().length)} `; });
        result += '|\n';
        header.forEach((_cell, ci) => { result += `| ${'-'.repeat(lengths[ci])} `; });
        result += '|\n';
        rows.forEach(row => {
            row.forEach((cell, ci) => {
                if (typeof cell !== 'undefined') {
                    result += `| ${cell + ' '.repeat(lengths[ci] - cell.toString().length)} `;
                }
            });
            result += '|\n';
        });
        return result;
    }
}
