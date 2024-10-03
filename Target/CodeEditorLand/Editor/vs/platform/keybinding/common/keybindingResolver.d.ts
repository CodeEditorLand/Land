import { ContextKeyExpression, IContext, IContextKeyService } from '../../contextkey/common/contextkey.js';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem.js';
export declare const enum ResultKind {
    NoMatchingKb = 0,
    MoreChordsNeeded = 1,
    KbFound = 2
}
export type ResolutionResult = {
    kind: ResultKind.NoMatchingKb;
} | {
    kind: ResultKind.MoreChordsNeeded;
} | {
    kind: ResultKind.KbFound;
    commandId: string | null;
    commandArgs: any;
    isBubble: boolean;
};
export declare const NoMatchingKb: ResolutionResult;
export declare class KeybindingResolver {
    private readonly _log;
    private readonly _defaultKeybindings;
    private readonly _keybindings;
    private readonly _defaultBoundCommands;
    private readonly _map;
    private readonly _lookupMap;
    constructor(defaultKeybindings: ResolvedKeybindingItem[], overrides: ResolvedKeybindingItem[], log: (str: string) => void);
    private static _isTargetedForRemoval;
    static handleRemovals(rules: ResolvedKeybindingItem[]): ResolvedKeybindingItem[];
    private _addKeyPress;
    private _addToLookupMap;
    private _removeFromLookupMap;
    static whenIsEntirelyIncluded(a: ContextKeyExpression | null | undefined, b: ContextKeyExpression | null | undefined): boolean;
    getDefaultBoundCommands(): Map<string, boolean>;
    getDefaultKeybindings(): readonly ResolvedKeybindingItem[];
    getKeybindings(): readonly ResolvedKeybindingItem[];
    lookupKeybindings(commandId: string): ResolvedKeybindingItem[];
    lookupPrimaryKeybinding(commandId: string, context: IContextKeyService): ResolvedKeybindingItem | null;
    resolve(context: IContext, currentChords: string[], keypress: string): ResolutionResult;
    private _findCommand;
    private static _contextMatchesRules;
}
