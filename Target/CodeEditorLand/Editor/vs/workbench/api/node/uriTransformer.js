import { URITransformer } from '../../../base/common/uriIpc.js';
function createRawURITransformer(remoteAuthority) {
    return {
        transformIncoming: (uri) => {
            if (uri.scheme === 'vscode-remote') {
                return { scheme: 'file', path: uri.path, query: uri.query, fragment: uri.fragment };
            }
            if (uri.scheme === 'file') {
                return { scheme: 'vscode-local', path: uri.path, query: uri.query, fragment: uri.fragment };
            }
            return uri;
        },
        transformOutgoing: (uri) => {
            if (uri.scheme === 'file') {
                return { scheme: 'vscode-remote', authority: remoteAuthority, path: uri.path, query: uri.query, fragment: uri.fragment };
            }
            if (uri.scheme === 'vscode-local') {
                return { scheme: 'file', path: uri.path, query: uri.query, fragment: uri.fragment };
            }
            return uri;
        },
        transformOutgoingScheme: (scheme) => {
            if (scheme === 'file') {
                return 'vscode-remote';
            }
            else if (scheme === 'vscode-local') {
                return 'file';
            }
            return scheme;
        }
    };
}
export function createURITransformer(remoteAuthority) {
    return new URITransformer(createRawURITransformer(remoteAuthority));
}
