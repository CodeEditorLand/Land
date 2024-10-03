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
import { Disposable } from '../../../../base/common/lifecycle.js';
import Severity from '../../../../base/common/severity.js';
import { getCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ILanguageStatusService } from '../../../services/languageStatus/common/languageStatusService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import * as nls from '../../../../nls.js';
import { FoldingController } from '../../../../editor/contrib/folding/browser/folding.js';
import { ColorDetector } from '../../../../editor/contrib/colorPicker/browser/colorDetector.js';
const openSettingsCommand = 'workbench.action.openSettings';
const configureSettingsLabel = nls.localize('status.button.configure', "Configure");
let LimitIndicatorContribution = class LimitIndicatorContribution extends Disposable {
    constructor(editorService, languageStatusService) {
        super();
        const accessors = [new ColorDecorationAccessor(), new FoldingRangeAccessor()];
        const statusEntries = accessors.map(indicator => new LanguageStatusEntry(languageStatusService, indicator));
        statusEntries.forEach(entry => this._register(entry));
        let control;
        const onActiveEditorChanged = () => {
            const activeControl = editorService.activeTextEditorControl;
            if (activeControl === control) {
                return;
            }
            control = activeControl;
            const editor = getCodeEditor(activeControl);
            statusEntries.forEach(statusEntry => statusEntry.onActiveEditorChanged(editor));
        };
        this._register(editorService.onDidActiveEditorChange(onActiveEditorChanged));
        onActiveEditorChanged();
    }
};
LimitIndicatorContribution = __decorate([
    __param(0, IEditorService),
    __param(1, ILanguageStatusService),
    __metadata("design:paramtypes", [Object, Object])
], LimitIndicatorContribution);
export { LimitIndicatorContribution };
class ColorDecorationAccessor {
    constructor() {
        this.id = 'decoratorsLimitInfo';
        this.name = nls.localize('colorDecoratorsStatusItem.name', 'Color Decorator Status');
        this.label = nls.localize('status.limitedColorDecorators.short', 'Color Decorators');
        this.source = nls.localize('colorDecoratorsStatusItem.source', 'Color Decorators');
        this.settingsId = 'editor.colorDecoratorsLimit';
    }
    getLimitReporter(editor) {
        return ColorDetector.get(editor)?.limitReporter;
    }
}
class FoldingRangeAccessor {
    constructor() {
        this.id = 'foldingLimitInfo';
        this.name = nls.localize('foldingRangesStatusItem.name', 'Folding Status');
        this.label = nls.localize('status.limitedFoldingRanges.short', 'Folding Ranges');
        this.source = nls.localize('foldingRangesStatusItem.source', 'Folding');
        this.settingsId = 'editor.foldingMaximumRegions';
    }
    getLimitReporter(editor) {
        return FoldingController.get(editor)?.limitReporter;
    }
}
class LanguageStatusEntry {
    constructor(languageStatusService, accessor) {
        this.languageStatusService = languageStatusService;
        this.accessor = accessor;
    }
    onActiveEditorChanged(editor) {
        if (this._indicatorChangeListener) {
            this._indicatorChangeListener.dispose();
            this._indicatorChangeListener = undefined;
        }
        let info;
        if (editor) {
            info = this.accessor.getLimitReporter(editor);
        }
        this.updateStatusItem(info);
        if (info) {
            this._indicatorChangeListener = info.onDidChange(_ => {
                this.updateStatusItem(info);
            });
            return true;
        }
        return false;
    }
    updateStatusItem(info) {
        if (this._limitStatusItem) {
            this._limitStatusItem.dispose();
            this._limitStatusItem = undefined;
        }
        if (info && info.limited !== false) {
            const status = {
                id: this.accessor.id,
                selector: '*',
                name: this.accessor.name,
                severity: Severity.Warning,
                label: this.accessor.label,
                detail: nls.localize('status.limited.details', 'only {0} shown for performance reasons', info.limited),
                command: { id: openSettingsCommand, arguments: [this.accessor.settingsId], title: configureSettingsLabel },
                accessibilityInfo: undefined,
                source: this.accessor.source,
                busy: false
            };
            this._limitStatusItem = this.languageStatusService.addStatus(status);
        }
    }
    dispose() {
        this._limitStatusItem?.dispose;
        this._limitStatusItem = undefined;
        this._indicatorChangeListener?.dispose;
        this._indicatorChangeListener = undefined;
    }
}
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LimitIndicatorContribution, 3);
