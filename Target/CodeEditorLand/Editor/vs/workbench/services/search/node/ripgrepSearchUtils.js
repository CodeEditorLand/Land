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
import { ILogService } from '../../../../platform/log/common/log.js';
import { SearchRange } from '../common/search.js';
import * as searchExtTypes from '../common/searchExtTypes.js';
export function anchorGlob(glob) {
    return glob.startsWith('**') || glob.startsWith('/') ? glob : `/${glob}`;
}
export function rangeToSearchRange(range) {
    return new SearchRange(range.start.line, range.start.character, range.end.line, range.end.character);
}
export function searchRangeToRange(range) {
    return new searchExtTypes.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
}
let OutputChannel = class OutputChannel {
    constructor(prefix, logService) {
        this.prefix = prefix;
        this.logService = logService;
    }
    appendLine(msg) {
        this.logService.debug(`${this.prefix}#search`, msg);
    }
};
OutputChannel = __decorate([
    __param(1, ILogService),
    __metadata("design:paramtypes", [String, Object])
], OutputChannel);
export { OutputChannel };
