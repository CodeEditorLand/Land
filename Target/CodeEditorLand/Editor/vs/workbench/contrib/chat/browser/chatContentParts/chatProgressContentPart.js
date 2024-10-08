/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { $ } from '../../../../../base/browser/dom.js';
import { alert } from '../../../../../base/browser/ui/aria/aria.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { isResponseVM } from '../../common/chatViewModel.js';
export class ChatProgressContentPart extends Disposable {
    constructor(progress, renderer, context, forceShowSpinner, forceShowMessage, icon) {
        super();
        const followingContent = context.content.slice(context.contentIndex + 1);
        this.showSpinner = forceShowSpinner ?? shouldShowSpinner(followingContent, context.element);
        const hideMessage = forceShowMessage !== true && followingContent.some(part => part.kind !== 'progressMessage');
        if (hideMessage) {
            // Placeholder, don't show the progress message
            this.domNode = $('');
            return;
        }
        if (this.showSpinner) {
            // TODO@roblourens is this the right place for this?
            // this step is in progress, communicate it to SR users
            alert(progress.content.value);
        }
        const codicon = icon ? icon.id : this.showSpinner ? ThemeIcon.modify(Codicon.loading, 'spin').id : Codicon.check.id;
        const markdown = new MarkdownString(`$(${codicon}) ${progress.content.value}`, {
            supportThemeIcons: true
        });
        const result = this._register(renderer.render(markdown));
        result.element.classList.add('progress-step');
        this.domNode = result.element;
    }
    hasSameContent(other, followingContent, element) {
        // Needs rerender when spinner state changes
        const showSpinner = shouldShowSpinner(followingContent, element);
        return other.kind === 'progressMessage' && this.showSpinner === showSpinner;
    }
}
function shouldShowSpinner(followingContent, element) {
    return isResponseVM(element) && !element.isComplete && followingContent.length === 0;
}
