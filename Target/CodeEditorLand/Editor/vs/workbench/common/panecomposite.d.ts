import { IView, IViewPaneContainer } from './views.js';
import { IComposite } from './composite.js';
export interface IPaneComposite extends IComposite {
    getOptimalWidth(): number | undefined;
    openView<T extends IView>(id: string, focus?: boolean): T | undefined;
    getViewPaneContainer(): IViewPaneContainer | undefined;
}
