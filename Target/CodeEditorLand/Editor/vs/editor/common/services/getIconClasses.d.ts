import { URI, URI as uri } from '../../../base/common/uri.js';
import { ILanguageService } from '../languages/language.js';
import { IModelService } from './model.js';
import { FileKind } from '../../../platform/files/common/files.js';
import { ThemeIcon } from '../../../base/common/themables.js';
export declare function getIconClasses(modelService: IModelService, languageService: ILanguageService, resource: uri | undefined, fileKind?: FileKind, icon?: ThemeIcon | URI): string[];
export declare function getIconClassesForLanguageId(languageId: string): string[];
