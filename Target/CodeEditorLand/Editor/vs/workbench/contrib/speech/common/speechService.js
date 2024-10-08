/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { language } from '../../../../base/common/platform.js';
export const ISpeechService = createDecorator('speechService');
export const HasSpeechProvider = new RawContextKey('hasSpeechProvider', false, { type: 'boolean', description: localize('hasSpeechProvider', "A speech provider is registered to the speech service.") });
export const SpeechToTextInProgress = new RawContextKey('speechToTextInProgress', false, { type: 'boolean', description: localize('speechToTextInProgress', "A speech-to-text session is in progress.") });
export const TextToSpeechInProgress = new RawContextKey('textToSpeechInProgress', false, { type: 'boolean', description: localize('textToSpeechInProgress', "A text-to-speech session is in progress.") });
export var SpeechToTextStatus;
(function (SpeechToTextStatus) {
    SpeechToTextStatus[SpeechToTextStatus["Started"] = 1] = "Started";
    SpeechToTextStatus[SpeechToTextStatus["Recognizing"] = 2] = "Recognizing";
    SpeechToTextStatus[SpeechToTextStatus["Recognized"] = 3] = "Recognized";
    SpeechToTextStatus[SpeechToTextStatus["Stopped"] = 4] = "Stopped";
    SpeechToTextStatus[SpeechToTextStatus["Error"] = 5] = "Error";
})(SpeechToTextStatus || (SpeechToTextStatus = {}));
export var TextToSpeechStatus;
(function (TextToSpeechStatus) {
    TextToSpeechStatus[TextToSpeechStatus["Started"] = 1] = "Started";
    TextToSpeechStatus[TextToSpeechStatus["Stopped"] = 2] = "Stopped";
    TextToSpeechStatus[TextToSpeechStatus["Error"] = 3] = "Error";
})(TextToSpeechStatus || (TextToSpeechStatus = {}));
export var KeywordRecognitionStatus;
(function (KeywordRecognitionStatus) {
    KeywordRecognitionStatus[KeywordRecognitionStatus["Recognized"] = 1] = "Recognized";
    KeywordRecognitionStatus[KeywordRecognitionStatus["Stopped"] = 2] = "Stopped";
    KeywordRecognitionStatus[KeywordRecognitionStatus["Canceled"] = 3] = "Canceled";
})(KeywordRecognitionStatus || (KeywordRecognitionStatus = {}));
export const SPEECH_LANGUAGE_CONFIG = "accessibility.voice.speechLanguage" /* AccessibilityVoiceSettingId.SpeechLanguage */;
export const SPEECH_LANGUAGES = {
    ['da-DK']: {
        name: localize('speechLanguage.da-DK', "Danish (Denmark)")
    },
    ['de-DE']: {
        name: localize('speechLanguage.de-DE', "German (Germany)")
    },
    ['en-AU']: {
        name: localize('speechLanguage.en-AU', "English (Australia)")
    },
    ['en-CA']: {
        name: localize('speechLanguage.en-CA', "English (Canada)")
    },
    ['en-GB']: {
        name: localize('speechLanguage.en-GB', "English (United Kingdom)")
    },
    ['en-IE']: {
        name: localize('speechLanguage.en-IE', "English (Ireland)")
    },
    ['en-IN']: {
        name: localize('speechLanguage.en-IN', "English (India)")
    },
    ['en-NZ']: {
        name: localize('speechLanguage.en-NZ', "English (New Zealand)")
    },
    ['en-US']: {
        name: localize('speechLanguage.en-US', "English (United States)")
    },
    ['es-ES']: {
        name: localize('speechLanguage.es-ES', "Spanish (Spain)")
    },
    ['es-MX']: {
        name: localize('speechLanguage.es-MX', "Spanish (Mexico)")
    },
    ['fr-CA']: {
        name: localize('speechLanguage.fr-CA', "French (Canada)")
    },
    ['fr-FR']: {
        name: localize('speechLanguage.fr-FR', "French (France)")
    },
    ['hi-IN']: {
        name: localize('speechLanguage.hi-IN', "Hindi (India)")
    },
    ['it-IT']: {
        name: localize('speechLanguage.it-IT', "Italian (Italy)")
    },
    ['ja-JP']: {
        name: localize('speechLanguage.ja-JP', "Japanese (Japan)")
    },
    ['ko-KR']: {
        name: localize('speechLanguage.ko-KR', "Korean (South Korea)")
    },
    ['nl-NL']: {
        name: localize('speechLanguage.nl-NL', "Dutch (Netherlands)")
    },
    ['pt-PT']: {
        name: localize('speechLanguage.pt-PT', "Portuguese (Portugal)")
    },
    ['pt-BR']: {
        name: localize('speechLanguage.pt-BR', "Portuguese (Brazil)")
    },
    ['ru-RU']: {
        name: localize('speechLanguage.ru-RU', "Russian (Russia)")
    },
    ['sv-SE']: {
        name: localize('speechLanguage.sv-SE', "Swedish (Sweden)")
    },
    ['tr-TR']: {
        // allow-any-unicode-next-line
        name: localize('speechLanguage.tr-TR', "Turkish (Türkiye)")
    },
    ['zh-CN']: {
        name: localize('speechLanguage.zh-CN', "Chinese (Simplified, China)")
    },
    ['zh-HK']: {
        name: localize('speechLanguage.zh-HK', "Chinese (Traditional, Hong Kong)")
    },
    ['zh-TW']: {
        name: localize('speechLanguage.zh-TW', "Chinese (Traditional, Taiwan)")
    }
};
export function speechLanguageConfigToLanguage(config, lang = language) {
    if (typeof config === 'string') {
        if (config === 'auto') {
            if (lang !== 'en') {
                const langParts = lang.split('-');
                return speechLanguageConfigToLanguage(`${langParts[0]}-${(langParts[1] ?? langParts[0]).toUpperCase()}`);
            }
        }
        else {
            if (SPEECH_LANGUAGES[config]) {
                return config;
            }
        }
    }
    return 'en-US';
}
