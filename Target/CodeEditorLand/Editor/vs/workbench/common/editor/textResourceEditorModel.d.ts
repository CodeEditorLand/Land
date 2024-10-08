import { BaseTextEditorModel } from './textEditorModel.js';
import { URI } from '../../../base/common/uri.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ILanguageDetectionService } from '../../services/languageDetection/common/languageDetectionWorkerService.js';
import { IAccessibilityService } from '../../../platform/accessibility/common/accessibility.js';
/**
 * An editor model for in-memory, readonly text content that
 * is backed by an existing editor model.
 */
export declare class TextResourceEditorModel extends BaseTextEditorModel {
    constructor(resource: URI, languageService: ILanguageService, modelService: IModelService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService);
    dispose(): void;
}
