/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const INotebookService = createDecorator('notebookService');
export class SimpleNotebookProviderInfo {
    constructor(viewType, serializer, extensionData) {
        this.viewType = viewType;
        this.serializer = serializer;
        this.extensionData = extensionData;
    }
}
