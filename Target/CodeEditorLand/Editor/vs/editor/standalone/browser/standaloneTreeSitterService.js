import { Event } from '../../../base/common/event.js';
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
