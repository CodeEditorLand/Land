export declare class IframeUtils {
    /**
     * Returns a chain of embedded windows with the same origin (which can be accessed programmatically).
     * Having a chain of length 1 might mean that the current execution environment is running outside of an iframe or inside an iframe embedded in a window with a different origin.
     */
    private static getSameOriginWindowChain;
    /**
     * Returns the position of `childWindow` relative to `ancestorWindow`
     */
    static getPositionOfChildWindowRelativeToAncestorWindow(childWindow: Window, ancestorWindow: Window | null): {
        top: number;
        left: number;
    };
}
/**
 * Returns a sha-256 composed of `parentOrigin` and `salt` converted to base 32
 */
export declare function parentOriginHash(parentOrigin: string, salt: string): Promise<string>;
