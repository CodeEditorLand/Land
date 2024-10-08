import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { CodeEditorWidget } from '../../../codeEditor/codeEditorWidget.js';
import { DiffEditorWidget } from '../../diffEditorWidget.js';
import { DetailedLineRangeMapping } from '../../../../../common/diff/rangeMapping.js';
import { ITextModel } from '../../../../../common/model.js';
import { IClipboardService } from '../../../../../../platform/clipboard/common/clipboardService.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
export declare class InlineDiffDeletedCodeMargin extends Disposable {
    private readonly _getViewZoneId;
    private readonly _marginDomNode;
    private readonly _modifiedEditor;
    private readonly _diff;
    private readonly _editor;
    private readonly _viewLineCounts;
    private readonly _originalTextModel;
    private readonly _contextMenuService;
    private readonly _clipboardService;
    private readonly _diffActions;
    private _visibility;
    get visibility(): boolean;
    set visibility(_visibility: boolean);
    constructor(_getViewZoneId: () => string, _marginDomNode: HTMLElement, _modifiedEditor: CodeEditorWidget, _diff: DetailedLineRangeMapping, _editor: DiffEditorWidget, _viewLineCounts: number[], _originalTextModel: ITextModel, _contextMenuService: IContextMenuService, _clipboardService: IClipboardService);
    private _updateLightBulbPosition;
}
