export declare namespace EditContext {
    /**
     * Checks if the EditContext is supported in the given window.
     */
    function supported(obj: any & Window): boolean;
    /**
     * Create an edit context. Check that the EditContext is supported using the method {@link EditContext.supported}
     */
    function create(window: Window, options?: EditContextInit): EditContext;
}
