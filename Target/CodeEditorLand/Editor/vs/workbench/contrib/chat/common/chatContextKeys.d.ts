import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ChatAgentLocation } from './chatAgents.js';
export declare const CONTEXT_RESPONSE_VOTE: RawContextKey<string>;
export declare const CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING: RawContextKey<boolean>;
export declare const CONTEXT_RESPONSE_FILTERED: RawContextKey<boolean>;
export declare const CONTEXT_RESPONSE_ERROR: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_REQUEST_IN_PROGRESS: RawContextKey<boolean>;
export declare const CONTEXT_RESPONSE: RawContextKey<boolean>;
export declare const CONTEXT_REQUEST: RawContextKey<boolean>;
export declare const CONTEXT_ITEM_ID: RawContextKey<string>;
export declare const CONTEXT_LAST_ITEM_ID: RawContextKey<string[]>;
export declare const CONTEXT_CHAT_EDIT_APPLIED: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_INPUT_HAS_TEXT: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_INPUT_HAS_FOCUS: RawContextKey<boolean>;
export declare const CONTEXT_IN_CHAT_INPUT: RawContextKey<boolean>;
export declare const CONTEXT_IN_CHAT_SESSION: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_ENABLED: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_EXTENSION_INVALID: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_INPUT_CURSOR_AT_TOP: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_INPUT_HAS_AGENT: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_LOCATION: RawContextKey<ChatAgentLocation>;
export declare const CONTEXT_IN_QUICK_CHAT: RawContextKey<boolean>;
export declare const CONTEXT_LANGUAGE_MODELS_ARE_USER_SELECTABLE: RawContextKey<boolean>;
export declare const CONTEXT_PARTICIPANT_SUPPORTS_MODEL_PICKER: RawContextKey<boolean>;
export declare const CONTEXT_CHAT_EDITING_ENABLED: RawContextKey<boolean>;
