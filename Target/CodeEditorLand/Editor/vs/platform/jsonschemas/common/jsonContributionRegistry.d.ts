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
    registerSchema(uri: string, unresolvedSchemaContent: IJSONSchema): void;
    notifySchemaChanged(uri: string): void;
    getSchemaContributions(): ISchemaContributions;
    getSchemaContent(uri: string): string | undefined;
    hasSchemaContent(uri: string): boolean;
}
