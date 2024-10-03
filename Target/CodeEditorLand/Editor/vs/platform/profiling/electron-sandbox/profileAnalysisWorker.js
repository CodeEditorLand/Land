import { basename } from '../../../base/common/path.js';
import { TernarySearchTree } from '../../../base/common/ternarySearchTree.js';
import { URI } from '../../../base/common/uri.js';
import { Utils } from '../common/profiling.js';
import { buildModel, BottomUpNode, processNode } from '../common/profilingModel.js';
export function create(workerServer) {
    return new ProfileAnalysisWorker();
}
class ProfileAnalysisWorker {
    $analyseBottomUp(profile) {
        if (!Utils.isValidProfile(profile)) {
            return { kind: 1, samples: [] };
        }
        const model = buildModel(profile);
        const samples = bottomUp(model, 5)
            .filter(s => !s.isSpecial);
        if (samples.length === 0 || samples[0].percentage < 10) {
            return { kind: 1, samples: [] };
        }
        return { kind: 2, samples };
    }
    $analyseByUrlCategory(profile, categories) {
        const searchTree = TernarySearchTree.forUris();
        searchTree.fill(categories);
        const model = buildModel(profile);
        const aggegrateByCategory = new Map();
        for (const node of model.nodes) {
            const loc = model.locations[node.locationId];
            let category;
            try {
                category = searchTree.findSubstr(URI.parse(loc.callFrame.url));
            }
            catch {
            }
            if (!category) {
                category = printCallFrameShort(loc.callFrame);
            }
            const value = aggegrateByCategory.get(category) ?? 0;
            const newValue = value + node.selfTime;
            aggegrateByCategory.set(category, newValue);
        }
        const result = [];
        for (const [key, value] of aggegrateByCategory) {
            result.push([key, value]);
        }
        return result;
    }
}
function isSpecial(call) {
    return call.functionName.startsWith('(') && call.functionName.endsWith(')');
}
function printCallFrameShort(frame) {
    let result = frame.functionName || '(anonymous)';
    if (frame.url) {
        result += '#';
        result += basename(frame.url);
        if (frame.lineNumber >= 0) {
            result += ':';
            result += frame.lineNumber + 1;
        }
        if (frame.columnNumber >= 0) {
            result += ':';
            result += frame.columnNumber + 1;
        }
    }
    return result;
}
function printCallFrameStackLike(frame) {
    let result = frame.functionName || '(anonymous)';
    if (frame.url) {
        result += ' (';
        result += frame.url;
        if (frame.lineNumber >= 0) {
            result += ':';
            result += frame.lineNumber + 1;
        }
        if (frame.columnNumber >= 0) {
            result += ':';
            result += frame.columnNumber + 1;
        }
        result += ')';
    }
    return result;
}
function getHeaviestLocationIds(model, topN) {
    const stackSelfTime = {};
    for (const node of model.nodes) {
        stackSelfTime[node.locationId] = (stackSelfTime[node.locationId] || 0) + node.selfTime;
    }
    const locationIds = Object.entries(stackSelfTime)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topN)
        .map(([locationId]) => Number(locationId));
    return new Set(locationIds);
}
function bottomUp(model, topN) {
    const root = BottomUpNode.root();
    const locationIds = getHeaviestLocationIds(model, topN);
    for (const node of model.nodes) {
        if (locationIds.has(node.locationId)) {
            processNode(root, node, model);
            root.addNode(node);
        }
    }
    const result = Object.values(root.children)
        .sort((a, b) => b.selfTime - a.selfTime)
        .slice(0, topN);
    const samples = [];
    for (const node of result) {
        const sample = {
            selfTime: Math.round(node.selfTime / 1000),
            totalTime: Math.round(node.aggregateTime / 1000),
            location: printCallFrameShort(node.callFrame),
            absLocation: printCallFrameStackLike(node.callFrame),
            url: node.callFrame.url,
            caller: [],
            percentage: Math.round(node.selfTime / (model.duration / 100)),
            isSpecial: isSpecial(node.callFrame)
        };
        const stack = [node];
        while (stack.length) {
            const node = stack.pop();
            let top;
            for (const candidate of Object.values(node.children)) {
                if (!top || top.selfTime < candidate.selfTime) {
                    top = candidate;
                }
            }
            if (top) {
                const percentage = Math.round(top.selfTime / (node.selfTime / 100));
                sample.caller.push({
                    percentage,
                    location: printCallFrameShort(top.callFrame),
                    absLocation: printCallFrameStackLike(top.callFrame),
                });
                stack.push(top);
            }
        }
        samples.push(sample);
    }
    return samples;
}
