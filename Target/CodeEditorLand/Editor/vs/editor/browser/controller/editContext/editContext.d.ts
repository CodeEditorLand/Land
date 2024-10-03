import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import { Position } from '../../../common/core/position.js';
import { IEditorAriaOptions } from '../../editorBrowser.js';
import { ViewPart } from '../../view/viewPart.js';
export declare abstract class AbstractEditContext extends ViewPart {
    abstract domNode: FastDomNode<HTMLElement>;
    abstract focus(): void;
    abstract isFocused(): boolean;
    abstract refreshFocusState(): void;
    abstract setAriaOptions(options: IEditorAriaOptions): void;
    abstract getLastRenderData(): Position | null;
    abstract writeScreenReaderContent(reason: string): void;
}
