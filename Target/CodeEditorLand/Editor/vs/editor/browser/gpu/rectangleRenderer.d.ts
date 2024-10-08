import { ViewEventHandler } from '../../common/viewEventHandler.js';
import type { ViewScrollChangedEvent } from '../../common/viewEvents.js';
import type { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
import type { ViewContext } from '../../common/viewModel/viewContext.js';
import { type IObjectCollectionBufferEntry } from './objectCollectionBuffer.js';
export type RectangleRendererEntrySpec = [
    {
        name: 'x';
    },
    {
        name: 'y';
    },
    {
        name: 'width';
    },
    {
        name: 'height';
    },
    {
        name: 'red';
    },
    {
        name: 'green';
    },
    {
        name: 'blue';
    },
    {
        name: 'alpha';
    }
];
export declare class RectangleRenderer extends ViewEventHandler {
    private readonly _context;
    private readonly _canvas;
    private readonly _ctx;
    private _device;
    private _renderPassDescriptor;
    private _renderPassColorAttachment;
    private _bindGroup;
    private _pipeline;
    private _vertexBuffer;
    private readonly _shapeBindBuffer;
    private _scrollOffsetBindBuffer;
    private _scrollOffsetValueBuffer;
    private _initialized;
    private _scrollChanged;
    private readonly _shapeCollection;
    constructor(_context: ViewContext, _canvas: HTMLCanvasElement, _ctx: GPUCanvasContext, device: Promise<GPUDevice>);
    private _initWebgpu;
    private _updateBindGroup;
    register(x: number, y: number, width: number, height: number, red: number, green: number, blue: number, alpha: number): IObjectCollectionBufferEntry<RectangleRendererEntrySpec>;
    onScrollChanged(e: ViewScrollChangedEvent): boolean;
    private _update;
    draw(viewportData: ViewportData): void;
}
