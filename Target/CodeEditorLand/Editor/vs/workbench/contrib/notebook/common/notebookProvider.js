import * as glob from '../../../../base/common/glob.js';
import { basename } from '../../../../base/common/path.js';
import { isDocumentExcludePattern } from './notebookCommon.js';
export class NotebookProviderInfo {
    get selectors() {
        return this._selectors;
    }
    get options() {
        return this._options;
    }
    constructor(descriptor) {
        this.extension = descriptor.extension;
        this.id = descriptor.id;
        this.displayName = descriptor.displayName;
        this._selectors = descriptor.selectors?.map(selector => ({
            include: selector.filenamePattern,
            exclude: selector.excludeFileNamePattern || ''
        })) || [];
        this.priority = descriptor.priority;
        this.providerDisplayName = descriptor.providerDisplayName;
        this._options = {
            transientCellMetadata: {},
            transientDocumentMetadata: {},
            transientOutputs: false,
            cellContentMetadata: {}
        };
    }
    update(args) {
        if (args.selectors) {
            this._selectors = args.selectors;
        }
        if (args.options) {
            this._options = args.options;
        }
    }
    matches(resource) {
        return this.selectors?.some(selector => NotebookProviderInfo.selectorMatches(selector, resource));
    }
    static selectorMatches(selector, resource) {
        if (typeof selector === 'string') {
            if (glob.match(selector.toLowerCase(), basename(resource.fsPath).toLowerCase())) {
                return true;
            }
        }
        if (glob.isRelativePattern(selector)) {
            if (glob.match(selector, basename(resource.fsPath).toLowerCase())) {
                return true;
            }
        }
        if (!isDocumentExcludePattern(selector)) {
            return false;
        }
        const filenamePattern = selector.include;
        const excludeFilenamePattern = selector.exclude;
        if (glob.match(filenamePattern, basename(resource.fsPath).toLowerCase())) {
            if (excludeFilenamePattern) {
                if (glob.match(excludeFilenamePattern, basename(resource.fsPath).toLowerCase())) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    static possibleFileEnding(selectors) {
        for (const selector of selectors) {
            const ending = NotebookProviderInfo._possibleFileEnding(selector);
            if (ending) {
                return ending;
            }
        }
        return undefined;
    }
    static _possibleFileEnding(selector) {
        const pattern = /^.*(\.[a-zA-Z0-9_-]+)$/;
        let candidate;
        if (typeof selector === 'string') {
            candidate = selector;
        }
        else if (glob.isRelativePattern(selector)) {
            candidate = selector.pattern;
        }
        else if (selector.include) {
            return NotebookProviderInfo._possibleFileEnding(selector.include);
        }
        if (candidate) {
            const match = pattern.exec(candidate);
            if (match) {
                return match[1];
            }
        }
        return undefined;
    }
}
