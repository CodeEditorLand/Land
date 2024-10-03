import { Schemas } from '../../../base/common/network.js';
import { DataUri } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { PLAINTEXT_LANGUAGE_ID } from '../languages/modesRegistry.js';
import { FileKind } from '../../../platform/files/common/files.js';
import { ThemeIcon } from '../../../base/common/themables.js';
const fileIconDirectoryRegex = /(?:\/|^)(?:([^\/]+)\/)?([^\/]+)$/;
export function getIconClasses(modelService, languageService, resource, fileKind, icon) {
    if (ThemeIcon.isThemeIcon(icon)) {
        return [`codicon-${icon.id}`, 'predefined-file-icon'];
    }
    if (URI.isUri(icon)) {
        return [];
    }
    const classes = fileKind === FileKind.ROOT_FOLDER ? ['rootfolder-icon'] : fileKind === FileKind.FOLDER ? ['folder-icon'] : ['file-icon'];
    if (resource) {
        let name;
        if (resource.scheme === Schemas.data) {
            const metadata = DataUri.parseMetaData(resource);
            name = metadata.get(DataUri.META_DATA_LABEL);
        }
        else {
            const match = resource.path.match(fileIconDirectoryRegex);
            if (match) {
                name = cssEscape(match[2].toLowerCase());
                if (match[1]) {
                    classes.push(`${cssEscape(match[1].toLowerCase())}-name-dir-icon`);
                }
            }
            else {
                name = cssEscape(resource.authority.toLowerCase());
            }
        }
        if (fileKind === FileKind.ROOT_FOLDER) {
            classes.push(`${name}-root-name-folder-icon`);
        }
        else if (fileKind === FileKind.FOLDER) {
            classes.push(`${name}-name-folder-icon`);
        }
        else {
            if (name) {
                classes.push(`${name}-name-file-icon`);
                classes.push(`name-file-icon`);
                if (name.length <= 255) {
                    const dotSegments = name.split('.');
                    for (let i = 1; i < dotSegments.length; i++) {
                        classes.push(`${dotSegments.slice(i).join('.')}-ext-file-icon`);
                    }
                }
                classes.push(`ext-file-icon`);
            }
            const detectedLanguageId = detectLanguageId(modelService, languageService, resource);
            if (detectedLanguageId) {
                classes.push(`${cssEscape(detectedLanguageId)}-lang-file-icon`);
            }
        }
    }
    return classes;
}
export function getIconClassesForLanguageId(languageId) {
    return ['file-icon', `${cssEscape(languageId)}-lang-file-icon`];
}
function detectLanguageId(modelService, languageService, resource) {
    if (!resource) {
        return null;
    }
    let languageId = null;
    if (resource.scheme === Schemas.data) {
        const metadata = DataUri.parseMetaData(resource);
        const mime = metadata.get(DataUri.META_DATA_MIME);
        if (mime) {
            languageId = languageService.getLanguageIdByMimeType(mime);
        }
    }
    else {
        const model = modelService.getModel(resource);
        if (model) {
            languageId = model.getLanguageId();
        }
    }
    if (languageId && languageId !== PLAINTEXT_LANGUAGE_ID) {
        return languageId;
    }
    return languageService.guessLanguageIdByFilepathOrFirstLine(resource);
}
function cssEscape(str) {
    return str.replace(/[\s]/g, '/');
}
