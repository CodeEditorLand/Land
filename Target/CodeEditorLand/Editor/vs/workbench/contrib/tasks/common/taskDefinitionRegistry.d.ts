import { IJSONSchema } from '../../../../base/common/jsonSchema.js';
import * as Tasks from './tasks.js';
import { Event } from '../../../../base/common/event.js';
export interface ITaskDefinitionRegistry {
    onReady(): Promise<void>;
    get(key: string): Tasks.ITaskDefinition;
    all(): Tasks.ITaskDefinition[];
    getJsonSchema(): IJSONSchema;
    onDefinitionsChanged: Event<void>;
}
export declare const TaskDefinitionRegistry: ITaskDefinitionRegistry;
