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
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { escapeRegExpCharacters } from '../../../../../base/common/strings.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { matchesScheme } from '../../../../../base/common/network.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { convertLinkRangeToBuffer, getXtermLineContent } from './terminalLinkHelpers.js';
import { TERMINAL_CONFIG_SECTION } from '../../../terminal/common/terminal.js';
let TerminalWordLinkDetector = class TerminalWordLinkDetector extends Disposable {
    static { this.id = 'word'; }
    constructor(xterm, _configurationService, _productService) {
        super();
        this.xterm = xterm;
        this._configurationService = _configurationService;
        this._productService = _productService;
        this.maxLinkLength = 100;
        this._refreshSeparatorCodes();
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.wordSeparators")) {
                this._refreshSeparatorCodes();
            }
        }));
    }
    detect(lines, startLine, endLine) {
        const links = [];
        const text = getXtermLineContent(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
        if (text === '' || text.length > 2000) {
            return [];
        }
        const words = this._parseWords(text);
        for (const word of words) {
            if (word.text === '') {
                continue;
            }
            if (word.text.length > 0 && word.text.charAt(word.text.length - 1) === ':') {
                word.text = word.text.slice(0, -1);
                word.endIndex--;
            }
            const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
                startColumn: word.startIndex + 1,
                startLineNumber: 1,
                endColumn: word.endIndex + 1,
                endLineNumber: 1
            }, startLine);
            if (matchesScheme(word.text, this._productService.urlProtocol)) {
                const uri = URI.parse(word.text);
                if (uri) {
                    links.push({
                        text: word.text,
                        uri,
                        bufferRange,
                        type: "Url"
                    });
                }
                continue;
            }
            links.push({
                text: word.text,
                bufferRange,
                type: "Search",
                contextLine: text
            });
        }
        return links;
    }
    _parseWords(text) {
        const words = [];
        const splitWords = text.split(this._separatorRegex);
        let runningIndex = 0;
        for (let i = 0; i < splitWords.length; i++) {
            words.push({
                text: splitWords[i],
                startIndex: runningIndex,
                endIndex: runningIndex + splitWords[i].length
            });
            runningIndex += splitWords[i].length + 1;
        }
        return words;
    }
    _refreshSeparatorCodes() {
        const separators = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).wordSeparators;
        let powerlineSymbols = '';
        for (let i = 0xe0b0; i <= 0xe0bf; i++) {
            powerlineSymbols += String.fromCharCode(i);
        }
        this._separatorRegex = new RegExp(`[${escapeRegExpCharacters(separators)}${powerlineSymbols}]`, 'g');
    }
};
TerminalWordLinkDetector = __decorate([
    __param(1, IConfigurationService),
    __param(2, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalWordLinkDetector);
export { TerminalWordLinkDetector };
