import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { deepClone } from '../../../../base/common/objects.js';
import { observableSignal } from '../../../../base/common/observable.js';
import { WellDefinedPrefixTree } from '../../../../base/common/prefixTree.js';
import { URI } from '../../../../base/common/uri.js';
import { ICoverageCount } from './testTypes.js';
let incId = 0;
export class TestCoverage {
    constructor(result, fromTaskId, uriIdentityService, accessor) {
        this.result = result;
        this.fromTaskId = fromTaskId;
        this.uriIdentityService = uriIdentityService;
        this.accessor = accessor;
        this.fileCoverage = new ResourceMap();
        this.didAddCoverage = observableSignal(this);
        this.tree = new WellDefinedPrefixTree();
        this.associatedData = new Map();
    }
    *allPerTestIDs() {
        const seen = new Set();
        for (const root of this.tree.nodes) {
            if (root.value && root.value.perTestData) {
                for (const id of root.value.perTestData) {
                    if (!seen.has(id)) {
                        seen.add(id);
                        yield id;
                    }
                }
            }
        }
    }
    append(coverage, tx) {
        const previous = this.getComputedForUri(coverage.uri);
        const result = this.result;
        const applyDelta = (kind, node) => {
            if (!node[kind]) {
                if (coverage[kind]) {
                    node[kind] = { ...coverage[kind] };
                }
            }
            else {
                node[kind].covered += (coverage[kind]?.covered || 0) - (previous?.[kind]?.covered || 0);
                node[kind].total += (coverage[kind]?.total || 0) - (previous?.[kind]?.total || 0);
            }
        };
        const canonical = [...this.treePathForUri(coverage.uri, true)];
        const chain = [];
        this.tree.mutatePath(this.treePathForUri(coverage.uri, false), node => {
            chain.push(node);
            if (chain.length === canonical.length) {
                if (node.value) {
                    const v = node.value;
                    v.id = coverage.id;
                    v.statement = coverage.statement;
                    v.branch = coverage.branch;
                    v.declaration = coverage.declaration;
                }
                else {
                    const v = node.value = new FileCoverage(coverage, result, this.accessor);
                    this.fileCoverage.set(coverage.uri, v);
                }
            }
            else {
                if (!node.value) {
                    const intermediate = deepClone(coverage);
                    intermediate.id = String(incId++);
                    intermediate.uri = this.treePathToUri(canonical.slice(0, chain.length));
                    node.value = new ComputedFileCoverage(intermediate, result);
                }
                else {
                    applyDelta('statement', node.value);
                    applyDelta('branch', node.value);
                    applyDelta('declaration', node.value);
                    node.value.didChange.trigger(tx);
                }
            }
            if (coverage.testIds) {
                node.value.perTestData ??= new Set();
                for (const id of coverage.testIds) {
                    node.value.perTestData.add(id);
                }
            }
        });
        if (chain) {
            this.didAddCoverage.trigger(tx, chain);
        }
    }
    filterTreeForTest(testId) {
        const tree = new WellDefinedPrefixTree();
        for (const node of this.tree.values()) {
            if (node instanceof FileCoverage) {
                if (!node.perTestData?.has(testId.toString())) {
                    continue;
                }
                const canonical = [...this.treePathForUri(node.uri, true)];
                const chain = [];
                tree.mutatePath(this.treePathForUri(node.uri, false), n => {
                    chain.push(n);
                    n.value ??= new BypassedFileCoverage(this.treePathToUri(canonical.slice(0, chain.length)), node.fromResult);
                });
            }
        }
        return tree;
    }
    getAllFiles() {
        return this.fileCoverage;
    }
    getUri(uri) {
        return this.fileCoverage.get(uri);
    }
    getComputedForUri(uri) {
        return this.tree.find(this.treePathForUri(uri, false));
    }
    *treePathForUri(uri, canconicalPath) {
        yield uri.scheme;
        yield uri.authority;
        const path = !canconicalPath && this.uriIdentityService.extUri.ignorePathCasing(uri) ? uri.path.toLowerCase() : uri.path;
        yield* path.split('/');
    }
    treePathToUri(path) {
        return URI.from({ scheme: path[0], authority: path[1], path: path.slice(2).join('/') });
    }
}
export const getTotalCoveragePercent = (statement, branch, function_) => {
    let numerator = statement.covered;
    let denominator = statement.total;
    if (branch) {
        numerator += branch.covered;
        denominator += branch.total;
    }
    if (function_) {
        numerator += function_.covered;
        denominator += function_.total;
    }
    return denominator === 0 ? 1 : numerator / denominator;
};
export class AbstractFileCoverage {
    get tpc() {
        return getTotalCoveragePercent(this.statement, this.branch, this.declaration);
    }
    constructor(coverage, fromResult) {
        this.fromResult = fromResult;
        this.didChange = observableSignal(this);
        this.id = coverage.id;
        this.uri = coverage.uri;
        this.statement = coverage.statement;
        this.branch = coverage.branch;
        this.declaration = coverage.declaration;
    }
}
export class ComputedFileCoverage extends AbstractFileCoverage {
}
export class BypassedFileCoverage extends ComputedFileCoverage {
    constructor(uri, result) {
        super({ id: String(incId++), uri, statement: { covered: 0, total: 0 } }, result);
    }
}
export class FileCoverage extends AbstractFileCoverage {
    get hasSynchronousDetails() {
        return this._details instanceof Array || this.resolved;
    }
    constructor(coverage, fromResult, accessor) {
        super(coverage, fromResult);
        this.accessor = accessor;
    }
    async detailsForTest(_testId, token = CancellationToken.None) {
        this._detailsForTest ??= new Map();
        const testId = _testId.toString();
        const prev = this._detailsForTest.get(testId);
        if (prev) {
            return prev;
        }
        const promise = (async () => {
            try {
                return await this.accessor.getCoverageDetails(this.id, testId, token);
            }
            catch (e) {
                this._detailsForTest?.delete(testId);
                throw e;
            }
        })();
        this._detailsForTest.set(testId, promise);
        return promise;
    }
    async details(token = CancellationToken.None) {
        this._details ??= this.accessor.getCoverageDetails(this.id, undefined, token);
        try {
            const d = await this._details;
            this.resolved = true;
            return d;
        }
        catch (e) {
            this._details = undefined;
            throw e;
        }
    }
}
export const totalFromCoverageDetails = (uri, details) => {
    const fc = {
        id: '',
        uri,
        statement: ICoverageCount.empty(),
    };
    for (const detail of details) {
        if (detail.type === 1) {
            fc.statement.total++;
            fc.statement.total += detail.count ? 1 : 0;
            for (const branch of detail.branches || []) {
                fc.branch ??= ICoverageCount.empty();
                fc.branch.total++;
                fc.branch.covered += branch.count ? 1 : 0;
            }
        }
        else {
            fc.declaration ??= ICoverageCount.empty();
            fc.declaration.total++;
            fc.declaration.covered += detail.count ? 1 : 0;
        }
    }
    return fc;
};
