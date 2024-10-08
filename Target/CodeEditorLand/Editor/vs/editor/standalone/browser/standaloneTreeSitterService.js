/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from '../../../base/common/event.js';
/**
 * The monaco build doesn't like the dynamic import of tree sitter in the real service.
 * We use a dummy sertive here to make the build happy.
 */
export class StandaloneTreeSitterParserService {
    constructor() {
        this.onDidUpdateTree = Event.None;
        this.onDidAddLanguage = Event.None;
    }
    async getTree(content, languageId) {
        return undefined;
    }
    getOrInitLanguage(_languageId) {
        return undefined;
    }
    getParseResult(textModel) {
        return undefined;
    }
}
