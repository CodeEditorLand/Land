import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
export declare class UnfocusedViewDimmingContribution extends Disposable implements IWorkbenchContribution {
    private _styleElement?;
    private _styleElementDisposables;
    constructor(configurationService: IConfigurationService);
    private _getStyleElement;
    private _removeStyleElement;
}
