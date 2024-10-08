/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
export class WebviewInput extends EditorInput {
    static { this.typeId = 'workbench.editors.webviewInput'; }
    get typeId() {
        return WebviewInput.typeId;
    }
    get editorId() {
        return this.viewType;
    }
    get capabilities() {
        return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */ | 128 /* EditorInputCapabilities.CanDropIntoEditor */;
    }
    get resource() {
        return URI.from({
            scheme: Schemas.webviewPanel,
            path: `webview-panel/webview-${this._resourceId}`
        });
    }
    constructor(init, webview, _iconManager) {
        super();
        this._iconManager = _iconManager;
        this._resourceId = generateUuid();
        this._hasTransfered = false;
        this.viewType = init.viewType;
        this.providedId = init.providedId;
        this._name = init.name;
        this._webview = webview;
    }
    dispose() {
        if (!this.isDisposed()) {
            if (!this._hasTransfered) {
                this._webview?.dispose();
            }
        }
        super.dispose();
    }
    getName() {
        return this._name;
    }
    getTitle(_verbosity) {
        return this.getName();
    }
    getDescription() {
        return undefined;
    }
    setName(value) {
        this._name = value;
        this.webview.setTitle(value);
        this._onDidChangeLabel.fire();
    }
    get webview() {
        return this._webview;
    }
    get extension() {
        return this.webview.extension;
    }
    get iconPath() {
        return this._iconPath;
    }
    set iconPath(value) {
        this._iconPath = value;
        this._iconManager.setIcons(this._resourceId, value);
    }
    matches(other) {
        return super.matches(other) || other === this;
    }
    get group() {
        return this._group;
    }
    updateGroup(group) {
        this._group = group;
    }
    transfer(other) {
        if (this._hasTransfered) {
            return undefined;
        }
        this._hasTransfered = true;
        other._webview = this._webview;
        return other;
    }
    claim(claimant, targetWindow, scopedContextKeyService) {
        return this._webview.claim(claimant, targetWindow, scopedContextKeyService);
    }
}
