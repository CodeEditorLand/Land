export class TokenMetadata {
    static getLanguageId(metadata) {
        return (metadata & 255) >>> 0;
    }
    static getTokenType(metadata) {
        return (metadata & 768) >>> 8;
    }
    static containsBalancedBrackets(metadata) {
        return (metadata & 1024) !== 0;
    }
    static getFontStyle(metadata) {
        return (metadata & 30720) >>> 11;
    }
    static getForeground(metadata) {
        return (metadata & 16744448) >>> 15;
    }
    static getBackground(metadata) {
        return (metadata & 4278190080) >>> 24;
    }
    static getClassNameFromMetadata(metadata) {
        const foreground = this.getForeground(metadata);
        let className = 'mtk' + foreground;
        const fontStyle = this.getFontStyle(metadata);
        if (fontStyle & 1) {
            className += ' mtki';
        }
        if (fontStyle & 2) {
            className += ' mtkb';
        }
        if (fontStyle & 4) {
            className += ' mtku';
        }
        if (fontStyle & 8) {
            className += ' mtks';
        }
        return className;
    }
    static getInlineStyleFromMetadata(metadata, colorMap) {
        const foreground = this.getForeground(metadata);
        const fontStyle = this.getFontStyle(metadata);
        let result = `color: ${colorMap[foreground]};`;
        if (fontStyle & 1) {
            result += 'font-style: italic;';
        }
        if (fontStyle & 2) {
            result += 'font-weight: bold;';
        }
        let textDecoration = '';
        if (fontStyle & 4) {
            textDecoration += ' underline';
        }
        if (fontStyle & 8) {
            textDecoration += ' line-through';
        }
        if (textDecoration) {
            result += `text-decoration:${textDecoration};`;
        }
        return result;
    }
    static getPresentationFromMetadata(metadata) {
        const foreground = this.getForeground(metadata);
        const fontStyle = this.getFontStyle(metadata);
        return {
            foreground: foreground,
            italic: Boolean(fontStyle & 1),
            bold: Boolean(fontStyle & 2),
            underline: Boolean(fontStyle & 4),
            strikethrough: Boolean(fontStyle & 8),
        };
    }
}
