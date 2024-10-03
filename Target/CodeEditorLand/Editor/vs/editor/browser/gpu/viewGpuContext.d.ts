import { type FastDomNode } from '../../../base/browser/fastDomNode.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import type { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
import type { ViewLineOptions } from '../viewParts/viewLines/viewLineOptions.js';
import { type IObservable } from '../../../base/common/observable.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { TextureAtlas } from './atlas/textureAtlas.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { RectangleRenderer } from './rectangleRenderer.js';
import type { ViewContext } from '../../common/viewModel/viewContext.js';
export declare class ViewGpuContext extends Disposable {
    private readonly _instantiationService;
    private readonly _notificationService;
    private readonly configurationService;
    readonly canvas: FastDomNode<HTMLCanvasElement>;
    readonly ctx: GPUCanvasContext;
    readonly device: Promise<GPUDevice>;
    readonly rectangleRenderer: RectangleRenderer;
    private static _atlas;
    static get atlas(): TextureAtlas;
    get atlas(): TextureAtlas;
    readonly canvasDevicePixelDimensions: IObservable<{
        width: number;
        height: number;
    }>;
    readonly devicePixelRatio: IObservable<number>;
    constructor(context: ViewContext, _instantiationService: IInstantiationService, _notificationService: INotificationService, configurationService: IConfigurationService);
    static canRender(options: ViewLineOptions, viewportData: ViewportData, lineNumber: number): boolean;
}
