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
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../../base/common/map.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { localize } from '../../../../../../nls.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../../../common/contributions.js';
import { CHANGE_CELL_LANGUAGE, DETECT_CELL_LANGUAGE } from '../../notebookBrowser.js';
import { INotebookCellStatusBarService } from '../../../common/notebookCellStatusBarService.js';
import { CellKind } from '../../../common/notebookCommon.js';
import { INotebookKernelService } from '../../../common/notebookKernelService.js';
import { INotebookService } from '../../../common/notebookService.js';
import { ILanguageDetectionService } from '../../../../../services/languageDetection/common/languageDetectionWorkerService.js';
let CellStatusBarLanguagePickerProvider = class CellStatusBarLanguagePickerProvider {
    constructor(_notebookService, _languageService) {
        this._notebookService = _notebookService;
        this._languageService = _languageService;
        this.viewType = '*';
    }
    async provideCellStatusBarItems(uri, index, _token) {
        const doc = this._notebookService.getNotebookTextModel(uri);
        const cell = doc?.cells[index];
        if (!cell) {
            return;
        }
        const statusBarItems = [];
        let displayLanguage = cell.language;
        if (cell.cellKind === CellKind.Markup) {
            displayLanguage = 'markdown';
        }
        else {
            const registeredId = this._languageService.getLanguageIdByLanguageName(cell.language);
            if (registeredId) {
                displayLanguage = this._languageService.getLanguageName(displayLanguage) ?? displayLanguage;
            }
            else {
                const searchTooltip = localize('notebook.cell.status.searchLanguageExtensions', "Unknown cell language. Click to search for '{0}' extensions", cell.language);
                statusBarItems.push({
                    text: `$(dialog-warning)`,
                    command: { id: 'workbench.extensions.search', arguments: [`@tag:${cell.language}`], title: 'Search Extensions' },
                    tooltip: searchTooltip,
                    alignment: 2,
                    priority: -Number.MAX_SAFE_INTEGER + 1
                });
            }
        }
        statusBarItems.push({
            text: displayLanguage,
            command: CHANGE_CELL_LANGUAGE,
            tooltip: localize('notebook.cell.status.language', "Select Cell Language Mode"),
            alignment: 2,
            priority: -Number.MAX_SAFE_INTEGER
        });
        return {
            items: statusBarItems
        };
    }
};
CellStatusBarLanguagePickerProvider = __decorate([
    __param(0, INotebookService),
    __param(1, ILanguageService),
    __metadata("design:paramtypes", [Object, Object])
], CellStatusBarLanguagePickerProvider);
let CellStatusBarLanguageDetectionProvider = class CellStatusBarLanguageDetectionProvider {
    constructor(_notebookService, _notebookKernelService, _languageService, _configurationService, _languageDetectionService, _keybindingService) {
        this._notebookService = _notebookService;
        this._notebookKernelService = _notebookKernelService;
        this._languageService = _languageService;
        this._configurationService = _configurationService;
        this._languageDetectionService = _languageDetectionService;
        this._keybindingService = _keybindingService;
        this.viewType = '*';
        this.cache = new ResourceMap();
    }
    async provideCellStatusBarItems(uri, index, token) {
        const doc = this._notebookService.getNotebookTextModel(uri);
        const cell = doc?.cells[index];
        if (!cell) {
            return;
        }
        const enablementConfig = this._configurationService.getValue('workbench.editor.languageDetectionHints');
        const enabled = typeof enablementConfig === 'object' && enablementConfig?.notebookEditors;
        if (!enabled) {
            return;
        }
        const cellUri = cell.uri;
        const contentVersion = cell.textModel?.getVersionId();
        if (!contentVersion) {
            return;
        }
        const currentLanguageId = cell.cellKind === CellKind.Markup ?
            'markdown' :
            (this._languageService.getLanguageIdByLanguageName(cell.language) || cell.language);
        if (!this.cache.has(cellUri)) {
            this.cache.set(cellUri, {
                cellLanguage: currentLanguageId,
                updateTimestamp: 0,
                contentVersion: 1,
            });
        }
        const cached = this.cache.get(cellUri);
        if (cached.cellLanguage !== currentLanguageId || (cached.updateTimestamp < Date.now() - 1000 && cached.contentVersion !== contentVersion)) {
            cached.updateTimestamp = Date.now();
            cached.cellLanguage = currentLanguageId;
            cached.contentVersion = contentVersion;
            const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(doc);
            if (kernel) {
                const supportedLangs = [...kernel.supportedLanguages, 'markdown'];
                cached.guess = await this._languageDetectionService.detectLanguage(cell.uri, supportedLangs);
            }
        }
        const items = [];
        if (cached.guess && currentLanguageId !== cached.guess) {
            const detectedName = this._languageService.getLanguageName(cached.guess) || cached.guess;
            let tooltip = localize('notebook.cell.status.autoDetectLanguage', "Accept Detected Language: {0}", detectedName);
            const keybinding = this._keybindingService.lookupKeybinding(DETECT_CELL_LANGUAGE);
            const label = keybinding?.getLabel();
            if (label) {
                tooltip += ` (${label})`;
            }
            items.push({
                text: '$(lightbulb-autofix)',
                command: DETECT_CELL_LANGUAGE,
                tooltip,
                alignment: 2,
                priority: -Number.MAX_SAFE_INTEGER + 1
            });
        }
        return { items };
    }
};
CellStatusBarLanguageDetectionProvider = __decorate([
    __param(0, INotebookService),
    __param(1, INotebookKernelService),
    __param(2, ILanguageService),
    __param(3, IConfigurationService),
    __param(4, ILanguageDetectionService),
    __param(5, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], CellStatusBarLanguageDetectionProvider);
let BuiltinCellStatusBarProviders = class BuiltinCellStatusBarProviders extends Disposable {
    constructor(instantiationService, notebookCellStatusBarService) {
        super();
        const builtinProviders = [
            CellStatusBarLanguagePickerProvider,
            CellStatusBarLanguageDetectionProvider,
        ];
        builtinProviders.forEach(p => {
            this._register(notebookCellStatusBarService.registerCellStatusBarItemProvider(instantiationService.createInstance(p)));
        });
    }
};
BuiltinCellStatusBarProviders = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookCellStatusBarService),
    __metadata("design:paramtypes", [Object, Object])
], BuiltinCellStatusBarProviders);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(BuiltinCellStatusBarProviders, 3);
