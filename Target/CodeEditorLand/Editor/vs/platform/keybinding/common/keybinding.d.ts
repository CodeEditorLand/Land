import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { KeyCode } from '../../../base/common/keyCodes.js';
import { ResolvedKeybinding, Keybinding } from '../../../base/common/keybindings.js';
import { IContextKeyService, IContextKeyServiceTarget } from '../../contextkey/common/contextkey.js';
import { ResolutionResult } from './keybindingResolver.js';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem.js';
export interface IUserFriendlyKeybinding {
    key: string;
    command: string;
    args?: any;
    when?: string;
}
export interface IKeyboardEvent {
    readonly _standardKeyboardEventBrand: true;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly altGraphKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
}
export interface KeybindingsSchemaContribution {
    readonly onDidChange?: Event<void>;
    getSchemaAdditions(): IJSONSchema[];
}
export declare const IKeybindingService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IKeybindingService>;
export interface IKeybindingService {
    readonly _serviceBrand: undefined;
    readonly inChordMode: boolean;
    onDidUpdateKeybindings: Event<void>;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(userBinding: string): ResolvedKeybinding[];
    dispatchEvent(e: IKeyboardEvent, target: IContextKeyServiceTarget): boolean;
    softDispatch(keyboardEvent: IKeyboardEvent, target: IContextKeyServiceTarget): ResolutionResult;
    enableKeybindingHoldMode(commandId: string): Promise<void> | undefined;
    dispatchByUserSettingsLabel(userSettingsLabel: string, target: IContextKeyServiceTarget): void;
    lookupKeybindings(commandId: string): ResolvedKeybinding[];
    lookupKeybinding(commandId: string, context?: IContextKeyService): ResolvedKeybinding | undefined;
    getDefaultKeybindingsContent(): string;
    getDefaultKeybindings(): readonly ResolvedKeybindingItem[];
    getKeybindings(): readonly ResolvedKeybindingItem[];
    customKeybindingsCount(): number;
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
    registerSchemaContribution(contribution: KeybindingsSchemaContribution): void;
    toggleLogging(): boolean;
    _dumpDebugInfo(): string;
    _dumpDebugInfoJSON(): string;
}
