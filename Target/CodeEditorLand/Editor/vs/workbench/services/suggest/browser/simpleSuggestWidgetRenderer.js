import { $, append, show } from '../../../../base/browser/dom.js';
import { IconLabel } from '../../../../base/browser/ui/iconLabel/iconLabel.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter } from '../../../../base/common/event.js';
import { createMatches } from '../../../../base/common/filters.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export function getAriaId(index) {
    return `simple-suggest-aria-id:${index}`;
}
export class SimpleSuggestWidgetItemRenderer {
    constructor(_getFontInfo) {
        this._getFontInfo = _getFontInfo;
        this._onDidToggleDetails = new Emitter();
        this.onDidToggleDetails = this._onDidToggleDetails.event;
        this.templateId = 'suggestion';
    }
    dispose() {
        this._onDidToggleDetails.dispose();
    }
    renderTemplate(container) {
        const disposables = new DisposableStore();
        const root = container;
        root.classList.add('show-file-icons');
        const icon = append(container, $('.icon'));
        const colorspan = append(icon, $('span.colorspan'));
        const text = append(container, $('.contents'));
        const main = append(text, $('.main'));
        const iconContainer = append(main, $('.icon-label.codicon'));
        const left = append(main, $('span.left'));
        const right = append(main, $('span.right'));
        const iconLabel = new IconLabel(left, { supportHighlights: true, supportIcons: true });
        disposables.add(iconLabel);
        const parametersLabel = append(left, $('span.signature-label'));
        const qualifierLabel = append(left, $('span.qualifier-label'));
        const detailsLabel = append(right, $('span.details-label'));
        const configureFont = () => {
            const fontFeatureSettings = '';
            const { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } = this._getFontInfo();
            const fontSizePx = `${fontSize}px`;
            const lineHeightPx = `${lineHeight}px`;
            const letterSpacingPx = `${letterSpacing}px`;
            root.style.fontSize = fontSizePx;
            root.style.fontWeight = fontWeight;
            root.style.letterSpacing = letterSpacingPx;
            main.style.fontFamily = fontFamily;
            main.style.fontFeatureSettings = fontFeatureSettings;
            main.style.lineHeight = lineHeightPx;
            icon.style.height = lineHeightPx;
            icon.style.width = lineHeightPx;
        };
        configureFont();
        return { root, left, right, icon, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, disposables };
    }
    renderElement(element, index, data) {
        const { completion } = element;
        data.root.id = getAriaId(index);
        data.colorspan.style.backgroundColor = '';
        const labelOptions = {
            labelEscapeNewLines: true,
            matches: createMatches(element.score)
        };
        data.icon.className = 'icon hide';
        data.iconContainer.className = '';
        data.iconContainer.classList.add('suggest-icon', ...ThemeIcon.asClassNameArray(completion.icon || Codicon.symbolText));
        data.iconLabel.setLabel(completion.label, undefined, labelOptions);
        data.parametersLabel.textContent = '';
        data.detailsLabel.textContent = stripNewLines(completion.detail || '');
        data.root.classList.add('string-label');
        show(data.detailsLabel);
        data.right.classList.remove('can-expand-details');
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
    }
}
function stripNewLines(str) {
    return str.replace(/\r\n|\r|\n/g, '');
}
