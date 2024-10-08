/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const IInteractiveDocumentService = createDecorator('IInteractiveDocumentService');
export class InteractiveDocumentService extends Disposable {
    constructor() {
        super();
        this._onWillAddInteractiveDocument = this._register(new Emitter());
        this.onWillAddInteractiveDocument = this._onWillAddInteractiveDocument.event;
        this._onWillRemoveInteractiveDocument = this._register(new Emitter());
        this.onWillRemoveInteractiveDocument = this._onWillRemoveInteractiveDocument.event;
    }
    willCreateInteractiveDocument(notebookUri, inputUri, languageId) {
        this._onWillAddInteractiveDocument.fire({
            notebookUri,
            inputUri,
            languageId
        });
    }
    willRemoveInteractiveDocument(notebookUri, inputUri) {
        this._onWillRemoveInteractiveDocument.fire({
            notebookUri,
            inputUri
        });
    }
}
