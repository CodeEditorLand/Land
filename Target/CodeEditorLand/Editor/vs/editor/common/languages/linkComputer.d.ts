import { ILink } from '../languages.js';
export interface ILinkComputerTarget {
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
}
export declare const enum State {
    Invalid = 0,
    Start = 1,
    H = 2,
    HT = 3,
    HTT = 4,
    HTTP = 5,
    F = 6,
    FI = 7,
    FIL = 8,
    BeforeColon = 9,
    AfterColon = 10,
    AlmostThere = 11,
    End = 12,
    Accept = 13,
    LastKnownState = 14
}
export type Edge = [State, number, State];
export declare class StateMachine {
    private readonly _states;
    private readonly _maxCharCode;
    constructor(edges: Edge[]);
    nextState(currentState: State, chCode: number): State;
}
export declare class LinkComputer {
    private static _createLink;
    static computeLinks(model: ILinkComputerTarget, stateMachine?: StateMachine): ILink[];
}
export declare function computeLinks(model: ILinkComputerTarget | null): ILink[];
