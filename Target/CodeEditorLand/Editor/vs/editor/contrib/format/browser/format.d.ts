import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IActiveCodeEditor } from '../../../browser/editorBrowser.js';
import { ServicesAccessor } from '../../../browser/editorExtensions.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { ITextModel } from '../../../common/model.js';
import { DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, FormattingOptions, TextEdit } from '../../../common/languages.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
export declare function getRealAndSyntheticDocumentFormattersOrdered(documentFormattingEditProvider: LanguageFeatureRegistry<DocumentFormattingEditProvider>, documentRangeFormattingEditProvider: LanguageFeatureRegistry<DocumentRangeFormattingEditProvider>, model: ITextModel): DocumentFormattingEditProvider[];
export declare const enum FormattingKind {
    File = 1,
    Selection = 2
}
export declare const enum FormattingMode {
    Explicit = 1,
    Silent = 2
}
export interface IFormattingEditProviderSelector {
    <T extends (DocumentFormattingEditProvider | DocumentRangeFormattingEditProvider)>(formatter: T[], document: ITextModel, mode: FormattingMode, kind: FormattingKind): Promise<T | undefined>;
}
export declare abstract class FormattingConflicts {
    private static readonly _selectors;
    static setFormatterSelector(selector: IFormattingEditProviderSelector): IDisposable;
    static select<T extends (DocumentFormattingEditProvider | DocumentRangeFormattingEditProvider)>(formatter: T[], document: ITextModel, mode: FormattingMode, kind: FormattingKind): Promise<T | undefined>;
}
export declare function formatDocumentRangesWithSelectedProvider(accessor: ServicesAccessor, editorOrModel: ITextModel | IActiveCodeEditor, rangeOrRanges: Range | Range[], mode: FormattingMode, progress: IProgress<DocumentRangeFormattingEditProvider>, token: CancellationToken, userGesture: boolean): Promise<void>;
export declare function formatDocumentRangesWithProvider(accessor: ServicesAccessor, provider: DocumentRangeFormattingEditProvider, editorOrModel: ITextModel | IActiveCodeEditor, rangeOrRanges: Range | Range[], token: CancellationToken, userGesture: boolean): Promise<boolean>;
export declare function formatDocumentWithSelectedProvider(accessor: ServicesAccessor, editorOrModel: ITextModel | IActiveCodeEditor, mode: FormattingMode, progress: IProgress<DocumentFormattingEditProvider>, token: CancellationToken, userGesture?: boolean): Promise<void>;
export declare function formatDocumentWithProvider(accessor: ServicesAccessor, provider: DocumentFormattingEditProvider, editorOrModel: ITextModel | IActiveCodeEditor, mode: FormattingMode, token: CancellationToken, userGesture?: boolean): Promise<boolean>;
export declare function getDocumentRangeFormattingEditsUntilResult(workerService: IEditorWorkerService, languageFeaturesService: ILanguageFeaturesService, model: ITextModel, range: Range, options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | undefined>;
export declare function getDocumentFormattingEditsUntilResult(workerService: IEditorWorkerService, languageFeaturesService: ILanguageFeaturesService, model: ITextModel, options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | undefined>;
export declare function getDocumentFormattingEditsWithSelectedProvider(workerService: IEditorWorkerService, languageFeaturesService: ILanguageFeaturesService, editorOrModel: ITextModel | IActiveCodeEditor, mode: FormattingMode, token: CancellationToken): Promise<TextEdit[] | undefined>;
export declare function getOnTypeFormattingEdits(workerService: IEditorWorkerService, languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: Position, ch: string, options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | null | undefined>;
