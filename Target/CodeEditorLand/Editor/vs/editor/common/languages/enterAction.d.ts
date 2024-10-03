import { Range } from '../core/range.js';
import { ITextModel } from '../model.js';
import { CompleteEnterAction } from './languageConfiguration.js';
import { EditorAutoIndentStrategy } from '../config/editorOptions.js';
import { ILanguageConfigurationService } from './languageConfigurationRegistry.js';
export declare function getEnterAction(autoIndent: EditorAutoIndentStrategy, model: ITextModel, range: Range, languageConfigurationService: ILanguageConfigurationService): CompleteEnterAction | null;
