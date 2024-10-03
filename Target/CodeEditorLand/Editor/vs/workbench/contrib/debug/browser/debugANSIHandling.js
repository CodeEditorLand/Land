import { Color, RGBA } from '../../../../base/common/color.js';
import { isDefined } from '../../../../base/common/types.js';
import { editorHoverBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from '../../../common/theme.js';
import { ansiColorIdentifiers } from '../../terminal/common/terminalColorRegistry.js';
export function handleANSIOutput(text, linkDetector, workspaceFolder) {
    const root = document.createElement('span');
    const textLength = text.length;
    let styleNames = [];
    let customFgColor;
    let customBgColor;
    let customUnderlineColor;
    let colorsInverted = false;
    let currentPos = 0;
    let buffer = '';
    while (currentPos < textLength) {
        let sequenceFound = false;
        if (text.charCodeAt(currentPos) === 27 && text.charAt(currentPos + 1) === '[') {
            const startPos = currentPos;
            currentPos += 2;
            let ansiSequence = '';
            while (currentPos < textLength) {
                const char = text.charAt(currentPos);
                ansiSequence += char;
                currentPos++;
                if (char.match(/^[ABCDHIJKfhmpsu]$/)) {
                    sequenceFound = true;
                    break;
                }
            }
            if (sequenceFound) {
                appendStylizedStringToContainer(root, buffer, styleNames, linkDetector, workspaceFolder, customFgColor, customBgColor, customUnderlineColor);
                buffer = '';
                if (ansiSequence.match(/^(?:[34][0-8]|9[0-7]|10[0-7]|[0-9]|2[1-5,7-9]|[34]9|5[8,9]|1[0-9])(?:;[349][0-7]|10[0-7]|[013]|[245]|[34]9)?(?:;[012]?[0-9]?[0-9])*;?m$/)) {
                    const styleCodes = ansiSequence.slice(0, -1)
                        .split(';')
                        .filter(elem => elem !== '')
                        .map(elem => parseInt(elem, 10));
                    if (styleCodes[0] === 38 || styleCodes[0] === 48 || styleCodes[0] === 58) {
                        const colorType = (styleCodes[0] === 38) ? 'foreground' : ((styleCodes[0] === 48) ? 'background' : 'underline');
                        if (styleCodes[1] === 5) {
                            set8BitColor(styleCodes, colorType);
                        }
                        else if (styleCodes[1] === 2) {
                            set24BitColor(styleCodes, colorType);
                        }
                    }
                    else {
                        setBasicFormatters(styleCodes);
                    }
                }
                else {
                }
            }
            else {
                currentPos = startPos;
            }
        }
        if (sequenceFound === false) {
            buffer += text.charAt(currentPos);
            currentPos++;
        }
    }
    if (buffer) {
        appendStylizedStringToContainer(root, buffer, styleNames, linkDetector, workspaceFolder, customFgColor, customBgColor, customUnderlineColor);
    }
    return root;
    function changeColor(colorType, color) {
        if (colorType === 'foreground') {
            customFgColor = color;
        }
        else if (colorType === 'background') {
            customBgColor = color;
        }
        else if (colorType === 'underline') {
            customUnderlineColor = color;
        }
        styleNames = styleNames.filter(style => style !== `code-${colorType}-colored`);
        if (color !== undefined) {
            styleNames.push(`code-${colorType}-colored`);
        }
    }
    function reverseForegroundAndBackgroundColors() {
        const oldFgColor = customFgColor;
        changeColor('foreground', customBgColor);
        changeColor('background', oldFgColor);
    }
    function setBasicFormatters(styleCodes) {
        for (const code of styleCodes) {
            switch (code) {
                case 0: {
                    styleNames = [];
                    customFgColor = undefined;
                    customBgColor = undefined;
                    break;
                }
                case 1: {
                    styleNames = styleNames.filter(style => style !== `code-bold`);
                    styleNames.push('code-bold');
                    break;
                }
                case 2: {
                    styleNames = styleNames.filter(style => style !== `code-dim`);
                    styleNames.push('code-dim');
                    break;
                }
                case 3: {
                    styleNames = styleNames.filter(style => style !== `code-italic`);
                    styleNames.push('code-italic');
                    break;
                }
                case 4: {
                    styleNames = styleNames.filter(style => (style !== `code-underline` && style !== `code-double-underline`));
                    styleNames.push('code-underline');
                    break;
                }
                case 5: {
                    styleNames = styleNames.filter(style => style !== `code-blink`);
                    styleNames.push('code-blink');
                    break;
                }
                case 6: {
                    styleNames = styleNames.filter(style => style !== `code-rapid-blink`);
                    styleNames.push('code-rapid-blink');
                    break;
                }
                case 7: {
                    if (!colorsInverted) {
                        colorsInverted = true;
                        reverseForegroundAndBackgroundColors();
                    }
                    break;
                }
                case 8: {
                    styleNames = styleNames.filter(style => style !== `code-hidden`);
                    styleNames.push('code-hidden');
                    break;
                }
                case 9: {
                    styleNames = styleNames.filter(style => style !== `code-strike-through`);
                    styleNames.push('code-strike-through');
                    break;
                }
                case 10: {
                    styleNames = styleNames.filter(style => !style.startsWith('code-font'));
                    break;
                }
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20: {
                    styleNames = styleNames.filter(style => !style.startsWith('code-font'));
                    styleNames.push(`code-font-${code - 10}`);
                    break;
                }
                case 21: {
                    styleNames = styleNames.filter(style => (style !== `code-underline` && style !== `code-double-underline`));
                    styleNames.push('code-double-underline');
                    break;
                }
                case 22: {
                    styleNames = styleNames.filter(style => (style !== `code-bold` && style !== `code-dim`));
                    break;
                }
                case 23: {
                    styleNames = styleNames.filter(style => (style !== `code-italic` && style !== `code-font-10`));
                    break;
                }
                case 24: {
                    styleNames = styleNames.filter(style => (style !== `code-underline` && style !== `code-double-underline`));
                    break;
                }
                case 25: {
                    styleNames = styleNames.filter(style => (style !== `code-blink` && style !== `code-rapid-blink`));
                    break;
                }
                case 27: {
                    if (colorsInverted) {
                        colorsInverted = false;
                        reverseForegroundAndBackgroundColors();
                    }
                    break;
                }
                case 28: {
                    styleNames = styleNames.filter(style => style !== `code-hidden`);
                    break;
                }
                case 29: {
                    styleNames = styleNames.filter(style => style !== `code-strike-through`);
                    break;
                }
                case 53: {
                    styleNames = styleNames.filter(style => style !== `code-overline`);
                    styleNames.push('code-overline');
                    break;
                }
                case 55: {
                    styleNames = styleNames.filter(style => style !== `code-overline`);
                    break;
                }
                case 39: {
                    changeColor('foreground', undefined);
                    break;
                }
                case 49: {
                    changeColor('background', undefined);
                    break;
                }
                case 59: {
                    changeColor('underline', undefined);
                    break;
                }
                case 73: {
                    styleNames = styleNames.filter(style => (style !== `code-superscript` && style !== `code-subscript`));
                    styleNames.push('code-superscript');
                    break;
                }
                case 74: {
                    styleNames = styleNames.filter(style => (style !== `code-superscript` && style !== `code-subscript`));
                    styleNames.push('code-subscript');
                    break;
                }
                case 75: {
                    styleNames = styleNames.filter(style => (style !== `code-superscript` && style !== `code-subscript`));
                    break;
                }
                default: {
                    setBasicColor(code);
                    break;
                }
            }
        }
    }
    function set24BitColor(styleCodes, colorType) {
        if (styleCodes.length >= 5 &&
            styleCodes[2] >= 0 && styleCodes[2] <= 255 &&
            styleCodes[3] >= 0 && styleCodes[3] <= 255 &&
            styleCodes[4] >= 0 && styleCodes[4] <= 255) {
            const customColor = new RGBA(styleCodes[2], styleCodes[3], styleCodes[4]);
            changeColor(colorType, customColor);
        }
    }
    function set8BitColor(styleCodes, colorType) {
        let colorNumber = styleCodes[2];
        const color = calcANSI8bitColor(colorNumber);
        if (color) {
            changeColor(colorType, color);
        }
        else if (colorNumber >= 0 && colorNumber <= 15) {
            if (colorType === 'underline') {
                const colorName = ansiColorIdentifiers[colorNumber];
                changeColor(colorType, `--vscode-debug-ansi-${colorName}`);
                return;
            }
            colorNumber += 30;
            if (colorNumber >= 38) {
                colorNumber += 52;
            }
            if (colorType === 'background') {
                colorNumber += 10;
            }
            setBasicColor(colorNumber);
        }
    }
    function setBasicColor(styleCode) {
        let colorType;
        let colorIndex;
        if (styleCode >= 30 && styleCode <= 37) {
            colorIndex = styleCode - 30;
            colorType = 'foreground';
        }
        else if (styleCode >= 90 && styleCode <= 97) {
            colorIndex = (styleCode - 90) + 8;
            colorType = 'foreground';
        }
        else if (styleCode >= 40 && styleCode <= 47) {
            colorIndex = styleCode - 40;
            colorType = 'background';
        }
        else if (styleCode >= 100 && styleCode <= 107) {
            colorIndex = (styleCode - 100) + 8;
            colorType = 'background';
        }
        if (colorIndex !== undefined && colorType) {
            const colorName = ansiColorIdentifiers[colorIndex];
            changeColor(colorType, `--vscode-debug-ansi-${colorName.replaceAll('.', '-')}`);
        }
    }
}
export function appendStylizedStringToContainer(root, stringContent, cssClasses, linkDetector, workspaceFolder, customTextColor, customBackgroundColor, customUnderlineColor) {
    if (!root || !stringContent) {
        return;
    }
    const container = linkDetector.linkify(stringContent, true, workspaceFolder);
    container.className = cssClasses.join(' ');
    if (customTextColor) {
        container.style.color =
            typeof customTextColor === 'string' ? `var(${customTextColor})` : Color.Format.CSS.formatRGB(new Color(customTextColor));
    }
    if (customBackgroundColor) {
        container.style.backgroundColor =
            typeof customBackgroundColor === 'string' ? `var(${customBackgroundColor})` : Color.Format.CSS.formatRGB(new Color(customBackgroundColor));
    }
    if (customUnderlineColor) {
        container.style.textDecorationColor =
            typeof customUnderlineColor === 'string' ? `var(${customUnderlineColor})` : Color.Format.CSS.formatRGB(new Color(customUnderlineColor));
    }
    root.appendChild(container);
}
export function calcANSI8bitColor(colorNumber) {
    if (colorNumber % 1 !== 0) {
        return;
    }
    if (colorNumber >= 16 && colorNumber <= 231) {
        colorNumber -= 16;
        let blue = colorNumber % 6;
        colorNumber = (colorNumber - blue) / 6;
        let green = colorNumber % 6;
        colorNumber = (colorNumber - green) / 6;
        let red = colorNumber;
        const convFactor = 255 / 5;
        blue = Math.round(blue * convFactor);
        green = Math.round(green * convFactor);
        red = Math.round(red * convFactor);
        return new RGBA(red, green, blue);
    }
    else if (colorNumber >= 232 && colorNumber <= 255) {
        colorNumber -= 232;
        const colorLevel = Math.round(colorNumber / 23 * 255);
        return new RGBA(colorLevel, colorLevel, colorLevel);
    }
    else {
        return;
    }
}
registerThemingParticipant((theme, collector) => {
    const areas = [
        { selector: '.monaco-workbench .sidebar, .monaco-workbench .auxiliarybar', bg: theme.getColor(SIDE_BAR_BACKGROUND) },
        { selector: '.monaco-workbench .panel', bg: theme.getColor(PANEL_BACKGROUND) },
        { selector: '.debug-hover-widget', bg: theme.getColor(editorHoverBackground) },
    ];
    for (const { selector, bg } of areas) {
        const content = ansiColorIdentifiers
            .map(color => {
            const actual = theme.getColor(color);
            if (!actual) {
                return undefined;
            }
            return `--vscode-debug-ansi-${color.replaceAll('.', '-')}:${bg ? bg.ensureConstrast(actual, 4) : actual}`;
        })
            .filter(isDefined);
        collector.addRule(`${selector} { ${content.join(';')} }`);
    }
});
