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
import { platform } from '../../../../base/common/process.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IProcessMainService } from '../../../../platform/issue/common/issue.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { activeContrastBorder, editorBackground, editorForeground, listActiveSelectionBackground, listActiveSelectionForeground, listFocusBackground, listFocusForeground, listFocusOutline, listHoverBackground, listHoverForeground, scrollbarShadow, scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IWorkbenchProcessService } from '../common/issue.js';
import { mainWindow } from '../../../../base/browser/window.js';
let ProcessService = class ProcessService {
    constructor(processMainService, themeService, environmentService, productService) {
        this.processMainService = processMainService;
        this.themeService = themeService;
        this.environmentService = environmentService;
        this.productService = productService;
    }
    openProcessExplorer() {
        const theme = this.themeService.getColorTheme();
        const data = {
            pid: this.environmentService.mainPid,
            zoomLevel: getZoomLevel(mainWindow),
            styles: {
                backgroundColor: getColor(theme, editorBackground),
                color: getColor(theme, editorForeground),
                listHoverBackground: getColor(theme, listHoverBackground),
                listHoverForeground: getColor(theme, listHoverForeground),
                listFocusBackground: getColor(theme, listFocusBackground),
                listFocusForeground: getColor(theme, listFocusForeground),
                listFocusOutline: getColor(theme, listFocusOutline),
                listActiveSelectionBackground: getColor(theme, listActiveSelectionBackground),
                listActiveSelectionForeground: getColor(theme, listActiveSelectionForeground),
                listHoverOutline: getColor(theme, activeContrastBorder),
                scrollbarShadowColor: getColor(theme, scrollbarShadow),
                scrollbarSliderActiveBackgroundColor: getColor(theme, scrollbarSliderActiveBackground),
                scrollbarSliderBackgroundColor: getColor(theme, scrollbarSliderBackground),
                scrollbarSliderHoverBackgroundColor: getColor(theme, scrollbarSliderHoverBackground),
            },
            platform: platform,
            applicationName: this.productService.applicationName
        };
        return this.processMainService.openProcessExplorer(data);
    }
};
ProcessService = __decorate([
    __param(0, IProcessMainService),
    __param(1, IThemeService),
    __param(2, INativeWorkbenchEnvironmentService),
    __param(3, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ProcessService);
export { ProcessService };
function getColor(theme, key) {
    const color = theme.getColor(key);
    return color ? color.toString() : undefined;
}
registerSingleton(IWorkbenchProcessService, ProcessService, 1);
