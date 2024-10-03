import { Event } from '../../../base/common/event.js';
import { LexingError } from './scanner.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
export declare function setConstant(key: string, value: boolean): void;
export declare const enum ContextKeyExprType {
    False = 0,
    True = 1,
    Defined = 2,
    Not = 3,
    Equals = 4,
    NotEquals = 5,
    And = 6,
    Regex = 7,
    NotRegex = 8,
    Or = 9,
    In = 10,
    NotIn = 11,
    Greater = 12,
    GreaterEquals = 13,
    Smaller = 14,
    SmallerEquals = 15
}
export interface IContextKeyExprMapper {
    mapDefined(key: string): ContextKeyExpression;
    mapNot(key: string): ContextKeyExpression;
    mapEquals(key: string, value: any): ContextKeyExpression;
    mapNotEquals(key: string, value: any): ContextKeyExpression;
    mapGreater(key: string, value: any): ContextKeyExpression;
    mapGreaterEquals(key: string, value: any): ContextKeyExpression;
    mapSmaller(key: string, value: any): ContextKeyExpression;
    mapSmallerEquals(key: string, value: any): ContextKeyExpression;
    mapRegex(key: string, regexp: RegExp | null): ContextKeyRegexExpr;
    mapIn(key: string, valueKey: string): ContextKeyInExpr;
    mapNotIn(key: string, valueKey: string): ContextKeyNotInExpr;
}
export interface IContextKeyExpression {
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export type ContextKeyExpression = (ContextKeyFalseExpr | ContextKeyTrueExpr | ContextKeyDefinedExpr | ContextKeyNotExpr | ContextKeyEqualsExpr | ContextKeyNotEqualsExpr | ContextKeyRegexExpr | ContextKeyNotRegexExpr | ContextKeyAndExpr | ContextKeyOrExpr | ContextKeyInExpr | ContextKeyNotInExpr | ContextKeyGreaterExpr | ContextKeyGreaterEqualsExpr | ContextKeySmallerExpr | ContextKeySmallerEqualsExpr);
export type ParserConfig = {
    regexParsingWithErrorRecovery: boolean;
};
export type ParsingError = {
    message: string;
    offset: number;
    lexeme: string;
    additionalInfo?: string;
};
export declare class Parser {
    private readonly _config;
    private static _parseError;
    private readonly _scanner;
    private _tokens;
    private _current;
    private _parsingErrors;
    get lexingErrors(): Readonly<LexingError[]>;
    get parsingErrors(): Readonly<ParsingError[]>;
    constructor(_config?: ParserConfig);
    parse(input: string): ContextKeyExpression | undefined;
    private _expr;
    private _or;
    private _and;
    private _term;
    private _primary;
    private _value;
    private _flagsGYRe;
    private _removeFlagsGY;
    private _previous;
    private _matchOne;
    private _advance;
    private _consume;
    private _errExpectedButGot;
    private _check;
    private _peek;
    private _isAtEnd;
}
export declare abstract class ContextKeyExpr {
    static false(): ContextKeyExpression;
    static true(): ContextKeyExpression;
    static has(key: string): ContextKeyExpression;
    static equals(key: string, value: any): ContextKeyExpression;
    static notEquals(key: string, value: any): ContextKeyExpression;
    static regex(key: string, value: RegExp): ContextKeyExpression;
    static in(key: string, value: string): ContextKeyExpression;
    static notIn(key: string, value: string): ContextKeyExpression;
    static not(key: string): ContextKeyExpression;
    static and(...expr: Array<ContextKeyExpression | undefined | null>): ContextKeyExpression | undefined;
    static or(...expr: Array<ContextKeyExpression | undefined | null>): ContextKeyExpression | undefined;
    static greater(key: string, value: number): ContextKeyExpression;
    static greaterEquals(key: string, value: number): ContextKeyExpression;
    static smaller(key: string, value: number): ContextKeyExpression;
    static smallerEquals(key: string, value: number): ContextKeyExpression;
    private static _parser;
    static deserialize(serialized: string | null | undefined): ContextKeyExpression | undefined;
}
export declare function validateWhenClauses(whenClauses: string[]): any;
export declare function expressionsAreEqualWithConstantSubstitution(a: ContextKeyExpression | null | undefined, b: ContextKeyExpression | null | undefined): boolean;
export declare class ContextKeyFalseExpr implements IContextKeyExpression {
    static INSTANCE: ContextKeyFalseExpr;
    readonly type = ContextKeyExprType.False;
    protected constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyTrueExpr implements IContextKeyExpression {
    static INSTANCE: ContextKeyTrueExpr;
    readonly type = ContextKeyExprType.True;
    protected constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyDefinedExpr implements IContextKeyExpression {
    readonly key: string;
    private negated;
    static create(key: string, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.Defined;
    protected constructor(key: string, negated: ContextKeyExpression | null);
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyEqualsExpr implements IContextKeyExpression {
    private readonly key;
    private readonly value;
    private negated;
    static create(key: string, value: any, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.Equals;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyInExpr implements IContextKeyExpression {
    private readonly key;
    private readonly valueKey;
    static create(key: string, valueKey: string): ContextKeyInExpr;
    readonly type = ContextKeyExprType.In;
    private negated;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyInExpr;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyNotInExpr implements IContextKeyExpression {
    private readonly key;
    private readonly valueKey;
    static create(key: string, valueKey: string): ContextKeyNotInExpr;
    readonly type = ContextKeyExprType.NotIn;
    private readonly _negated;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyNotEqualsExpr implements IContextKeyExpression {
    private readonly key;
    private readonly value;
    private negated;
    static create(key: string, value: any, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.NotEquals;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyNotExpr implements IContextKeyExpression {
    private readonly key;
    private negated;
    static create(key: string, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.Not;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyGreaterExpr implements IContextKeyExpression {
    private readonly key;
    private readonly value;
    private negated;
    static create(key: string, _value: any, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.Greater;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyGreaterEqualsExpr implements IContextKeyExpression {
    private readonly key;
    private readonly value;
    private negated;
    static create(key: string, _value: any, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.GreaterEquals;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeySmallerExpr implements IContextKeyExpression {
    private readonly key;
    private readonly value;
    private negated;
    static create(key: string, _value: any, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.Smaller;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeySmallerEqualsExpr implements IContextKeyExpression {
    private readonly key;
    private readonly value;
    private negated;
    static create(key: string, _value: any, negated?: ContextKeyExpression | null): ContextKeyExpression;
    readonly type = ContextKeyExprType.SmallerEquals;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyRegexExpr implements IContextKeyExpression {
    private readonly key;
    private readonly regexp;
    static create(key: string, regexp: RegExp | null): ContextKeyRegexExpr;
    readonly type = ContextKeyExprType.Regex;
    private negated;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyRegexExpr;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyNotRegexExpr implements IContextKeyExpression {
    private readonly _actual;
    static create(actual: ContextKeyRegexExpr): ContextKeyExpression;
    readonly type = ContextKeyExprType.NotRegex;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyAndExpr implements IContextKeyExpression {
    readonly expr: ContextKeyExpression[];
    private negated;
    static create(_expr: ReadonlyArray<ContextKeyExpression | null | undefined>, negated: ContextKeyExpression | null, extraRedundantCheck: boolean): ContextKeyExpression | undefined;
    readonly type = ContextKeyExprType.And;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    private static _normalizeArr;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export declare class ContextKeyOrExpr implements IContextKeyExpression {
    readonly expr: ContextKeyExpression[];
    private negated;
    static create(_expr: ReadonlyArray<ContextKeyExpression | null | undefined>, negated: ContextKeyExpression | null, extraRedundantCheck: boolean): ContextKeyExpression | undefined;
    readonly type = ContextKeyExprType.Or;
    private constructor();
    cmp(other: ContextKeyExpression): number;
    equals(other: ContextKeyExpression): boolean;
    substituteConstants(): ContextKeyExpression | undefined;
    evaluate(context: IContext): boolean;
    private static _normalizeArr;
    serialize(): string;
    keys(): string[];
    map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
    negate(): ContextKeyExpression;
}
export interface ContextKeyInfo {
    readonly key: string;
    readonly type?: string;
    readonly description?: string;
}
export declare class RawContextKey<T extends ContextKeyValue> extends ContextKeyDefinedExpr {
    private static _info;
    static all(): IterableIterator<ContextKeyInfo>;
    private readonly _defaultValue;
    constructor(key: string, defaultValue: T | undefined, metaOrHide?: string | true | {
        type: string;
        description: string;
    });
    bindTo(target: IContextKeyService): IContextKey<T>;
    getValue(target: IContextKeyService): T | undefined;
    toNegated(): ContextKeyExpression;
    isEqualTo(value: any): ContextKeyExpression;
    notEqualsTo(value: any): ContextKeyExpression;
}
export type ContextKeyValue = null | undefined | boolean | number | string | Array<null | undefined | boolean | number | string> | Record<string, null | undefined | boolean | number | string>;
export interface IContext {
    getValue<T extends ContextKeyValue = ContextKeyValue>(key: string): T | undefined;
}
export interface IContextKey<T extends ContextKeyValue = ContextKeyValue> {
    set(value: T): void;
    reset(): void;
    get(): T | undefined;
}
export interface IContextKeyServiceTarget {
    parentElement: IContextKeyServiceTarget | null;
    setAttribute(attr: string, value: string): void;
    removeAttribute(attr: string): void;
    hasAttribute(attr: string): boolean;
    getAttribute(attr: string): string | null;
}
export declare const IContextKeyService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IContextKeyService>;
export interface IReadableSet<T> {
    has(value: T): boolean;
}
export interface IContextKeyChangeEvent {
    affectsSome(keys: IReadableSet<string>): boolean;
    allKeysContainedIn(keys: IReadableSet<string>): boolean;
}
export type IScopedContextKeyService = IContextKeyService & IDisposable;
export interface IContextKeyService {
    readonly _serviceBrand: undefined;
    onDidChangeContext: Event<IContextKeyChangeEvent>;
    bufferChangeEvents(callback: Function): void;
    createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T>;
    contextMatchesRules(rules: ContextKeyExpression | undefined): boolean;
    getContextKeyValue<T>(key: string): T | undefined;
    createScoped(target: IContextKeyServiceTarget): IScopedContextKeyService;
    createOverlay(overlay: Iterable<[string, any]>): IContextKeyService;
    getContext(target: IContextKeyServiceTarget | null): IContext;
    updateParent(parentContextKeyService: IContextKeyService): void;
}
export declare function implies(p: ContextKeyExpression, q: ContextKeyExpression): boolean;
