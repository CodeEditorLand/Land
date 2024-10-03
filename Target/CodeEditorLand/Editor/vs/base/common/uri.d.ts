export declare class URI implements UriComponents {
    static isUri(thing: any): thing is URI;
    readonly scheme: string;
    readonly authority: string;
    readonly path: string;
    readonly query: string;
    readonly fragment: string;
    protected constructor(scheme: string, authority?: string, path?: string, query?: string, fragment?: string, _strict?: boolean);
    protected constructor(components: UriComponents);
    get fsPath(): string;
    with(change: {
        scheme?: string;
        authority?: string | null;
        path?: string | null;
        query?: string | null;
        fragment?: string | null;
    }): URI;
    static parse(value: string, _strict?: boolean): URI;
    static file(path: string): URI;
    static from(components: UriComponents, strict?: boolean): URI;
    static joinPath(uri: URI, ...pathFragment: string[]): URI;
    toString(skipEncoding?: boolean): string;
    toJSON(): UriComponents;
    static revive(data: UriComponents | URI): URI;
    static revive(data: UriComponents | URI | undefined): URI | undefined;
    static revive(data: UriComponents | URI | null): URI | null;
    static revive(data: UriComponents | URI | undefined | null): URI | undefined | null;
}
export interface UriComponents {
    scheme: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
}
export declare function isUriComponents(thing: any): thing is UriComponents;
export declare function uriToFsPath(uri: URI, keepDriveLetterCasing: boolean): string;
export type UriDto<T> = {
    [K in keyof T]: T[K] extends URI ? UriComponents : UriDto<T[K]>;
};
