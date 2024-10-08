/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var VoiceChatService_1;
import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { rtrim } from '../../../../base/common/strings.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IChatAgentService } from './chatAgents.js';
import { chatAgentLeader, chatSubcommandLeader } from './chatParserTypes.js';
import { ISpeechService, SpeechToTextStatus } from '../../speech/common/speechService.js';
export const IVoiceChatService = createDecorator('voiceChatService');
var PhraseTextType;
(function (PhraseTextType) {
    PhraseTextType[PhraseTextType["AGENT"] = 1] = "AGENT";
    PhraseTextType[PhraseTextType["COMMAND"] = 2] = "COMMAND";
    PhraseTextType[PhraseTextType["AGENT_AND_COMMAND"] = 3] = "AGENT_AND_COMMAND";
})(PhraseTextType || (PhraseTextType = {}));
export const VoiceChatInProgress = new RawContextKey('voiceChatInProgress', false, { type: 'boolean', description: localize('voiceChatInProgress', "A speech-to-text session is in progress for chat.") });
let VoiceChatService = class VoiceChatService extends Disposable {
    static { VoiceChatService_1 = this; }
    static { this.AGENT_PREFIX = chatAgentLeader; }
    static { this.COMMAND_PREFIX = chatSubcommandLeader; }
    static { this.PHRASES_LOWER = {
        [this.AGENT_PREFIX]: 'at',
        [this.COMMAND_PREFIX]: 'slash'
    }; }
    static { this.PHRASES_UPPER = {
        [this.AGENT_PREFIX]: 'At',
        [this.COMMAND_PREFIX]: 'Slash'
    }; }
    static { this.CHAT_AGENT_ALIAS = new Map([['vscode', 'code']]); }
    constructor(speechService, chatAgentService, contextKeyService) {
        super();
        this.speechService = speechService;
        this.chatAgentService = chatAgentService;
        this.contextKeyService = contextKeyService;
        this.voiceChatInProgress = VoiceChatInProgress.bindTo(this.contextKeyService);
        this.activeVoiceChatSessions = 0;
    }
    createPhrases(model) {
        const phrases = new Map();
        for (const agent of this.chatAgentService.getActivatedAgents()) {
            const agentPhrase = `${VoiceChatService_1.PHRASES_LOWER[VoiceChatService_1.AGENT_PREFIX]} ${VoiceChatService_1.CHAT_AGENT_ALIAS.get(agent.name) ?? agent.name}`.toLowerCase();
            phrases.set(agentPhrase, { agent: agent.name });
            for (const slashCommand of agent.slashCommands) {
                const slashCommandPhrase = `${VoiceChatService_1.PHRASES_LOWER[VoiceChatService_1.COMMAND_PREFIX]} ${slashCommand.name}`.toLowerCase();
                phrases.set(slashCommandPhrase, { agent: agent.name, command: slashCommand.name });
                const agentSlashCommandPhrase = `${agentPhrase} ${slashCommandPhrase}`.toLowerCase();
                phrases.set(agentSlashCommandPhrase, { agent: agent.name, command: slashCommand.name });
            }
        }
        return phrases;
    }
    toText(value, type) {
        switch (type) {
            case PhraseTextType.AGENT:
                return `${VoiceChatService_1.AGENT_PREFIX}${value.agent}`;
            case PhraseTextType.COMMAND:
                return `${VoiceChatService_1.COMMAND_PREFIX}${value.command}`;
            case PhraseTextType.AGENT_AND_COMMAND:
                return `${VoiceChatService_1.AGENT_PREFIX}${value.agent} ${VoiceChatService_1.COMMAND_PREFIX}${value.command}`;
        }
    }
    async createVoiceChatSession(token, options) {
        const disposables = new DisposableStore();
        const onSessionStoppedOrCanceled = (dispose) => {
            this.activeVoiceChatSessions = Math.max(0, this.activeVoiceChatSessions - 1);
            if (this.activeVoiceChatSessions === 0) {
                this.voiceChatInProgress.reset();
            }
            if (dispose) {
                disposables.dispose();
            }
        };
        disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled(true)));
        let detectedAgent = false;
        let detectedSlashCommand = false;
        const emitter = disposables.add(new Emitter());
        const session = await this.speechService.createSpeechToTextSession(token, 'chat');
        if (token.isCancellationRequested) {
            onSessionStoppedOrCanceled(true);
        }
        const phrases = this.createPhrases(options.model);
        disposables.add(session.onDidChange(e => {
            switch (e.status) {
                case SpeechToTextStatus.Recognizing:
                case SpeechToTextStatus.Recognized: {
                    let massagedEvent = e;
                    if (e.text) {
                        const startsWithAgent = e.text.startsWith(VoiceChatService_1.PHRASES_UPPER[VoiceChatService_1.AGENT_PREFIX]) || e.text.startsWith(VoiceChatService_1.PHRASES_LOWER[VoiceChatService_1.AGENT_PREFIX]);
                        const startsWithSlashCommand = e.text.startsWith(VoiceChatService_1.PHRASES_UPPER[VoiceChatService_1.COMMAND_PREFIX]) || e.text.startsWith(VoiceChatService_1.PHRASES_LOWER[VoiceChatService_1.COMMAND_PREFIX]);
                        if (startsWithAgent || startsWithSlashCommand) {
                            const originalWords = e.text.split(' ');
                            let transformedWords;
                            let waitingForInput = false;
                            // Check for agent + slash command
                            if (options.usesAgents && startsWithAgent && !detectedAgent && !detectedSlashCommand && originalWords.length >= 4) {
                                const phrase = phrases.get(originalWords.slice(0, 4).map(word => this.normalizeWord(word)).join(' '));
                                if (phrase) {
                                    transformedWords = [this.toText(phrase, PhraseTextType.AGENT_AND_COMMAND), ...originalWords.slice(4)];
                                    waitingForInput = originalWords.length === 4;
                                    if (e.status === SpeechToTextStatus.Recognized) {
                                        detectedAgent = true;
                                        detectedSlashCommand = true;
                                    }
                                }
                            }
                            // Check for agent (if not done already)
                            if (options.usesAgents && startsWithAgent && !detectedAgent && !transformedWords && originalWords.length >= 2) {
                                const phrase = phrases.get(originalWords.slice(0, 2).map(word => this.normalizeWord(word)).join(' '));
                                if (phrase) {
                                    transformedWords = [this.toText(phrase, PhraseTextType.AGENT), ...originalWords.slice(2)];
                                    waitingForInput = originalWords.length === 2;
                                    if (e.status === SpeechToTextStatus.Recognized) {
                                        detectedAgent = true;
                                    }
                                }
                            }
                            // Check for slash command (if not done already)
                            if (startsWithSlashCommand && !detectedSlashCommand && !transformedWords && originalWords.length >= 2) {
                                const phrase = phrases.get(originalWords.slice(0, 2).map(word => this.normalizeWord(word)).join(' '));
                                if (phrase) {
                                    transformedWords = [this.toText(phrase, options.usesAgents && !detectedAgent ?
                                            PhraseTextType.AGENT_AND_COMMAND : // rewrite `/fix` to `@workspace /foo` in this case
                                            PhraseTextType.COMMAND // when we have not yet detected an agent before
                                        ), ...originalWords.slice(2)];
                                    waitingForInput = originalWords.length === 2;
                                    if (e.status === SpeechToTextStatus.Recognized) {
                                        detectedSlashCommand = true;
                                    }
                                }
                            }
                            massagedEvent = {
                                status: e.status,
                                text: (transformedWords ?? originalWords).join(' '),
                                waitingForInput
                            };
                        }
                    }
                    emitter.fire(massagedEvent);
                    break;
                }
                case SpeechToTextStatus.Started:
                    this.activeVoiceChatSessions++;
                    this.voiceChatInProgress.set(true);
                    emitter.fire(e);
                    break;
                case SpeechToTextStatus.Stopped:
                    onSessionStoppedOrCanceled(false);
                    emitter.fire(e);
                    break;
                case SpeechToTextStatus.Error:
                    emitter.fire(e);
                    break;
            }
        }));
        return {
            onDidChange: emitter.event
        };
    }
    normalizeWord(word) {
        word = rtrim(word, '.');
        word = rtrim(word, ',');
        word = rtrim(word, '?');
        return word.toLowerCase();
    }
};
VoiceChatService = VoiceChatService_1 = __decorate([
    __param(0, ISpeechService),
    __param(1, IChatAgentService),
    __param(2, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object])
], VoiceChatService);
export { VoiceChatService };
