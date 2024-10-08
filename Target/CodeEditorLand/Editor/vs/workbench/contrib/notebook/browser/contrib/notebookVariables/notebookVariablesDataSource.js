/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationTokenSource } from '../../../../../../base/common/cancellation.js';
import { localize } from '../../../../../../nls.js';
import { variablePageSize } from '../../../common/notebookKernelService.js';
export class NotebookVariableDataSource {
    constructor(notebookKernelService) {
        this.notebookKernelService = notebookKernelService;
        this.cancellationTokenSource = new CancellationTokenSource();
    }
    hasChildren(element) {
        return element.kind === 'root' || element.hasNamedChildren || element.indexedChildrenCount > 0;
    }
    cancel() {
        this.cancellationTokenSource.cancel();
        this.cancellationTokenSource.dispose();
        this.cancellationTokenSource = new CancellationTokenSource();
    }
    async getChildren(element) {
        if (element.kind === 'empty') {
            return [];
        }
        else if (element.kind === 'root') {
            return this.getRootVariables(element.notebook);
        }
        else {
            return this.getVariables(element);
        }
    }
    async getVariables(parent) {
        const selectedKernel = this.notebookKernelService.getMatchingKernel(parent.notebook).selected;
        if (selectedKernel && selectedKernel.hasVariableProvider) {
            let children = [];
            if (parent.hasNamedChildren) {
                const variables = selectedKernel.provideVariables(parent.notebook.uri, parent.extHostId, 'named', 0, this.cancellationTokenSource.token);
                const childNodes = await variables
                    .map(variable => { return this.createVariableElement(variable, parent.notebook); })
                    .toPromise();
                children = children.concat(childNodes);
            }
            if (parent.indexedChildrenCount > 0) {
                const childNodes = await this.getIndexedChildren(parent, selectedKernel);
                children = children.concat(childNodes);
            }
            return children;
        }
        return [];
    }
    async getIndexedChildren(parent, kernel) {
        const childNodes = [];
        if (parent.indexedChildrenCount > variablePageSize) {
            const nestedPageSize = Math.floor(Math.max(parent.indexedChildrenCount / variablePageSize, 100));
            const indexedChildCountLimit = 1_000_000;
            let start = parent.indexStart ?? 0;
            const last = start + Math.min(parent.indexedChildrenCount, indexedChildCountLimit);
            for (; start < last; start += nestedPageSize) {
                let end = start + nestedPageSize;
                if (end > last) {
                    end = last;
                }
                childNodes.push({
                    kind: 'variable',
                    notebook: parent.notebook,
                    id: parent.id + `${start}`,
                    extHostId: parent.extHostId,
                    name: `[${start}..${end - 1}]`,
                    value: '',
                    indexedChildrenCount: end - start,
                    indexStart: start,
                    hasNamedChildren: false
                });
            }
            if (parent.indexedChildrenCount > indexedChildCountLimit) {
                childNodes.push({
                    kind: 'variable',
                    notebook: parent.notebook,
                    id: parent.id + `${last + 1}`,
                    extHostId: parent.extHostId,
                    name: localize('notebook.indexedChildrenLimitReached', "Display limit reached"),
                    value: '',
                    indexedChildrenCount: 0,
                    hasNamedChildren: false
                });
            }
        }
        else if (parent.indexedChildrenCount > 0) {
            const variables = kernel.provideVariables(parent.notebook.uri, parent.extHostId, 'indexed', parent.indexStart ?? 0, this.cancellationTokenSource.token);
            for await (const variable of variables) {
                childNodes.push(this.createVariableElement(variable, parent.notebook));
                if (childNodes.length >= variablePageSize) {
                    break;
                }
            }
        }
        return childNodes;
    }
    async getRootVariables(notebook) {
        const selectedKernel = this.notebookKernelService.getMatchingKernel(notebook).selected;
        if (selectedKernel && selectedKernel.hasVariableProvider) {
            const variables = selectedKernel.provideVariables(notebook.uri, undefined, 'named', 0, this.cancellationTokenSource.token);
            return await variables
                .map(variable => { return this.createVariableElement(variable, notebook); })
                .toPromise();
        }
        return [];
    }
    createVariableElement(variable, notebook) {
        return {
            ...variable,
            kind: 'variable',
            notebook,
            extHostId: variable.id,
            id: `${variable.id}`
        };
    }
}
