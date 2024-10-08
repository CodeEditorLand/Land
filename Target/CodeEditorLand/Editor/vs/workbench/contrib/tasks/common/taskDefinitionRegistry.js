/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from '../../../../nls.js';
import * as Types from '../../../../base/common/types.js';
import * as Objects from '../../../../base/common/objects.js';
import { ExtensionsRegistry } from '../../../services/extensions/common/extensionsRegistry.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Emitter } from '../../../../base/common/event.js';
const taskDefinitionSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        type: {
            type: 'string',
            description: nls.localize('TaskDefinition.description', 'The actual task type. Please note that types starting with a \'$\' are reserved for internal usage.')
        },
        required: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        properties: {
            type: 'object',
            description: nls.localize('TaskDefinition.properties', 'Additional properties of the task type'),
            additionalProperties: {
                $ref: 'http://json-schema.org/draft-07/schema#'
            }
        },
        when: {
            type: 'string',
            markdownDescription: nls.localize('TaskDefinition.when', 'Condition which must be true to enable this type of task. Consider using `shellExecutionSupported`, `processExecutionSupported`, and `customExecutionSupported` as appropriate for this task definition. See the [API documentation](https://code.visualstudio.com/api/extension-guides/task-provider#when-clause) for more information.'),
            default: ''
        }
    }
};
var Configuration;
(function (Configuration) {
    function from(value, extensionId, messageCollector) {
        if (!value) {
            return undefined;
        }
        const taskType = Types.isString(value.type) ? value.type : undefined;
        if (!taskType || taskType.length === 0) {
            messageCollector.error(nls.localize('TaskTypeConfiguration.noType', 'The task type configuration is missing the required \'taskType\' property'));
            return undefined;
        }
        const required = [];
        if (Array.isArray(value.required)) {
            for (const element of value.required) {
                if (Types.isString(element)) {
                    required.push(element);
                }
            }
        }
        return {
            extensionId: extensionId.value,
            taskType, required: required,
            properties: value.properties ? Objects.deepClone(value.properties) : {},
            when: value.when ? ContextKeyExpr.deserialize(value.when) : undefined
        };
    }
    Configuration.from = from;
})(Configuration || (Configuration = {}));
const taskDefinitionsExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'taskDefinitions',
    activationEventsGenerator: (contributions, result) => {
        for (const task of contributions) {
            if (task.type) {
                result.push(`onTaskType:${task.type}`);
            }
        }
    },
    jsonSchema: {
        description: nls.localize('TaskDefinitionExtPoint', 'Contributes task kinds'),
        type: 'array',
        items: taskDefinitionSchema
    }
});
class TaskDefinitionRegistryImpl {
    constructor() {
        this._onDefinitionsChanged = new Emitter();
        this.onDefinitionsChanged = this._onDefinitionsChanged.event;
        this.taskTypes = Object.create(null);
        this.readyPromise = new Promise((resolve, reject) => {
            taskDefinitionsExtPoint.setHandler((extensions, delta) => {
                this._schema = undefined;
                try {
                    for (const extension of delta.removed) {
                        const taskTypes = extension.value;
                        for (const taskType of taskTypes) {
                            if (this.taskTypes && taskType.type && this.taskTypes[taskType.type]) {
                                delete this.taskTypes[taskType.type];
                            }
                        }
                    }
                    for (const extension of delta.added) {
                        const taskTypes = extension.value;
                        for (const taskType of taskTypes) {
                            const type = Configuration.from(taskType, extension.description.identifier, extension.collector);
                            if (type) {
                                this.taskTypes[type.taskType] = type;
                            }
                        }
                    }
                    if ((delta.removed.length > 0) || (delta.added.length > 0)) {
                        this._onDefinitionsChanged.fire();
                    }
                }
                catch (error) {
                }
                resolve(undefined);
            });
        });
    }
    onReady() {
        return this.readyPromise;
    }
    get(key) {
        return this.taskTypes[key];
    }
    all() {
        return Object.keys(this.taskTypes).map(key => this.taskTypes[key]);
    }
    getJsonSchema() {
        if (this._schema === undefined) {
            const schemas = [];
            for (const definition of this.all()) {
                const schema = {
                    type: 'object',
                    additionalProperties: false
                };
                if (definition.required.length > 0) {
                    schema.required = definition.required.slice(0);
                }
                if (definition.properties !== undefined) {
                    schema.properties = Objects.deepClone(definition.properties);
                }
                else {
                    schema.properties = Object.create(null);
                }
                schema.properties.type = {
                    type: 'string',
                    enum: [definition.taskType]
                };
                schemas.push(schema);
            }
            this._schema = { oneOf: schemas };
        }
        return this._schema;
    }
}
export const TaskDefinitionRegistry = new TaskDefinitionRegistryImpl();
