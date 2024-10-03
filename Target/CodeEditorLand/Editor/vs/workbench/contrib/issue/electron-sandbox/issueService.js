var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { getZoomLevel } from '../../../../base/browser/browser.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { ipcRenderer } from '../../../../base/parts/sandbox/electron-sandbox/globals.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionIdentifier, ExtensionIdentifierSet } from '../../../../platform/extensions/common/extensions.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IIssueMainService } from '../../../../platform/issue/common/issue.js';
import { buttonBackground, buttonForeground, buttonHoverBackground, foreground, inputActiveOptionBorder, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground, textLinkActiveForeground, textLinkForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { SIDE_BAR_BACKGROUND } from '../../../common/theme.js';
import { IIssueFormService, IWorkbenchIssueService } from '../common/issue.js';
import { IWorkbenchAssignmentService } from '../../../services/assignment/common/assignmentService.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IIntegrityService } from '../../../services/integrity/common/integrity.js';
let NativeIssueService = class NativeIssueService {
    constructor(issueMainService, issueFormService, themeService, extensionManagementService, extensionEnablementService, workspaceTrustManagementService, experimentService, authenticationService, integrityService, menuService, contextKeyService, configurationService) {
        this.issueMainService = issueMainService;
        this.issueFormService = issueFormService;
        this.themeService = themeService;
        this.extensionManagementService = extensionManagementService;
        this.extensionEnablementService = extensionEnablementService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.experimentService = experimentService;
        this.authenticationService = authenticationService;
        this.integrityService = integrityService;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.configurationService = configurationService;
        this.extensionIdentifierSet = new ExtensionIdentifierSet();
        ipcRenderer.on('vscode:triggerReporterMenu', async (event, arg) => {
            const extensionId = arg.extensionId;
            const actions = this.menuService.getMenuActions(MenuId.IssueReporter, this.contextKeyService, { renderShortTitle: true }).flatMap(entry => entry[1]);
            actions.forEach(async (action) => {
                try {
                    if (action.item && 'source' in action.item && action.item.source?.id === extensionId) {
                        this.extensionIdentifierSet.add(extensionId);
                        await action.run();
                    }
                }
                catch (error) {
                    console.error(error);
                }
            });
            if (!this.extensionIdentifierSet.has(extensionId)) {
                ipcRenderer.send(`vscode:triggerReporterMenuResponse:${extensionId}`, undefined);
            }
        });
    }
    async openReporter(dataOverrides = {}) {
        const extensionData = [];
        const oldExtensionData = [];
        const oldDataOverrides = dataOverrides;
        try {
            const extensions = await this.extensionManagementService.getInstalled();
            const enabledExtensions = extensions.filter(extension => this.extensionEnablementService.isEnabled(extension) || (dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId));
            extensionData.push(...enabledExtensions.map((extension) => {
                const { manifest } = extension;
                const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
                const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === 'themes';
                const isBuiltin = extension.type === 0;
                return {
                    name: manifest.name,
                    publisher: manifest.publisher,
                    version: manifest.version,
                    repositoryUrl: manifest.repository && manifest.repository.url,
                    bugsUrl: manifest.bugs && manifest.bugs.url,
                    displayName: manifest.displayName,
                    id: extension.identifier.id,
                    data: dataOverrides.data,
                    uri: dataOverrides.uri,
                    isTheme,
                    isBuiltin,
                    extensionData: 'Extensions data loading',
                };
            }));
            oldExtensionData.push(...enabledExtensions.map((extension) => {
                const { manifest } = extension;
                const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
                const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === 'themes';
                const isBuiltin = extension.type === 0;
                return {
                    name: manifest.name,
                    publisher: manifest.publisher,
                    version: manifest.version,
                    repositoryUrl: manifest.repository && manifest.repository.url,
                    bugsUrl: manifest.bugs && manifest.bugs.url,
                    displayName: manifest.displayName,
                    id: extension.identifier.id,
                    data: dataOverrides.data,
                    uri: dataOverrides.uri,
                    isTheme,
                    isBuiltin,
                    extensionData: 'Extensions data loading',
                };
            }));
        }
        catch (e) {
            extensionData.push({
                name: 'Workbench Issue Service',
                publisher: 'Unknown',
                version: '0.0.0',
                repositoryUrl: undefined,
                bugsUrl: undefined,
                extensionData: 'Extensions data loading',
                displayName: `Extensions not loaded: ${e}`,
                id: 'workbench.issue',
                isTheme: false,
                isBuiltin: true
            });
            oldExtensionData.push({
                name: 'Workbench Issue Service',
                publisher: 'Unknown',
                version: '0.0.0',
                repositoryUrl: undefined,
                bugsUrl: undefined,
                extensionData: 'Extensions data loading',
                displayName: `Extensions not loaded: ${e}`,
                id: 'workbench.issue',
                isTheme: false,
                isBuiltin: true
            });
        }
        const experiments = await this.experimentService.getCurrentExperiments();
        let githubAccessToken = '';
        try {
            const githubSessions = await this.authenticationService.getSessions('github');
            const potentialSessions = githubSessions.filter(session => session.scopes.includes('repo'));
            githubAccessToken = potentialSessions[0]?.accessToken;
        }
        catch (e) {
        }
        let isUnsupported = false;
        try {
            isUnsupported = !(await this.integrityService.isPure()).isPure;
        }
        catch (e) {
        }
        const theme = this.themeService.getColorTheme();
        const issueReporterData = Object.assign({
            styles: getIssueReporterStyles(theme),
            zoomLevel: getZoomLevel(mainWindow),
            enabledExtensions: extensionData,
            experiments: experiments?.join('\n'),
            restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
            isUnsupported,
            githubAccessToken
        }, dataOverrides);
        const oldIssueReporterData = Object.assign({
            styles: oldGetIssueReporterStyles(theme),
            zoomLevel: getZoomLevel(mainWindow),
            enabledExtensions: oldExtensionData,
            experiments: experiments?.join('\n'),
            restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
            isUnsupported,
            githubAccessToken
        }, oldDataOverrides);
        if (issueReporterData.extensionId) {
            const extensionExists = extensionData.some(extension => ExtensionIdentifier.equals(extension.id, issueReporterData.extensionId));
            if (!extensionExists) {
                console.error(`Extension with ID ${issueReporterData.extensionId} does not exist.`);
            }
        }
        if (issueReporterData.extensionId && this.extensionIdentifierSet.has(issueReporterData.extensionId)) {
            ipcRenderer.send(`vscode:triggerReporterMenuResponse:${issueReporterData.extensionId}`, issueReporterData);
            this.extensionIdentifierSet.delete(new ExtensionIdentifier(issueReporterData.extensionId));
        }
        if (this.configurationService.getValue('issueReporter.experimental.auxWindow')) {
            return this.issueFormService.openReporter(issueReporterData);
        }
        return this.issueMainService.openReporter(oldIssueReporterData);
    }
};
NativeIssueService = __decorate([
    __param(0, IIssueMainService),
    __param(1, IIssueFormService),
    __param(2, IThemeService),
    __param(3, IExtensionManagementService),
    __param(4, IWorkbenchExtensionEnablementService),
    __param(5, IWorkspaceTrustManagementService),
    __param(6, IWorkbenchAssignmentService),
    __param(7, IAuthenticationService),
    __param(8, IIntegrityService),
    __param(9, IMenuService),
    __param(10, IContextKeyService),
    __param(11, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeIssueService);
export { NativeIssueService };
export function getIssueReporterStyles(theme) {
    return {
        backgroundColor: getColor(theme, SIDE_BAR_BACKGROUND),
        color: getColor(theme, foreground),
        textLinkColor: getColor(theme, textLinkForeground),
        textLinkActiveForeground: getColor(theme, textLinkActiveForeground),
        inputBackground: getColor(theme, inputBackground),
        inputForeground: getColor(theme, inputForeground),
        inputBorder: getColor(theme, inputBorder),
        inputActiveBorder: getColor(theme, inputActiveOptionBorder),
        inputErrorBorder: getColor(theme, inputValidationErrorBorder),
        inputErrorBackground: getColor(theme, inputValidationErrorBackground),
        inputErrorForeground: getColor(theme, inputValidationErrorForeground),
        buttonBackground: getColor(theme, buttonBackground),
        buttonForeground: getColor(theme, buttonForeground),
        buttonHoverBackground: getColor(theme, buttonHoverBackground),
        sliderActiveColor: getColor(theme, scrollbarSliderActiveBackground),
        sliderBackgroundColor: getColor(theme, SIDE_BAR_BACKGROUND),
        sliderHoverColor: getColor(theme, scrollbarSliderHoverBackground),
    };
}
export function oldGetIssueReporterStyles(theme) {
    return {
        backgroundColor: getColor(theme, SIDE_BAR_BACKGROUND),
        color: getColor(theme, foreground),
        textLinkColor: getColor(theme, textLinkForeground),
        textLinkActiveForeground: getColor(theme, textLinkActiveForeground),
        inputBackground: getColor(theme, inputBackground),
        inputForeground: getColor(theme, inputForeground),
        inputBorder: getColor(theme, inputBorder),
        inputActiveBorder: getColor(theme, inputActiveOptionBorder),
        inputErrorBorder: getColor(theme, inputValidationErrorBorder),
        inputErrorBackground: getColor(theme, inputValidationErrorBackground),
        inputErrorForeground: getColor(theme, inputValidationErrorForeground),
        buttonBackground: getColor(theme, buttonBackground),
        buttonForeground: getColor(theme, buttonForeground),
        buttonHoverBackground: getColor(theme, buttonHoverBackground),
        sliderActiveColor: getColor(theme, scrollbarSliderActiveBackground),
        sliderBackgroundColor: getColor(theme, scrollbarSliderBackground),
        sliderHoverColor: getColor(theme, scrollbarSliderHoverBackground),
    };
}
function getColor(theme, key) {
    const color = theme.getColor(key);
    return color ? color.toString() : undefined;
}
registerSingleton(IWorkbenchIssueService, NativeIssueService, 1);
