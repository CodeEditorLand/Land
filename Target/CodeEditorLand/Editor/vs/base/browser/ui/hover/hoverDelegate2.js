let baseHoverDelegate = {
    showHover: () => undefined,
    hideHover: () => undefined,
    showAndFocusLastHover: () => undefined,
    setupManagedHover: () => null,
    showManagedHover: () => undefined
};
export function setBaseLayerHoverDelegate(hoverDelegate) {
    baseHoverDelegate = hoverDelegate;
}
export function getBaseLayerHoverDelegate() {
    return baseHoverDelegate;
}
