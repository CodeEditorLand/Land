import { URI } from '../../../../base/common/uri.js';
export declare const ILanguageDetectionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageDetectionService>;
export declare const LanguageDetectionLanguageEventSource = "languageDetection";
export interface ILanguageDetectionService {
    readonly _serviceBrand: undefined;
    isEnabledForLanguage(languageId: string): boolean;
    detectLanguage(resource: URI, supportedLangs?: string[]): Promise<string | undefined>;
}
export type LanguageDetectionHintConfig = {
    untitledEditors: boolean;
    notebookEditors: boolean;
};
export declare const AutomaticLanguageDetectionLikelyWrongId = "automaticlanguagedetection.likelywrong";
export interface IAutomaticLanguageDetectionLikelyWrongData {
    currentLanguageId: string;
    nextLanguageId: string;
    lineCount: number;
    modelPreference: string;
}
export type AutomaticLanguageDetectionLikelyWrongClassification = {
    owner: 'TylerLeonhardt,JacksonKearl';
    comment: 'Used to determine how often language detection is likely wrong.';
    currentLanguageId: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The language id we guessed.';
    };
    nextLanguageId: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The language id the user chose.';
    };
    lineCount: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The number of lines in the file.';
    };
    modelPreference: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'What the user\'s model preference is.';
    };
};
export declare const LanguageDetectionStatsId = "automaticlanguagedetection.stats";
export interface ILanguageDetectionStats {
    languages: string;
    confidences: string;
    timeSpent: number;
}
export type LanguageDetectionStatsClassification = {
    owner: 'TylerLeonhardt,JacksonKearl';
    comment: 'Used to determine how definitive language detection is and how long it takes.';
    languages: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The languages the model supports.';
    };
    confidences: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The confidences of those languages.';
    };
    timeSpent: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'How long the operation took.';
    };
};
