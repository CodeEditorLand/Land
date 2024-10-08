/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as DOM from '../../../../../base/browser/dom.js';
import { onUnexpectedError } from '../../../../../base/common/errors.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
/**
 * A content part is a non-floating element that is rendered inside a cell.
 * The rendering of the content part is synchronous to avoid flickering.
 */
export class CellContentPart extends Disposable {
    constructor() {
        super();
        this.cellDisposables = this._register(new DisposableStore());
    }
    /**
     * Prepare model for cell part rendering
     * No DOM operations recommended within this operation
     */
    prepareRenderCell(element) { }
    /**
     * Update the DOM for the cell `element`
     */
    renderCell(element) {
        this.currentCell = element;
        safeInvokeNoArg(() => this.didRenderCell(element));
    }
    didRenderCell(element) { }
    /**
     * Dispose any disposables generated from `didRenderCell`
     */
    unrenderCell(element) {
        this.currentCell = undefined;
        this.cellDisposables.clear();
    }
    /**
     * Perform DOM read operations to prepare for the list/cell layout update.
     */
    prepareLayout() { }
    /**
     * Update internal DOM (top positions) per cell layout info change
     * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
     * the list view will ensure that layout call is invoked in the right frame
     */
    updateInternalLayoutNow(element) { }
    /**
     * Update per cell state change
     */
    updateState(element, e) { }
    /**
     * Update per execution state change.
     */
    updateForExecutionState(element, e) { }
}
/**
 * An overlay part renders on top of other components.
 * The rendering of the overlay part might be postponed to the next animation frame to avoid forced reflow.
 */
export class CellOverlayPart extends Disposable {
    constructor() {
        super();
        this.cellDisposables = this._register(new DisposableStore());
    }
    /**
     * Prepare model for cell part rendering
     * No DOM operations recommended within this operation
     */
    prepareRenderCell(element) { }
    /**
     * Update the DOM for the cell `element`
     */
    renderCell(element) {
        this.currentCell = element;
        this.didRenderCell(element);
    }
    didRenderCell(element) { }
    /**
     * Dispose any disposables generated from `didRenderCell`
     */
    unrenderCell(element) {
        this.currentCell = undefined;
        this.cellDisposables.clear();
    }
    /**
     * Update internal DOM (top positions) per cell layout info change
     * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
     * the list view will ensure that layout call is invoked in the right frame
     */
    updateInternalLayoutNow(element) { }
    /**
     * Update per cell state change
     */
    updateState(element, e) { }
    /**
     * Update per execution state change.
     */
    updateForExecutionState(element, e) { }
}
function safeInvokeNoArg(func) {
    try {
        return func();
    }
    catch (e) {
        onUnexpectedError(e);
        return null;
    }
}
export class CellPartsCollection extends Disposable {
    constructor(targetWindow, contentParts, overlayParts) {
        super();
        this.targetWindow = targetWindow;
        this.contentParts = contentParts;
        this.overlayParts = overlayParts;
        this._scheduledOverlayRendering = this._register(new MutableDisposable());
        this._scheduledOverlayUpdateState = this._register(new MutableDisposable());
        this._scheduledOverlayUpdateExecutionState = this._register(new MutableDisposable());
    }
    concatContentPart(other, targetWindow) {
        return new CellPartsCollection(targetWindow, this.contentParts.concat(other), this.overlayParts);
    }
    concatOverlayPart(other, targetWindow) {
        return new CellPartsCollection(targetWindow, this.contentParts, this.overlayParts.concat(other));
    }
    scheduleRenderCell(element) {
        // prepare model
        for (const part of this.contentParts) {
            safeInvokeNoArg(() => part.prepareRenderCell(element));
        }
        for (const part of this.overlayParts) {
            safeInvokeNoArg(() => part.prepareRenderCell(element));
        }
        // render content parts
        for (const part of this.contentParts) {
            safeInvokeNoArg(() => part.renderCell(element));
        }
        this._scheduledOverlayRendering.value = DOM.modify(this.targetWindow, () => {
            for (const part of this.overlayParts) {
                safeInvokeNoArg(() => part.renderCell(element));
            }
        });
    }
    unrenderCell(element) {
        for (const part of this.contentParts) {
            safeInvokeNoArg(() => part.unrenderCell(element));
        }
        this._scheduledOverlayRendering.value = undefined;
        this._scheduledOverlayUpdateState.value = undefined;
        this._scheduledOverlayUpdateExecutionState.value = undefined;
        for (const part of this.overlayParts) {
            safeInvokeNoArg(() => part.unrenderCell(element));
        }
    }
    updateInternalLayoutNow(viewCell) {
        for (const part of this.contentParts) {
            safeInvokeNoArg(() => part.updateInternalLayoutNow(viewCell));
        }
        for (const part of this.overlayParts) {
            safeInvokeNoArg(() => part.updateInternalLayoutNow(viewCell));
        }
    }
    prepareLayout() {
        for (const part of this.contentParts) {
            safeInvokeNoArg(() => part.prepareLayout());
        }
    }
    updateState(viewCell, e) {
        for (const part of this.contentParts) {
            safeInvokeNoArg(() => part.updateState(viewCell, e));
        }
        this._scheduledOverlayUpdateState.value = DOM.modify(this.targetWindow, () => {
            for (const part of this.overlayParts) {
                safeInvokeNoArg(() => part.updateState(viewCell, e));
            }
        });
    }
    updateForExecutionState(viewCell, e) {
        for (const part of this.contentParts) {
            safeInvokeNoArg(() => part.updateForExecutionState(viewCell, e));
        }
        this._scheduledOverlayUpdateExecutionState.value = DOM.modify(this.targetWindow, () => {
            for (const part of this.overlayParts) {
                safeInvokeNoArg(() => part.updateForExecutionState(viewCell, e));
            }
        });
    }
}
