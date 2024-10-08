import { IExtUri } from './resources.js';
import { URI } from './uri.js';
export interface IResourceNode<T, C = void> {
    readonly uri: URI;
    readonly relativePath: string;
    readonly name: string;
    readonly element: T | undefined;
    readonly children: Iterable<IResourceNode<T, C>>;
    readonly childrenCount: number;
    readonly parent: IResourceNode<T, C> | undefined;
    readonly context: C;
    get(childName: string): IResourceNode<T, C> | undefined;
}
declare class Node<T, C> implements IResourceNode<T, C> {
    readonly uri: URI;
    readonly relativePath: string;
    readonly context: C;
    element: T | undefined;
    readonly parent: IResourceNode<T, C> | undefined;
    private _children;
    get childrenCount(): number;
    get children(): Iterable<Node<T, C>>;
    get name(): string;
    constructor(uri: URI, relativePath: string, context: C, element?: T | undefined, parent?: IResourceNode<T, C> | undefined);
    get(path: string): Node<T, C> | undefined;
    set(path: string, child: Node<T, C>): void;
    delete(path: string): void;
    clear(): void;
}
export declare class ResourceTree<T extends NonNullable<any>, C> {
    private extUri;
    readonly root: Node<T, C>;
    static getRoot<T, C>(node: IResourceNode<T, C>): IResourceNode<T, C>;
    static collect<T, C>(node: IResourceNode<T, C>): T[];
    static isResourceNode<T, C>(obj: any): obj is IResourceNode<T, C>;
    constructor(context: C, rootURI?: URI, extUri?: IExtUri);
    add(uri: URI, element: T): void;
    delete(uri: URI): T | undefined;
    private _delete;
    clear(): void;
    getNode(uri: URI): IResourceNode<T, C> | undefined;
}
export {};
