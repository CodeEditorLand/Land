import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor, IViewZoneChangeAccessor } from '../../../../../editor/browser/editorBrowser.js';
export declare abstract class FixedZoneWidget extends Disposable {
    private readonly editor;
    private static counter;
    private readonly overlayWidgetId;
    private readonly viewZoneId;
    protected readonly widgetDomNode: HTMLDivElement;
    private readonly overlayWidget;
    constructor(editor: ICodeEditor, viewZoneAccessor: IViewZoneChangeAccessor, afterLineNumber: number, height: number, viewZoneIdsToCleanUp: string[]);
}
