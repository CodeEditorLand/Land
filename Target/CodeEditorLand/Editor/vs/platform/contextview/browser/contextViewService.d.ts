import { ContextView, IContextViewProvider } from '../../../base/browser/ui/contextview/contextview.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILayoutService } from '../../layout/browser/layoutService.js';
import { IContextViewDelegate, IContextViewService, IOpenContextView } from './contextView.js';
export declare class ContextViewHandler extends Disposable implements IContextViewProvider {
    private readonly layoutService;
    private openContextView;
    protected readonly contextView: ContextView;
    constructor(layoutService: ILayoutService);
    showContextView(delegate: IContextViewDelegate, container?: HTMLElement, shadowRoot?: boolean): IOpenContextView;
    layout(): void;
    hideContextView(data?: any): void;
}
export declare class ContextViewService extends ContextViewHandler implements IContextViewService {
    readonly _serviceBrand: undefined;
    getContextViewElement(): HTMLElement;
}
