export interface ILink {
    readonly label: string;
    readonly href: string;
    readonly title?: string;
}
export type LinkedTextNode = string | ILink;
export declare class LinkedText {
    readonly nodes: LinkedTextNode[];
    constructor(nodes: LinkedTextNode[]);
    toString(): string;
}
export declare function parseLinkedText(text: string): LinkedText;
