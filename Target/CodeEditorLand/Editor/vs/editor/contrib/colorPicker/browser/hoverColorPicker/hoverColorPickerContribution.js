import { Disposable } from '../../../../../base/common/lifecycle.js';
import { Range } from '../../../../common/core/range.js';
import { ColorDecorationInjectedTextMarker } from '../colorDetector.js';
import { ContentHoverController } from '../../../hover/browser/contentHoverController.js';
export class HoverColorPickerContribution extends Disposable {
    static { this.ID = 'editor.contrib.colorContribution'; }
    static { this.RECOMPUTE_TIME = 1000; }
    constructor(_editor) {
        super();
        this._editor = _editor;
        this._register(_editor.onMouseDown((e) => this.onMouseDown(e)));
    }
    dispose() {
        super.dispose();
    }
    onMouseDown(mouseEvent) {
        const colorDecoratorsActivatedOn = this._editor.getOption(151);
        if (colorDecoratorsActivatedOn !== 'click' && colorDecoratorsActivatedOn !== 'clickAndHover') {
            return;
        }
        const target = mouseEvent.target;
        if (target.type !== 6) {
            return;
        }
        if (!target.detail.injectedText) {
            return;
        }
        if (target.detail.injectedText.options.attachedData !== ColorDecorationInjectedTextMarker) {
            return;
        }
        if (!target.range) {
            return;
        }
        const hoverController = this._editor.getContribution(ContentHoverController.ID);
        if (!hoverController) {
            return;
        }
        if (!hoverController.isColorPickerVisible) {
            const range = new Range(target.range.startLineNumber, target.range.startColumn + 1, target.range.endLineNumber, target.range.endColumn + 1);
            hoverController.showContentHover(range, 1, 0, false, true);
        }
    }
}
