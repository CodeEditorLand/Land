import { ResourceMap } from '../../../../base/common/map.js';
import { splitLinesIncludeSeparators } from '../../../../base/common/strings.js';
import { isString } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { isLocation } from '../../../../editor/common/languages.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const ICodeMapperService = createDecorator('codeMapperService');
export class CodeMapperService {
    constructor() {
        this.providers = [];
    }
    registerCodeMapperProvider(handle, provider) {
        this.providers.push(provider);
        return {
            dispose: () => {
                const index = this.providers.indexOf(provider);
                if (index >= 0) {
                    this.providers.splice(index, 1);
                }
            }
        };
    }
    async mapCode(request, response, token) {
        for (const provider of this.providers) {
            const result = await provider.mapCode(request, response, token);
            if (result) {
                return result;
            }
        }
        return undefined;
    }
    async mapCodeFromResponse(responseModel, response, token) {
        const fenceLanguageRegex = /^`{3,}/;
        const codeBlocks = [];
        const currentBlock = [];
        const markdownBeforeBlock = [];
        let currentBlockUri = undefined;
        let fence = undefined;
        for (const lineOrUri of iterateLinesOrUris(responseModel)) {
            if (isString(lineOrUri)) {
                const fenceLanguageIdMatch = lineOrUri.match(fenceLanguageRegex);
                if (fenceLanguageIdMatch) {
                    if (fence !== undefined && fenceLanguageIdMatch[0] === fence) {
                        fence = undefined;
                        if (currentBlockUri) {
                            codeBlocks.push({ code: currentBlock.join(''), resource: currentBlockUri, markdownBeforeBlock: markdownBeforeBlock.join('') });
                            currentBlock.length = 0;
                            markdownBeforeBlock.length = 0;
                            currentBlockUri = undefined;
                        }
                    }
                    else {
                        fence = fenceLanguageIdMatch[0];
                    }
                }
                else {
                    if (fence !== undefined) {
                        currentBlock.push(lineOrUri);
                    }
                    else {
                        markdownBeforeBlock.push(lineOrUri);
                    }
                }
            }
            else {
                currentBlockUri = lineOrUri;
            }
        }
        const conversation = [];
        for (const request of responseModel.session.getRequests()) {
            const response = request.response;
            if (!response || response === responseModel) {
                break;
            }
            conversation.push({
                type: 'request',
                message: request.message.text
            });
            conversation.push({
                type: 'response',
                message: response.response.toMarkdown(),
                result: response.result,
                references: getReferencesAsDocumentContext(response.contentReferences)
            });
        }
        return this.mapCode({ codeBlocks, conversation }, response, token);
    }
}
function iterateLinesOrUris(responseModel) {
    return {
        *[Symbol.iterator]() {
            let lastIncompleteLine = undefined;
            for (const part of responseModel.response.value) {
                if (part.kind === 'markdownContent' || part.kind === 'markdownVuln') {
                    const lines = splitLinesIncludeSeparators(part.content.value);
                    if (lines.length > 0) {
                        if (lastIncompleteLine !== undefined) {
                            lines[0] = lastIncompleteLine + lines[0];
                        }
                        lastIncompleteLine = isLineIncomplete(lines[lines.length - 1]) ? lines.pop() : undefined;
                        for (const line of lines) {
                            yield line;
                        }
                    }
                }
                else if (part.kind === 'codeblockUri') {
                    yield part.uri;
                }
            }
        }
    };
}
function isLineIncomplete(line) {
    const lastChar = line.charCodeAt(line.length - 1);
    return lastChar !== 10 && lastChar !== 13;
}
export function getReferencesAsDocumentContext(res) {
    const map = new ResourceMap();
    for (const r of res) {
        let uri;
        let range;
        if (URI.isUri(r.reference)) {
            uri = r.reference;
        }
        else if (isLocation(r.reference)) {
            uri = r.reference.uri;
            range = r.reference.range;
        }
        if (uri) {
            const item = map.get(uri);
            if (item) {
                if (range) {
                    item.ranges.push(range);
                }
            }
            else {
                map.set(uri, { uri, version: -1, ranges: range ? [range] : [] });
            }
        }
    }
    return [...map.values()];
}
