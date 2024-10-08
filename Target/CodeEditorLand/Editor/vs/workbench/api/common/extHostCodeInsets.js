/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { asWebviewUri, webviewGenericCspSource } from '../../contrib/webview/common/webview.js';
export class ExtHostEditorInsets {
    constructor(_proxy, _editors, _remoteInfo) {
        this._proxy = _proxy;
        this._editors = _editors;
        this._remoteInfo = _remoteInfo;
        this._handlePool = 0;
        this._disposables = new DisposableStore();
        this._insets = new Map();
        // dispose editor inset whenever the hosting editor goes away
        this._disposables.add(_editors.onDidChangeVisibleTextEditors(() => {
            const visibleEditor = _editors.getVisibleTextEditors();
            for (const value of this._insets.values()) {
                if (visibleEditor.indexOf(value.editor) < 0) {
                    value.inset.dispose(); // will remove from `this._insets`
                }
            }
        }));
    }
    dispose() {
        this._insets.forEach(value => value.inset.dispose());
        this._disposables.dispose();
    }
    createWebviewEditorInset(editor, line, height, options, extension) {
        let apiEditor;
        for (const candidate of this._editors.getVisibleTextEditors(true)) {
            if (candidate.value === editor) {
                apiEditor = candidate;
                break;
            }
        }
        if (!apiEditor) {
            throw new Error('not a visible editor');
        }
        const that = this;
        const handle = this._handlePool++;
        const onDidReceiveMessage = new Emitter();
        const onDidDispose = new Emitter();
        const webview = new class {
            constructor() {
                this._html = '';
                this._options = Object.create(null);
            }
            asWebviewUri(resource) {
                return asWebviewUri(resource, that._remoteInfo);
            }
            get cspSource() {
                return webviewGenericCspSource;
            }
            set options(value) {
                this._options = value;
                that._proxy.$setOptions(handle, value);
            }
            get options() {
                return this._options;
            }
            set html(value) {
                this._html = value;
                that._proxy.$setHtml(handle, value);
            }
            get html() {
                return this._html;
            }
            get onDidReceiveMessage() {
                return onDidReceiveMessage.event;
            }
            postMessage(message) {
                return that._proxy.$postMessage(handle, message);
            }
        };
        const inset = new class {
            constructor() {
                this.editor = editor;
                this.line = line;
                this.height = height;
                this.webview = webview;
                this.onDidDispose = onDidDispose.event;
            }
            dispose() {
                if (that._insets.has(handle)) {
                    that._insets.delete(handle);
                    that._proxy.$disposeEditorInset(handle);
                    onDidDispose.fire();
                    // final cleanup
                    onDidDispose.dispose();
                    onDidReceiveMessage.dispose();
                }
            }
        };
        this._proxy.$createEditorInset(handle, apiEditor.id, apiEditor.value.document.uri, line + 1, height, options || {}, extension.identifier, extension.extensionLocation);
        this._insets.set(handle, { editor, inset, onDidReceiveMessage });
        return inset;
    }
    $onDidDispose(handle) {
        const value = this._insets.get(handle);
        if (value) {
            value.inset.dispose();
        }
    }
    $onDidReceiveMessage(handle, message) {
        const value = this._insets.get(handle);
        value?.onDidReceiveMessage.fire(message);
    }
}
