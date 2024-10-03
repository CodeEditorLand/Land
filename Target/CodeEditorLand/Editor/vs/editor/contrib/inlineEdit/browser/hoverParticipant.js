var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { constObservable } from '../../../../base/common/observable.js';
import { HoverForeignElementAnchor, RenderedHoverParts } from '../../hover/browser/hoverTypes.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { InlineEditController } from './inlineEditController.js';
import { InlineEditHintsContentWidget } from './inlineEditHintsWidget.js';
import * as nls from '../../../../nls.js';
export class InlineEditHover {
    constructor(owner, range, controller) {
        this.owner = owner;
        this.range = range;
        this.controller = controller;
    }
    isValidForHoverAnchor(anchor) {
        return (anchor.type === 1
            && this.range.startColumn <= anchor.range.startColumn
            && this.range.endColumn >= anchor.range.endColumn);
    }
}
let InlineEditHoverParticipant = class InlineEditHoverParticipant {
    constructor(_editor, _instantiationService, _telemetryService) {
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._telemetryService = _telemetryService;
        this.hoverOrdinal = 5;
    }
    suggestHoverAnchor(mouseEvent) {
        const controller = InlineEditController.get(this._editor);
        if (!controller) {
            return null;
        }
        const target = mouseEvent.target;
        if (target.type === 8) {
            const viewZoneData = target.detail;
            if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
                const range = target.range;
                return new HoverForeignElementAnchor(1000, this, range, mouseEvent.event.posx, mouseEvent.event.posy, false);
            }
        }
        if (target.type === 7) {
            if (controller.shouldShowHoverAt(target.range)) {
                return new HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
            }
        }
        if (target.type === 6) {
            const mightBeForeignElement = target.detail.mightBeForeignElement;
            if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
                return new HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
            }
        }
        return null;
    }
    computeSync(anchor, lineDecorations) {
        if (this._editor.getOption(65).showToolbar !== 'onHover') {
            return [];
        }
        const controller = InlineEditController.get(this._editor);
        if (controller && controller.shouldShowHoverAt(anchor.range)) {
            return [new InlineEditHover(this, anchor.range, controller)];
        }
        return [];
    }
    renderHoverParts(context, hoverParts) {
        const disposables = new DisposableStore();
        this._telemetryService.publicLog2('inlineEditHover.shown');
        const w = this._instantiationService.createInstance(InlineEditHintsContentWidget, this._editor, false, constObservable(null));
        disposables.add(w);
        const widgetNode = w.getDomNode();
        const renderedHoverPart = {
            hoverPart: hoverParts[0],
            hoverElement: widgetNode,
            dispose: () => disposables.dispose()
        };
        return new RenderedHoverParts([renderedHoverPart]);
    }
    getAccessibleContent(hoverPart) {
        return nls.localize('hoverAccessibilityInlineEdits', 'There are inline edits here.');
    }
};
InlineEditHoverParticipant = __decorate([
    __param(1, IInstantiationService),
    __param(2, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object])
], InlineEditHoverParticipant);
export { InlineEditHoverParticipant };
