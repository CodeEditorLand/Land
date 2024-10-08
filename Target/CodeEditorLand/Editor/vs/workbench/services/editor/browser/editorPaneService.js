/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IEditorPaneService } from '../common/editorPaneService.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
export class EditorPaneService {
    constructor() {
        this.onWillInstantiateEditorPane = EditorPaneDescriptor.onWillInstantiateEditorPane;
    }
    didInstantiateEditorPane(typeId) {
        return EditorPaneDescriptor.didInstantiateEditorPane(typeId);
    }
}
registerSingleton(IEditorPaneService, EditorPaneService, 1 /* InstantiationType.Delayed */);
