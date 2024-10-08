import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
export declare const Extensions: {
    JSONContribution: string;
};
export interface ISchemaContributions {
    schemas: {
        [id: string]: IJSONSchema;
    };
}
export interface IJSONContributionRegistry {
    readonly onDidChangeSchema: Event<string>;
    /**
     * Register a schema to the registry.
     */
    registerSchema(uri: string, unresolvedSchemaContent: IJSONSchema): void;
    /**
     * Notifies all listeners that the content of the given schema has changed.
     * @param uri The id of the schema
     */
    notifySchemaChanged(uri: string): void;
    /**
     * Get all schemas
     */
    getSchemaContributions(): ISchemaContributions;
    /**
     * Gets the (compressed) content of the schema with the given schema ID (if any)
     * @param uri The id of the schema
     */
    getSchemaContent(uri: string): string | undefined;
    /**
     * Returns true if there's a schema that matches the given schema ID
     * @param uri The id of the schema
     */
    hasSchemaContent(uri: string): boolean;
}
