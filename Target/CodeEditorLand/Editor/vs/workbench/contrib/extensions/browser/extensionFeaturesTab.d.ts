import { IExtensionManifest } from '../../../../platform/extensions/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
export declare class ExtensionFeaturesTab extends Themable {
    private readonly manifest;
    private readonly feature;
    private readonly instantiationService;
    readonly domNode: HTMLElement;
    private readonly featureView;
    private featureViewDimension?;
    private readonly layoutParticipants;
    private readonly extensionId;
    constructor(manifest: IExtensionManifest, feature: string | undefined, themeService: IThemeService, instantiationService: IInstantiationService);
    layout(height?: number, width?: number): void;
    private create;
    private createFeaturesList;
    private layoutFeatureView;
    private showFeatureView;
    private getFeatures;
    private getRenderer;
}
