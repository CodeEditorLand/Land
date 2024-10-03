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
import { Emitter } from '../../../../base/common/event.js';
import { splitGlobAware } from '../../../../base/common/glob.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { MutableObservableValue } from './observableValue.js';
import { StoredValue } from './storedValue.js';
import { namespaceTestTag } from './testTypes.js';
export const ITestExplorerFilterState = createDecorator('testingFilterState');
const tagRe = /!?@([^ ,:]+)/g;
const trimExtraWhitespace = (str) => str.replace(/\s\s+/g, ' ').trim();
let TestExplorerFilterState = class TestExplorerFilterState extends Disposable {
    constructor(storageService) {
        super();
        this.storageService = storageService;
        this.focusEmitter = new Emitter();
        this.termFilterState = {};
        this.globList = [];
        this.includeTags = new Set();
        this.excludeTags = new Set();
        this.text = this._register(new MutableObservableValue(''));
        this.fuzzy = this._register(MutableObservableValue.stored(new StoredValue({
            key: 'testHistoryFuzzy',
            scope: 0,
            target: 0,
        }, this.storageService), false));
        this.reveal = this._register(new MutableObservableValue(undefined));
        this.onDidRequestInputFocus = this.focusEmitter.event;
    }
    focusInput() {
        this.focusEmitter.fire();
    }
    setText(text) {
        if (text === this.text.value) {
            return;
        }
        this.termFilterState = {};
        this.globList = [];
        this.includeTags.clear();
        this.excludeTags.clear();
        let globText = '';
        let lastIndex = 0;
        for (const match of text.matchAll(tagRe)) {
            let nextIndex = match.index + match[0].length;
            const tag = match[0];
            if (allTestFilterTerms.includes(tag)) {
                this.termFilterState[tag] = true;
            }
            if (text[nextIndex] === ':') {
                nextIndex++;
                let delimiter = text[nextIndex];
                if (delimiter !== `"` && delimiter !== `'`) {
                    delimiter = ' ';
                }
                else {
                    nextIndex++;
                }
                let tagId = '';
                while (nextIndex < text.length && text[nextIndex] !== delimiter) {
                    if (text[nextIndex] === '\\') {
                        tagId += text[nextIndex + 1];
                        nextIndex += 2;
                    }
                    else {
                        tagId += text[nextIndex];
                        nextIndex++;
                    }
                }
                if (match[0].startsWith('!')) {
                    this.excludeTags.add(namespaceTestTag(match[1], tagId));
                }
                else {
                    this.includeTags.add(namespaceTestTag(match[1], tagId));
                }
                nextIndex++;
            }
            globText += text.slice(lastIndex, match.index);
            lastIndex = nextIndex;
        }
        globText += text.slice(lastIndex).trim();
        if (globText.length) {
            for (const filter of splitGlobAware(globText, ',').map(s => s.trim()).filter(s => !!s.length)) {
                if (filter.startsWith('!')) {
                    this.globList.push({ include: false, text: filter.slice(1).toLowerCase() });
                }
                else {
                    this.globList.push({ include: true, text: filter.toLowerCase() });
                }
            }
        }
        this.text.value = text;
    }
    isFilteringFor(term) {
        return !!this.termFilterState[term];
    }
    toggleFilteringFor(term, shouldFilter) {
        const text = this.text.value.trim();
        if (shouldFilter !== false && !this.termFilterState[term]) {
            this.setText(text ? `${text} ${term}` : term);
        }
        else if (shouldFilter !== true && this.termFilterState[term]) {
            this.setText(trimExtraWhitespace(text.replace(term, '')));
        }
    }
};
TestExplorerFilterState = __decorate([
    __param(0, IStorageService),
    __metadata("design:paramtypes", [Object])
], TestExplorerFilterState);
export { TestExplorerFilterState };
const allTestFilterTerms = [
    "@failed",
    "@executed",
    "@doc",
    "@openedFiles",
    "@hidden",
];
