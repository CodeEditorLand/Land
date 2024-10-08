import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IExtensionPoint } from '../../../services/extensions/common/extensionsRegistry.js';
import { ViewsWelcomeExtensionPoint } from './viewsWelcomeExtensionPoint.js';
export declare class ViewsWelcomeContribution extends Disposable implements IWorkbenchContribution {
    private viewWelcomeContents;
    constructor(extensionPoint: IExtensionPoint<ViewsWelcomeExtensionPoint>);
}
