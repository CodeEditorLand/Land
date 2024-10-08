import { ContextKeyExpression, IContext, IContextKeyService } from '../../contextkey/common/contextkey.js';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem.js';
export declare const enum ResultKind {
    /** No keybinding found this sequence of chords */
    NoMatchingKb = 0,
    /** There're several keybindings that have the given sequence of chords as a prefix */
    MoreChordsNeeded = 1,
    /** A single keybinding found to be dispatched/invoked */
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
/**
 * Stores mappings from keybindings to commands and from commands to keybindings.
 * Given a sequence of chords, `resolve`s which keybinding it matches
 */
export declare class KeybindingResolver {
    private readonly _log;
    private readonly _defaultKeybindings;
    private readonly _keybindings;
    private readonly _defaultBoundCommands;
    private readonly _map;
    private readonly _lookupMap;
    constructor(
    /** built-in and extension-provided keybindings */
    defaultKeybindings: ResolvedKeybindingItem[], 
    /** user's keybindings */
    overrides: ResolvedKeybindingItem[], log: (str: string) => void);
    private static _isTargetedForRemoval;
    /**
     * Looks for rules containing "-commandId" and removes them.
     */
    static handleRemovals(rules: ResolvedKeybindingItem[]): ResolvedKeybindingItem[];
    private _addKeyPress;
    private _addToLookupMap;
    private _removeFromLookupMap;
    /**
     * Returns true if it is provable `a` implies `b`.
     */
    static whenIsEntirelyIncluded(a: ContextKeyExpression | null | undefined, b: ContextKeyExpression | null | undefined): boolean;
    getDefaultBoundCommands(): Map<string, boolean>;
    getDefaultKeybindings(): readonly ResolvedKeybindingItem[];
    getKeybindings(): readonly ResolvedKeybindingItem[];
    lookupKeybindings(commandId: string): ResolvedKeybindingItem[];
    lookupPrimaryKeybinding(commandId: string, context: IContextKeyService): ResolvedKeybindingItem | null;
    /**
     * Looks up a keybinding trigged as a result of pressing a sequence of chords - `[...currentChords, keypress]`
     *
     * Example: resolving 3 chords pressed sequentially - `cmd+k cmd+p cmd+i`:
     * 	`currentChords = [ 'cmd+k' , 'cmd+p' ]` and `keypress = `cmd+i` - last pressed chord
     */
    resolve(context: IContext, currentChords: string[], keypress: string): ResolutionResult;
    private _findCommand;
    private static _contextMatchesRules;
}
