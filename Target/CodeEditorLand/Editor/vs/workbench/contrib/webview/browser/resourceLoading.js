/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isUNC } from '../../../../base/common/extpath.js';
import { Schemas } from '../../../../base/common/network.js';
import { normalize, sep } from '../../../../base/common/path.js';
import { URI } from '../../../../base/common/uri.js';
import { FileOperationError } from '../../../../platform/files/common/files.js';
import { getWebviewContentMimeType } from '../../../../platform/webview/common/mimeTypes.js';
export var WebviewResourceResponse;
(function (WebviewResourceResponse) {
    let Type;
    (function (Type) {
        Type[Type["Success"] = 0] = "Success";
        Type[Type["Failed"] = 1] = "Failed";
        Type[Type["AccessDenied"] = 2] = "AccessDenied";
        Type[Type["NotModified"] = 3] = "NotModified";
    })(Type = WebviewResourceResponse.Type || (WebviewResourceResponse.Type = {}));
    class StreamSuccess {
        constructor(stream, etag, mtime, mimeType) {
            this.stream = stream;
            this.etag = etag;
            this.mtime = mtime;
            this.mimeType = mimeType;
            this.type = Type.Success;
        }
    }
    WebviewResourceResponse.StreamSuccess = StreamSuccess;
    WebviewResourceResponse.Failed = { type: Type.Failed };
    WebviewResourceResponse.AccessDenied = { type: Type.AccessDenied };
    class NotModified {
        constructor(mimeType, mtime) {
            this.mimeType = mimeType;
            this.mtime = mtime;
            this.type = Type.NotModified;
        }
    }
    WebviewResourceResponse.NotModified = NotModified;
})(WebviewResourceResponse || (WebviewResourceResponse = {}));
export async function loadLocalResource(requestUri, options, fileService, logService, token) {
    logService.debug(`loadLocalResource - begin. requestUri=${requestUri}`);
    const resourceToLoad = getResourceToLoad(requestUri, options.roots);
    logService.debug(`loadLocalResource - found resource to load. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
    if (!resourceToLoad) {
        return WebviewResourceResponse.AccessDenied;
    }
    const mime = getWebviewContentMimeType(requestUri); // Use the original path for the mime
    try {
        const result = await fileService.readFileStream(resourceToLoad, { etag: options.ifNoneMatch }, token);
        return new WebviewResourceResponse.StreamSuccess(result.value, result.etag, result.mtime, mime);
    }
    catch (err) {
        if (err instanceof FileOperationError) {
            const result = err.fileOperationResult;
            // NotModified status is expected and can be handled gracefully
            if (result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                return new WebviewResourceResponse.NotModified(mime, err.options?.mtime);
            }
        }
        // Otherwise the error is unexpected.
        logService.debug(`loadLocalResource - Error using fileReader. requestUri=${requestUri}`);
        console.log(err);
        return WebviewResourceResponse.Failed;
    }
}
function getResourceToLoad(requestUri, roots) {
    for (const root of roots) {
        if (containsResource(root, requestUri)) {
            return normalizeResourcePath(requestUri);
        }
    }
    return undefined;
}
function containsResource(root, resource) {
    if (root.scheme !== resource.scheme) {
        return false;
    }
    let resourceFsPath = normalize(resource.fsPath);
    let rootPath = normalize(root.fsPath + (root.fsPath.endsWith(sep) ? '' : sep));
    if (isUNC(root.fsPath) && isUNC(resource.fsPath)) {
        rootPath = rootPath.toLowerCase();
        resourceFsPath = resourceFsPath.toLowerCase();
    }
    return resourceFsPath.startsWith(rootPath);
}
function normalizeResourcePath(resource) {
    // Rewrite remote uris to a path that the remote file system can understand
    if (resource.scheme === Schemas.vscodeRemote) {
        return URI.from({
            scheme: Schemas.vscodeRemote,
            authority: resource.authority,
            path: '/vscode-resource',
            query: JSON.stringify({
                requestResourcePath: resource.path
            })
        });
    }
    return resource;
}
