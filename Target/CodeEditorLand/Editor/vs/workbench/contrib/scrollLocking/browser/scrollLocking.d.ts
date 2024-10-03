import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
export declare class SyncScroll extends Disposable implements IWorkbenchContribution {
    private readonly editorService;
    private readonly statusbarService;
    static readonly ID = "workbench.contrib.syncScrolling";
    private readonly paneInitialScrollTop;
    private readonly syncScrollDispoasbles;
    private readonly paneDisposables;
    private readonly statusBarEntry;
    private isActive;
    constructor(editorService: IEditorService, statusbarService: IStatusbarService);
    private registerActiveListeners;
    private activate;
    toggle(): void;
    private _reentrancyBarrier;
    private trackVisiblePanes;
    private onDidEditorPaneScroll;
    private getAllVisiblePanes;
    private deactivate;
    private toggleStatusbarItem;
    private registerActions;
    dispose(): void;
}
