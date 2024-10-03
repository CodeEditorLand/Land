import { URI } from '../../../../base/common/uri.js';
export declare class StickyRange {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    constructor(startLineNumber: number, endLineNumber: number);
}
export declare class StickyElement {
    readonly range: StickyRange | undefined;
    readonly children: StickyElement[];
    readonly parent: StickyElement | undefined;
    constructor(range: StickyRange | undefined, children: StickyElement[], parent: StickyElement | undefined);
}
export declare class StickyModel {
    readonly uri: URI;
    readonly version: number;
    readonly element: StickyElement | undefined;
    readonly outlineProviderId: string | undefined;
    constructor(uri: URI, version: number, element: StickyElement | undefined, outlineProviderId: string | undefined);
}
