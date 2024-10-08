/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { FuzzyScore } from '../../../../base/common/filters.js';
import { isWindows } from '../../../../base/common/platform.js';
export class SimpleCompletionItem {
    constructor(completion) {
        this.completion = completion;
        this.fileExtLow = '';
        // sorting, filtering
        this.score = FuzzyScore.Default;
        // ensure lower-variants (perf)
        this.labelLow = this.completion.label.toLowerCase();
        this.labelLowExcludeFileExt = this.labelLow;
        if (completion.isFile) {
            if (isWindows) {
                this.labelLow = this.labelLow.replaceAll('/', '\\');
            }
            const extIndex = this.labelLow.lastIndexOf('.');
            if (extIndex !== -1) {
                this.labelLowExcludeFileExt = this.labelLow.substring(0, extIndex);
                this.fileExtLow = this.labelLow.substring(extIndex + 1);
            }
        }
    }
}
