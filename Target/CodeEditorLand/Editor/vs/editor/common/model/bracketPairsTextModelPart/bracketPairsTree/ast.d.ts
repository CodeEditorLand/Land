import { BracketKind } from '../../../languages/supports/languageBracketsConfiguration.js';
import { ITextModel } from '../../../model.js';
import { Length } from './length.js';
import { SmallImmutableSet } from './smallImmutableSet.js';
import { OpeningBracketId } from './tokenizer.js';
export declare const enum AstNodeKind {
    Text = 0,
    Bracket = 1,
    Pair = 2,
    UnexpectedClosingBracket = 3,
    List = 4
}
export type AstNode = PairAstNode | ListAstNode | BracketAstNode | InvalidBracketAstNode | TextAstNode;
declare abstract class BaseAstNode {
    abstract readonly kind: AstNodeKind;
    abstract readonly childrenLength: number;
    abstract getChild(idx: number): AstNode | null;
    abstract readonly children: readonly AstNode[];
    abstract readonly missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>;
    abstract readonly listHeight: number;
    protected _length: Length;
    get length(): Length;
    constructor(length: Length);
    abstract canBeReused(openBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    abstract flattenLists(): AstNode;
    abstract deepClone(): AstNode;
    abstract computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export declare class PairAstNode extends BaseAstNode {
    readonly openingBracket: BracketAstNode;
    readonly child: AstNode | null;
    readonly closingBracket: BracketAstNode | null;
    readonly missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>;
    static create(openingBracket: BracketAstNode, child: AstNode | null, closingBracket: BracketAstNode | null): PairAstNode;
    get kind(): AstNodeKind.Pair;
    get listHeight(): number;
    get childrenLength(): number;
    getChild(idx: number): AstNode | null;
    get children(): AstNode[];
    private constructor();
    canBeReused(openBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    flattenLists(): PairAstNode;
    deepClone(): PairAstNode;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export declare abstract class ListAstNode extends BaseAstNode {
    readonly listHeight: number;
    private _missingOpeningBracketIds;
    static create23(item1: AstNode, item2: AstNode, item3: AstNode | null, immutable?: boolean): ListAstNode;
    static create(items: AstNode[], immutable?: boolean): ListAstNode;
    static getEmpty(): ImmutableArrayListAstNode;
    get kind(): AstNodeKind.List;
    get missingOpeningBracketIds(): SmallImmutableSet<OpeningBracketId>;
    private cachedMinIndentation;
    constructor(length: Length, listHeight: number, _missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>);
    protected throwIfImmutable(): void;
    protected abstract setChild(idx: number, child: AstNode): void;
    makeLastElementMutable(): AstNode | undefined;
    makeFirstElementMutable(): AstNode | undefined;
    canBeReused(openBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    handleChildrenChanged(): void;
    flattenLists(): ListAstNode;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
    abstract toMutable(): ListAstNode;
    abstract appendChildOfSameHeight(node: AstNode): void;
    abstract unappendChild(): AstNode | undefined;
    abstract prependChildOfSameHeight(node: AstNode): void;
    abstract unprependChild(): AstNode | undefined;
}
declare class ArrayListAstNode extends ListAstNode {
    private readonly _children;
    get childrenLength(): number;
    getChild(idx: number): AstNode | null;
    protected setChild(idx: number, child: AstNode): void;
    get children(): readonly AstNode[];
    constructor(length: Length, listHeight: number, _children: AstNode[], missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>);
    deepClone(): ListAstNode;
    appendChildOfSameHeight(node: AstNode): void;
    unappendChild(): AstNode | undefined;
    prependChildOfSameHeight(node: AstNode): void;
    unprependChild(): AstNode | undefined;
    toMutable(): ListAstNode;
}
declare class ImmutableArrayListAstNode extends ArrayListAstNode {
    toMutable(): ListAstNode;
    protected throwIfImmutable(): void;
}
declare abstract class ImmutableLeafAstNode extends BaseAstNode {
    get listHeight(): number;
    get childrenLength(): number;
    getChild(idx: number): AstNode | null;
    get children(): readonly AstNode[];
    flattenLists(): this & AstNode;
    deepClone(): this & AstNode;
}
export declare class TextAstNode extends ImmutableLeafAstNode {
    get kind(): AstNodeKind.Text;
    get missingOpeningBracketIds(): SmallImmutableSet<OpeningBracketId>;
    canBeReused(_openedBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export declare class BracketAstNode extends ImmutableLeafAstNode {
    readonly bracketInfo: BracketKind;
    readonly bracketIds: SmallImmutableSet<OpeningBracketId>;
    static create(length: Length, bracketInfo: BracketKind, bracketIds: SmallImmutableSet<OpeningBracketId>): BracketAstNode;
    get kind(): AstNodeKind.Bracket;
    get missingOpeningBracketIds(): SmallImmutableSet<OpeningBracketId>;
    private constructor();
    get text(): string;
    get languageId(): string;
    canBeReused(_openedBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export declare class InvalidBracketAstNode extends ImmutableLeafAstNode {
    get kind(): AstNodeKind.UnexpectedClosingBracket;
    readonly missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>;
    constructor(closingBrackets: SmallImmutableSet<OpeningBracketId>, length: Length);
    canBeReused(openedBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export {};
