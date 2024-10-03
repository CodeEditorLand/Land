import { createDecorator } from '../../instantiation/common/instantiation.js';
export function RecommendationSourceToString(source) {
    switch (source) {
        case 1: return 'file';
        case 2: return 'workspace';
        case 3: return 'exe';
    }
}
export const IExtensionRecommendationNotificationService = createDecorator('IExtensionRecommendationNotificationService');
