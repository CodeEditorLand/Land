import { Action } from '../../../../base/common/actions.js';
import { IExtensionHostProfile } from '../../../services/extensions/common/extensions.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { AbstractRuntimeExtensionsEditor, IRuntimeExtension } from './abstractRuntimeExtensionsEditor.js';
export declare class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    protected _getProfileInfo(): IExtensionHostProfile | null;
    protected _getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    protected _createSlowExtensionAction(element: IRuntimeExtension): Action | null;
    protected _createReportExtensionIssueAction(element: IRuntimeExtension): Action | null;
}
