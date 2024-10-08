import { ContentHoverComputerOptions } from './contentHoverComputer.js';
import { HoverAnchor, IHoverPart } from './hoverTypes.js';
export declare class ContentHoverResult {
    readonly hoverParts: IHoverPart[];
    readonly isComplete: boolean;
    readonly options: ContentHoverComputerOptions;
    constructor(hoverParts: IHoverPart[], isComplete: boolean, options: ContentHoverComputerOptions);
    filter(anchor: HoverAnchor): ContentHoverResult;
}
export declare class FilteredContentHoverResult extends ContentHoverResult {
    private readonly original;
    constructor(original: ContentHoverResult, messages: IHoverPart[], isComplete: boolean, options: ContentHoverComputerOptions);
    filter(anchor: HoverAnchor): ContentHoverResult;
}
