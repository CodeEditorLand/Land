import { rtrim } from '../../../../base/common/strings.js';
export function normalizeGitHubUrl(url) {
    if (url.endsWith('.git')) {
        url = url.substr(0, url.length - 4);
    }
    url = rtrim(url, '/');
    if (url.endsWith('/new')) {
        url = rtrim(url, '/new');
    }
    if (url.endsWith('/issues')) {
        url = rtrim(url, '/issues');
    }
    return url;
}
