/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { isDefined } from '../../../../base/common/types.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { CONTEXT_VARIABLE_NAME, CONTEXT_VARIABLE_TYPE, CONTEXT_VARIABLE_VALUE } from './debug.js';
import { getContextForVariable } from './debugContext.js';
import { Scope, Variable, VisualizedExpression } from './debugModel.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ExtensionsRegistry } from '../../../services/extensions/common/extensionsRegistry.js';
export const IDebugVisualizerService = createDecorator('debugVisualizerService');
export class DebugVisualizer {
    get name() {
        return this.viz.name;
    }
    get iconPath() {
        return this.viz.iconPath;
    }
    get iconClass() {
        return this.viz.iconClass;
    }
    constructor(handle, viz) {
        this.handle = handle;
        this.viz = viz;
    }
    async resolve(token) {
        return this.viz.visualization ??= await this.handle.resolveDebugVisualizer(this.viz, token);
    }
    async execute() {
        await this.handle.executeDebugVisualizerCommand(this.viz.id);
    }
}
const emptyRef = { object: [], dispose: () => { } };
let DebugVisualizerService = class DebugVisualizerService {
    constructor(contextKeyService, extensionService, logService) {
        this.contextKeyService = contextKeyService;
        this.extensionService = extensionService;
        this.logService = logService;
        this.handles = new Map();
        this.trees = new Map();
        this.didActivate = new Map();
        this.registrations = [];
        visualizersExtensionPoint.setHandler((_, { added, removed }) => {
            this.registrations = this.registrations.filter(r => !removed.some(e => ExtensionIdentifier.equals(e.description.identifier, r.extensionId)));
            added.forEach(e => this.processExtensionRegistration(e.description));
        });
    }
    /** @inheritdoc */
    async getApplicableFor(variable, token) {
        if (!(variable instanceof Variable)) {
            return emptyRef;
        }
        const threadId = variable.getThreadId();
        if (threadId === undefined) { // an expression, not a variable
            return emptyRef;
        }
        const context = this.getVariableContext(threadId, variable);
        const overlay = getContextForVariable(this.contextKeyService, variable, [
            [CONTEXT_VARIABLE_NAME.key, variable.name],
            [CONTEXT_VARIABLE_VALUE.key, variable.value],
            [CONTEXT_VARIABLE_TYPE.key, variable.type],
        ]);
        const maybeVisualizers = await Promise.all(this.registrations.map(async (registration) => {
            if (!overlay.contextMatchesRules(registration.expr)) {
                return;
            }
            let prom = this.didActivate.get(registration.id);
            if (!prom) {
                prom = this.extensionService.activateByEvent(`onDebugVisualizer:${registration.id}`);
                this.didActivate.set(registration.id, prom);
            }
            await prom;
            if (token.isCancellationRequested) {
                return;
            }
            const handle = this.handles.get(toKey(registration.extensionId, registration.id));
            return handle && { handle, result: await handle.provideDebugVisualizers(context, token) };
        }));
        const ref = {
            object: maybeVisualizers.filter(isDefined).flatMap(v => v.result.map(r => new DebugVisualizer(v.handle, r))),
            dispose: () => {
                for (const viz of maybeVisualizers) {
                    viz?.handle.disposeDebugVisualizers(viz.result.map(r => r.id));
                }
            },
        };
        if (token.isCancellationRequested) {
            ref.dispose();
        }
        return ref;
    }
    /** @inheritdoc */
    register(handle) {
        const key = toKey(handle.extensionId, handle.id);
        this.handles.set(key, handle);
        return toDisposable(() => this.handles.delete(key));
    }
    /** @inheritdoc */
    registerTree(treeId, handle) {
        this.trees.set(treeId, handle);
        return toDisposable(() => this.trees.delete(treeId));
    }
    /** @inheritdoc */
    async getVisualizedNodeFor(treeId, expr) {
        if (!(expr instanceof Variable)) {
            return;
        }
        const threadId = expr.getThreadId();
        if (threadId === undefined) {
            return;
        }
        const tree = this.trees.get(treeId);
        if (!tree) {
            return;
        }
        try {
            const treeItem = await tree.getTreeItem(this.getVariableContext(threadId, expr));
            if (!treeItem) {
                return;
            }
            return new VisualizedExpression(expr.getSession(), this, treeId, treeItem, expr);
        }
        catch (e) {
            this.logService.warn('Failed to get visualized node', e);
            return;
        }
    }
    /** @inheritdoc */
    async getVisualizedChildren(session, treeId, treeElementId) {
        const node = this.trees.get(treeId);
        const children = await node?.getChildren(treeElementId) || [];
        return children.map(c => new VisualizedExpression(session, this, treeId, c, undefined));
    }
    /** @inheritdoc */
    async editTreeItem(treeId, treeItem, newValue) {
        const newItem = await this.trees.get(treeId)?.editItem?.(treeItem.id, newValue);
        if (newItem) {
            Object.assign(treeItem, newItem); // replace in-place so rerenders work
        }
    }
    getVariableContext(threadId, variable) {
        const context = {
            sessionId: variable.getSession()?.getId() || '',
            containerId: (variable.parent instanceof Variable ? variable.reference : undefined),
            threadId,
            variable: {
                name: variable.name,
                value: variable.value,
                type: variable.type,
                evaluateName: variable.evaluateName,
                variablesReference: variable.reference || 0,
                indexedVariables: variable.indexedVariables,
                memoryReference: variable.memoryReference,
                namedVariables: variable.namedVariables,
                presentationHint: variable.presentationHint,
            }
        };
        for (let p = variable; p instanceof Variable; p = p.parent) {
            if (p.parent instanceof Scope) {
                context.frameId = p.parent.stackFrame.frameId;
            }
        }
        return context;
    }
    processExtensionRegistration(ext) {
        const viz = ext.contributes?.debugVisualizers;
        if (!(viz instanceof Array)) {
            return;
        }
        for (const { when, id } of viz) {
            try {
                const expr = ContextKeyExpr.deserialize(when);
                if (expr) {
                    this.registrations.push({ expr, id, extensionId: ext.identifier });
                }
            }
            catch (e) {
                this.logService.error(`Error processing debug visualizer registration from extension '${ext.identifier.value}'`, e);
            }
        }
    }
};
DebugVisualizerService = __decorate([
    __param(0, IContextKeyService),
    __param(1, IExtensionService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DebugVisualizerService);
export { DebugVisualizerService };
const toKey = (extensionId, id) => `${ExtensionIdentifier.toKey(extensionId)}\0${id}`;
const visualizersExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'debugVisualizers',
    jsonSchema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Name of the debug visualizer'
                },
                when: {
                    type: 'string',
                    description: 'Condition when the debug visualizer is applicable'
                }
            },
            required: ['id', 'when']
        }
    },
    activationEventsGenerator: (contribs, result) => {
        for (const contrib of contribs) {
            if (contrib.id) {
                result.push(`onDebugVisualizer:${contrib.id}`);
            }
        }
    }
});
