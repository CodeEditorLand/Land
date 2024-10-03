import * as nls from '../../../../nls.js';
import { URI } from '../../../../base/common/uri.js';
import { normalize, isAbsolute } from '../../../../base/common/path.js';
import * as resources from '../../../../base/common/resources.js';
import { DEBUG_SCHEME } from './debug.js';
import { SIDE_GROUP, ACTIVE_GROUP } from '../../../services/editor/common/editorService.js';
import { Schemas } from '../../../../base/common/network.js';
import { isUri } from './debugUtils.js';
export const UNKNOWN_SOURCE_LABEL = nls.localize('unknownSource', "Unknown Source");
export class Source {
    constructor(raw_, sessionId, uriIdentityService, logService) {
        let path;
        if (raw_) {
            this.raw = raw_;
            path = this.raw.path || this.raw.name || '';
            this.available = true;
        }
        else {
            this.raw = { name: UNKNOWN_SOURCE_LABEL };
            this.available = false;
            path = `${DEBUG_SCHEME}:${UNKNOWN_SOURCE_LABEL}`;
        }
        this.uri = getUriFromSource(this.raw, path, sessionId, uriIdentityService, logService);
    }
    get name() {
        return this.raw.name || resources.basenameOrAuthority(this.uri);
    }
    get origin() {
        return this.raw.origin;
    }
    get presentationHint() {
        return this.raw.presentationHint;
    }
    get reference() {
        return this.raw.sourceReference;
    }
    get inMemory() {
        return this.uri.scheme === DEBUG_SCHEME;
    }
    openInEditor(editorService, selection, preserveFocus, sideBySide, pinned) {
        return !this.available ? Promise.resolve(undefined) : editorService.openEditor({
            resource: this.uri,
            description: this.origin,
            options: {
                preserveFocus,
                selection,
                revealIfOpened: true,
                selectionRevealType: 1,
                pinned
            }
        }, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
    }
    static getEncodedDebugData(modelUri) {
        let path;
        let sourceReference;
        let sessionId;
        switch (modelUri.scheme) {
            case Schemas.file:
                path = normalize(modelUri.fsPath);
                break;
            case DEBUG_SCHEME:
                path = modelUri.path;
                if (modelUri.query) {
                    const keyvalues = modelUri.query.split('&');
                    for (const keyvalue of keyvalues) {
                        const pair = keyvalue.split('=');
                        if (pair.length === 2) {
                            switch (pair[0]) {
                                case 'session':
                                    sessionId = pair[1];
                                    break;
                                case 'ref':
                                    sourceReference = parseInt(pair[1]);
                                    break;
                            }
                        }
                    }
                }
                break;
            default:
                path = modelUri.toString();
                break;
        }
        return {
            name: resources.basenameOrAuthority(modelUri),
            path,
            sourceReference,
            sessionId
        };
    }
}
export function getUriFromSource(raw, path, sessionId, uriIdentityService, logService) {
    const _getUriFromSource = (path) => {
        if (typeof raw.sourceReference === 'number' && raw.sourceReference > 0) {
            return URI.from({
                scheme: DEBUG_SCHEME,
                path: path?.replace(/^\/+/g, '/'),
                query: `session=${sessionId}&ref=${raw.sourceReference}`
            });
        }
        if (path && isUri(path)) {
            return uriIdentityService.asCanonicalUri(URI.parse(path));
        }
        if (path && isAbsolute(path)) {
            return uriIdentityService.asCanonicalUri(URI.file(path));
        }
        return uriIdentityService.asCanonicalUri(URI.from({
            scheme: DEBUG_SCHEME,
            path,
            query: `session=${sessionId}`
        }));
    };
    try {
        return _getUriFromSource(path);
    }
    catch (err) {
        logService.error('Invalid path from debug adapter: ' + path);
        return _getUriFromSource('/invalidDebugSource');
    }
}
