/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as pfs from '../../../../base/node/pfs.js';
import { resultIsMatch } from '../common/search.js';
import { RipgrepTextSearchEngine } from './ripgrepTextSearchEngine.js';
import { NativeTextSearchManager } from './textSearchManager.js';
export class TextSearchEngineAdapter {
    constructor(query, numThreads) {
        this.query = query;
        this.numThreads = numThreads;
    }
    search(token, onResult, onMessage) {
        if ((!this.query.folderQueries || !this.query.folderQueries.length) && (!this.query.extraFileResources || !this.query.extraFileResources.length)) {
            return Promise.resolve({
                type: 'success',
                limitHit: false,
                stats: {
                    type: 'searchProcess'
                },
                messages: []
            });
        }
        const pretendOutputChannel = {
            appendLine(msg) {
                onMessage({ message: msg });
            }
        };
        const textSearchManager = new NativeTextSearchManager(this.query, new RipgrepTextSearchEngine(pretendOutputChannel, this.numThreads), pfs);
        return new Promise((resolve, reject) => {
            return textSearchManager
                .search(matches => {
                onResult(matches.map(fileMatchToSerialized));
            }, token)
                .then(c => resolve({ limitHit: c.limitHit ?? false, type: 'success', stats: c.stats, messages: [] }), reject);
        });
    }
}
function fileMatchToSerialized(match) {
    return {
        path: match.resource && match.resource.fsPath,
        results: match.results,
        numMatches: (match.results || []).reduce((sum, r) => {
            if (resultIsMatch(r)) {
                const m = r;
                return sum + m.rangeLocations.length;
            }
            else {
                return sum + 1;
            }
        }, 0)
    };
}
