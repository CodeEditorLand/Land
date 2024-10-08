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
import { registerWorkbenchContribution2 } from '../../../../../common/contributions.js';
import { MarkerList, IMarkerNavigationService } from '../../../../../../editor/contrib/gotoError/browser/markerNavigationService.js';
import { CellUri } from '../../../common/notebookCommon.js';
import { IMarkerService, MarkerSeverity } from '../../../../../../platform/markers/common/markers.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { NotebookOverviewRulerLane } from '../../notebookBrowser.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { throttle } from '../../../../../../base/common/decorators.js';
import { editorErrorForeground, editorWarningForeground } from '../../../../../../platform/theme/common/colorRegistry.js';
import { isEqual } from '../../../../../../base/common/resources.js';
let MarkerListProvider = class MarkerListProvider {
    static { this.ID = 'workbench.contrib.markerListProvider'; }
    constructor(_markerService, markerNavigation, _configService) {
        this._markerService = _markerService;
        this._configService = _configService;
        this._dispoables = markerNavigation.registerProvider(this);
    }
    dispose() {
        this._dispoables.dispose();
    }
    getMarkerList(resource) {
        if (!resource) {
            return undefined;
        }
        const data = CellUri.parse(resource);
        if (!data) {
            return undefined;
        }
        return new MarkerList(uri => {
            const otherData = CellUri.parse(uri);
            return otherData?.notebook.toString() === data.notebook.toString();
        }, this._markerService, this._configService);
    }
};
MarkerListProvider = __decorate([
    __param(0, IMarkerService),
    __param(1, IMarkerNavigationService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MarkerListProvider);
let NotebookMarkerDecorationContribution = class NotebookMarkerDecorationContribution extends Disposable {
    static { this.id = 'workbench.notebook.markerDecoration'; }
    constructor(_notebookEditor, _markerService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._markerService = _markerService;
        this._markersOverviewRulerDecorations = [];
        this._update();
        this._register(this._notebookEditor.onDidChangeModel(() => this._update()));
        this._register(this._markerService.onMarkerChanged(e => {
            if (e.some(uri => this._notebookEditor.getCellsInRange().some(cell => isEqual(cell.uri, uri)))) {
                this._update();
            }
        }));
    }
    _update() {
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        const cellDecorations = [];
        this._notebookEditor.getCellsInRange().forEach(cell => {
            const marker = this._markerService.read({ resource: cell.uri, severities: MarkerSeverity.Error | MarkerSeverity.Warning });
            marker.forEach(m => {
                const color = m.severity === MarkerSeverity.Error ? editorErrorForeground : editorWarningForeground;
                const range = { startLineNumber: m.startLineNumber, startColumn: m.startColumn, endLineNumber: m.endLineNumber, endColumn: m.endColumn };
                cellDecorations.push({
                    handle: cell.handle,
                    options: {
                        overviewRuler: {
                            color: color,
                            modelRanges: [range],
                            includeOutput: false,
                            position: NotebookOverviewRulerLane.Right
                        }
                    }
                });
            });
        });
        this._markersOverviewRulerDecorations = this._notebookEditor.deltaCellDecorations(this._markersOverviewRulerDecorations, cellDecorations);
    }
};
__decorate([
    throttle(100),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotebookMarkerDecorationContribution.prototype, "_update", null);
NotebookMarkerDecorationContribution = __decorate([
    __param(1, IMarkerService),
    __metadata("design:paramtypes", [Object, Object])
], NotebookMarkerDecorationContribution);
registerWorkbenchContribution2(MarkerListProvider.ID, MarkerListProvider, 2 /* WorkbenchPhase.BlockRestore */);
registerNotebookContribution(NotebookMarkerDecorationContribution.id, NotebookMarkerDecorationContribution);
