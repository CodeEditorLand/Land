import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
export declare const ISpeechService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISpeechService>;
export declare const HasSpeechProvider: RawContextKey<boolean>;
export declare const SpeechToTextInProgress: RawContextKey<boolean>;
export declare const TextToSpeechInProgress: RawContextKey<boolean>;
export interface ISpeechProviderMetadata {
    readonly extension: ExtensionIdentifier;
    readonly displayName: string;
}
export declare enum SpeechToTextStatus {
    Started = 1,
    Recognizing = 2,
    Recognized = 3,
    Stopped = 4,
    Error = 5
}
export interface ISpeechToTextEvent {
    readonly status: SpeechToTextStatus;
    readonly text?: string;
}
export interface ISpeechToTextSession {
    readonly onDidChange: Event<ISpeechToTextEvent>;
}
export declare enum TextToSpeechStatus {
    Started = 1,
    Stopped = 2,
    Error = 3
}
export interface ITextToSpeechEvent {
    readonly status: TextToSpeechStatus;
    readonly text?: string;
}
export interface ITextToSpeechSession {
    readonly onDidChange: Event<ITextToSpeechEvent>;
    synthesize(text: string): Promise<void>;
}
export declare enum KeywordRecognitionStatus {
    Recognized = 1,
    Stopped = 2,
    Canceled = 3
}
export interface IKeywordRecognitionEvent {
    readonly status: KeywordRecognitionStatus;
    readonly text?: string;
}
export interface IKeywordRecognitionSession {
    readonly onDidChange: Event<IKeywordRecognitionEvent>;
}
export interface ISpeechToTextSessionOptions {
    readonly language?: string;
}
export interface ITextToSpeechSessionOptions {
    readonly language?: string;
}
export interface ISpeechProvider {
    readonly metadata: ISpeechProviderMetadata;
    createSpeechToTextSession(token: CancellationToken, options?: ISpeechToTextSessionOptions): ISpeechToTextSession;
    createTextToSpeechSession(token: CancellationToken, options?: ITextToSpeechSessionOptions): ITextToSpeechSession;
    createKeywordRecognitionSession(token: CancellationToken): IKeywordRecognitionSession;
}
export interface ISpeechService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeHasSpeechProvider: Event<void>;
    readonly hasSpeechProvider: boolean;
    registerSpeechProvider(identifier: string, provider: ISpeechProvider): IDisposable;
    readonly onDidStartSpeechToTextSession: Event<void>;
    readonly onDidEndSpeechToTextSession: Event<void>;
    readonly hasActiveSpeechToTextSession: boolean;
    createSpeechToTextSession(token: CancellationToken, context?: string): Promise<ISpeechToTextSession>;
    readonly onDidStartTextToSpeechSession: Event<void>;
    readonly onDidEndTextToSpeechSession: Event<void>;
    readonly hasActiveTextToSpeechSession: boolean;
    createTextToSpeechSession(token: CancellationToken, context?: string): Promise<ITextToSpeechSession>;
    readonly onDidStartKeywordRecognition: Event<void>;
    readonly onDidEndKeywordRecognition: Event<void>;
    readonly hasActiveKeywordRecognition: boolean;
    recognizeKeyword(token: CancellationToken): Promise<KeywordRecognitionStatus>;
}
export declare const enum AccessibilityVoiceSettingId {
    SpeechTimeout = "accessibility.voice.speechTimeout",
    AutoSynthesize = "accessibility.voice.autoSynthesize",
    SpeechLanguage = "accessibility.voice.speechLanguage"
}
export declare const SPEECH_LANGUAGE_CONFIG = AccessibilityVoiceSettingId.SpeechLanguage;
export declare const SPEECH_LANGUAGES: {
    "da-DK": {
        name: string;
    };
    "de-DE": {
        name: string;
    };
    "en-AU": {
        name: string;
    };
    "en-CA": {
        name: string;
    };
    "en-GB": {
        name: string;
    };
    "en-IE": {
        name: string;
    };
    "en-IN": {
        name: string;
    };
    "en-NZ": {
        name: string;
    };
    "en-US": {
        name: string;
    };
    "es-ES": {
        name: string;
    };
    "es-MX": {
        name: string;
    };
    "fr-CA": {
        name: string;
    };
    "fr-FR": {
        name: string;
    };
    "hi-IN": {
        name: string;
    };
    "it-IT": {
        name: string;
    };
    "ja-JP": {
        name: string;
    };
    "ko-KR": {
        name: string;
    };
    "nl-NL": {
        name: string;
    };
    "pt-PT": {
        name: string;
    };
    "pt-BR": {
        name: string;
    };
    "ru-RU": {
        name: string;
    };
    "sv-SE": {
        name: string;
    };
    "tr-TR": {
        name: string;
    };
    "zh-CN": {
        name: string;
    };
    "zh-HK": {
        name: string;
    };
    "zh-TW": {
        name: string;
    };
};
export declare function speechLanguageConfigToLanguage(config: unknown, lang?: string): string;
