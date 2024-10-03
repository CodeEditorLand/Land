export declare class IframeUtils {
    private static getSameOriginWindowChain;
    static getPositionOfChildWindowRelativeToAncestorWindow(childWindow: Window, ancestorWindow: Window | null): {
        top: number;
        left: number;
    };
}
export declare function parentOriginHash(parentOrigin: string, salt: string): Promise<string>;
