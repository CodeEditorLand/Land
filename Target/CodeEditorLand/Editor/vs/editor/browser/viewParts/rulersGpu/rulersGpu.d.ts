import { ViewPart } from '../../view/viewPart.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
import type { ViewGpuContext } from '../../gpu/viewGpuContext.js';
export declare class RulersGpu extends ViewPart {
    private readonly _viewGpuContext;
    private readonly _gpuShapes;
    constructor(context: ViewContext, _viewGpuContext: ViewGpuContext);
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    private _updateEntries;
}
