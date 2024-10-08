export declare enum ZIndex {
    Base = 0,
    Sash = 35,
    SuggestWidget = 40,
    Hover = 50,
    DragImage = 1000,
    MenubarMenuItemsHolder = 2000,// quick-input-widget
    ContextView = 2500,
    ModalDialog = 2600,
    PaneDropOverlay = 10000
}
export declare function registerZIndex(relativeLayer: ZIndex, z: number, name: string): string;
