/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Codicon } from '../../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { MarkerSeverity } from '../../../../../platform/markers/common/markers.js';
import { executingStateIcon } from '../notebookIcons.js';
import { CellKind } from '../../common/notebookCommon.js';
import { SymbolKinds } from '../../../../../editor/common/languages.js';
export class OutlineEntry {
    get icon() {
        if (this.symbolKind) {
            return SymbolKinds.toIcon(this.symbolKind);
        }
        return this.isExecuting && this.isPaused ? executingStateIcon :
            this.isExecuting ? ThemeIcon.modify(executingStateIcon, 'spin') :
                this.cell.cellKind === CellKind.Markup ? Codicon.markdown : Codicon.code;
    }
    constructor(index, level, cell, label, isExecuting, isPaused, range, symbolKind) {
        this.index = index;
        this.level = level;
        this.cell = cell;
        this.label = label;
        this.isExecuting = isExecuting;
        this.isPaused = isPaused;
        this.range = range;
        this.symbolKind = symbolKind;
        this._children = [];
    }
    addChild(entry) {
        this._children.push(entry);
        entry._parent = this;
    }
    get parent() {
        return this._parent;
    }
    get children() {
        return this._children;
    }
    get markerInfo() {
        return this._markerInfo;
    }
    get position() {
        if (this.range) {
            return { startLineNumber: this.range.startLineNumber, startColumn: this.range.startColumn };
        }
        return undefined;
    }
    updateMarkers(markerService) {
        if (this.cell.cellKind === CellKind.Code) {
            // a code cell can have marker
            const marker = markerService.read({ resource: this.cell.uri, severities: MarkerSeverity.Error | MarkerSeverity.Warning });
            if (marker.length === 0) {
                this._markerInfo = undefined;
            }
            else {
                const topSev = marker.find(a => a.severity === MarkerSeverity.Error)?.severity ?? MarkerSeverity.Warning;
                this._markerInfo = { topSev, count: marker.length };
            }
        }
        else {
            // a markdown cell can inherit markers from its children
            let topChild;
            for (const child of this.children) {
                child.updateMarkers(markerService);
                if (child.markerInfo) {
                    topChild = !topChild ? child.markerInfo.topSev : Math.max(child.markerInfo.topSev, topChild);
                }
            }
            this._markerInfo = topChild && { topSev: topChild, count: 0 };
        }
    }
    clearMarkers() {
        this._markerInfo = undefined;
        for (const child of this.children) {
            child.clearMarkers();
        }
    }
    find(cell, parents) {
        if (cell.id === this.cell.id) {
            return this;
        }
        parents.push(this);
        for (const child of this.children) {
            const result = child.find(cell, parents);
            if (result) {
                return result;
            }
        }
        parents.pop();
        return undefined;
    }
    asFlatList(bucket) {
        bucket.push(this);
        for (const child of this.children) {
            child.asFlatList(bucket);
        }
    }
}
