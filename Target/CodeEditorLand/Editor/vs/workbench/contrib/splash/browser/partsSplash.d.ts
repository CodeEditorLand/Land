import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ISplashStorageService } from './splash.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
export declare class PartsSplash {
    private readonly _themeService;
    private readonly _layoutService;
    private readonly _environmentService;
    private readonly _configService;
    private readonly _partSplashService;
    static readonly ID = "workbench.contrib.partsSplash";
    private static readonly _splashElementId;
    private readonly _disposables;
    private _didChangeTitleBarStyle?;
    constructor(_themeService: IThemeService, _layoutService: IWorkbenchLayoutService, _environmentService: IWorkbenchEnvironmentService, _configService: IConfigurationService, _partSplashService: ISplashStorageService, editorGroupsService: IEditorGroupsService, lifecycleService: ILifecycleService);
    dispose(): void;
    private _savePartsSplash;
    private _shouldSaveLayoutInfo;
    private _removePartsSplash;
}
