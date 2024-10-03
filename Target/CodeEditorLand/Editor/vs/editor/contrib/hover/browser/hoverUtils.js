import * as dom from '../../../../base/browser/dom.js';
export function isMousePositionWithinElement(element, posx, posy) {
    const elementRect = dom.getDomNodePagePosition(element);
    if (posx < elementRect.left
        || posx > elementRect.left + elementRect.width
        || posy < elementRect.top
        || posy > elementRect.top + elementRect.height) {
        return false;
    }
    return true;
}
