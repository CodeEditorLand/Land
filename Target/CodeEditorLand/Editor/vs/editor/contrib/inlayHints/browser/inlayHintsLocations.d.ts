import { IActiveCodeEditor, ICodeEditor } from '../../../browser/editorBrowser.js';
import { Location } from '../../../common/languages.js';
import { ClickLinkMouseEvent } from '../../gotoSymbol/browser/link/clickLinkGesture.js';
import { RenderedInlayHintLabelPart } from './inlayHintsController.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare function showGoToContextMenu(accessor: ServicesAccessor, editor: ICodeEditor, anchor: HTMLElement, part: RenderedInlayHintLabelPart): Promise<void>;
export declare function goToDefinitionWithLocation(accessor: ServicesAccessor, event: ClickLinkMouseEvent, editor: IActiveCodeEditor, location: Location): Promise<void>;
