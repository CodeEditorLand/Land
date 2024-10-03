import { FastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ViewConfigurationChangedEvent, ViewCursorStateChangedEvent } from '../../../../common/viewEvents.js';
import { ViewContext } from '../../../../common/viewModel/viewContext.js';
import { RestrictedRenderingContext, RenderingContext } from '../../../view/renderingContext.js';
export declare class ScreenReaderSupport {
    private readonly _domNode;
    private readonly _context;
    private readonly _keybindingService;
    private _contentLeft;
    private _contentWidth;
    private _lineHeight;
    private _fontInfo;
    private _accessibilitySupport;
    private _accessibilityPageSize;
    private _primarySelection;
    private _screenReaderContentState;
    constructor(_domNode: FastDomNode<HTMLElement>, _context: ViewContext, _keybindingService: IKeybindingService);
    onConfigurationChanged(e: ViewConfigurationChangedEvent): void;
    private _updateConfigurationSettings;
    private _updateDomAttributes;
    onCursorStateChanged(e: ViewCursorStateChangedEvent): void;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    setAriaOptions(): void;
    writeScreenReaderContent(): void;
    private _getScreenReaderContentState;
    private _setSelectionOfScreenReaderContent;
}
