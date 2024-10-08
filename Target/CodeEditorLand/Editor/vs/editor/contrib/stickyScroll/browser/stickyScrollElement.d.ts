import { URI } from '../../../../base/common/uri.js';
export declare class StickyRange {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    constructor(startLineNumber: number, endLineNumber: number);
}
export declare class StickyElement {
    /**
     * Range of line numbers spanned by the current scope
     */
    readonly range: StickyRange | undefined;
    /**
     * Must be sorted by start line number
    */
    readonly children: StickyElement[];
    /**
     * Parent sticky outline element
     */
    readonly parent: StickyElement | undefined;
    constructor(
    /**
     * Range of line numbers spanned by the current scope
     */
    range: StickyRange | undefined, 
    /**
     * Must be sorted by start line number
    */
    children: StickyElement[], 
    /**
     * Parent sticky outline element
     */
    parent: StickyElement | undefined);
}
export declare class StickyModel {
    readonly uri: URI;
    readonly version: number;
    readonly element: StickyElement | undefined;
    readonly outlineProviderId: string | undefined;
    constructor(uri: URI, version: number, element: StickyElement | undefined, outlineProviderId: string | undefined);
}
