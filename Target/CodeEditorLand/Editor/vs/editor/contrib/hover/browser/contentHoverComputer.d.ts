import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { HoverStartSource, IHoverComputer } from './hoverOperation.js';
import { HoverAnchor, IEditorHoverParticipant, IHoverPart } from './hoverTypes.js';
import { AsyncIterableObject } from '../../../../base/common/async.js';
export interface ContentHoverComputerOptions {
    shouldFocus: boolean;
    anchor: HoverAnchor;
    source: HoverStartSource;
    insistOnKeepingHoverVisible: boolean;
}
export declare class ContentHoverComputer implements IHoverComputer<ContentHoverComputerOptions, IHoverPart> {
    private readonly _editor;
    private readonly _participants;
    constructor(_editor: ICodeEditor, _participants: readonly IEditorHoverParticipant[]);
    private static _getLineDecorations;
    computeAsync(options: ContentHoverComputerOptions, token: CancellationToken): AsyncIterableObject<IHoverPart>;
    computeSync(options: ContentHoverComputerOptions): IHoverPart[];
}
