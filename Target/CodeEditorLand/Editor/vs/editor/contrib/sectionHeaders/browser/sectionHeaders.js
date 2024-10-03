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
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerEditorContribution } from '../../../browser/editorExtensions.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { ModelDecorationOptions } from '../../../common/model/textModel.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
let SectionHeaderDetector = class SectionHeaderDetector extends Disposable {
    static { this.ID = 'editor.sectionHeaderDetector'; }
    constructor(editor, languageConfigurationService, editorWorkerService) {
        super();
        this.editor = editor;
        this.languageConfigurationService = languageConfigurationService;
        this.editorWorkerService = editorWorkerService;
        this.decorations = this.editor.createDecorationsCollection();
        this.options = this.createOptions(editor.getOption(75));
        this.computePromise = null;
        this.currentOccurrences = {};
        this._register(editor.onDidChangeModel((e) => {
            this.currentOccurrences = {};
            this.options = this.createOptions(editor.getOption(75));
            this.stop();
            this.computeSectionHeaders.schedule(0);
        }));
        this._register(editor.onDidChangeModelLanguage((e) => {
            this.currentOccurrences = {};
            this.options = this.createOptions(editor.getOption(75));
            this.stop();
            this.computeSectionHeaders.schedule(0);
        }));
        this._register(languageConfigurationService.onDidChange((e) => {
            const editorLanguageId = this.editor.getModel()?.getLanguageId();
            if (editorLanguageId && e.affects(editorLanguageId)) {
                this.currentOccurrences = {};
                this.options = this.createOptions(editor.getOption(75));
                this.stop();
                this.computeSectionHeaders.schedule(0);
            }
        }));
        this._register(editor.onDidChangeConfiguration(e => {
            if (this.options && !e.hasChanged(75)) {
                return;
            }
            this.options = this.createOptions(editor.getOption(75));
            this.updateDecorations([]);
            this.stop();
            this.computeSectionHeaders.schedule(0);
        }));
        this._register(this.editor.onDidChangeModelContent(e => {
            this.computeSectionHeaders.schedule();
        }));
        this._register(editor.onDidChangeModelTokens((e) => {
            if (!this.computeSectionHeaders.isScheduled()) {
                this.computeSectionHeaders.schedule(1000);
            }
        }));
        this.computeSectionHeaders = this._register(new RunOnceScheduler(() => {
            this.findSectionHeaders();
        }, 250));
        this.computeSectionHeaders.schedule(0);
    }
    createOptions(minimap) {
        if (!minimap || !this.editor.hasModel()) {
            return undefined;
        }
        const languageId = this.editor.getModel().getLanguageId();
        if (!languageId) {
            return undefined;
        }
        const commentsConfiguration = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
        const foldingRules = this.languageConfigurationService.getLanguageConfiguration(languageId).foldingRules;
        if (!commentsConfiguration && !foldingRules?.markers) {
            return undefined;
        }
        return {
            foldingRules,
            findMarkSectionHeaders: minimap.showMarkSectionHeaders,
            findRegionSectionHeaders: minimap.showRegionSectionHeaders,
        };
    }
    findSectionHeaders() {
        if (!this.editor.hasModel()
            || (!this.options?.findMarkSectionHeaders && !this.options?.findRegionSectionHeaders)) {
            return;
        }
        const model = this.editor.getModel();
        if (model.isDisposed() || model.isTooLargeForSyncing()) {
            return;
        }
        const modelVersionId = model.getVersionId();
        this.editorWorkerService.findSectionHeaders(model.uri, this.options)
            .then((sectionHeaders) => {
            if (model.isDisposed() || model.getVersionId() !== modelVersionId) {
                return;
            }
            this.updateDecorations(sectionHeaders);
        });
    }
    updateDecorations(sectionHeaders) {
        const model = this.editor.getModel();
        if (model) {
            sectionHeaders = sectionHeaders.filter((sectionHeader) => {
                if (!sectionHeader.shouldBeInComments) {
                    return true;
                }
                const validRange = model.validateRange(sectionHeader.range);
                const tokens = model.tokenization.getLineTokens(validRange.startLineNumber);
                const idx = tokens.findTokenIndexAtOffset(validRange.startColumn - 1);
                const tokenType = tokens.getStandardTokenType(idx);
                const languageId = tokens.getLanguageId(idx);
                return (languageId === model.getLanguageId() && tokenType === 1);
            });
        }
        const oldDecorations = Object.values(this.currentOccurrences).map(occurrence => occurrence.decorationId);
        const newDecorations = sectionHeaders.map(sectionHeader => decoration(sectionHeader));
        this.editor.changeDecorations((changeAccessor) => {
            const decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
            this.currentOccurrences = {};
            for (let i = 0, len = decorations.length; i < len; i++) {
                const occurrence = { sectionHeader: sectionHeaders[i], decorationId: decorations[i] };
                this.currentOccurrences[occurrence.decorationId] = occurrence;
            }
        });
    }
    stop() {
        this.computeSectionHeaders.cancel();
        if (this.computePromise) {
            this.computePromise.cancel();
            this.computePromise = null;
        }
    }
    dispose() {
        super.dispose();
        this.stop();
        this.decorations.clear();
    }
};
SectionHeaderDetector = __decorate([
    __param(1, ILanguageConfigurationService),
    __param(2, IEditorWorkerService),
    __metadata("design:paramtypes", [Object, Object, Object])
], SectionHeaderDetector);
export { SectionHeaderDetector };
function decoration(sectionHeader) {
    return {
        range: sectionHeader.range,
        options: ModelDecorationOptions.createDynamic({
            description: 'section-header',
            stickiness: 3,
            collapseOnReplaceEdit: true,
            minimap: {
                color: undefined,
                position: 1,
                sectionHeaderStyle: sectionHeader.hasSeparatorLine ? 2 : 1,
                sectionHeaderText: sectionHeader.text,
            },
        })
    };
}
registerEditorContribution(SectionHeaderDetector.ID, SectionHeaderDetector, 1);
