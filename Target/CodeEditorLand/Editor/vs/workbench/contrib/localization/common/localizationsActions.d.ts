import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ConfigureDisplayLanguageAction extends Action2 {
    static readonly ID = "workbench.action.configureLocale";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    private withMoreInfoButton;
}
export declare class ClearDisplayLanguageAction extends Action2 {
    static readonly ID = "workbench.action.clearLocalePreference";
    static readonly LABEL: import("../../../../nls.js").ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
