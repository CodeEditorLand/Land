/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { h } from '../../../../../base/browser/dom.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { Event } from '../../../../../base/common/event.js';
export class FixedZoneWidget extends Disposable {
    static { this.counter = 0; }
    constructor(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp) {
        super();
        this.editor = editor;
        this.overlayWidgetId = `fixedZoneWidget-${FixedZoneWidget.counter++}`;
        this.widgetDomNode = h('div.fixed-zone-widget').root;
        this.overlayWidget = {
            getId: () => this.overlayWidgetId,
            getDomNode: () => this.widgetDomNode,
            getPosition: () => null
        };
        this.viewZoneId = viewZoneAccessor.addZone({
            domNode: document.createElement('div'),
            afterLineNumber: afterLineNumber,
            heightInPx: height,
            ordinal: 50000 + 1,
            onComputedHeight: (height) => {
                this.widgetDomNode.style.height = `${height}px`;
            },
            onDomNodeTop: (top) => {
                this.widgetDomNode.style.top = `${top}px`;
            }
        });
        viewZoneIdsToCleanUp.push(this.viewZoneId);
        this._register(Event.runAndSubscribe(this.editor.onDidLayoutChange, () => {
            this.widgetDomNode.style.left = this.editor.getLayoutInfo().contentLeft + 'px';
        }));
        this.editor.addOverlayWidget(this.overlayWidget);
        this._register({
            dispose: () => {
                this.editor.removeOverlayWidget(this.overlayWidget);
            },
        });
    }
}
