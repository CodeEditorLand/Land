import { ILogService } from '../../../platform/log/common/log.js';
import { MainThreadSpeechShape } from '../common/extHost.protocol.js';
import { IKeywordRecognitionEvent, ISpeechProviderMetadata, ISpeechService, ISpeechToTextEvent, ITextToSpeechEvent } from '../../contrib/speech/common/speechService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadSpeech implements MainThreadSpeechShape {
    private readonly speechService;
    private readonly logService;
    private readonly proxy;
    private readonly providerRegistrations;
    private readonly speechToTextSessions;
    private readonly textToSpeechSessions;
    private readonly keywordRecognitionSessions;
    constructor(extHostContext: IExtHostContext, speechService: ISpeechService, logService: ILogService);
    $registerProvider(handle: number, identifier: string, metadata: ISpeechProviderMetadata): void;
    $unregisterProvider(handle: number): void;
    $emitSpeechToTextEvent(session: number, event: ISpeechToTextEvent): void;
    $emitTextToSpeechEvent(session: number, event: ITextToSpeechEvent): void;
    $emitKeywordRecognitionEvent(session: number, event: IKeywordRecognitionEvent): void;
    dispose(): void;
}
