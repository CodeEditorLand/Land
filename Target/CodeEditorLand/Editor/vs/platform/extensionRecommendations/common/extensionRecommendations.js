/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../instantiation/common/instantiation.js';
export function RecommendationSourceToString(source) {
    switch (source) {
        case 1 /* RecommendationSource.FILE */: return 'file';
        case 2 /* RecommendationSource.WORKSPACE */: return 'workspace';
        case 3 /* RecommendationSource.EXE */: return 'exe';
    }
}
export const IExtensionRecommendationNotificationService = createDecorator('IExtensionRecommendationNotificationService');
