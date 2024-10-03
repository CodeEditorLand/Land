import { Emitter } from '../../../base/common/event.js';
import { getCompressedContent } from '../../../base/common/jsonSchema.js';
import * as platform from '../../registry/common/platform.js';
export const Extensions = {
    JSONContribution: 'base.contributions.json'
};
function normalizeId(id) {
    if (id.length > 0 && id.charAt(id.length - 1) === '#') {
        return id.substring(0, id.length - 1);
    }
    return id;
}
class JSONContributionRegistry {
    constructor() {
        this._onDidChangeSchema = new Emitter();
        this.onDidChangeSchema = this._onDidChangeSchema.event;
        this.schemasById = {};
    }
    registerSchema(uri, unresolvedSchemaContent) {
        this.schemasById[normalizeId(uri)] = unresolvedSchemaContent;
        this._onDidChangeSchema.fire(uri);
    }
    notifySchemaChanged(uri) {
        this._onDidChangeSchema.fire(uri);
    }
    getSchemaContributions() {
        return {
            schemas: this.schemasById,
        };
    }
    getSchemaContent(uri) {
        const schema = this.schemasById[uri];
        return schema ? getCompressedContent(schema) : undefined;
    }
    hasSchemaContent(uri) {
        return !!this.schemasById[uri];
    }
}
const jsonContributionRegistry = new JSONContributionRegistry();
platform.Registry.add(Extensions.JSONContribution, jsonContributionRegistry);
