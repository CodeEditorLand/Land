import { IOverviewRuler } from '../../editorBrowser.js';
import { OverviewRulerPosition } from '../../../common/config/editorOptions.js';
import { OverviewRulerZone } from '../../../common/viewModel/overviewZoneManager.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
import { ViewEventHandler } from '../../../common/viewEventHandler.js';
export declare class OverviewRuler extends ViewEventHandler implements IOverviewRuler {
    private readonly _context;
    private readonly _domNode;
    private readonly _zoneManager;
    constructor(context: ViewContext, cssClassName: string);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    getDomNode(): HTMLElement;
    setLayout(position: OverviewRulerPosition): void;
    setZones(zones: OverviewRulerZone[]): void;
    private _render;
    private _renderOneLane;
}
