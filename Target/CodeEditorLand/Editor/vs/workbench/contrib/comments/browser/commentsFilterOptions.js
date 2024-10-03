import { matchesFuzzy, matchesFuzzy2 } from '../../../../base/common/filters.js';
import * as strings from '../../../../base/common/strings.js';
export class FilterOptions {
    static { this._filter = matchesFuzzy2; }
    static { this._messageFilter = matchesFuzzy; }
    constructor(filter, showResolved, showUnresolved) {
        this.filter = filter;
        this.showResolved = true;
        this.showUnresolved = true;
        filter = filter.trim();
        this.showResolved = showResolved;
        this.showUnresolved = showUnresolved;
        const negate = filter.startsWith('!');
        this.textFilter = { text: (negate ? strings.ltrim(filter, '!') : filter).trim(), negate };
    }
}
