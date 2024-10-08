import { Disposable } from '../../../../base/common/lifecycle.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IActivityService } from '../../activity/common/activity.js';
import { IAuthenticationAccessService } from './authenticationAccessService.js';
import { IAuthenticationUsageService } from './authenticationUsageService.js';
import { AuthenticationSession, IAuthenticationService, IAuthenticationExtensionsService, AuthenticationSessionAccount } from '../common/authentication.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare class AuthenticationExtensionsService extends Disposable implements IAuthenticationExtensionsService {
    private readonly activityService;
    private readonly storageService;
    private readonly dialogService;
    private readonly quickInputService;
    private readonly _productService;
    private readonly _authenticationService;
    private readonly _authenticationUsageService;
    private readonly _authenticationAccessService;
    readonly _serviceBrand: undefined;
    private _signInRequestItems;
    private _sessionAccessRequestItems;
    private readonly _accountBadgeDisposable;
    private _onDidAccountPreferenceChange;
    readonly onDidChangeAccountPreference: import("../../../workbench.web.main.internal.js").Event<{
        providerId: string;
        extensionIds: string[];
    }>;
    private _inheritAuthAccountPreferenceParentToChildren;
    private _inheritAuthAccountPreferenceChildToParent;
    constructor(activityService: IActivityService, storageService: IStorageService, dialogService: IDialogService, quickInputService: IQuickInputService, _productService: IProductService, _authenticationService: IAuthenticationService, _authenticationUsageService: IAuthenticationUsageService, _authenticationAccessService: IAuthenticationAccessService);
    private registerListeners;
    private updateNewSessionRequests;
    private updateAccessRequests;
    private updateBadgeCount;
    private removeAccessRequest;
    updateAccountPreference(extensionId: string, providerId: string, account: AuthenticationSessionAccount): void;
    getAccountPreference(extensionId: string, providerId: string): string | undefined;
    removeAccountPreference(extensionId: string, providerId: string): void;
    private _getKey;
    updateSessionPreference(providerId: string, extensionId: string, session: AuthenticationSession): void;
    getSessionPreference(providerId: string, extensionId: string, scopes: string[]): string | undefined;
    removeSessionPreference(providerId: string, extensionId: string, scopes: string[]): void;
    private _updateAccountAndSessionPreferences;
    private showGetSessionPrompt;
    /**
     * This function should be used only when there are sessions to disambiguate.
     */
    selectSession(providerId: string, extensionId: string, extensionName: string, scopes: string[], availableSessions: AuthenticationSession[]): Promise<AuthenticationSession>;
    private completeSessionAccessRequest;
    requestSessionAccess(providerId: string, extensionId: string, extensionName: string, scopes: string[], possibleSessions: AuthenticationSession[]): void;
    requestNewSession(providerId: string, scopes: string[], extensionId: string, extensionName: string): Promise<void>;
}
